from django.db import migrations


AI_EXTENSIONS = [
    ".pdf",
    ".docx",
    ".pptx",
    ".xlsx",
    ".xlsm",
    ".txt",
    ".md",
    ".csv",
    ".json",
    ".xml",
    ".html",
    ".htm",
    ".rtf",
    ".odt",
]


def expand_ai_file_extensions(apps, schema_editor):
    SystemSetting = apps.get_model("administration", "SystemSetting")
    setting, _ = SystemSetting.objects.get_or_create(
        key="allowed_ai_file_extensions",
        defaults={
            "label": "Allowed AI file extensions",
            "setting_type": "json",
            "value": AI_EXTENSIONS,
            "description": "File extensions allowed for AI processing.",
        },
    )
    current = setting.value if isinstance(setting.value, list) else []
    merged = []
    for extension in [*current, *AI_EXTENSIONS]:
        extension = str(extension).strip().lower()
        if extension and extension not in merged:
            merged.append(extension)
    setting.value = merged
    setting.save(update_fields=["value", "updated_at"])


class Migration(migrations.Migration):
    dependencies = [
        ("administration", "0002_seed_system_settings"),
    ]

    operations = [
        migrations.RunPython(expand_ai_file_extensions, migrations.RunPython.noop),
    ]
