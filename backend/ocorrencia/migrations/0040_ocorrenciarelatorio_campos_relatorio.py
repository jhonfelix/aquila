from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ocorrencia', '0039_alter_ocorrenciaasoaci_destino_notificacao_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='ocorrenciarelatorio',
            name='relatorio_pt',
            field=models.FileField(blank=True, max_length=255, null=True, upload_to='ocorrencia/relatorios/', verbose_name='Relatório em Português'),
        ),
        migrations.AddField(
            model_name='ocorrenciarelatorio',
            name='relatorio_en',
            field=models.FileField(blank=True, max_length=255, null=True, upload_to='ocorrencia/relatorios/', verbose_name='Relatório em Inglês'),
        ),
        migrations.AddField(
            model_name='ocorrenciarelatorio',
            name='relatorio_es',
            field=models.FileField(blank=True, max_length=255, null=True, upload_to='ocorrencia/relatorios/', verbose_name='Relatório em Espanhol'),
        ),
        migrations.AddField(
            model_name='ocorrenciarelatorio',
            name='publicar_site_sipae',
            field=models.BooleanField(default=True, verbose_name='Publicar no site e Painel Sipae?'),
        ),
        migrations.AddField(
            model_name='ocorrenciarelatorio',
            name='comunicar_elos',
            field=models.CharField(
                blank=True,
                choices=[
                    ('ANAC', 'ANAC'),
                    ('DECEA', 'DECEA'),
                    ('RepAcred', 'RepAcred'),
                    ('ICAO', 'ICAO'),
                    ('ANAC,DECEA', 'ANAC e DECEA'),
                    ('ANAC,DECEA,RepAcred', 'ANAC, DECEA e RepAcred'),
                    ('ANAC,DECEA,RepAcred,ICAO', 'ANAC, DECEA, RepAcred e ICAO'),
                    ('TODOS', 'Todos'),
                ],
                help_text='Gostaria de comunicar aos Elos de Coordenação sobre a publicação deste relatório? Ex: DCTA e/ou RepAcred.',
                max_length=100,
                null=True,
                verbose_name='Comunicar aos Elos de Coordenação via e-mail',
            ),
        ),
        migrations.AddField(
            model_name='ocorrenciarelatorio',
            name='observacoes',
            field=models.TextField(blank=True, null=True, verbose_name='Observações'),
        ),
        migrations.AddField(
            model_name='ocorrenciarelatorio',
            name='data_assinatura',
            field=models.DateField(blank=True, null=True, verbose_name='Data da Assinatura'),
        ),
        migrations.AddField(
            model_name='ocorrenciarelatorio',
            name='data_publicacao',
            field=models.DateField(blank=True, null=True, verbose_name='Data de Publicação'),
        ),
        migrations.AddField(
            model_name='ocorrenciarelatorio',
            name='data_cadastro',
            field=models.DateField(blank=True, null=True, verbose_name='Data de Cadastro'),
        ),
    ]
