from django.db import migrations, models


def converter_tipos(apps, schema_editor):
    OcorrenciaAeronave = apps.get_model('ocorrencia', 'OcorrenciaAeronave')
    OcorrenciaAeronave.objects.filter(tipo='Estágio de foguete').update(tipo='Veículo lançador')
    # Cápsula / Sonda não existem mais como tipo: ficam sem tipo para revisão manual.
    OcorrenciaAeronave.objects.filter(tipo__in=['Cápsula', 'Sonda']).update(tipo=None)


def reverter_tipos(apps, schema_editor):
    OcorrenciaAeronave = apps.get_model('ocorrencia', 'OcorrenciaAeronave')
    OcorrenciaAeronave.objects.filter(tipo__in=['Veículo lançador', 'Veículo suborbital']).update(tipo='Estágio de foguete')


class Migration(migrations.Migration):

    dependencies = [
        ('ocorrencia', '0056_ocorrenciadocumento_descricao'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ocorrenciaaeronave',
            name='tipo',
            field=models.CharField(blank=True, choices=[('Veículo lançador', 'Veículo lançador'), ('Veículo suborbital', 'Veículo suborbital'), ('Satélite', 'Satélite')], max_length=25, null=True, verbose_name='Tipo'),
        ),
        migrations.RunPython(converter_tipos, reverter_tipos),
    ]
