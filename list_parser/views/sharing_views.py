from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django_ratelimit.decorators import ratelimit
import json

from ..models import SharedList


@ratelimit(key='ip', rate='20/m', method='POST')
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
            share_url = share_url.replace("http://", "https://")

        return JsonResponse(
            {"success": True, "slug": shared_list.slug, "share_url": share_url}
        )

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
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
        return JsonResponse({"error": str(e)}, status=500)