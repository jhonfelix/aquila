from django.db import models
from usuario.models import User


class MaterialApoio(models.Model):
    CATEGORIA_CHOICES = [
        ('NORMA', 'Norma'),
        ('LEGISLACAO', 'Legislação'),
        ('MANUAL', 'Manual'),
        ('PROCEDIMENTO', 'Procedimento'),
        ('INSTRUCAO', 'Instrução'),
        ('REGULAMENTO', 'Regulamento'),
        ('FORMULARIO', 'Formulário'),
        ('OUTRO', 'Outro'),
    ]

    CATEGORIAS_NORMA = ['NORMA', 'LEGISLACAO', 'REGULAMENTO', 'INSTRUCAO', 'PROCEDIMENTO', 'MANUAL']
    CATEGORIAS_DOCUMENTO = ['OUTRO']
    CATEGORIAS_FORMULARIO = ['FORMULARIO']

    TIPO_DOCUMENTO_CHOICES = [
        ('AUTO', 'Auto'),
        ('COMUNICACAO', 'Comunicação'),
        ('IS', 'IS'),
        ('NPA', 'NPA'),
        ('FORMULARIO', 'Formulário'),
        ('MODELO', 'Modelo'),
        ('NORMAS_MANUAIS', 'Normas e Manuais'),
        ('ORIENTACAO', 'Orientação'),
        ('LEGISLACAO', 'Legislação'),
        ('POP', 'POP'),
        ('PROCESSO', 'Processo'),
        ('PROTOCOLO', 'Protocolo'),
        ('GLOSSARIO', 'Glossário'),
        ('REQUISICAO', 'Requisição'),
        ('TERMO', 'Termo'),
        ('OUTRO', 'Outro'),
    ]

    titulo = models.CharField(max_length=300, verbose_name="Título")
    categoria = models.CharField(max_length=50, choices=CATEGORIA_CHOICES, verbose_name="Categoria")
    tipo_documento = models.CharField(max_length=50, choices=TIPO_DOCUMENTO_CHOICES, verbose_name="Tipo de Documento")
    numero_norma = models.CharField(max_length=100, null=True, blank=True, verbose_name="Número da Norma")
    divisao_responsavel = models.CharField(max_length=200, null=True, blank=True, verbose_name="Divisão Responsável")
    setor_responsavel = models.CharField(max_length=200, null=True, blank=True, verbose_name="Setor Responsável")
    pessoa_responsavel = models.ForeignKey(User, on_delete=models.PROTECT, null=True, blank=True, verbose_name="Pessoa Responsável", help_text="Pessoa responsável pela manutenção deste documento.")
    data_emissao = models.DateField(null=True, blank=True, verbose_name="Data da Emissão")
    data_efetivacao = models.DateField(null=True, blank=True, verbose_name="Data da Efetivação")
    data_aprovacao = models.DateField(null=True, blank=True, verbose_name="Data da Aprovação")
    data_publicacao = models.DateField(null=True, blank=True, verbose_name="Data da Publicação")
    documento_word = models.FileField(upload_to='material_apoio/word/', null=True, blank=True, verbose_name="Documento Word")
    documento_pdf = models.FileField(upload_to='material_apoio/pdf/', null=True, blank=True, verbose_name="Documento PDF")
    observacoes = models.TextField(null=True, blank=True, verbose_name="Observações")
    cadastrado_por_id = models.ForeignKey(User, on_delete=models.PROTECT, related_name='materiais_cadastrados', null=True, blank=True, verbose_name="Cadastrado por")
    cadastrado_em = models.DateField(auto_now_add=True, null=True, verbose_name="Cadastrado em")

    class Meta:
        ordering = ['titulo']
        verbose_name = "Material de Apoio"
        verbose_name_plural = "Materiais de Apoio"
        db_table = "material_apoio"

    def __str__(self):
        return f"{self.numero_norma or ''} - {self.titulo}"


