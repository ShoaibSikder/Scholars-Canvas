from .models import SystemSetting


def setting_value(key, default=None):
    setting = SystemSetting.objects.filter(key=key).first()
    if not setting:
        return default
    value = setting.value
    if isinstance(value, dict) and "value" in value:
        return value["value"]
    return value if value not in ({}, None) else default


def bool_setting(key, default=False):
    value = setting_value(key, default)
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "yes", "on"}
    return bool(value)
