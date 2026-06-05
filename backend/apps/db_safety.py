from rest_framework import serializers


def parse_positive_int(value, *, minimum=1, maximum=None, allow_none=False, field_name="value"):
    if value in (None, ""):
        if allow_none:
            return None
        raise serializers.ValidationError({field_name: "This field is required."})
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        raise serializers.ValidationError({field_name: "Enter a valid number."})
    if parsed < minimum:
        raise serializers.ValidationError({field_name: f"Enter a number greater than or equal to {minimum}."})
    if maximum is not None and parsed > maximum:
        raise serializers.ValidationError({field_name: f"Enter a number less than or equal to {maximum}."})
    return parsed


def maybe_positive_int(value, *, minimum=1, maximum=None):
    try:
        return parse_positive_int(value, minimum=minimum, maximum=maximum)
    except serializers.ValidationError:
        return None


def parse_page_window(query_params, *, default_limit=20, max_limit=100):
    try:
        limit = int(query_params.get("limit", default_limit) or default_limit)
        offset = int(query_params.get("offset", 0) or 0)
    except (TypeError, ValueError):
        return default_limit, 0
    return min(max(limit, 1), max_limit), max(offset, 0)
