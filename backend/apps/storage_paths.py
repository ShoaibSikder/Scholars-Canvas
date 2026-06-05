import re
from pathlib import Path

from django.utils.text import get_valid_filename, slugify


def _user_folder(user):
    label = (
        getattr(user, "full_name", "")
        or getattr(user, "email", "")
        or f"user-{getattr(user, 'pk', '')}"
        or "unknown-user"
    )
    folder = slugify(label) or re.sub(r"[^A-Za-z0-9._-]+", "-", label).strip("-._")
    return folder or "unknown-user"


def _clean_filename(filename):
    path = Path(filename or "upload")
    stem = get_valid_filename(path.stem) or "upload"
    suffix = get_valid_filename(path.suffix)
    return f"{stem}{suffix}"


def profile_picture_upload_path(instance, filename):
    return f"profile_picture/{_user_folder(instance)}/{_clean_filename(filename)}"


def vault_resource_upload_path(instance, filename):
    user = getattr(getattr(instance, "course", None), "user", None)
    return f"vault_resources/{_user_folder(user)}/{_clean_filename(filename)}"


def communication_upload_path(instance, filename):
    return f"communication/{_user_folder(getattr(instance, 'sender', None))}/{_clean_filename(filename)}"
