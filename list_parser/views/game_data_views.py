from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.cache import cache_page
from django_ratelimit.decorators import ratelimit

from datasheet_scraper.models import FactionJson, DetachmentJson, DatasheetJson


@cache_page(60 * 60 * 24 * 7)  # Cache for 7 days
@ratelimit(key='ip', rate='1000/hr', method='GET')
@require_http_methods(["GET"])
def get_datasheet(request, datasheet_id):
    """
    Retrieve a datasheet by its ID from the database without enhancement
    """
    try:
        datasheet = get_object_or_404(DatasheetJson, datasheet_id=datasheet_id)
        return JsonResponse(datasheet.data)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@ratelimit(key='ip', rate='1000/hr', method='GET')
@require_http_methods(["GET"])
def get_datasheet_with_enhancement(request, datasheet_id):
    """
    Retrieve a datasheet by its ID from the database with enhancement information
    """
    try:
        detachment_id = request.GET.get("detachment_id")
        enhancement_name = request.GET.get("enhancement")

        if not detachment_id or not enhancement_name:
            return JsonResponse(
                {"error": "detachment_id and enhancement_name query parameters are required"},
                status=400
            )

        # Get base datasheet data
        datasheet = get_object_or_404(DatasheetJson, datasheet_id=datasheet_id)
        datasheet_data = datasheet.data

        # Try to find matching enhancement
        try:
            detachment = get_object_or_404(DetachmentJson, detachment_id=detachment_id)
            enhancements = detachment.data.get("enhancements", [])

            for enhancement in enhancements:
                enh_name = enhancement.get("name")
                enh_text = enhancement.get("text")

                if enh_name and enh_name.lower() == enhancement_name.lower():
                    datasheet_data["enhancement"] = {
                        "name": enh_name,
                        "text": enh_text,
                    }
                    break
        except Exception as e:
            print(f"Error while checking for enhancements: {e}")

        return JsonResponse(datasheet_data)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@cache_page(60 * 60 * 24 * 7)  # Cache for 7 days
@ratelimit(key='ip', rate='500/hr', method='GET')
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


@cache_page(60 * 60 * 24 * 7)  # Cache for 7 days
@ratelimit(key='ip', rate='500/hr', method='GET')
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