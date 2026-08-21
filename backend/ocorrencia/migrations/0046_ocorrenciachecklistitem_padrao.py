from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ocorrencia', '0045_ocorrenciachecklistitem_comentario'),
    ]

    operations = [
        migrations.AddField(
            model_name='ocorrenciachecklistitem',
            name='padrao',
            field=models.BooleanField(default=False, help_text='Itens padrão (semeados de CHECKLIST_ITENS_PADRAO) não podem ser excluídos.', verbose_name='Item Padrão'),
        ),
    ]
