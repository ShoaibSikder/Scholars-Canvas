from django.db import migrations


def promote_superusers(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    User.objects.filter(is_superuser=True).update(role="super_admin", is_staff=True)


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0005_user_account_status_user_ai_features_enabled_and_more"),
    ]

    operations = [
        migrations.RunPython(promote_superusers, migrations.RunPython.noop),
    ]
