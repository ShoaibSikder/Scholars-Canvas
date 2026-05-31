from django.conf import settings


class AllowMediaEmbeddingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if settings.DEBUG and request.path.startswith(settings.MEDIA_URL):
            response.headers.pop("X-Frame-Options", None)

        return response
