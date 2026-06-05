def media_url(field_file):
    if not field_file:
        return ""
    url = field_file.url
    if url.startswith(("http://", "https://")):
        return url
    return url


def request_media_url(request, field_file):
    url = media_url(field_file)
    if not url:
        return ""
    if url.startswith(("http://", "https://")) or not request:
        return url
    return request.build_absolute_uri(url)
