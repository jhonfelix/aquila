from django.db import models
from taxonomia.models import GeografiaCidade, VeiculoLancador
from usuario.models import User

class OcorrenciaGeral(models.Model):
    status = models.CharField(null=True,max_length=50, verbose_name='Status da Ocorrência')
    numero_processo = models.CharField(null=True, max_length=100, verbose_name='Número do Processo')
    publico = models.BooleanField(null=True, verbose_name='Público nos Painéis')
    CLASSIFICACAO_CHOICES = [
        ('ACIDENTE', 'ACIDENTE'),
        ('INCIDENTE', 'INCIDENTE'),
        ('INFORTÚNIO', 'INFORTÚNIO')
    ]
    # Tipos de ocorrência agrupados: foguete (Anexo M) e satélite (Anexo N).
    # O valor é o subtipo (ex.: PROP.1); o grupo (PROP, ENV...) é só o cabeçalho.
    TIPO_CHOICES = [
        ("PROP — Sistema de Propulsão", [
            ("PROP.1", "PROP.1 — Motores e Câmaras de Combustão"),
            ("PROP.2", "PROP.2 — Sistema de Alimentação e Injeção de Propelente"),
            ("PROP.3", "PROP.3 — Controle de Fluxo e Pressurização"),
        ]),
        ("TACS — Controle de Atitude, Aviônica e Guiagem", [
            ("TACS.1", "TACS.1 — Unidades de Guiagem e Navegação (GNC / Computador de Voo)"),
            ("TACS.2", "TACS.2 — Sensores e Instrumentação"),
            ("TACS.3", "TACS.3 — Sistema Elétrico e Transmissão de Sinal"),
            ("TACS.4", "TACS.4 — Atuadores de Vetorização de Empuxo (TVC)"),
        ]),
        ("SEP-STR — Sistemas de Separação e Estrutura", [
            ("SEP-STR.1", "SEP-STR.1 — Mecanismos de Separação de Estágios"),
            ("SEP-STR.2", "SEP-STR.2 — Sistema de Coifa de Proteção (Payload Fairing)"),
            ("SEP-STR.3", "SEP-STR.3 — Integridade Estrutural e Materiais"),
        ]),
        ("ENV — Origem Ambiental", [
            ("ENV.1", "ENV.1 — Radiação Ionizante e Efeitos de Evento Único (SEE)"),
            ("ENV.2", "ENV.2 — Carregamento Eletrostático e Descargas (ESD)"),
            ("ENV.3", "ENV.3 — Micrometeoroides e Detritos Orbitais (MMOD)"),
            ("ENV.4", "ENV.4 — Perturbações Geomagnéticas e Clima Espacial"),
        ]),
        ("HW — Origem em Hardware Embarcado", [
            ("HW.1", "HW.1 — Componentes Eletrônicos e Potência Elétrica (EPS)"),
            ("HW.2", "HW.2 — Mecanismos, Estrutura e Controle Térmico"),
            ("HW.3", "HW.3 — Subsistema Propulsivo Embarcado"),
        ]),
        ("FSW — Origem em Software Embarcado", [
            ("FSW.1", "FSW.1 — Erros Lógicos de Voo e RTOS"),
            ("FSW.2", "FSW.2 — Mecanismos de Tolerância a Falhas e Memória"),
        ]),
        ("OPS — Origem em Operações Terrestres e Segmento Solo", [
            ("OPS.1", "OPS.1 — Infraestrutura de Solo e Enlaces"),
            ("OPS.2", "OPS.2 — Fatores Humanos e Procedimentos Operacionais"),
        ]),
        ("INT — Origem Intencional e Interferência Adversária", [
            ("INT.1", "INT.1 — Interferência em Radiofrequência e Guerra Eletrônica"),
            ("INT.2", "INT.2 — Ataques Ciber e Ações Antissatélite (ASAT)"),
        ]),
    ]
    classificacao = models.CharField(null=True, max_length=50,choices=CLASSIFICACAO_CHOICES, verbose_name='Classificação')
    tipo = models.CharField(null=True, max_length=50,choices=TIPO_CHOICES, verbose_name='tipo')
    dia_comunicacao = models.DateField(null=True, verbose_name='Dia comunicação')
    dia = models.DateField(null=True, verbose_name='Dia')
    horario = models.TimeField(null=True, verbose_name='Hora')
    dia_utc = models.DateField(null=True, verbose_name='Dia UTC')
    horario_utc = models.TimeField(null=True, verbose_name='Hora UTC')
    cidade = models.ForeignKey(GeografiaCidade, on_delete=models.PROTECT)
    local = models.CharField(null=True, max_length=100, blank=True)
    ORGANIZACAO_SEGMENTO_ESPACIAL_CHOICES = [
        ('CLA', 'CLA'),
        ('CLBI', 'CLBI'),
        ('COPE', 'COPE'),
    ]
    aerodromo = models.CharField(max_length=10, choices=ORGANIZACAO_SEGMENTO_ESPACIAL_CHOICES, verbose_name='Organização do segmento espacial')
    latitude = models.CharField(null=True, max_length=100, blank=True)
    longitude = models.CharField(null=True, max_length=100, blank=True)
    latitude_decimal = models.CharField(null=True, max_length=100, blank=True)
    longitude_decimal = models.CharField(null=True, max_length=100, blank=True)
    DANOS_TERCEIROS_CHOICES = [
        ('SIM', 'SIM'),
        ('NÃO', 'NÃO'),
        ('INDETERMINADO', 'INDETERMINADO')
    ]
    danos_terceiros = models.CharField(null=True, max_length=100,choices=DANOS_TERCEIROS_CHOICES)

    # Localização
    LOCALIZACAO_TIPO_CHOICES = [
        ('EM_ORBITA', 'Em órbita'),
        ('EM_SOLO', 'Em solo (impacto ou destroços)'),
    ]
    localizacao_tipo = models.CharField(null=True, blank=True, max_length=20, choices=LOCALIZACAO_TIPO_CHOICES, verbose_name='Tipo de Localização')

    # Localização em órbita
    ORBITA_TIPO_CHOICES = [
        ('LEO', 'LEO - Órbita Baixa da Terra'),
        ('MEO', 'MEO - Órbita Média da Terra'),
        ('GEO', 'GEO - Órbita Geoestacionária'),
        ('HEO', 'HEO - Órbita Altamente Elíptica'),
        ('INTERPLANETARIO', 'Interplanetário'),
    ]
    orbita_tipo = models.CharField(null=True, blank=True, max_length=20, choices=ORBITA_TIPO_CHOICES, verbose_name='Tipo de Órbita')

    # Coordenadas orbitais
    tle = models.TextField(null=True, blank=True, verbose_name='TLE (Two-Line Element)')
    apogeu = models.DecimalField(null=True, blank=True, max_digits=12, decimal_places=2, verbose_name='Apogeu (km)')
    perigeu = models.DecimalField(null=True, blank=True, max_digits=12, decimal_places=2, verbose_name='Perigeu (km)')
    inclinacao = models.DecimalField(null=True, blank=True, max_digits=6, decimal_places=2, verbose_name='Inclinação (graus)')

    # Localização em solo
    local_impacto = models.CharField(null=True, blank=True, max_length=200, verbose_name='Local de Impacto/Destroços')
    latitude_impacto = models.CharField(null=True, blank=True, max_length=100, verbose_name='Latitude do Impacto')
    longitude_impacto = models.CharField(null=True, blank=True, max_length=100, verbose_name='Longitude do Impacto')

    historico = models.TextField(null=True)
    observacao = models.TextField(null=True, blank=True)
    cadastrado_por_id = models.ForeignKey(User, on_delete=models.PROTECT)
    cadastrado_em = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ["dia"]
        verbose_name_plural = "Ocorrência Geral"
        db_table = 'ocorrencia_geral'

    def __str__(self):
        dia = self.dia.strftime('%d-%m-%Y') if self.dia else '-'
        return f"{self.numero_processo}/{self.classificacao}/{dia}"


class OcorrenciaRedigir(OcorrenciaGeral):
    class Meta:
        proxy = True
        verbose_name = "Redigir Ocorrência"
        verbose_name_plural = "Redigir Ocorrências"


class OcorrenciaConfirmar(OcorrenciaGeral):
    class Meta:
        proxy = True
        verbose_name = "Confirmar Ocorrência"
        verbose_name_plural = "Confirmar Ocorrências"


class OcorrenciaAutenticar(OcorrenciaGeral):
    class Meta:
        proxy = True
        verbose_name = "Autenticar Ocorrência"
        verbose_name_plural = "Autenticar Ocorrências"


class OcorrenciaInvestigada(OcorrenciaGeral):
    class Meta:
        proxy = True
        verbose_name = "Controle de Investigação"
        verbose_name_plural = "Controle de Investigação"


