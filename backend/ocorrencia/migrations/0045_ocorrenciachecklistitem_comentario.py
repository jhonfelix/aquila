from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ocorrencia', '0044_ocorrenciachecklistitem'),
    ]

    operations = [
        migrations.AddField(
            model_name='ocorrenciachecklistitem',
            name='comentario',
            field=models.TextField(blank=True, null=True, verbose_name='Comentário'),
        ),
    ]
