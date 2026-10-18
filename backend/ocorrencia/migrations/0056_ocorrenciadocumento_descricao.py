from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ocorrencia', '0055_reset_checklist_anexos_k_l'),
    ]

    operations = [
        migrations.AddField(
            model_name='ocorrenciadocumento',
            name='descricao',
            field=models.TextField(blank=True, null=True, verbose_name='Informações do documento'),
        ),
    ]