class OcorrenciaAeronave(models.Model):
    ocorrencia = models.ForeignKey(OcorrenciaGeral, on_delete=models.CASCADE, related_name='ocorrencia_aeronave', verbose_name='Ocorrência')
    artefato_espacial = models.ForeignKey(VeiculoLancador, on_delete=models.CASCADE, null=True, verbose_name="Artefato Espacial")
    operador = models.CharField(null=True, max_length=100, blank=True, verbose_name="Operador / proprietário")
    operador_detalhe = models.CharField(null=True, max_length=100, blank=True, verbose_name="Detalhes do Operador / proprietário")

    TIPO_CHOICES = [
        ('Satélite', 'Satélite'),
        ('Estágio de foguete', 'Estágio de foguete'),
        ('Cápsula', 'Cápsula'),
        ('Sonda', 'Sonda'),
    ]
    tipo = models.CharField(null=True, max_length=25, blank=True, choices=TIPO_CHOICES, verbose_name="Tipo")

    DANOS_ARTEFATO_CHOICES = [
        ('DESTRUÍDO', 'DESTRUÍDO'),
        ('NENHUM DANO', 'NENHUM DANO'),
        ('PARCIAL', 'PARCIAL'),
        ('INDETERMINADO', 'INDETERMINADO')
    ]
    danos = models.CharField(null=True, max_length=100,choices=DANOS_ARTEFATO_CHOICES)

    FASE_MISSAO_CHOICES = [
        ('PREPARACAO', 'Preparação'),
        ('ABASTECIMENTO', 'Abastecimento'),
        ('CONTAGEM_REGRESSIVA', 'Contagem regressiva'),
        ('LANCAMENTO', 'Lançamento'),
        ('VOO_PROPULSADO', 'Voo propulsado'),
        ('SEPARACAO_ESTAGIOS', 'Separação de estágios'),
        ('ORBITA', 'Órbita'),
        ('REENTRADA', 'Reentrada'),
    ]
    fase_missao = models.CharField(null=True, blank=True, max_length=50, choices=FASE_MISSAO_CHOICES, verbose_name="Fase da Missão")

    observacoes = models.TextField(null=True, blank=True, verbose_name="Observações adicionais")
    
    # Características técnicas
    veiculo_lancador = models.CharField(null=True, max_length=200, blank=True, verbose_name="Satélite")
    massa_total = models.DecimalField(null=True, blank=True, max_digits=10, decimal_places=2, verbose_name="Massa total (kg)")
    dimensoes = models.CharField(null=True, max_length=200, blank=True, verbose_name="Dimensões")
    vida_util_prevista = models.CharField(null=True, max_length=100, blank=True, verbose_name="Vida útil prevista")
    sistema_propulsao = models.TextField(null=True, blank=True, verbose_name="Sistema de propulsão")
    sistema_controle_atitude = models.TextField(null=True, blank=True, verbose_name="Sistema de controle de atitude")
    
    # Sistemas críticos
    sistema_energia = models.TextField(null=True, blank=True, verbose_name="Sistema de Energia")
    sistema_comunicacao = models.TextField(null=True, blank=True, verbose_name="Sistema de Comunicação")
    sistema_navegacao = models.TextField(null=True, blank=True, verbose_name="Sistema de Navegação")
    software_bordo = models.TextField(null=True, blank=True, verbose_name="Software de bordo")

    # Informações coletadas do artefato
    dados_telemetria_brutos = models.TextField(null=True, blank=True, verbose_name="Dados de telemetria (brutos)")
    dados_telemetria_processados = models.TextField(null=True, blank=True, verbose_name="Dados de telemetria (processados)")
    logs_eventos_falhas = models.TextField(null=True, blank=True, verbose_name="Logs de eventos e falhas")
    ultimos_comandos_enviados = models.TextField(null=True, blank=True, verbose_name="Últimos comandos enviados")
    estado_subsistemas_antes_evento = models.TextField(null=True, blank=True, verbose_name="Estado dos subsistemas antes do evento")
    dados_orbitais_antes_depois = models.TextField(null=True, blank=True, verbose_name="Dados orbitais antes e depois da ocorrência")

    EVIDENCIA_FALHA_CHOICES = [
        ('MECANICA', 'Mecânica'),
        ('ELETRICA', 'Elétrica'),
        ('SOFTWARE', 'Software'),
        ('OPERACIONAL', 'Operacional'),
        ('AMBIENTAL', 'Ambiental (radiação, clima espacial)'),
    ]
    evidencia_falha = models.CharField(
        null=True,
        blank=True,
        max_length=20,
        choices=EVIDENCIA_FALHA_CHOICES,
        verbose_name="Evidência de falha",
    )

    class Meta:
        ordering = ["id"]
        verbose_name_plural = "ARTEFATO ESPECIAL"
        db_table = "ocorrencia_aeronave"

    def __str__(self):
        return f"{self.operador}"
    
class OcorrenciaJuridico(models.Model):
    ocorrencia = models.ForeignKey(OcorrenciaGeral, on_delete=models.CASCADE, related_name='ocorrencia_juridico', verbose_name='Ocorrência')

    class Meta:
        ordering = ["id"]
        verbose_name_plural = "Ocorrência Jurídico"
        db_table = "ocorrencia_juridico"

    def __str__(self):
        return f"{self.ocorrencia}"

class OcorrenciaLaudoMaterial(models.Model):
    ocorrencia = models.ForeignKey(OcorrenciaGeral, on_delete=models.CASCADE, related_name='ocorrencia_laudo_material', verbose_name='Ocorrência')

    class Meta:
        ordering = ["id"]
        verbose_name_plural = "Ocorrência Laudo Material"
        db_table = "ocorrencia_laudo_material"

    def __str__(self):
        return f"{self.ocorrencia}"

class OcorrenciaApoio(models.Model):
    ocorrencia = models.ForeignKey(OcorrenciaGeral, on_delete=models.CASCADE, related_name='ocorrencia_apoio', verbose_name='Ocorrência')

    class Meta:
        ordering = ["id"]
        verbose_name_plural = "Ocorrência Apoio"
        db_table = "ocorrencia_apoio"

    def __str__(self):
        return f"{self.ocorrencia}"

class OcorrenciaControle(models.Model):
    ocorrencia = models.ForeignKey(OcorrenciaGeral, on_delete=models.CASCADE, related_name='ocorrencia_controle', verbose_name='Ocorrência')
    STATUS_CHOICES = [
        ('INVESTIGADA', 'INVESTIGADA'),
        ('COLETA DE DADOS', 'COLETA DE DADOS'),
    ]
    ORGAO_INVESTIGADOR_CHOICES = [
        ('CENIPA', 'CENIPA'),
        ('OUTRO', 'OUTRO'),
    ]
    SIM_NAO_CHOICES = [
        ('SIM', 'SIM'),
        ('NÃO', 'NÃO'),
        ('INDETERMINADO', 'INDETERMINADO')
    ]
    TIPO_RELATORIO_CHOICES = [
        ('RF', 'RF'),
        ('OUTRO', 'Outro'),
    ]
    PRIORIDADE_CHOICES = [
        ('1', '1 - CENIPA'),
        ('2', '2 - ALTISSÍMA'),
        ('3', '3 - ALTA'),
        ('4', '4 - MÉDIA'),
        ('5', '5 - NORMAL'),
    ]
    SITUACAO_CHOICES = [
        ('ATIVA', 'ATIVA'),
        ('FINALIZADA', 'FINALIZADA'),
    ]
    FASE_CHOICES = [
        ('RAI', 'RAI'),
        ('MIN', 'MINUTA'),
        ('REV', 'REVISAO'),
        ('RF', 'RF'),
        ('FIM', 'FIM'),
    ]
    status = models.CharField(null=True, max_length=100, choices=STATUS_CHOICES, verbose_name="Tratamento da Ocorrência")
    orgao_investigador = models.CharField(null=True, max_length=25, choices=ORGAO_INVESTIGADOR_CHOICES, verbose_name="Órgão Investigador")
    fez_acao_inicial = models.CharField(null=True, max_length=25, choices=SIM_NAO_CHOICES, verbose_name="Houve deslocamento até o local")
    investigador = models.ForeignKey(User, on_delete=models.PROTECT, null=True, blank=True, verbose_name="Investigador responsável")
    tipo_relatorio = models.CharField(null=True, blank=True, max_length=20, choices=TIPO_RELATORIO_CHOICES, verbose_name="Tipo de Relatório a Produzir")
    numero_relatorio = models.CharField(null=True, blank=True, max_length=100, default='A DEFINIR', verbose_name="Número do Relatório")
    prioridade = models.CharField(null=True, blank=True, max_length=1, choices=PRIORIDADE_CHOICES, default='4', verbose_name="Prioridade")
    situacao_investigacao = models.CharField(null=True, blank=True, max_length=20, choices=SITUACAO_CHOICES, default='ATIVA', verbose_name="Situação da Investigação")
    fase_atual = models.CharField(null=True, blank=True, max_length=30, choices=FASE_CHOICES, default='RAI', verbose_name="Fase atual")
    observacoes = models.TextField(null=True, blank=True, verbose_name="Observações")
    cadastrado_em = models.DateField(auto_now_add=True, null=True, blank=True)

    class Meta:
        ordering = ["id"]
        verbose_name_plural = "Ocorrência Controle"
        db_table = "ocorrencia_controle"

    def __str__(self):
        return f"{self.ocorrencia}"

