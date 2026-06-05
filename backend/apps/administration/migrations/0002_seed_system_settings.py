from django.db import migrations


DEFAULT_SETTINGS = [
    ("maintenance_mode", "Maintenance mode", "boolean", {"value": False}, "Temporarily block public login and registration."),
    ("public_registration_enabled", "Public registration enabled", "boolean", {"value": True}, "Allow students to create accounts from the public registration form."),
    ("ai_features_enabled", "AI features enabled", "boolean", {"value": True}, "Global AI Lab feature toggle."),
    ("allowed_ai_file_extensions", "Allowed AI file extensions", "json", [".pdf", ".docx", ".pptx", ".xlsx", ".xlsm", ".txt", ".md", ".csv", ".json", ".xml", ".html", ".htm", ".rtf", ".odt"], "File extensions allowed for AI processing."),
    ("allowed_upload_file_extensions", "Allowed upload file extensions", "json", [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt", ".md", ".csv", ".png", ".jpg", ".jpeg", ".webp"], "File extensions allowed in Vault and chat uploads."),
    ("max_upload_size_mb", "Default max upload size MB", "integer", {"value": 25}, "Fallback upload size limit when a user-specific limit is not set."),
    ("active_ai_provider", "Active AI provider", "string", {"value": "openrouter"}, "Current AI provider label, such as Gemini, Groq, OpenRouter, or fallback."),
    ("active_ai_model", "Active AI model", "string", {"value": ""}, "Current model name shown to admins."),
    ("group_chat_creation_limit", "Group chat creation limit", "integer", {"value": 10}, "Maximum group conversations a user may create."),
    ("api_rate_limit_per_minute", "API rate limit per minute", "integer", {"value": 120}, "Default API rate limit target for future middleware/API enforcement."),
]


def seed_settings(apps, schema_editor):
    SystemSetting = apps.get_model("administration", "SystemSetting")
    for key, label, setting_type, value, description in DEFAULT_SETTINGS:
        SystemSetting.objects.get_or_create(
            key=key,
            defaults={
                "label": label,
                "setting_type": setting_type,
                "value": value,
                "description": description,
            },
        )


class Migration(migrations.Migration):

    dependencies = [
        ("administration", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_settings, migrations.RunPython.noop),
    ]
