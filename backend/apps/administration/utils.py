from .models import SystemSetting


SYSTEM_SETTING_CACHE_TIMEOUT = 60


def setting_value(key, default=None):
    from django.core.cache import cache

    cache_key = f"system-setting:{key}"
    cached = cache.get(cache_key)
    if cached is not None:
        return default if cached == "__missing__" else cached

    setting = SystemSetting.objects.filter(key=key).only("value").first()
    if not setting:
        cache.set(cache_key, "__missing__", SYSTEM_SETTING_CACHE_TIMEOUT)
        return default
    value = setting.value
    if isinstance(value, dict) and "value" in value:
        resolved = value["value"]
    else:
        resolved = value if value not in ({}, None) else default

    cache.set(cache_key, resolved, SYSTEM_SETTING_CACHE_TIMEOUT)
    return resolved


def bool_setting(key, default=False):
    value = setting_value(key, default)
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "yes", "on"}
    return bool(value)