class OcorrenciaChecklistItem(models.Model):
    ocorrencia = models.ForeignKey(OcorrenciaGeral, on_delete=models.CASCADE, related_name='ocorrencia_checklist_item', verbose_name='Ocorrência')

    ETAPA_CHOICES = [
        ('COLETA_DADOS', 'Coleta de Dados'),
        ('ANALISE', 'Análise'),
        ('FATOS', 'Fatos'),
    ]
    etapa = models.CharField(max_length=20, choices=ETAPA_CHOICES, verbose_name='Etapa')
    descricao = models.CharField(max_length=255, verbose_name='Descrição')
    ordem = models.PositiveIntegerField(default=0, verbose_name='Ordem')
    padrao = models.BooleanField(default=False, verbose_name='Item Padrão', help_text='Itens padrão (semeados de CHECKLIST_ITENS_PADRAO) não podem ser excluídos.')
    realizado = models.BooleanField(default=False, verbose_name='Realizado')
    responsavel = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name='Responsável')
    data_vinculacao = models.DateField(null=True, blank=True, verbose_name='Data de Vinculação')
    comentario = models.TextField(null=True, blank=True, verbose_name='Comentário')
    cadastrado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['etapa', 'ordem', 'id']
        verbose_name = 'Item de Checklist'
        verbose_name_plural = 'Ocorrência Checklist Item'
        db_table = 'ocorrencia_checklist_item'

    def __str__(self):
        return f"{self.get_etapa_display()} — {self.descricao}"


# Prazo (em dias, a partir de `cadastrado_em`) para concluir os itens da etapa
# Coleta de Dados — usado por OcorrenciaChecklistItemSerializer.get_atrasado e pelo
# alerta de pendência na tela Controle da Investigação.
CHECKLIST_ETAPA1_PRAZO_DIAS = 30

# Checklist padrão semeado na ocorrência (POST .../checklist-item/seed/), conforme o
# tipo do artefato espacial (OcorrenciaAeronave.tipo): Anexo K (foguete — ações
# imediatas em ocorrência no lançamento) ou Anexo L (satélite). Os itens são os
# dos anexos, resumidos; as etapas seguem a natureza de cada item. Cada ocorrência
# pode editar/remover/adicionar itens livremente depois de semeado — não há
# sincronização de volta com estas listas.
CHECKLIST_ITENS_PADRAO_FOGUETE = [
    ('COLETA_DADOS', 'Ativar planos de contingência no MCC e na plataforma de lançamento'),
    ('COLETA_DADOS', 'Confirmar estado do FTS (acionamento automático, manual ou desarme seguro)'),
    ('COLETA_DADOS', 'Manter zonas de exclusão com autoridades aeronáuticas e marítimas (TFR/NOTMAR)'),
    ('COLETA_DADOS', 'Isolar áreas com propelentes remanescentes, criogênicos, hipergólicos ou riscos químicos'),
    ('COLETA_DADOS', 'Preservar registros brutos de telemetria'),
    ('COLETA_DADOS', 'Extrair dados brutos de trajetória de todos os radares'),
    ('COLETA_DADOS', 'Preservar registros cinemáticos'),
    ('COLETA_DADOS', 'Preservar dados do console do FSO'),
    ('COLETA_DADOS', 'Preservar registros do transmissor terrestre do FTS'),
    ('COLETA_DADOS', 'Preservar telemetria do receptor embarcado do FTS'),
    ('COLETA_DADOS', 'Registrar acionamento automático do FTS por violação de limites'),
    ('COLETA_DADOS', 'Fazer backup dos registros do MCC'),
    ('COLETA_DADOS', 'Registrar perdas de enlace (LOV)'),
    ('COLETA_DADOS', 'Verificar sincronização temporal UTC'),
    ('COLETA_DADOS', 'Preservar gravações de comunicações'),
    ('COLETA_DADOS', 'Gerar cópias forenses das imagens (hash SHA-256)'),
    ('COLETA_DADOS', 'Restringir acesso às instalações'),
    ('COLETA_DADOS', 'Preservar configuração física dos consoles'),
    ('COLETA_DADOS', 'Fazer documentação fotográfica sistemática'),
    ('COLETA_DADOS', 'Executar levantamento aerofotogramétrico por RPAS/UAV'),
    ('COLETA_DADOS', 'Estabelecer cadeia de custódia dos componentes recuperados'),
    ('COLETA_DADOS', 'Preservar Flight Rules, SOPs, LCC e demais documentos operacionais'),
    ('COLETA_DADOS', 'Preservar Ordem de Operações'),
    ('COLETA_DADOS', 'Arquivar waivers, desvios e aceitações formais de risco'),
    ('COLETA_DADOS', 'Preservar Relprev, Safety Action Reports e relatos de condições inseguras'),
    ('COLETA_DADOS', 'Preservar Integration Logs, NCRs e ARs'),
    ('COLETA_DADOS', 'Confirmar configuração física certificada do veículo'),
    ('COLETA_DADOS', 'Isolar registros de aceitações "use as-is"'),
    ('COLETA_DADOS', 'Preservar dados meteorológicos locais'),
    ('COLETA_DADOS', 'Preservar perfil vertical de ventos'),
    ('COLETA_DADOS', 'Preservar registros de descargas atmosféricas'),
    ('COLETA_DADOS', 'Preservar dados de clima espacial, quando aplicável'),
    ('COLETA_DADOS', 'Preservar escalas, certificações e períodos de repouso'),
    ('COLETA_DADOS', 'Realizar entrevistas estruturadas individuais'),
    ('COLETA_DADOS', 'Preservar comunicações do MCC para análise posterior'),
    ('COLETA_DADOS', 'Confirmar preservação de todas as evidências prioritárias'),
    ('COLETA_DADOS', 'Registrar evidências não preservadas e justificar'),
    ('COLETA_DADOS', 'Confirmar integridade da cadeia de custódia'),
    ('COLETA_DADOS', 'Autorizar transição para a análise aprofundada'),
    ('ANALISE', 'Constituir grupos técnicos multidisciplinares'),
    ('ANALISE', 'Formalizar a corroboração cruzada das evidências'),
    ('FATOS', 'Iniciar reconstrução do Diagrama de Sequência de Eventos (DSE)'),
]

CHECKLIST_ITENS_PADRAO_SATELITE = [
    ('COLETA_DADOS', 'Registrar horário da notificação (UTC) e fonte primária'),
    ('COLETA_DADOS', 'Confirmar identificadores: nome, COSPAR ID, NORAD, operador e Estado de registro'),
    ('COLETA_DADOS', 'Congelar e copiar stream bruto de HK, com margem antes e depois do evento'),
    ('COLETA_DADOS', 'Preservar HK na frequência original (1–16 Hz), sem versões decimadas'),
    ('COLETA_DADOS', 'Registrar saltos de timestamp, desalinhamento OBT/UTC e lacunas de cobertura'),
    ('COLETA_DADOS', 'Documentar parâmetros fora de limite na notificação'),
    ('COLETA_DADOS', 'Solicitar dados orbitais recentes e TLEs pré e pós-evento'),
    ('COLETA_DADOS', 'Verificar no catálogo novos objetos na vizinhança (fragmentação)'),
    ('COLETA_DADOS', 'Se houver suspeita de fragmentação, iniciar alerta de conjunção a terceiros e à ISS'),
    ('COLETA_DADOS', 'Registrar Kp e Dst no evento e nas 72 h anteriores'),
    ('COLETA_DADOS', 'Verificar passagem pela Anomalia do Atlântico Sul (SAA)'),
    ('COLETA_DADOS', 'Verificar alerta de clima espacial (NOAA/SWPC, ESA) nas 72 h e se foi recebido'),
    ('COLETA_DADOS', 'Preservar dados de dosímetros, detectores de partículas e acelerômetros de bordo'),
    ('COLETA_DADOS', 'Congelar repositório do FSW na condição do evento'),
    ('COLETA_DADOS', 'Preservar memory dumps transmitidos'),
    ('COLETA_DADOS', 'Preservar sequência completa de telecomandos'),
    ('COLETA_DADOS', 'Verificar modificações recentes de software e parâmetros (patch history)'),
    ('COLETA_DADOS', 'Preservar registros de atuação do FDIR'),
    ('COLETA_DADOS', 'Emitir ordem formal de preservação (data freeze) a todos os detentores de dados'),
    ('COLETA_DADOS', 'Gerar hash SHA-256 dos dados e lavrar termo de custódia'),
    ('COLETA_DADOS', 'Se LOM: determinar o momento de LOS correlacionando múltiplas estações'),
    ('COLETA_DADOS', 'Se LOM: tentar detectar sinal residual em redes complementares (UIT, KSAT, SSC, AMSAT)'),
    ('COLETA_DADOS', 'Se LOM: preparar análise retrospectiva da telemetria em busca de precursores'),
    ('COLETA_DADOS', 'Se AOCS: preservar dados dos sensores de atitude redundantes (cross-voting)'),
    ('COLETA_DADOS', 'Se AOCS: registrar resposta dos atuadores aos últimos comandos'),
    ('COLETA_DADOS', 'Se AOCS: correlacionar com dados ambientais (arrasto, pressão de radiação solar)'),
    ('COLETA_DADOS', 'Se payload: verificar se a plataforma (bus) permanece nominal'),
    ('COLETA_DADOS', 'Se payload: registrar modo de operação científica no momento do evento'),
    ('COLETA_DADOS', 'Preservar shift logs, e-mails e atas de decisão do período anterior'),
    ('COLETA_DADOS', 'Registrar escala de plantão das 24 h anteriores'),
    ('COLETA_DADOS', 'Registrar se e quando o alerta de clima espacial foi recebido e a decisão tomada'),
    ('COLETA_DADOS', 'Anotar alterações recentes de procedimento ou script de solo'),
    ('COLETA_DADOS', 'Verificar interferência de RF anômala no uplink ou GNSS'),
    ('COLETA_DADOS', 'Verificar comando não autorizado ou falha de autenticação no enlace'),
    ('COLETA_DADOS', 'Havendo indício, acionar canal de segurança/inteligência'),
    ('COLETA_DADOS', 'Acionar rastreamento e catalogação de fragmentos'),
    ('COLETA_DADOS', 'Caracterizar mecanismo provável (explosão de propelente ou colisão)'),
    ('COLETA_DADOS', 'Emitir alertas de conjunção sem aguardar a caracterização completa'),
    ('COLETA_DADOS', 'Consolidar classificação provisória e evidências preservadas, com horário de aquisição'),
    ('COLETA_DADOS', 'Registrar evidências não preservadas e a razão'),
    ('COLETA_DADOS', 'Confirmar que nenhuma hipótese de domínio foi descartada prematuramente'),
    ('COLETA_DADOS', 'Autorizar transição para a análise aprofundada'),
    ('ANALISE', 'Classificar preliminarmente o domínio de origem, sem excluir hipóteses'),
    ('ANALISE', 'Domínio: ambiental (radiação, ESD, MMOD, geomagnético, arrasto)'),
    ('ANALISE', 'Domínio: hardware (eletrônica, estrutura, propulsão, térmico, EPS)'),
    ('ANALISE', 'Domínio: software embarcado (FSW, FDIR, RTOS, memória)'),
    ('ANALISE', 'Domínio: operações terrestres/segmento solo'),
    ('ANALISE', 'Domínio: intencional/adversária (jamming, spoofing, ciber, ASAT)'),
    ('ANALISE', 'Domínio: indeterminada (sem forçar enquadramento)'),
    ('ANALISE', 'Classificar severidade preliminar (S-1 a S-4), como provisória'),
    ('ANALISE', 'Classificar perfil temporal (súbita, gradual ou latente)'),
    ('ANALISE', 'Lembrar: taxonomia de domínio organiza a fase inicial, não define causa definitiva'),
]


