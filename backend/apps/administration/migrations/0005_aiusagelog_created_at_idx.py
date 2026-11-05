from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("administration", "0004_adminauditlog_audit_actor_created_idx"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="aiusagelog",
            index=models.Index(fields=["created_at"], name="ai_log_created_idx"),
        ),
    ]
