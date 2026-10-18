from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('material_apoio', '0007_alter_materialapoio_tipo_documento'),
    ]

    operations = [
        migrations.AlterField(
            model_name='materialapoio',
            name='categoria',
            field=models.CharField(blank=True, choices=[('NORMA', 'Norma'), ('LEGISLACAO', 'Legislação'), ('MANUAL', 'Manual'), ('PROCEDIMENTO', 'Procedimento'), ('INSTRUCAO', 'Instrução'), ('REGULAMENTO', 'Regulamento'), ('FORMULARIO', 'Formulário'), ('OUTRO', 'Outro')], max_length=50, null=True, verbose_name='Categoria'),
        ),
    ]
