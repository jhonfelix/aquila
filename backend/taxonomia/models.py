from django.db import models
import datetime


class GeografiaPais(models.Model):
    nome = models.CharField(null=True, max_length=150)
    nome_codigo = models.CharField(null=True, max_length=50)
    idioma_codigo = models.CharField(null=True, max_length=10)
    continente = models.CharField(null=True, max_length=50)

    def __str__(self):
        return self.nome
    
    class Meta:
        db_table = 'geografia_pais'

class GeografiaUf(models.Model):
    nome = models.CharField(null=True, max_length=150)
    pais = models.ForeignKey(GeografiaPais, on_delete=models.CASCADE)
    nome_codigo = models.CharField(null=True, max_length=10)
    regiao = models.CharField(null=True, max_length=50)
    comar = models.CharField(null=True, max_length=50)

    def __str__(self):
        return self.nome
    
    class Meta:
        db_table = 'geografia_uf'


class GeografiaCidade(models.Model):
    uf = models.ForeignKey(GeografiaUf, on_delete=models.CASCADE)
    pais = models.ForeignKey(GeografiaPais, on_delete=models.CASCADE)
    nome = models.CharField(null=True, max_length=150)
    latitude = models.CharField(null=True, max_length=100)
    longitude = models.CharField(null=True, max_length=100)
    altitude = models.CharField(null=True, max_length=100)

    def __str__(self):
        return f"{self.nome} - {self.uf} - {self.pais}"
    
    class Meta:
        db_table = 'geografia_cidade'


class AerodromoGeral(models.Model):
    cidade = models.ForeignKey(GeografiaCidade, on_delete=models.CASCADE)
    icao = models.CharField(null=True, max_length=7)
    iata = models.CharField(null=True, max_length=5)
    nome = models.CharField(null=True, max_length=150)
    propriedade = models.CharField(null=True, max_length=150)
    tipo = models.CharField(null=True, max_length=10)
    latitude = models.CharField(null=True, max_length=100)
    longitude = models.CharField(null=True, max_length=100)
    latitude_decimal = models.CharField(null=True, max_length=100)
    longitude_decimal = models.CharField(null=True, max_length=100)
    altitude = models.CharField(null=True, max_length=100)
    vfr_diurno = models.CharField(null=True, max_length=100)
    vfr_noturno = models.CharField(null=True, max_length=100)
    ifr_diurno = models.CharField(null=True, max_length=100)
    ifr_noturno = models.CharField(null=True, max_length=100)

    def __str__(self):
        return f"{self.icao} {self.nome} {self.cidade}"
    
    class Meta:
        db_table = 'aerodromo_geral'


class ArtefatoEspacial(models.Model):
    TIPO_ARTEFATO = [
        ("foguete", "Foguete"),
        ("satelite", "Satélite"),
        ("sonda", "Sonda"),
        ("capsula", "Cápsula"),
        ("estacao", "Estação Espacial"),
    ]

    designacao = models.CharField(max_length=120)
    numero_serie = models.CharField(max_length=80, null=True, blank=True)
    fabricante = models.CharField(max_length=120, null=True, blank=True)
    operador = models.CharField(max_length=120, null=True, blank=True)

    pais_fabricacao = models.CharField(max_length=60, null=True, blank=True)
    pais_operador = models.CharField(max_length=60, null=True, blank=True)

    ano_fabricacao = models.IntegerField(null=True, blank=True)

    tipo_artefato = models.CharField(
        max_length=30,
        choices=TIPO_ARTEFATO
    )

    status = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )  # Ativo, Aposentado, Perdido, Destruído

    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["designacao"]
        verbose_name = "Artefato Espacial"
        verbose_name_plural = "Artefatos Espaciais"
        db_table = 'veiculo_geral'

    def __str__(self):
        return f" ({self.tipo_artefato})"

class VeiculoLancador(models.Model):

    TIPO_PROPULSAO = [
        ("liquido", "Líquido"),
        ("solido", "Sólido"),
        ("hibrido", "Híbrido"),
    ]

    artefato = models.OneToOneField(
        ArtefatoEspacial,
        on_delete=models.CASCADE,
        related_name="veiculo_lancador"
    )

    altura_metros = models.FloatField(null=True, blank=True)
    diametro_metros = models.FloatField(null=True, blank=True)

    massa_total_kg = models.FloatField(null=True, blank=True)
    carga_util_leo_kg = models.FloatField(null=True, blank=True)
    carga_util_geo_kg = models.FloatField(null=True, blank=True)

    numero_estagios = models.IntegerField(null=True, blank=True)

    tipo_propulsao = models.CharField(
        max_length=50,
        choices=TIPO_PROPULSAO
    )  # Liquido, Solido, Hibrido

    PROPELENTE_CHOICES = [
        ("RP-1/LOX", "RP-1/LOX"),
        ("LH2/LOX", "LH2/LOX"),
        ("Metano/LOX", "Metano/LOX"),
    ]

    propelente = models.JSONField(
        null=True,
        blank=True,
        verbose_name="Propelente",
    )  # RP-1/LOX, LH2/LOX, Metano/LOX

    quantidade_motores_primeiro_estagio = models.IntegerField(null=True, blank=True)
    empuxo_total_kN = models.FloatField(null=True, blank=True)

    reutilizavel = models.BooleanField(default=False)


    class Meta:
        ordering = ["artefato__designacao"]
        verbose_name = "Veículo Lançador"
        verbose_name_plural = "Veículos Lançadores"
        db_table = 'veiculo_lancador'

    def __str__(self):
        return f"{self.artefato.designacao}"



