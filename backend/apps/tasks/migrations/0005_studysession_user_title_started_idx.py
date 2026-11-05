from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tasks", "0004_task_task_user_due_status_idx"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="studysession",
            index=models.Index(fields=["user", "title", "started_at"], name="study_user_title_start_idx"),
        ),
    ]
