from django.core.cache import cache
from django.utils import timezone
from rest_framework.throttling import BaseThrottle

from apps.administration.utils import setting_value


class SystemRateLimitThrottle(BaseThrottle):
    def allow_request(self, request, view):
        if request.path.startswith("/api/admin-panel/"):
            return True

        limit = setting_value("api_rate_limit_per_minute", 120)
        try:
            limit = int(limit)
        except (TypeError, ValueError):
            limit = 120

        if limit <= 0 or not request.user or not request.user.is_authenticated:
            return True
        if request.user.is_staff or getattr(request.user, "is_admin_role", False):
            return True

        minute_key = timezone.now().strftime("%Y%m%d%H%M")
        cache_key = f"system-rate:{request.user.pk}:{minute_key}"
        count = cache.get(cache_key, 0) + 1
        cache.set(cache_key, count, 70)
        return count <= limit
