from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('taxonomia', '0008_artefatoespacial_veiculolancador'),
        ('ocorrencia', '0016_rename_aeronave_to_artefato_espacial'),
    ]

    operations = [
        migrations.DeleteModel(
            name='AeronaveGeral',
        ),
    ]
