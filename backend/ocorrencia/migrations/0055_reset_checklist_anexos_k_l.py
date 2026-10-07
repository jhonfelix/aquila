from django.db import migrations


def apagar_itens(apps, schema_editor):
    # Checklist aeronáutico antigo substituído pelos Anexos K/L: apaga itens e
    # comentários; o novo checklist é semeado ao abrir o checklist da ocorrência
    # (seed/), conforme o tipo do artefato.
    apps.get_model('ocorrencia', 'OcorrenciaChecklistItem').objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('ocorrencia', '0054_tipo_agrupado_remove_subtipo'),
    ]

    operations = [
        migrations.RunPython(apagar_itens, migrations.RunPython.noop),
    ]
