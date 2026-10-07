from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ocorrencia', '0053_ocorrenciageral_subtipo'),
    ]

    operations = [
        migrations.RemoveField(model_name='ocorrenciageral', name='subtipo'),
        migrations.AlterField(
            model_name='ocorrenciageral',
            name='tipo',
            field=models.CharField(choices=[
                ('PROP — Sistema de Propulsão', [
                    ('PROP.1', 'PROP.1 — Motores e Câmaras de Combustão'),
                    ('PROP.2', 'PROP.2 — Sistema de Alimentação e Injeção de Propelente'),
                    ('PROP.3', 'PROP.3 — Controle de Fluxo e Pressurização'),
                ]),
                ('TACS — Controle de Atitude, Aviônica e Guiagem', [
                    ('TACS.1', 'TACS.1 — Unidades de Guiagem e Navegação (GNC / Computador de Voo)'),
                    ('TACS.2', 'TACS.2 — Sensores e Instrumentação'),
                    ('TACS.3', 'TACS.3 — Sistema Elétrico e Transmissão de Sinal'),
                    ('TACS.4', 'TACS.4 — Atuadores de Vetorização de Empuxo (TVC)'),
                ]),
                ('SEP-STR — Sistemas de Separação e Estrutura', [
                    ('SEP-STR.1', 'SEP-STR.1 — Mecanismos de Separação de Estágios'),
                    ('SEP-STR.2', 'SEP-STR.2 — Sistema de Coifa de Proteção (Payload Fairing)'),
                    ('SEP-STR.3', 'SEP-STR.3 — Integridade Estrutural e Materiais'),
                ]),
                ('ENV — Origem Ambiental', [
                    ('ENV.1', 'ENV.1 — Radiação Ionizante e Efeitos de Evento Único (SEE)'),
                    ('ENV.2', 'ENV.2 — Carregamento Eletrostático e Descargas (ESD)'),
                    ('ENV.3', 'ENV.3 — Micrometeoroides e Detritos Orbitais (MMOD)'),
                    ('ENV.4', 'ENV.4 — Perturbações Geomagnéticas e Clima Espacial'),
                ]),
                ('HW — Origem em Hardware Embarcado', [
                    ('HW.1', 'HW.1 — Componentes Eletrônicos e Potência Elétrica (EPS)'),
                    ('HW.2', 'HW.2 — Mecanismos, Estrutura e Controle Térmico'),
                    ('HW.3', 'HW.3 — Subsistema Propulsivo Embarcado'),
                ]),
                ('FSW — Origem em Software Embarcado', [
                    ('FSW.1', 'FSW.1 — Erros Lógicos de Voo e RTOS'),
                    ('FSW.2', 'FSW.2 — Mecanismos de Tolerância a Falhas e Memória'),
                ]),
                ('OPS — Origem em Operações Terrestres e Segmento Solo', [
                    ('OPS.1', 'OPS.1 — Infraestrutura de Solo e Enlaces'),
                    ('OPS.2', 'OPS.2 — Fatores Humanos e Procedimentos Operacionais'),
                ]),
                ('INT — Origem Intencional e Interferência Adversária', [
                    ('INT.1', 'INT.1 — Interferência em Radiofrequência e Guerra Eletrônica'),
                    ('INT.2', 'INT.2 — Ataques Ciber e Ações Antissatélite (ASAT)'),
                ]),
            ], max_length=50, null=True, verbose_name='tipo'),
        ),
    ]
