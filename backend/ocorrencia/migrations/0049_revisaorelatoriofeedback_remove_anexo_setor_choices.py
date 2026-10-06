from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ocorrencia', '0048_ocorrenciarevisaorelatoriofeedback_setor'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='ocorrenciarevisaorelatoriofeedback',
            name='anexo',
        ),
        migrations.AlterField(
            model_name='ocorrenciarevisaorelatoriofeedback',
            name='setor',
            field=models.CharField(blank=True, null=True, max_length=20, verbose_name='Área/Setor Relacionado', choices=[
                ('COLETA', 'Coleta'),
                ('ANALISE', 'Análise'),
                ('FATOS', 'Fatos'),
                ('CONCLUSAO', 'Conclusão'),
            ]),
        ),
    ]
