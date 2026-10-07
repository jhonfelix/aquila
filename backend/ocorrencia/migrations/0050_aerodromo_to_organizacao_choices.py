from django.db import migrations, models

CHOICES = [('CLA', 'CLA'), ('CLBI', 'CLBI'), ('COPE', 'COPE')]


def copy_icao(apps, schema_editor):
    Ocorrencia = apps.get_model('ocorrencia', 'OcorrenciaGeral')
    for o in Ocorrencia.objects.select_related('aerodromo'):
        icao = (o.aerodromo.icao or '').upper()
        # Registros fora de CLA/CLBI/COPE ficam vazios para serem reclassificados.
        o.aerodromo_sigla = icao if icao in ('CLA', 'CLBI', 'COPE') else ''
        o.save(update_fields=['aerodromo_sigla'])


class Migration(migrations.Migration):

    dependencies = [
        ('ocorrencia', '0049_revisaorelatoriofeedback_remove_anexo_setor_choices'),
    ]

    operations = [
        migrations.AddField(
            model_name='ocorrenciageral',
            name='aerodromo_sigla',
            field=models.CharField(max_length=10, blank=True, default=''),
            preserve_default=False,
        ),
        migrations.RunPython(copy_icao, migrations.RunPython.noop),
        migrations.RemoveField(model_name='ocorrenciageral', name='aerodromo'),
        migrations.RenameField(model_name='ocorrenciageral', old_name='aerodromo_sigla', new_name='aerodromo'),
        migrations.AlterField(
            model_name='ocorrenciageral',
            name='aerodromo',
            field=models.CharField(choices=CHOICES, max_length=10, verbose_name='Organização do segmento espacial'),
        ),
    ]
