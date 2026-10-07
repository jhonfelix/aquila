from django.db import migrations, models

VALIDOS = ['PROP', 'TACS', 'SEP-STR', 'ENV', 'HW', 'FSW', 'OPS', 'INT']


def limpar_tipos_antigos(apps, schema_editor):
    # Taxonomia antiga (explosao, falha_estagio...) não tem correspondência
    # direta com os Anexos M/N; fica vazio para ser reclassificado.
    Ocorrencia = apps.get_model('ocorrencia', 'OcorrenciaGeral')
    Ocorrencia.objects.exclude(tipo__in=VALIDOS).update(tipo=None)


class Migration(migrations.Migration):

    dependencies = [
        ('ocorrencia', '0051_tipo_ocorrencia_choices_anexos_k_l'),
    ]

    operations = [
        migrations.RunPython(limpar_tipos_antigos, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='ocorrenciageral',
            name='tipo',
            field=models.CharField(choices=[
                ('PROP', 'PROP — Sistema de Propulsão'),
                ('TACS', 'TACS — Controle de Atitude, Aviônica e Guiagem'),
                ('SEP-STR', 'SEP-STR — Sistemas de Separação e Estrutura'),
                ('ENV', 'ENV — Origem Ambiental'),
                ('HW', 'HW — Origem em Hardware Embarcado'),
                ('FSW', 'FSW — Origem em Software Embarcado'),
                ('OPS', 'OPS — Origem em Operações Terrestres e Segmento Solo'),
                ('INT', 'INT — Origem Intencional e Interferência Adversária'),
            ], max_length=50, null=True, verbose_name='tipo'),
        ),
    ]
