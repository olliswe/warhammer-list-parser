import logging
import json
import time

logger = logging.getLogger(__name__)


class RequestResponseLoggingMiddleware:
    """
    Middleware to log all API requests and responses
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip logging for static files and health checks
        if request.path.startswith("/static/") or request.path == "/health/":
            return self.get_response(request)

        start_time = time.time()

        # Get response
        response = self.get_response(request)

        # Calculate duration
        duration = time.time() - start_time

        # Only log API endpoints
        if request.path.startswith("/api/"):
            log_data = {
                "method": request.method,
                "path": request.path,
                "status_code": response.status_code,
                "duration_ms": round(duration * 1000, 2),
            }

            # Add request body for POST requests
            if request.method == "POST" and hasattr(request, "body"):
                try:
                    body = json.loads(request.body)
                    # Don't log the full army_list text, just metadata
                    if "army_list" in body:
                        log_data["has_army_list"] = True
                    if "parsed_data" in body:
                        log_data["has_parsed_data"] = True
                except:
                    pass

            # Add response data for successful requests
            if response.status_code == 200 and hasattr(response, "content"):
                try:
                    response_data = json.loads(response.content)

                    # Log specific data based on endpoint
                    if "factions" in response_data:
                        log_data["faction"] = (
                            response_data["factions"][0]["faction_name"]
                            if response_data["factions"]
                            else "unknown"
                        )
                        log_data["unit_count"] = len(response_data.get("datasheets", []))

                    if "share_url" in response_data:
                        log_data["share_url"] = response_data["share_url"]
                        log_data["slug"] = response_data.get("slug")
                except:
                    pass

            # Log at appropriate level with formatted message
            msg = f"{log_data['method']} {log_data['path']} {log_data['status_code']} {log_data['duration_ms']}ms"
            if response.status_code >= 400:
                logger.error(msg, extra=log_data)
            else:
                logger.info(msg, extra=log_data)

        return response