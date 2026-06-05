from io import BytesIO

from django.conf import settings
from django.core.files.storage import Storage
from supabase import create_client


class SupabaseMediaStorage(Storage):
    def __init__(self):
        self.supabase_url = settings.SUPABASE_URL.rstrip("/")
        self.supabase_key = settings.SUPABASE_KEY
        self.bucket_name = settings.SUPABASE_MEDIA_BUCKET
        self.client = create_client(self.supabase_url, self.supabase_key)

    def _normalize_name(self, name):
        return str(name or "").replace("\\", "/").lstrip("/")

    def _save(self, name, content):
        name = self._normalize_name(name)
        if hasattr(content, "seek"):
            content.seek(0)
        data = content.read() if hasattr(content, "read") else content
        content_type = getattr(content, "content_type", None)
        file_options = {"upsert": "true"}
        if content_type:
            file_options["content-type"] = content_type
        self.client.storage.from_(self.bucket_name).upload(
            path=name,
            file=data,
            file_options=file_options,
        )
        return name

    def _open(self, name, mode="rb"):
        data = self.client.storage.from_(self.bucket_name).download(self._normalize_name(name))
        return BytesIO(data)

    def delete(self, name):
        name = self._normalize_name(name)
        if name:
            self.client.storage.from_(self.bucket_name).remove([name])

    def exists(self, name):
        name = self._normalize_name(name)
        if not name:
            return False
        try:
            return bool(self.client.storage.from_(self.bucket_name).exists(name))
        except Exception:
            return False

    def size(self, name):
        name = self._normalize_name(name)
        if not name:
            return 0
        try:
            metadata = self.client.storage.from_(self.bucket_name).info(name)
            return metadata.get("metadata", {}).get("size", 0) or 0
        except Exception:
            return 0

    def url(self, name):
        name = self._normalize_name(name)
        if not name:
            return ""
        return f"{self.supabase_url}/storage/v1/object/public/{self.bucket_name}/{name}"
