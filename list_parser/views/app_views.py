from django.http import JsonResponse, HttpResponse
from django.conf import settings
import os


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