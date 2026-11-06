import logging
from time import monotonic


logger = logging.getLogger("studentassistant.request")


class RequestTimingMiddleware:
    """Expose server timing so client, network, and application latency are separable."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        started = monotonic()
        response = self.get_response(request)
        elapsed_ms = (monotonic() - started) * 1000
        logger.info("%s %s -> %s in %.1fms", request.method, request.path, response.status_code, elapsed_ms)
        response["Server-Timing"] = f"app;dur={elapsed_ms:.1f}"
        return response