def checklist_itens_padrao(tipo_artefato):
    """Itens padrão para o tipo de artefato; vazio se não houver anexo correspondente."""
    if tipo_artefato == 'Estágio de foguete':
        return CHECKLIST_ITENS_PADRAO_FOGUETE
    if tipo_artefato == 'Satélite':
        return CHECKLIST_ITENS_PADRAO_SATELITE
    return []


class OcorrenciaRelatorio(models.Model):
    ELOS_CHOICES = [
        ('ANAC', 'ANAC'),
        ('DECEA', 'DECEA'),
        ('RepAcred', 'RepAcred'),
        ('ICAO', 'ICAO'),
        ('ANAC,DECEA', 'ANAC e DECEA'),
        ('ANAC,DECEA,RepAcred', 'ANAC, DECEA e RepAcred'),
        ('ANAC,DECEA,RepAcred,ICAO', 'ANAC, DECEA, RepAcred e ICAO'),
        ('TODOS', 'Todos'),
    ]

    ocorrencia = models.ForeignKey(OcorrenciaGeral, on_delete=models.CASCADE, related_name='ocorrencia_relatorio', verbose_name='Ocorrência')
    relatorio_pt = models.FileField(upload_to='ocorrencia/relatorios/', null=True, blank=True, max_length=255, verbose_name='Relatório em Português')
    relatorio_en = models.FileField(upload_to='ocorrencia/relatorios/', null=True, blank=True, max_length=255, verbose_name='Relatório em Inglês')
    relatorio_es = models.FileField(upload_to='ocorrencia/relatorios/', null=True, blank=True, max_length=255, verbose_name='Relatório em Espanhol')
    publicar_site_sipae = models.BooleanField(default=True, verbose_name='Publicar no site e Painel Sipae?')
    comunicar_elos = models.CharField(max_length=100, null=True, blank=True, choices=ELOS_CHOICES, verbose_name='Comunicar aos Elos de Coordenação via e-mail', help_text='Gostaria de comunicar aos Elos de Coordenação sobre a publicação deste relatório? Ex: DCTA e/ou RepAcred.')
    observacoes = models.TextField(null=True, blank=True, verbose_name='Observações')
    data_assinatura = models.DateField(null=True, blank=True, verbose_name='Data da Assinatura')
    data_publicacao = models.DateField(null=True, blank=True, verbose_name='Data de Publicação')
    data_cadastro = models.DateField(null=True, blank=True, verbose_name='Data de Cadastro')

    class Meta:
        ordering = ["id"]
        verbose_name_plural = "Ocorrência Relatório"
        db_table = "ocorrencia_relatorio"

    def __str__(self):
        return f"{self.ocorrencia}"

class OcorrenciaFatorContribuinte(models.Model):
    FATOR_CHOICES = [
        # FATOR HUMANO
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
        # FATOR MATERIAL
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
        # FATOR OPERACIONAL
        ('FATOR OPERACIONAL - PLANEJAMENTO - BRIEFING INADEQUADO', 'FATOR OPERACIONAL - PLANEJAMENTO - BRIEFING INADEQUADO'),
        ('FATOR OPERACIONAL - PLANEJAMENTO - PLANEJAMENTO INADEQUADO', 'FATOR OPERACIONAL - PLANEJAMENTO - PLANEJAMENTO INADEQUADO'),
        ('FATOR OPERACIONAL - SUPERVISÃO - FISCALIZAÇÃO INADEQUADA', 'FATOR OPERACIONAL - SUPERVISÃO - FISCALIZAÇÃO INADEQUADA'),
        ('FATOR OPERACIONAL - SUPERVISÃO - SUPERVISÃO INADEQUADA', 'FATOR OPERACIONAL - SUPERVISÃO - SUPERVISÃO INADEQUADA'),
        ('FATOR OPERACIONAL - INFRAESTRUTURA - APOIO AO SOLO', 'FATOR OPERACIONAL - INFRAESTRUTURA - APOIO AO SOLO'),
        ('FATOR OPERACIONAL - INFRAESTRUTURA - DOCUMENTAÇÃO', 'FATOR OPERACIONAL - INFRAESTRUTURA - DOCUMENTAÇÃO'),
        ('FATOR OPERACIONAL - INFRAESTRUTURA - INSTALAÇÕES', 'FATOR OPERACIONAL - INFRAESTRUTURA - INSTALAÇÕES'),
        # FATOR AMBIENTAL
        ('FATOR AMBIENTAL - METEOROLOGIA - CONDIÇÕES METEOROLÓGICAS', 'FATOR AMBIENTAL - METEOROLOGIA - CONDIÇÕES METEOROLÓGICAS'),
        ('FATOR AMBIENTAL - METEOROLOGIA - INFORMAÇÃO METEOROLÓGICA', 'FATOR AMBIENTAL - METEOROLOGIA - INFORMAÇÃO METEOROLÓGICA'),
        ('FATOR AMBIENTAL - ESPAÇO - DEBRIS ESPACIAL', 'FATOR AMBIENTAL - ESPAÇO - DEBRIS ESPACIAL'),
        ('FATOR AMBIENTAL - ESPAÇO - RADIAÇÃO', 'FATOR AMBIENTAL - ESPAÇO - RADIAÇÃO'),
        ('FATOR AMBIENTAL - ESPAÇO - VÁCUO', 'FATOR AMBIENTAL - ESPAÇO - VÁCUO'),
        ('FATOR AMBIENTAL - INTERFERÊNCIA EXTERNA - INTERFERÊNCIA ELETROMAGNÉTICA', 'FATOR AMBIENTAL - INTERFERÊNCIA EXTERNA - INTERFERÊNCIA ELETROMAGNÉTICA'),
        ('FATOR AMBIENTAL - INTERFERÊNCIA EXTERNA - INTERFERÊNCIA HUMANA', 'FATOR AMBIENTAL - INTERFERÊNCIA EXTERNA - INTERFERÊNCIA HUMANA'),
        # OUTRO FATOR
        ('OUTRO FATOR - OUTRO - OUTRO', 'OUTRO FATOR - OUTRO - OUTRO'),
    ]

    NIVEL_CONTRIBUICAO_CHOICES = [
        ('CONTRIBUIU', 'CONTRIBUIU'),
        ('INDETERMINADO', 'INDETERMINADO'),
    ]

    ocorrencia = models.ForeignKey(OcorrenciaGeral, on_delete=models.CASCADE, related_name='ocorrencia_fator_contribuinte', verbose_name='Ocorrência')
    fator = models.CharField(max_length=200, choices=FATOR_CHOICES, verbose_name='Fator Contribuinte')
    nivel_contribuicao = models.CharField(max_length=50, choices=NIVEL_CONTRIBUICAO_CHOICES, verbose_name='Nível de Contribuição')
    observacoes = models.TextField(null=True, blank=True, verbose_name='Observações')

    class Meta:
        ordering = ["id"]
        verbose_name = "Fator Contribuinte"
        verbose_name_plural = "Fatores Contribuintes"
        db_table = "ocorrencia_fator_contribuinte"

    def __str__(self):
        return f"{self.fator}"

class OcorrenciaRecomendacao(models.Model):
    ocorrencia = models.ForeignKey(OcorrenciaGeral, on_delete=models.CASCADE, related_name='ocorrencia_recomendacao', verbose_name='Ocorrência')
    descricao = models.TextField(verbose_name='Descrição da Recomendação')

    class Meta:
        ordering = ["id"]
        verbose_name_plural = "Ocorrência Recomendação"
        db_table = "ocorrencia_recomendacao"

    def __str__(self):
        return f"{self.ocorrencia}"
    
