from django.shortcuts import get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
import json
import os
import logging
from .utils.main import detect_entities
from .utils.shared_utils import (
    faction_id_to_url,
    detachment_id_to_url,
    datasheet_id_to_url,
)
from .models import SharedList
from datasheet_scraper.models import FactionJson, DetachmentJson, DatasheetJson
from rapidfuzz import fuzz

logger = logging.getLogger(__name__)


def index(request):
    """Serve React app"""
    try:
        with open(os.path.join(settings.REACT_APP_DIR, "index.html")) as f:
            return HttpResponse(f.read())
    except FileNotFoundError:
        return HttpResponse(
            """
            <h1>React app not built yet</h1>
            <p>Run <code>cd react-frontend && npm run build</code> to build the React app.</p>
            """,
            status=503,
        )


def health(request):
    return JsonResponse({"status": "ok"})


def sanitized_response(entities):
    """
    Helper function to sanitize response
    """
    factions_with_urls = [
        {
            "faction_id": faction["faction_id"],
            "faction_name": faction["faction_name"],
            "is_supplement": faction.get("is_supplement", False),
            "url": faction_id_to_url(faction["faction_id"]),
        }
        for faction in entities.get("factions", [])
    ]
    detachment_with_urls = [
        {
            "detachment_id": entities["detachment"].get("detachment_id"),
            "detachment_name": entities["detachment"].get("detachment_name"),
            "url": detachment_id_to_url(entities["detachment"].get("detachment_id")),
        }
    ]
    datasheets_with_urls = [
        {
            "datasheet_id": ds["datasheet_id"],
            "datasheet_name": ds["datasheet_name"],
            "entry_text": ds.get("entry_text", ""),
            "url": datasheet_id_to_url(ds["datasheet_id"]),
        }
        for ds in entities.get("datasheets", [])
    ]
    return {
        "factions": factions_with_urls,
        "detachment": detachment_with_urls,
        "datasheets": datasheets_with_urls,
    }


@csrf_exempt
@require_http_methods(["POST"])
def detect_army_entities(request):
    try:
        body = json.loads(request.body)
        army_list = body.get("army_list")

        if not army_list:
            logger.warning("detect_army_entities: missing army_list parameter")
            return JsonResponse(
                {"error": "army_list parameter is required"}, status=400
            )

        entities = detect_entities(army_list)
        response_data = sanitized_response(entities)

        logger.info(
            "list_parsed",
            extra={
                "endpoint": "/api/detect-entities/",
                "faction": response_data["factions"][0]["faction_name"] if response_data["factions"] else "unknown",
                "detachment": response_data["detachment"][0]["detachment_name"] if response_data["detachment"] else "unknown",
                "unit_count": len(response_data["datasheets"]),
            }
        )

        return JsonResponse(response_data)

    except json.JSONDecodeError:
        logger.error("detect_army_entities: invalid JSON", extra={"endpoint": "/api/detect-entities/"})
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        logger.error(
            "detect_army_entities: error",
            extra={"endpoint": "/api/detect-entities/", "error": str(e)},
            exc_info=True
        )
        return JsonResponse({"error": str(e)}, status=500)


@require_http_methods(["GET"])
def get_datasheet(request, datasheet_id):
    """
    Retrieve a datasheet by its ID from the database
    """
    try:
        datasheet = get_object_or_404(DatasheetJson, datasheet_id=datasheet_id)
        detachment_id = request.GET.get("detachment_id")
        text = request.GET.get("text")
        detachment = get_object_or_404(DetachmentJson, detachment_id=detachment_id)
        return_data = datasheet.data
        has_enhancement = fuzz.partial_ratio("enhancement", text.lower()) > 95
        if has_enhancement and detachment and text:
            enhancements = detachment.data.get("enhancements", [])
            for enhancement in enhancements:
                enhancement_name = enhancement.get("name")
                enhancement_text = enhancement.get("text")
                # use rapidfuzz to find the enhancement in the datasheet
                if enhancement_name:
                    score = fuzz.partial_ratio(enhancement_name.lower(), text.lower())
                    print(enhancement_name, score)
                    if score >= 90:
                        return_data["enhancement"] = {
                            "name": enhancement_name,
                            "text": enhancement_text,
                        }
                        break

        return JsonResponse(return_data)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@require_http_methods(["GET"])
def get_faction(request, faction_id):
    """
    Retrieve faction rules by faction ID from the database
    """
    try:
        faction = get_object_or_404(FactionJson, faction_id=faction_id)
        return JsonResponse(faction.data)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@require_http_methods(["GET"])
def get_detachment(request, detachment_id):
    """
    Retrieve detachment rules and enhancements by detachment ID from the database
    """
    try:
        detachment = get_object_or_404(DetachmentJson, detachment_id=detachment_id)
        return JsonResponse(detachment.data)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def share_list(request):
    """
    Create a shared list and return the share URL
    """
    try:
        body = json.loads(request.body)
        name = body.get("name")
        raw_text = body.get("raw_text")
        parsed_data = body.get("parsed_data")
        source_url = request.get_host()

        if not all([name, raw_text, parsed_data]):
            logger.warning("share_list: missing required fields")
            return JsonResponse(
                {"error": "name, raw_text, and parsed_data are required"}, status=400
            )

        # Create shared list
        shared_list = SharedList.objects.create(
            name=name, raw_text=raw_text, parsed_data=parsed_data
        )

        # Build the share URL
        if "localhost" in source_url:
            share_url = f"http://localhost:3000/shared/{shared_list.slug}/"
        else:
            share_url = request.build_absolute_uri(f"/shared/{shared_list.slug}/")

        logger.info(
            "list_shared",
            extra={
                "endpoint": "/api/share/",
                "slug": shared_list.slug,
                "share_url": share_url,
                "faction": parsed_data.get("factions", [{}])[0].get("faction_name", "unknown") if parsed_data.get("factions") else "unknown",
                "unit_count": len(parsed_data.get("datasheets", [])),
            }
        )

        return JsonResponse(
            {"success": True, "slug": shared_list.slug, "share_url": share_url}
        )

    except json.JSONDecodeError:
        logger.error("share_list: invalid JSON", extra={"endpoint": "/api/share/"})
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        logger.error(
            "share_list: error",
            extra={"endpoint": "/api/share/", "error": str(e)},
            exc_info=True
        )
        return JsonResponse({"error": str(e)}, status=500)


@require_http_methods(["GET"])
def get_shared_list(request, slug):
    """
    Retrieve a shared list by slug
    """
    try:
        shared_list = get_object_or_404(SharedList, slug=slug)

        # Increment view count
        shared_list.increment_view_count()

        logger.info(
            "shared_list_viewed",
            extra={
                "endpoint": "/api/shared/",
                "slug": slug,
                "view_count": shared_list.view_count,
            }
        )

        return JsonResponse(
            {
                "name": shared_list.name,
                "raw_text": shared_list.raw_text,
                "parsed_data": shared_list.parsed_data,
                "created_at": shared_list.created_at.isoformat(),
                "view_count": shared_list.view_count,
            }
        )

    except Exception as e:
        logger.error(
            "get_shared_list: error",
            extra={"endpoint": "/api/shared/", "slug": slug, "error": str(e)},
            exc_info=True
        )
        return JsonResponse({"error": str(e)}, status=500)
