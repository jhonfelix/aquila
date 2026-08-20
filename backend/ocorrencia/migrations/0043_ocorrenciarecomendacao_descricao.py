from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ocorrencia', '0042_ocorrenciafatorcontribuinte_campos'),
    ]

    operations = [
        migrations.AddField(
            model_name='ocorrenciarecomendacao',
            name='descricao',
            field=models.TextField(default='', verbose_name='Descrição da Recomendação'),
            preserve_default=False,
        ),
    ]
