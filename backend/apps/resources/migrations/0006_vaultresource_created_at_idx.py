from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("resources", "0005_alter_vaultresource_file"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="vaultresource",
            index=models.Index(fields=["created_at"], name="resource_created_idx"),
        ),
    ]
