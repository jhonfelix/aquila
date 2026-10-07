from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ocorrencia', '0050_aerodromo_to_organizacao_choices'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ocorrenciageral',
            name='tipo',
            field=models.CharField(choices=[
                ('explosao', 'Explosão'),
                ('falha_estagio', 'Falha de Estágio'),
                ('perda_telemetria', 'Perda de Telemetria'),
                ('falha_motor', 'Falha de Motor'),
                ('reentrada_nao_controlada', 'Reentrada Não Controlada'),
                ('colisao_orbital', 'Colisão Orbital'),
                ('acionamento_fts', 'Acionamento do FTS (Sistema de Terminação de Voo)'),
                ('perda_veiculo_lov', 'Perda de enlace / veículo (LOV)'),
                ('perda_sinal_lom', 'Perda total de sinal / perda de missão (LOM)'),
                ('anomalia_atitude', 'Anomalia de atitude (AOCS)'),
                ('anomalia_carga_util', 'Anomalia de carga útil (payload)'),
                ('fragmentacao_orbital', 'Fragmentação orbital'),
                ('outro', 'Outro'),
            ], max_length=50, null=True, verbose_name='tipo'),
        ),
    ]
