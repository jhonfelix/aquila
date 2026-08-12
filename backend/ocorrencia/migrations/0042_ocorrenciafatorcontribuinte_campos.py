from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ocorrencia', '0041_alter_ocorrenciaasoaci_tem_rep_acred_and_more'),
        ('ocorrencia', '0040_ocorrenciarelatorio_campos_relatorio'),
    ]

    operations = [
        migrations.AddField(
            model_name='ocorrenciafatorcontribuinte',
            name='fator',
            field=models.CharField(
                choices=[
                    ('FATOR HUMANO - ASPECTO PSICOLÓGICO - ATITUDE', 'FATOR HUMANO - ASPECTO PSICOLÓGICO - ATITUDE'),
                    ('FATOR HUMANO - ASPECTO PSICOLÓGICO - MOTIVAÇÃO', 'FATOR HUMANO - ASPECTO PSICOLÓGICO - MOTIVAÇÃO'),
                    ('FATOR HUMANO - ASPECTO PSICOLÓGICO - PERCEPÇÃO', 'FATOR HUMANO - ASPECTO PSICOLÓGICO - PERCEPÇÃO'),
                    ('FATOR HUMANO - ASPECTO PSICOLÓGICO - PERSONALIDADE', 'FATOR HUMANO - ASPECTO PSICOLÓGICO - PERSONALIDADE'),
                    ('FATOR HUMANO - ASPECTO PSICOLÓGICO - TOMADA DE DECISÃO', 'FATOR HUMANO - ASPECTO PSICOLÓGICO - TOMADA DE DECISÃO'),
                    ('FATOR HUMANO - ASPECTO FISIOLÓGICO - CONDIÇÃO MÉDICA', 'FATOR HUMANO - ASPECTO FISIOLÓGICO - CONDIÇÃO MÉDICA'),
                    ('FATOR HUMANO - ASPECTO FISIOLÓGICO - FADIGA', 'FATOR HUMANO - ASPECTO FISIOLÓGICO - FADIGA'),
                    ('FATOR HUMANO - ASPECTO FISIOLÓGICO - USO DE SUBSTÂNCIA', 'FATOR HUMANO - ASPECTO FISIOLÓGICO - USO DE SUBSTÂNCIA'),
                    ('FATOR HUMANO - CAPACITAÇÃO - CONHECIMENTO', 'FATOR HUMANO - CAPACITAÇÃO - CONHECIMENTO'),
                    ('FATOR HUMANO - CAPACITAÇÃO - EXPERIÊNCIA', 'FATOR HUMANO - CAPACITAÇÃO - EXPERIÊNCIA'),
                    ('FATOR HUMANO - CAPACITAÇÃO - HABILITAÇÃO', 'FATOR HUMANO - CAPACITAÇÃO - HABILITAÇÃO'),
                    ('FATOR HUMANO - CAPACITAÇÃO - TREINAMENTO', 'FATOR HUMANO - CAPACITAÇÃO - TREINAMENTO'),
                    ('FATOR HUMANO - COMUNICAÇÃO - COORDENAÇÃO', 'FATOR HUMANO - COMUNICAÇÃO - COORDENAÇÃO'),
                    ('FATOR HUMANO - COMUNICAÇÃO - FALHA DE COMUNICAÇÃO', 'FATOR HUMANO - COMUNICAÇÃO - FALHA DE COMUNICAÇÃO'),
                    ('FATOR HUMANO - JULGAMENTO/AÇÃO - AVALIAÇÃO DE RISCO', 'FATOR HUMANO - JULGAMENTO/AÇÃO - AVALIAÇÃO DE RISCO'),
                    ('FATOR HUMANO - JULGAMENTO/AÇÃO - DESCUMPRIMENTO DE NORMA', 'FATOR HUMANO - JULGAMENTO/AÇÃO - DESCUMPRIMENTO DE NORMA'),
                    ('FATOR HUMANO - JULGAMENTO/AÇÃO - ERRO DE PROCEDIMENTO', 'FATOR HUMANO - JULGAMENTO/AÇÃO - ERRO DE PROCEDIMENTO'),
                    ('FATOR HUMANO - JULGAMENTO/AÇÃO - PLANEJAMENTO INADEQUADO', 'FATOR HUMANO - JULGAMENTO/AÇÃO - PLANEJAMENTO INADEQUADO'),
                    ('FATOR MATERIAL - PROJETO - DEFICIÊNCIA DE PROJETO', 'FATOR MATERIAL - PROJETO - DEFICIÊNCIA DE PROJETO'),
                    ('FATOR MATERIAL - PROJETO - INTEGRAÇÃO DE SISTEMAS', 'FATOR MATERIAL - PROJETO - INTEGRAÇÃO DE SISTEMAS'),
                    ('FATOR MATERIAL - FABRICAÇÃO - CONTROLE DE QUALIDADE', 'FATOR MATERIAL - FABRICAÇÃO - CONTROLE DE QUALIDADE'),
                    ('FATOR MATERIAL - FABRICAÇÃO - DEFEITO DE FABRICAÇÃO', 'FATOR MATERIAL - FABRICAÇÃO - DEFEITO DE FABRICAÇÃO'),
                    ('FATOR MATERIAL - MANUTENÇÃO - FALTA DE MANUTENÇÃO', 'FATOR MATERIAL - MANUTENÇÃO - FALTA DE MANUTENÇÃO'),
                    ('FATOR MATERIAL - MANUTENÇÃO - MANUTENÇÃO INADEQUADA', 'FATOR MATERIAL - MANUTENÇÃO - MANUTENÇÃO INADEQUADA'),
                    ('FATOR MATERIAL - FALHA DE COMPONENTE - DESGASTE', 'FATOR MATERIAL - FALHA DE COMPONENTE - DESGASTE'),
                    ('FATOR MATERIAL - FALHA DE COMPONENTE - FALHA ESTRUTURAL', 'FATOR MATERIAL - FALHA DE COMPONENTE - FALHA ESTRUTURAL'),
                    ('FATOR MATERIAL - FALHA DE COMPONENTE - FALHA DE SISTEMA', 'FATOR MATERIAL - FALHA DE COMPONENTE - FALHA DE SISTEMA'),
                    ('FATOR MATERIAL - FALHA DE COMPONENTE - FALHA DE SOFTWARE', 'FATOR MATERIAL - FALHA DE COMPONENTE - FALHA DE SOFTWARE'),
                    ('FATOR OPERACIONAL - PLANEJAMENTO - BRIEFING INADEQUADO', 'FATOR OPERACIONAL - PLANEJAMENTO - BRIEFING INADEQUADO'),
                    ('FATOR OPERACIONAL - PLANEJAMENTO - PLANEJAMENTO INADEQUADO', 'FATOR OPERACIONAL - PLANEJAMENTO - PLANEJAMENTO INADEQUADO'),
                    ('FATOR OPERACIONAL - SUPERVISÃO - FISCALIZAÇÃO INADEQUADA', 'FATOR OPERACIONAL - SUPERVISÃO - FISCALIZAÇÃO INADEQUADA'),
                    ('FATOR OPERACIONAL - SUPERVISÃO - SUPERVISÃO INADEQUADA', 'FATOR OPERACIONAL - SUPERVISÃO - SUPERVISÃO INADEQUADA'),
                    ('FATOR OPERACIONAL - INFRAESTRUTURA - APOIO AO SOLO', 'FATOR OPERACIONAL - INFRAESTRUTURA - APOIO AO SOLO'),
                    ('FATOR OPERACIONAL - INFRAESTRUTURA - DOCUMENTAÇÃO', 'FATOR OPERACIONAL - INFRAESTRUTURA - DOCUMENTAÇÃO'),
                    ('FATOR OPERACIONAL - INFRAESTRUTURA - INSTALAÇÕES', 'FATOR OPERACIONAL - INFRAESTRUTURA - INSTALAÇÕES'),
                    ('FATOR AMBIENTAL - METEOROLOGIA - CONDIÇÕES METEOROLÓGICAS', 'FATOR AMBIENTAL - METEOROLOGIA - CONDIÇÕES METEOROLÓGICAS'),
                    ('FATOR AMBIENTAL - METEOROLOGIA - INFORMAÇÃO METEOROLÓGICA', 'FATOR AMBIENTAL - METEOROLOGIA - INFORMAÇÃO METEOROLÓGICA'),
                    ('FATOR AMBIENTAL - ESPAÇO - DEBRIS ESPACIAL', 'FATOR AMBIENTAL - ESPAÇO - DEBRIS ESPACIAL'),
                    ('FATOR AMBIENTAL - ESPAÇO - RADIAÇÃO', 'FATOR AMBIENTAL - ESPAÇO - RADIAÇÃO'),
                    ('FATOR AMBIENTAL - ESPAÇO - VÁCUO', 'FATOR AMBIENTAL - ESPAÇO - VÁCUO'),
                    ('FATOR AMBIENTAL - INTERFERÊNCIA EXTERNA - INTERFERÊNCIA ELETROMAGNÉTICA', 'FATOR AMBIENTAL - INTERFERÊNCIA EXTERNA - INTERFERÊNCIA ELETROMAGNÉTICA'),
                    ('FATOR AMBIENTAL - INTERFERÊNCIA EXTERNA - INTERFERÊNCIA HUMANA', 'FATOR AMBIENTAL - INTERFERÊNCIA EXTERNA - INTERFERÊNCIA HUMANA'),
                    ('OUTRO FATOR - OUTRO - OUTRO', 'OUTRO FATOR - OUTRO - OUTRO'),
                ],
                max_length=200,
                verbose_name='Fator Contribuinte',
                default='OUTRO FATOR - OUTRO - OUTRO',
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='ocorrenciafatorcontribuinte',
            name='nivel_contribuicao',
            field=models.CharField(
                choices=[
                    ('CONTRIBUIU', 'CONTRIBUIU'),
                    ('INDUZIU', 'INDUZIU'),
                    ('NÃO DETERMINOU', 'NÃO DETERMINOU'),
                    ('INDETERMINADO', 'INDETERMINADO'),
                ],
                max_length=50,
                verbose_name='Nível de Contribuição',
                default='INDETERMINADO',
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='ocorrenciafatorcontribuinte',
            name='observacoes',
            field=models.TextField(blank=True, null=True, verbose_name='Observações'),
        ),
        migrations.AlterModelOptions(
            name='ocorrenciafatorcontribuinte',
            options={
                'ordering': ['id'],
                'verbose_name': 'Fator Contribuinte',
                'verbose_name_plural': 'Fatores Contribuintes',
            },
        ),
    ]