class OcorrenciaAsoaci(models.Model):
    ocorrencia = models.ForeignKey(OcorrenciaGeral, on_delete=models.CASCADE, related_name='ocorrencia_asoaci', verbose_name='Ocorrência')
    initial_notification = models.CharField(null=True, blank=True, max_length=30, choices=[('SIM', 'SIM'),('NÃO', 'NÃO')], default='NÃO', verbose_name="Initial Notification")
    destino_notificacao = models.CharField(null=True, blank=True, max_length=100, verbose_name="Destinatário/Instituição")
    dia_envio_notificacao = models.DateField(null=True, blank=True, verbose_name="Data da Notificação")
    tem_rep_acred = models.CharField(null=True, blank=True, max_length=30, choices=[('SIM', 'SIM'),('NÃO', 'NÃO'),('AGUARDANDO', 'AGUARDANDO')], default='NÃO', verbose_name="Tem Rep Acred?")
    nome_rep_acred = models.CharField(null=True, blank=True, max_length=100, verbose_name="Nome do Representante")
    observacoes = models.TextField(null=True, blank=True, verbose_name="Observações")

    class Meta:
        ordering = ["id"]
        verbose_name_plural = "Representante Acreditado"
        db_table = "ocorrencia_asoaci"

    def __str__(self):
        return f"{self.ocorrencia}"

class OcorrenciaTipoOcorrencia(models.Model):
    ocorrencia = models.ForeignKey(OcorrenciaGeral, on_delete=models.CASCADE, related_name='ocorrencia_tipo_ocorrencia', verbose_name='Ocorrência')

    class Meta:
        ordering = ["id"]
        verbose_name_plural = "Ocorrência Tipo de Ocorrência"
        db_table = "ocorrencia_tipo_ocorrencia"

    def __str__(self):
        return f"{self.ocorrencia}"

class OcorrenciaComissao(models.Model):
    ocorrencia = models.ForeignKey(OcorrenciaGeral, on_delete=models.CASCADE, related_name='ocorrencia_comissao', verbose_name='Ocorrência')
    investigador = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Investigador')
    FUNCAO_CHOICES = [
        ('ASPECTO_OPERACIONAL', 'ASPECTO OPERACIONAL'),
        ('ASPECTO_MATERIAL', 'ASPECTO MATERIAL'),
        ('ASPECTO_MEDICO', 'ASPECTO MÉDICO'),
        ('ASPECTO_PSICOLOGICO', 'ASPECTO PSICOLÓGICO'),
        ('INVESTIGADOR_ENCARREGADO', 'INVESTIGADOR ENCARREGADO'),
    ]
    funcao = models.CharField(max_length=50, choices=FUNCAO_CHOICES, null=True, blank=True, verbose_name='Função')
    observacoes = models.CharField(null=True, max_length=200, verbose_name='Observações')
    identificacao_rai = models.CharField(max_length=100, null=True, blank=True, verbose_name='Identificação no RAI (ex.: nº portaria)')

    class Meta:
        ordering = ["id"]
        verbose_name = "Membro da Comissão"
        verbose_name_plural = "Comissão de Investigação"
        db_table = "ocorrencia_comissao"

    def __str__(self):
        return str(self.investigador) if self.investigador else f"Membro #{self.pk}"

class OcorrenciaViolacao(models.Model):
    ocorrencia = models.ForeignKey(OcorrenciaGeral, on_delete=models.CASCADE, related_name='ocorrencia_violacao', verbose_name='Ocorrência')

    class Meta:
        ordering = ["id"]
        verbose_name_plural = "Ocorrência Violação"
        db_table = "ocorrencia_violacao"

    def __str__(self):
        return f"{self.ocorrencia}"

class OcorrenciaDocumento(models.Model):
    ocorrencia = models.ForeignKey(OcorrenciaGeral, on_delete=models.CASCADE, related_name='ocorrencia_documento', verbose_name='Ocorrência')

    TIPO_DOCUMENTO_CHOICES = [
        ('ARTEFATO_MAPA_COMPONENTES', 'Artefato Espacial - Mapa de Componentes'),
        ('ARTEFATO_SISTEMAS_SUBSISTEMAS', 'Artefato Espacial - Sistemas e Subsistemas'),
        ('ARTEFATO_MASSA_CG', 'Artefato Espacial - Massa e Centro de Gravidade'),
        ('ARTEFATO_SEGURO', 'Artefato Espacial - Seguro Espacial'),
        ('ARTEFATO_STATUS_AEB', 'Artefato Espacial - Status AEB'),
        ('ARTEFATO_CERTIFICACOES', 'Artefato Espacial - Certificações e Autorizações'),
        ('ARTEFATO_TERMO_LIBERACAO', 'Artefato Espacial - Termo de Liberação para Lançamento'),
        ('ARTEFATO_OUTROS', 'Artefato Espacial - Outros Documentos'),
        ('IMAGEM_ACAO_INICIAL', 'Imagens - Ação Inicial'),
        ('IMAGEM_CROQUI', 'Imagens - Croqui do Sítio de Lançamento'),
        ('IMAGEM_OUTRAS', 'Imagens - Outras'),
        ('LAUDO_TECNICO', 'Laudos Técnicos e Resultados'),
        ('PORTARIA_COMISSAO', 'Portaria de Designação de Comissão de Investigação'),
        ('COORDENADOR_INVESTIGACAO', 'Coordenador da Investigação'),
        ('RESPONSAVEL_COLETA_DADOS', 'Responsável pela Coleta de Dados'),
        ('VEICULO_STATUS', 'Veículo Lançador - Status Regulatório'),
        ('OPERADOR_STATUS', 'Operador Espacial - Status Regulatório'),
        ('OPERADOR_OUTROS', 'Operador Espacial - Outros Documentos'),
        ('OUTROS_DOCUMENTOS', 'Outros Documentos Gerais')
    ]
    tipo_documento = models.CharField(
        null=True,
        blank=True,
        max_length=120,
        choices=TIPO_DOCUMENTO_CHOICES,
        verbose_name='Tipo de documento',
    )
    arquivo = models.FileField(
        null=True,
        blank=True,
        upload_to='ocorrencia/documentos/',
        max_length=255,
        verbose_name='Arquivo (upload)',
    )
    cadastrado_por_id = models.ForeignKey(User, on_delete=models.PROTECT, null=True, blank=True)
    cadastrado_em = models.DateField(auto_now_add=True, null=True, blank=True)

    class Meta:
        ordering = ["id"]
        verbose_name_plural = "Ocorrência Documento"
        db_table = "ocorrencia_documento"

    def __str__(self):
        return f"{self.tipo_documento or 'Documento'}"

class OcorrenciaFatorHumano(models.Model):
    ocorrencia = models.ForeignKey(OcorrenciaGeral, on_delete=models.CASCADE, related_name='ocorrencia_fator_humano', verbose_name='Ocorrência')

    class Meta:
        ordering = ["id"]
        verbose_name_plural = "Ocorrência Fator Humano"
        db_table = "ocorrencia_fator_humano"

    def __str__(self):
        return f"{self.ocorrencia}"

class OcorrenciaConfirmacao(models.Model):
    ocorrencia = models.ForeignKey(OcorrenciaGeral, on_delete=models.CASCADE, related_name='ocorrencia_confirmacao', verbose_name='Ocorrência')
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Confirmado por')
    data_confirmacao = models.DateField(null=True, blank=True, verbose_name='Data da confirmação')

    class Meta:
        ordering = ["id"]
        verbose_name_plural = "Ocorrência Confirmação"
        db_table = "ocorrencia_confirmacao"

    def __str__(self):
        return f"{self.ocorrencia}"

class OcorrenciaAutenticacao(models.Model):
    ocorrencia = models.ForeignKey(OcorrenciaGeral, on_delete=models.CASCADE, related_name='ocorrencia_autenticacao', verbose_name='Ocorrência')
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Autenticado por')
    data_autenticacao = models.DateField(null=True, blank=True, verbose_name='Data da autenticação')

    class Meta:
        ordering = ["id"]
        verbose_name_plural = "Ocorrência Autenticação"
        db_table = "ocorrencia_autenticacao"

    def __str__(self):
        return f"{self.ocorrencia}"

