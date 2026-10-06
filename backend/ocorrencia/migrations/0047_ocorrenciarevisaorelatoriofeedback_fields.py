import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('ocorrencia', '0046_ocorrenciachecklistitem_padrao'),
    ]

    operations = [
        migrations.AddField(
            model_name='ocorrenciarevisaorelatoriofeedback',
            name='autor',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='ocorrencia_revisao_relatorio_feedback_autor', to=settings.AUTH_USER_MODEL, verbose_name='Autor'),
        ),
        migrations.AddField(
            model_name='ocorrenciarevisaorelatoriofeedback',
            name='comentario',
            field=models.TextField(default='', verbose_name='Comentário'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='ocorrenciarevisaorelatoriofeedback',
            name='anexo',
            field=models.FileField(blank=True, null=True, upload_to='revisao_relatorio/feedback/', verbose_name='Anexo'),
        ),
        migrations.AddField(
            model_name='ocorrenciarevisaorelatoriofeedback',
            name='criado_em',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now, verbose_name='Criado Em'),
            preserve_default=False,
        ),
        migrations.AlterModelOptions(
            name='ocorrenciarevisaorelatoriofeedback',
            options={'ordering': ['-criado_em', '-id'], 'verbose_name': 'Feedback do Painel de Revisão RF', 'verbose_name_plural': 'Feedback do Painel de Revisão RF'},
        ),
    ]
