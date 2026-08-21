import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ocorrencia', '0043_ocorrenciarecomendacao_descricao'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='OcorrenciaChecklistItem',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('etapa', models.CharField(choices=[('COLETA_DADOS', 'Coleta de Dados'), ('ANALISE', 'Análise'), ('FATOS', 'Fatos')], max_length=20, verbose_name='Etapa')),
                ('descricao', models.CharField(max_length=255, verbose_name='Descrição')),
                ('ordem', models.PositiveIntegerField(default=0, verbose_name='Ordem')),
                ('realizado', models.BooleanField(default=False, verbose_name='Realizado')),
                ('data_vinculacao', models.DateField(blank=True, null=True, verbose_name='Data de Vinculação')),
                ('cadastrado_em', models.DateTimeField(auto_now_add=True)),
                ('ocorrencia', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ocorrencia_checklist_item', to='ocorrencia.ocorrenciageral', verbose_name='Ocorrência')),
                ('responsavel', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL, verbose_name='Responsável')),
            ],
            options={
                'verbose_name': 'Item de Checklist',
                'verbose_name_plural': 'Ocorrência Checklist Item',
                'db_table': 'ocorrencia_checklist_item',
                'ordering': ['etapa', 'ordem', 'id'],
            },
        ),
    ]