class OcorrenciaRegistroRai(models.Model):
    """RAI — Relatório de Ação Inicial. Ver readme_rai.md para o escopo completo
    (15 seções). Campos organizados nas mesmas seções da documentação; seções 3
    (Pessoal Envolvido) e 10 (Fotografias) viram os models filhos
    OcorrenciaRaiPessoal/OcorrenciaRaiFoto por serem repetíveis."""

    ocorrencia = models.ForeignKey(OcorrenciaGeral, on_delete=models.CASCADE, related_name='ocorrencia_registro_rai', verbose_name='Ocorrência')

    # ── Seção 1 — Histórico ──
    historico_evento = models.TextField(null=True, blank=True, verbose_name='Histórico do Evento')
    sequencia_falhas = models.TextField(null=True, blank=True, verbose_name='Sequência de Falhas')
    dados_telemetria_rai = models.TextField(null=True, blank=True, verbose_name='Dados de Telemetria')

    # ── Seção 2 — Informações Gerais (demais campos vêm de OcorrenciaGeral/Aeronave, somente leitura) ──
    PERIODO_DIA_CHOICES = [
        ('DIA', 'Dia'),
        ('NOITE', 'Noite'),
        ('CREPUSCULO', 'Crepúsculo'),
    ]
    periodo_dia = models.CharField(max_length=20, null=True, blank=True, choices=PERIODO_DIA_CHOICES, verbose_name='Período do Dia')
    tempo_ate_acao_inicial = models.CharField(max_length=50, null=True, blank=True, verbose_name='Tempo até Ação Inicial')
    fonte_informacao_ocorrencia = models.TextField(null=True, blank=True, verbose_name='Fonte da Informação')

    # ── Seção 4 — Informações Operacionais ──
    informacoes_operacionais = models.TextField(null=True, blank=True, verbose_name='Informações Operacionais')
    procedimentos_em_execucao = models.TextField(null=True, blank=True, verbose_name='Procedimentos em Execução')
    desvios_procedimento = models.TextField(null=True, blank=True, verbose_name='Desvios de Procedimento')

    # ── Seção 5 — Artefato (identificação vem de OcorrenciaAeronave, somente leitura) ──
    fabricante_rai = models.CharField(max_length=200, null=True, blank=True, verbose_name='Fabricante')
    modelo_rai = models.CharField(max_length=200, null=True, blank=True, verbose_name='Modelo')
    ano_fabricacao_rai = models.IntegerField(null=True, blank=True, verbose_name='Ano de Fabricação')
    numero_serie_rai = models.CharField(max_length=100, null=True, blank=True, verbose_name='Número de Série')
    horas_ciclos_rai = models.CharField(max_length=100, null=True, blank=True, verbose_name='Horas/Ciclos de Operação')
    observacoes_artefato_rai = models.TextField(null=True, blank=True, verbose_name='Observações do Artefato')

    # ── Seção 6 — Instalações ──
    instalacoes_envolvidas = models.TextField(null=True, blank=True, verbose_name='Instalações Envolvidas')
    comentarios_instalacoes = models.TextField(null=True, blank=True, verbose_name='Comentários sobre Instalações')

    # ── Seção 7 — Meteorologia ──
    condicoes_ambientais = models.TextField(null=True, blank=True, verbose_name='Condições Ambientais')
    METEO_ORIGEM_CHOICES = [
        ('PILOTO', 'Piloto'),
        ('ORGAO_METEO', 'Órgão Meteorológico'),
        ('TESTEMUNHA', 'Testemunha'),
        ('OUTRO', 'Outro'),
    ]
    meteo_origem_informacao = models.CharField(max_length=20, null=True, blank=True, choices=METEO_ORIGEM_CHOICES, verbose_name='Origem da Informação')
    meteo_vento_direcao = models.IntegerField(null=True, blank=True, verbose_name='Direção do Vento (graus)')
    meteo_vento_velocidade = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, verbose_name='Velocidade do Vento')
    meteo_vento_rajada = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, verbose_name='Rajada de Vento')
    METEO_VENTO_TIPO_CHOICES = [
        ('CALMO', 'Calmo'),
        ('VARIAVEL', 'Variável'),
        ('CONSTANTE', 'Constante'),
    ]
    meteo_vento_tipo = models.CharField(max_length=20, null=True, blank=True, choices=METEO_VENTO_TIPO_CHOICES, verbose_name='Tipo de Vento')
    meteo_visibilidade_km = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, verbose_name='Visibilidade (km)')
    meteo_teto_ft = models.IntegerField(null=True, blank=True, verbose_name='Teto (pés)')
    METEO_NEBULOSIDADE_CHOICES = [
        ('SKC', 'SKC'),
        ('FEW', 'FEW'),
        ('SCT', 'SCT'),
        ('BKN', 'BKN'),
        ('OVC', 'OVC'),
    ]
    meteo_nebulosidade = models.CharField(max_length=10, null=True, blank=True, choices=METEO_NEBULOSIDADE_CHOICES, verbose_name='Nebulosidade')
    meteo_temperatura_c = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name='Temperatura (°C)')
    meteo_ponto_orvalho_c = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name='Ponto de Orvalho (°C)')
    meteo_pressao_hpa = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True, verbose_name='Pressão Atmosférica (hPa)')
    METEO_PERIODO_DIA_CHOICES = [
        ('DIA', 'Dia'),
        ('NOITE', 'Noite'),
        ('CREPUSCULO_MATUTINO', 'Crepúsculo Matutino'),
        ('CREPUSCULO_VESPERTINO', 'Crepúsculo Vespertino'),
    ]
    meteo_periodo_dia = models.CharField(max_length=25, null=True, blank=True, choices=METEO_PERIODO_DIA_CHOICES, verbose_name='Período do Dia (Meteo)')
    meteo_chuva = models.BooleanField(null=True, blank=True, verbose_name='Chuva')
    meteo_trovao = models.BooleanField(null=True, blank=True, verbose_name='Trovão')
    meteo_nevoeiro = models.BooleanField(null=True, blank=True, verbose_name='Nevoeiro')
    meteo_granizo = models.BooleanField(null=True, blank=True, verbose_name='Granizo')
    meteo_turbulencia = models.BooleanField(null=True, blank=True, verbose_name='Turbulência')
    meteo_gelo = models.BooleanField(null=True, blank=True, verbose_name='Formação de Gelo')
    meteo_clima_espacial = models.TextField(null=True, blank=True, verbose_name='Clima Espacial')
    meteo_radiacao_solar = models.CharField(max_length=100, null=True, blank=True, verbose_name='Radiação Solar')
    meteo_debris_espacial = models.TextField(null=True, blank=True, verbose_name='Debris Espacial')
    meteo_observacoes = models.TextField(null=True, blank=True, verbose_name='Observações Meteorológicas')

    # ── Seção 8 — Croqui ──
    CROQUI_TIPO_CHOICES = [
        ('SITIO_LANCAMENTO', 'Sítio de Lançamento'),
        ('TRAJETORIA', 'Trajetória'),
        ('DESTROCOS', 'Destroços'),
        ('OUTRO', 'Outro'),
    ]
    croqui_tipo = models.CharField(max_length=20, null=True, blank=True, choices=CROQUI_TIPO_CHOICES, verbose_name='Tipo de Croqui')
    croqui_escala = models.CharField(max_length=50, null=True, blank=True, verbose_name='Escala')
    croqui_descricao = models.TextField(null=True, blank=True, verbose_name='Descrição do Croqui')
    croqui_norte_magnetico = models.BooleanField(null=True, blank=True, verbose_name='Referência ao Norte Magnético')
    croqui_arquivo = models.FileField(upload_to='ocorrencia/rai/croqui/', null=True, blank=True, max_length=255, verbose_name='Arquivo do Croqui')
    croqui_observacoes = models.TextField(null=True, blank=True, verbose_name='Observações do Croqui')

    # ── Seção 9 — Destroços ──
    destrocos_localizacao = models.TextField(null=True, blank=True, verbose_name='Localização dos Destroços')
    destrocos_latitude = models.CharField(max_length=100, null=True, blank=True, verbose_name='Latitude')
    destrocos_longitude = models.CharField(max_length=100, null=True, blank=True, verbose_name='Longitude')
    destrocos_altitude_m = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, verbose_name='Altitude (m)')
    DESTROCOS_TERRENO_CHOICES = [
        ('PLANO', 'Plano'),
        ('ACIDENTADO', 'Acidentado'),
        ('ALAGADO', 'Alagado'),
        ('URBANO', 'Urbano'),
        ('MAR', 'Mar'),
        ('OUTRO', 'Outro'),
    ]
    destrocos_tipo_terreno = models.CharField(max_length=15, null=True, blank=True, choices=DESTROCOS_TERRENO_CHOICES, verbose_name='Tipo de Terreno')
    DESTROCOS_VEGETACAO_CHOICES = [
        ('NENHUMA', 'Nenhuma'),
        ('RASTEIRA', 'Rasteira'),
        ('ARBUSTIVA', 'Arbustiva'),
        ('FLORESTA', 'Floresta'),
        ('DENSA', 'Densa'),
    ]
    destrocos_vegetacao = models.CharField(max_length=15, null=True, blank=True, choices=DESTROCOS_VEGETACAO_CHOICES, verbose_name='Vegetação')
    DESTROCOS_ACESSO_CHOICES = [
        ('FACIL', 'Fácil'),
        ('DIFICIL', 'Difícil'),
        ('INACESSIVEL', 'Inacessível'),
    ]
    destrocos_acesso = models.CharField(max_length=15, null=True, blank=True, choices=DESTROCOS_ACESSO_CHOICES, verbose_name='Acesso ao Local')

    destrocos_angulo_impacto = models.IntegerField(null=True, blank=True, verbose_name='Ângulo de Impacto (graus)')
    destrocos_velocidade_impacto = models.CharField(max_length=100, null=True, blank=True, verbose_name='Velocidade de Impacto')
    destrocos_area_dispersao_m2 = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Área de Dispersão (m²)')
    destrocos_direcao_dispersao = models.IntegerField(null=True, blank=True, verbose_name='Direção da Dispersão (graus)')
    destrocos_peca_mais_distante_m = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Peça Mais Distante (m)')
    DESTROCOS_TIPO_IMPACTO_CHOICES = [
        ('PONTO_UNICO', 'Ponto Único'),
        ('DISPERSO', 'Disperso'),
        ('RASTRO', 'Rastro'),
    ]
    destrocos_tipo_impacto = models.CharField(max_length=15, null=True, blank=True, choices=DESTROCOS_TIPO_IMPACTO_CHOICES, verbose_name='Tipo de Impacto')

    destrocos_fogo = models.BooleanField(null=True, blank=True, verbose_name='Houve Fogo')
    destrocos_fogo_antes_impacto = models.BooleanField(null=True, blank=True, verbose_name='Fogo Antes do Impacto')
    destrocos_fogo_durante_impacto = models.BooleanField(null=True, blank=True, verbose_name='Fogo Durante o Impacto')
    destrocos_fogo_apos_impacto = models.BooleanField(null=True, blank=True, verbose_name='Fogo Após o Impacto')
    destrocos_fogo_combatido = models.BooleanField(null=True, blank=True, verbose_name='Fogo Combatido')
    destrocos_fogo_descricao = models.TextField(null=True, blank=True, verbose_name='Descrição do Incêndio')

    destrocos_fuselagem = models.BooleanField(null=True, blank=True, verbose_name='Fuselagem Encontrada')
    destrocos_motor = models.BooleanField(null=True, blank=True, verbose_name='Motor/Propulsor Encontrado')
    destrocos_paineis_solares = models.BooleanField(null=True, blank=True, verbose_name='Painéis Solares Encontrados')
    destrocos_bateria = models.BooleanField(null=True, blank=True, verbose_name='Baterias Encontradas')
    destrocos_eletronico = models.BooleanField(null=True, blank=True, verbose_name='Componentes Eletrônicos Encontrados')
    destrocos_tanque = models.BooleanField(null=True, blank=True, verbose_name='Tanque(s) de Combustível Encontrado(s)')
    destrocos_combustivel_derramado = models.BooleanField(null=True, blank=True, verbose_name='Derramamento de Combustível')
    destrocos_material_perigoso = models.BooleanField(null=True, blank=True, verbose_name='Material Perigoso no Local')
    destrocos_descricao_geral = models.TextField(null=True, blank=True, verbose_name='Descrição Geral dos Destroços')
    destrocos_observacoes = models.TextField(null=True, blank=True, verbose_name='Observações sobre Destroços')

    # ── Seção 11 — Danos a Terceiros ──
    danos_terceiros_descricao = models.TextField(null=True, blank=True, verbose_name='Descrição dos Danos a Terceiros')
    danos_terceiros_observacoes = models.TextField(null=True, blank=True, verbose_name='Observações sobre Danos a Terceiros')

    # ── Seção 12 — Informações Adicionais ──
    informacoes_adicionais = models.TextField(null=True, blank=True, verbose_name='Informações Adicionais')
    informacoes_adicionais_obs = models.TextField(null=True, blank=True, verbose_name='Observações Complementares')

    # ── Seção 13 — Informações Administrativas ──
    custo_artefato = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True, verbose_name='Valor Estimado do Artefato (R$)')
    custo_danos_terceiros = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True, verbose_name='Valor Estimado dos Danos a Terceiros (R$)')
    custo_operacao_resgate = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True, verbose_name='Custo da Operação de Resgate (R$)')
    custo_observacoes = models.TextField(null=True, blank=True, verbose_name='Observações sobre Custos')

    procedimento_policia = models.BooleanField(null=True, blank=True, verbose_name='Acionamento de Polícia')
    procedimento_ministerio_publico = models.BooleanField(null=True, blank=True, verbose_name='Acionamento do Ministério Público')
    procedimento_ib = models.BooleanField(null=True, blank=True, verbose_name='Acionamento do IBAMA/ICMBio')
    procedimento_defesa_civil = models.BooleanField(null=True, blank=True, verbose_name='Acionamento da Defesa Civil')
    procedimento_outro = models.BooleanField(null=True, blank=True, verbose_name='Outro Procedimento Legal')
    procedimento_outro_descricao = models.CharField(max_length=200, null=True, blank=True, verbose_name='Descrição do Outro Procedimento')

    dificuldades_investigacao = models.TextField(null=True, blank=True, verbose_name='Dificuldades na Investigação')
    adm_observacoes = models.TextField(null=True, blank=True, verbose_name='Observações Administrativas')

    # ── Seção 14 — Críticas ──
    criticas = models.TextField(null=True, blank=True, verbose_name='Críticas')

    # ── Controle do RAI ──
    STATUS_RAI_CHOICES = [
        ('RASCUNHO', 'Rascunho'),
        ('FINALIZADO', 'Finalizado'),
    ]
    status_rai = models.CharField(max_length=20, choices=STATUS_RAI_CHOICES, default='RASCUNHO', verbose_name='Status do RAI')
    data_rai = models.DateField(null=True, blank=True, verbose_name='Data de Elaboração do RAI')
    responsavel_rai = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='rais_responsavel', verbose_name='Investigador Responsável',
    )
    observacoes = models.TextField(null=True, blank=True, verbose_name='Observações Gerais')
    cadastrado_em = models.DateField(auto_now_add=True, verbose_name='Data de Criação')
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name='Última Atualização')

    class Meta:
        ordering = ["id"]
        verbose_name_plural = "Ocorrência Registro RAI"
        db_table = "ocorrencia_registro_rai"

    def __str__(self):
        return f"{self.ocorrencia}"


