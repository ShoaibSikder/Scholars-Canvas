from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("communication", "0006_messageread_typingindicator"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="message",
            index=models.Index(fields=["conversation", "created_at"], name="msg_conv_created_idx"),
        ),
    ]
