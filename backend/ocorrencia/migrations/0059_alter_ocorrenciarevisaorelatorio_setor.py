from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ocorrencia', '0058_ocorrenciacomissao_identificacao_rai_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ocorrenciarevisaorelatorio',
            name='setor',
            field=models.CharField(blank=True, null=True, max_length=150, verbose_name='Setor Responsável', choices=[
                ('DESIGNACAO', 'Designação'),
                ('REVISAO_PRELIMINAR_FATOR_OPERACIONAL', 'Revisão Preliminar/Fator Operacional'),
                ('REVISAO_FATOR_HUMANO', 'Revisão Fator Humano'),
                ('REVISAO_FATOR_MATERIAL', 'Revisão Fator Material'),
                ('RECOMENDACAO_DE_SEGURANCA', 'Recomendação de Segurança'),
                ('JEDI', 'JEDI'),
                ('REVISAO_GRAMATICAL', 'Revisão Gramatical'),
                ('REVISAO_FINAL', 'Revisão Final'),
                ('APRECIACAO_CHEFE_DIP', 'Apreciação Chefe DESP'),
                ('APRECIACAO_CHEFE_DO_CENIPA', 'Apreciação Chefe do CENIPA'),
                ('CONTROLE_IMPRESSAO', 'Controle/Impressão'),
                ('TRADUCAO', 'Tradução'),
                ('ASOACI', 'ASOACI'),
                ('VALIDACAO_DE_DADOS', 'Validação de Dados'),
                ('DIVULGACAO', 'Divulgação'),
                ('ASSINATURA_CHEFE_DO_CENIPA', 'Assinatura Chefe do CENIPA'),
                ('ARQUIVO', 'Arquivo'),
                ('REABERTURA', 'Reabertura'),
            ]),
        ),
    ]