class OcorrenciaRaiPessoal(models.Model):
    """Seção 3 do RAI — Pessoal Envolvido (repetível)."""

    rai = models.ForeignKey(OcorrenciaRegistroRai, on_delete=models.CASCADE, related_name='pessoal', verbose_name='RAI')
    funcao = models.CharField(max_length=100, null=True, blank=True, verbose_name='Função no Evento')
    nome = models.CharField(max_length=200, null=True, blank=True, verbose_name='Nome Completo')
    contato = models.CharField(max_length=200, null=True, blank=True, verbose_name='Contato (telefone/e-mail)')
    LESOES_CHOICES = [
        ('FATAL', 'Fatal'),
        ('GRAVE', 'Grave'),
        ('LEVE', 'Leve'),
        ('ILESO', 'Ileso'),
        ('INDETERMINADO', 'Indeterminado'),
    ]
    lesoes = models.CharField(max_length=20, null=True, blank=True, choices=LESOES_CHOICES, verbose_name='Lesões')
    posicao_no_evento = models.CharField(max_length=200, null=True, blank=True, verbose_name='Posição/Papel no Evento')
    observacoes = models.TextField(null=True, blank=True, verbose_name='Observações')

    class Meta:
        ordering = ["id"]
        verbose_name = "Pessoal Envolvido"
        verbose_name_plural = "Ocorrência RAI Pessoal"
        db_table = "ocorrencia_rai_pessoal"

    def __str__(self):
        return f"{self.nome or 'Pessoa'} - {self.funcao or 'N/A'}"


class OcorrenciaRaiFoto(models.Model):
    """Seção 10 do RAI — Fotografias (até 15 uploads)."""

    rai = models.ForeignKey(OcorrenciaRegistroRai, on_delete=models.CASCADE, related_name='fotos', verbose_name='RAI')
    arquivo = models.FileField(upload_to='ocorrencia/rai/fotos/', max_length=255, verbose_name='Imagem')
    numero = models.IntegerField(null=True, blank=True, verbose_name='Número da Foto')
    descricao = models.CharField(max_length=300, null=True, blank=True, verbose_name='Legenda/Descrição')
    data_foto = models.DateField(null=True, blank=True, verbose_name='Data da Foto')

    class Meta:
        ordering = ["numero", "id"]
        verbose_name = "Fotografia"
        verbose_name_plural = "Ocorrência RAI Fotos"
        db_table = "ocorrencia_rai_foto"

    def __str__(self):
        return self.descricao or f"Foto #{self.numero or self.pk}"


"""
class OcorrenciaRegistroRp(models.Model):
    ocorrencia = models.ForeignKey(OcorrenciaGeral, on_delete=models.CASCADE, related_name='ocorrencia_registro_rp', verbose_name='Ocorrência')

    class Meta:
        ordering = ["id"]
        verbose_name_plural = "Ocorrência Registro RP"
        db_table = "ocorrencia_registro_rp"

    def __str__(self):
        return f"{self.ocorrencia}"
"""
class OcorrenciaRegistroMinuta(models.Model):
    ocorrencia = models.ForeignKey(OcorrenciaGeral, on_delete=models.CASCADE, related_name='ocorrencia_registro_minuta', verbose_name='Ocorrência')

    class Meta:
        ordering = ["id"]
        verbose_name_plural = "Ocorrência Registro Minuta"
        db_table = "ocorrencia_registro_minuta"

    def __str__(self):
        return f"{self.ocorrencia}"
    
 

