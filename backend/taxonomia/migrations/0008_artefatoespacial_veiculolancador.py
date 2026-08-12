from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('taxonomia', '0007_alter_aeronavegeral_matricula'),
    ]

    operations = [
        migrations.CreateModel(
            name='ArtefatoEspacial',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('designacao', models.CharField(max_length=120)),
                ('numero_serie', models.CharField(blank=True, max_length=80, null=True)),
                ('fabricante', models.CharField(blank=True, max_length=120, null=True)),
                ('operador', models.CharField(blank=True, max_length=120, null=True)),
                ('pais_fabricacao', models.CharField(blank=True, max_length=60, null=True)),
                ('pais_operador', models.CharField(blank=True, max_length=60, null=True)),
                ('ano_fabricacao', models.IntegerField(blank=True, null=True)),
                ('tipo_artefato', models.CharField(choices=[('foguete', 'Foguete'), ('satelite', 'Satélite'), ('sonda', 'Sonda'), ('capsula', 'Cápsula'), ('estacao', 'Estação Espacial')], max_length=30)),
                ('status', models.CharField(blank=True, max_length=50, null=True)),
                ('criado_em', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Artefato Espacial',
                'verbose_name_plural': 'Artefatos Espaciais',
                'db_table': 'veiculo_geral',
                'ordering': ['designacao'],
            },
        ),
        migrations.CreateModel(
            name='VeiculoLancador',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('altura_metros', models.FloatField(blank=True, null=True)),
                ('diametro_metros', models.FloatField(blank=True, null=True)),
                ('massa_total_kg', models.FloatField(blank=True, null=True)),
                ('carga_util_leo_kg', models.FloatField(blank=True, null=True)),
                ('carga_util_geo_kg', models.FloatField(blank=True, null=True)),
                ('numero_estagios', models.IntegerField(blank=True, null=True)),
                ('tipo_propulsao', models.CharField(choices=[('liquido', 'Líquido'), ('solido', 'Sólido'), ('hibrido', 'Híbrido')], max_length=50)),
                ('propelente', models.CharField(blank=True, choices=[('RP-1/LOX', 'RP-1/LOX'), ('LH2/LOX', 'LH2/LOX'), ('Metano/LOX', 'Metano/LOX')], max_length=120, null=True)),
                ('quantidade_motores_primeiro_estagio', models.IntegerField(blank=True, null=True)),
                ('empuxo_total_kN', models.FloatField(blank=True, null=True)),
                ('reutilizavel', models.BooleanField(default=False)),
                ('artefato', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='veiculo_lancador', to='taxonomia.artefatoespacial')),
            ],
            options={
                'verbose_name': 'Veículo Lançador',
                'verbose_name_plural': 'Veículos Lançadores',
                'db_table': 'veiculo_lancador',
                'ordering': ['artefato__designacao'],
            },
        ),
    ]
