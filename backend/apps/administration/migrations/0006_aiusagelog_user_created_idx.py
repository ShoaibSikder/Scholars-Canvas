from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("administration", "0005_aiusagelog_created_at_idx")]

    operations = [
        migrations.AddIndex(
            model_name="aiusagelog",
            index=models.Index(fields=["user", "created_at"], name="ai_log_user_created_idx"),
        )
    ]
