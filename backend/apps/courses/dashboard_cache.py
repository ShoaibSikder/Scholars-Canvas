from django.core.cache import cache


def dashboard_cache_key(user_id):
    return f"dashboard-data:{user_id}"


def clear_dashboard_cache(user_id):
    cache.delete(dashboard_cache_key(user_id))
