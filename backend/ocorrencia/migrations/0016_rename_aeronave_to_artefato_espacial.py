import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ocorrencia', '0015_ocorrenciadocumento_arquivo_and_more'),
        ('taxonomia', '0008_artefatoespacial_veiculolancador'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='ocorrenciaaeronave',
            name='aeronave',
        ),
        migrations.AddField(
            model_name='ocorrenciaaeronave',
            name='artefato_espacial',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to='taxonomia.veiculolancador',
                verbose_name='Artefato Espacial',
            ),
        ),
    ]
