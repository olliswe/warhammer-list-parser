from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django_ratelimit.decorators import ratelimit
import json

from ..utils.main import detect_entities
from ..utils.shared_utils import sanitized_response


@ratelimit(key='ip', rate='50/hr', method='POST')
@csrf_exempt
@require_http_methods(["POST"])
def detect_army_entities(request):
    try:
        body = json.loads(request.body)
        army_list = body.get("army_list")

        if not army_list:
            return JsonResponse(
                {"error": "army_list parameter is required"}, status=400
            )

        entities = detect_entities(army_list)
        return JsonResponse(sanitized_response(entities))

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)