class InvestigacaoOutrasAutoridades(models.Model):
    TIPO_OCORRENCIA_CHOICES = [
        ('ACIDENTE', 'Acidente'),
        ('INFORTÚNIO', 'Infortúnio'),
        ('INCIDENTE', 'Incidente'),
        ('ANOMALIA', 'Anomalia'),
        ('OUTRO', 'Outro'),
    ]

    FASE_VOO_CHOICES = [
        ('LANCAMENTO', 'Lançamento'),
        ('ASCENSAO', 'Ascensão'),
        ('ORBITA', 'Órbita'),
        ('REENTRADA', 'Reentrada'),
        ('POUSO', 'Pouso'),
        ('PRE_LANCAMENTO', 'Pré-Lançamento'),
        ('OUTRO', 'Outro'),
    ]

    titulo = models.CharField(max_length=300, verbose_name="Título")
    pais = models.CharField(max_length=100, verbose_name="País")
    autoridade_investigadora = models.CharField(max_length=200, verbose_name="Autoridade Investigadora", help_text="Ex: FAA/AST, NTSB, ESA, Roscosmos")
    numero_relatorio = models.CharField(max_length=100, null=True, blank=True, verbose_name="Número do Relatório")
    veiculo = models.CharField(max_length=200, null=True, blank=True, verbose_name="Veículo", help_text="Ex: Antares 130, Falcon 9, Ariane 5")
    operador = models.CharField(max_length=200, null=True, blank=True, verbose_name="Operador", help_text="Ex: Orbital Sciences, SpaceX")
    tipo_ocorrencia = models.CharField(max_length=50, choices=TIPO_OCORRENCIA_CHOICES, verbose_name="Tipo de Ocorrência")
    fase_voo = models.CharField(max_length=50, choices=FASE_VOO_CHOICES, null=True, blank=True, verbose_name="Fase do Voo")
    data_ocorrencia = models.DateField(null=True, blank=True, verbose_name="Data da Ocorrência")
    data_publicacao = models.DateField(null=True, blank=True, verbose_name="Data de Publicação")
    documento_pdf = models.FileField(upload_to='investigacao_outras_autoridades/pdf/', null=True, blank=True, verbose_name="Documento PDF")
    observacoes = models.TextField(null=True, blank=True, verbose_name="Observações")
    cadastrado_por_id = models.ForeignKey(User, on_delete=models.PROTECT, related_name='investigacoes_outras_autoridades_cadastradas', null=True, blank=True, verbose_name="Cadastrado por")
    cadastrado_em = models.DateField(auto_now_add=True, null=True, verbose_name="Cadastrado em")

    class Meta:
        ordering = ['-data_ocorrencia', 'titulo']
        verbose_name = "Investigação de Outras Autoridades"
        verbose_name_plural = "Investigações de Outras Autoridades"
        db_table = "investigacao_outras_autoridades"

    def __str__(self):
        return f"{self.numero_relatorio or ''} - {self.titulo} ({self.pais})"


# --- Proxy models para categorização na mesma tabela ---

class NormaLegislacaoManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(categoria__in=MaterialApoio.CATEGORIAS_NORMA)


class NormaLegislacao(MaterialApoio):
    objects = NormaLegislacaoManager()

    class Meta:
        proxy = True
        verbose_name = "Norma / Legislação"
        verbose_name_plural = "Normas e Legislações"


class FormularioManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(categoria='FORMULARIO')


class Formulario(MaterialApoio):
    objects = FormularioManager()

    class Meta:
        proxy = True
        verbose_name = "Formulário"
        verbose_name_plural = "Formulários"

    def save(self, *args, **kwargs):
        self.categoria = 'FORMULARIO'
        super().save(*args, **kwargs)


class DocumentoDiversoManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(categoria__in=MaterialApoio.CATEGORIAS_DOCUMENTO)


class DocumentoDiverso(MaterialApoio):
    objects = DocumentoDiversoManager()

    class Meta:
        proxy = True
        verbose_name = "Documento Diverso"
        verbose_name_plural = "Documentos Diversos"

    def save(self, *args, **kwargs):
        self.categoria = 'OUTRO'
        super().save(*args, **kwargs)