class OcorrenciaRevisaoRelatorio(models.Model):
    ocorrencia = models.ForeignKey(OcorrenciaGeral, on_delete=models.CASCADE, related_name='ocorrencia_revisao_relatorio', verbose_name='Ocorrência')
    data_atribuicao = models.DateField(null=True, blank=True, verbose_name='Data da Atribuição')
    
    SETOR_CHOICES = [
        ('DESIGNACAO', 'Designação'),
        ('REVISAO_PRELIMINAR_FATOR_OPERACIONAL', 'Revisão Preliminar/Fator Operacional'),
        ('REVISAO_FATOR_HUMANO', 'Revisão Fator Humano'),
        ('REVISAO_FATOR_MATERIAL', 'Revisão Fator Material'),
        ('RECOMENDACAO_DE_SEGURANCA', 'Recomendação de Segurança'),
        ('JEDI', 'JEDI'),
        ('REVISAO_GRAMATICAL', 'Revisão Gramatical'),
        ('REVISAO_FINAL', 'Revisão Final'),
        ('APRECIACAO_CHEFE_DIP', 'Apreciação Chefe DIP'),
        ('APRECIACAO_CHEFE_DO_CENIPA', 'Apreciação Chefe do CENIPA'),
        ('CONTROLE_IMPRESSAO', 'Controle/Impressão'),
        ('TRADUCAO', 'Tradução'),
        ('ASOACI', 'ASOACI'),
        ('VALIDACAO_DE_DADOS', 'Validação de Dados'),
        ('DIVULGACAO', 'Divulgação'),
        ('ASSINATURA_CHEFE_DO_CENIPA', 'Assinatura Chefe do CENIPA'),
        ('ARQUIVO', 'Arquivo'),
        ('REABERTURA', 'Reabertura'),
    ]

    setor = models.CharField(max_length=150, choices=SETOR_CHOICES, null=True, blank=True, verbose_name='Setor Responsável')
    revisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='ocorrencia_revisao_relatorio_revisor', verbose_name='Revisor Responsável')
    anexo = models.FileField(upload_to='revisao_relatorio/anexos/', null=True, blank=True, verbose_name='Anexo')
    observacao = models.TextField(null=True, blank=True, verbose_name='Observação')
    cadastrado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='ocorrencia_revisao_relatorio_cadastrado_por', verbose_name='Cadastrado Por')
    cadastrado_em = models.DateField(null=True, blank=True, verbose_name='Cadastrado Em')

    class Meta:
        ordering = ["id"]
        verbose_name = "Painel de Revisão RF"
        verbose_name_plural = "Painel de Revisão RF"
        db_table = "ocorrencia_revisao_relatorio"

    def __str__(self):
        return f"{self.ocorrencia}"

class OcorrenciaRevisaoRelatorioFeedback(models.Model):
    SETOR_CHOICES = [
        ('COLETA', 'Coleta'),
        ('ANALISE', 'Análise'),
        ('FATOS', 'Fatos'),
        ('CONCLUSAO', 'Conclusão'),
    ]

    ocorrencia = models.ForeignKey(OcorrenciaGeral, on_delete=models.CASCADE, related_name='ocorrencia_revisao_relatorio_feedback', verbose_name='Ocorrência')
    setor = models.CharField(max_length=20, choices=SETOR_CHOICES, null=True, blank=True, verbose_name='Área/Setor Relacionado')
    autor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='ocorrencia_revisao_relatorio_feedback_autor', verbose_name='Autor')
    comentario = models.TextField(verbose_name='Comentário')
    criado_em = models.DateTimeField(auto_now_add=True, verbose_name='Criado Em')

    class Meta:
        ordering = ["-criado_em", "-id"]
        verbose_name = "Feedback do Painel de Revisão RF"
        verbose_name_plural = "Feedback do Painel de Revisão RF"
        db_table = "ocorrencia_revisao_relatorio_feedback"

    def __str__(self):
        return f"{self.ocorrencia}"

class OcorrenciaProgressoInvestigacao(models.Model):
    ocorrencia = models.ForeignKey(OcorrenciaGeral, on_delete=models.CASCADE, related_name='ocorrencia_progresso_investigacao', verbose_name='Ocorrência')

    class Meta:
        ordering = ["id"]
        verbose_name_plural = "Ocorrência Progresso Investigação"
        db_table = "ocorrencia_progresso_investigacao"

    def __str__(self):
        return f"{self.ocorrencia}"
    
class OcorrenciaAeronaveTripulante(models.Model):
    ocorrencia_aeronave = models.ForeignKey(OcorrenciaAeronave, on_delete=models.CASCADE, related_name='ocorrencia_aeronave_tripulante', verbose_name='Ocorrência Aeronave')

    nome = models.CharField(max_length=200, null=True, blank=True, verbose_name='Nome')
    cpf = models.CharField(max_length=14, null=True, blank=True, verbose_name='CPF')

    FUNCAO_CHOICES = [
        ('PILOTO', 'Piloto'),
        ('COPILOTO', 'Copiloto'),
        ('MECÂNICO DE VOO', 'Mecânico de Voo'),
        ('COMISSÁRIO', 'Comissário'),
        ('INSTRUTOR', 'Instrutor'),
        ('ALUNO', 'Aluno'),
        ('OUTRO', 'Outro'),
    ]
    funcao = models.CharField(max_length=50, null=True, blank=True, choices=FUNCAO_CHOICES, verbose_name='Função a Bordo')

    licenca = models.CharField(max_length=50, null=True, blank=True, verbose_name='Licença')
    habilitacao = models.CharField(max_length=100, null=True, blank=True, verbose_name='Habilitação')
    validade_cma = models.DateField(null=True, blank=True, verbose_name='Validade CMA')
    validade_habilitacao = models.DateField(null=True, blank=True, verbose_name='Validade Habilitação')

    horas_totais = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Horas Totais de Voo')
    horas_equipamento = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Horas no Equipamento')
    horas_ultimos_30_dias = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Horas Últimos 30 Dias')
    horas_ultimas_24_horas = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Horas Últimas 24 Horas')

    idade = models.IntegerField(null=True, blank=True, verbose_name='Idade')
    formacao = models.CharField(max_length=200, null=True, blank=True, verbose_name='Formação')
    observacoes = models.TextField(null=True, blank=True, verbose_name='Observações')

    class Meta:
        ordering = ["id"]
        verbose_name = "Tripulante"
        verbose_name_plural = "Ocorrência Aeronave Tripulante"
        db_table = "ocorrencia_aeronave_tripulante"

    def __str__(self):
        return f"{self.nome or 'Tripulante'} - {self.funcao or 'N/A'}"

class OcorrenciaAeronaveLesao(models.Model):
    ocorrencia_aeronave = models.ForeignKey(OcorrenciaAeronave, on_delete=models.CASCADE, related_name='ocorrencia_aeronave_lesao', verbose_name='Ocorrência Aeronave')

    TIPO_LESAO_CHOICES = [
        ('FATAL', 'Fatal'),
        ('GRAVE', 'Grave'),
        ('LEVE', 'Leve'),
        ('ILESO', 'Ileso'),
        ('INDETERMINADO', 'Indeterminado'),
    ]
    tipo_lesao = models.CharField(max_length=50, null=True, blank=True, choices=TIPO_LESAO_CHOICES, verbose_name='Tipo de Lesão')

    CATEGORIA_CHOICES = [
        ('TRIPULANTE', 'Tripulante'),
        ('PASSAGEIRO', 'Passageiro'),
        ('TERCEIROS', 'Terceiros'),
    ]
    categoria = models.CharField(max_length=50, null=True, blank=True, choices=CATEGORIA_CHOICES, verbose_name='Categoria')

    quantidade = models.IntegerField(null=True, blank=True, verbose_name='Quantidade')
    descricao = models.TextField(null=True, blank=True, verbose_name='Descrição')
    observacoes = models.TextField(null=True, blank=True, verbose_name='Observações')

    class Meta:
        ordering = ["id"]
        verbose_name = "Lesão"
        verbose_name_plural = "Ocorrência Aeronave Lesão"
        db_table = "ocorrencia_aeronave_lesao"

    def __str__(self):
        return f"{self.categoria or 'N/A'} - {self.tipo_lesao or 'N/A'} ({self.quantidade or 0})"

class OcorrenciaLabdata(models.Model):
    ocorrencia = models.ForeignKey(OcorrenciaGeral, on_delete=models.CASCADE, related_name='ocorrencia_labdata', verbose_name='Ocorrência')

    TIPO_GRAVADOR_CHOICES = [
        ('CVR', 'CVR - Cockpit Voice Recorder'),
        ('FDR', 'FDR - Flight Data Recorder'),
        ('COMBO', 'Combinado CVR/FDR'),
        ('OUTRO', 'Outro'),
    ]
    tipo_gravador = models.CharField(max_length=50, null=True, blank=True, choices=TIPO_GRAVADOR_CHOICES, verbose_name='Tipo de Gravador')

    fabricante = models.CharField(max_length=100, null=True, blank=True, verbose_name='Fabricante')
    modelo = models.CharField(max_length=100, null=True, blank=True, verbose_name='Modelo')
    numero_serie = models.CharField(max_length=100, null=True, blank=True, verbose_name='Número de Série')

    STATUS_RECUPERACAO_CHOICES = [
        ('RECUPERADO', 'Recuperado'),
        ('NAO_RECUPERADO', 'Não Recuperado'),
        ('PARCIALMENTE', 'Parcialmente Recuperado'),
        ('NAO_EQUIPADO', 'Aeronave Não Equipada'),
        ('INDETERMINADO', 'Indeterminado'),
    ]
    status_recuperacao = models.CharField(max_length=50, null=True, blank=True, choices=STATUS_RECUPERACAO_CHOICES, verbose_name='Status de Recuperação')

    dados_extraidos = models.BooleanField(null=True, blank=True, verbose_name='Dados Extraídos')
    data_extracao = models.DateField(null=True, blank=True, verbose_name='Data da Extração')

    duracao_gravacao = models.CharField(max_length=50, null=True, blank=True, verbose_name='Duração da Gravação')
    qualidade_dados = models.CharField(max_length=100, null=True, blank=True, verbose_name='Qualidade dos Dados')

    laudo = models.TextField(null=True, blank=True, verbose_name='Laudo Técnico')
    observacoes = models.TextField(null=True, blank=True, verbose_name='Observações')

    class Meta:
        ordering = ["id"]
        verbose_name = "Gravador de Voo (LABDATA)"
        verbose_name_plural = "Ocorrência Aeronave LABDATA"
        db_table = "ocorrencia_aeronave_labdata"

    def __str__(self):
        return f"{self.tipo_gravador or 'Gravador'} - {self.status_recuperacao or 'N/A'}"
