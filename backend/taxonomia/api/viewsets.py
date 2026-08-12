from rest_framework import viewsets

from taxonomia.models import (
    AerodromoGeral,
    ArtefatoEspacial,
    GeografiaCidade,
    GeografiaPais,
    GeografiaUf,
    VeiculoLancador,
)

from .serializers import (
    AerodromoGeralSerializer,
    ArtefatoEspacialSerializer,
    GeografiaCidadeSerializer,
    GeografiaPaisSerializer,
    GeografiaUfSerializer,
    VeiculoLancadorSerializer,
)


class GeografiaPaisViewSet(viewsets.ModelViewSet):
    queryset = GeografiaPais.objects.order_by('nome')
    serializer_class = GeografiaPaisSerializer
    search_fields = ['nome', 'nome_codigo']
    filterset_fields = ['continente']


class GeografiaUfViewSet(viewsets.ModelViewSet):
    queryset = GeografiaUf.objects.all()
    serializer_class = GeografiaUfSerializer
    search_fields = ['nome', 'nome_codigo']
    filterset_fields = ['pais']


class GeografiaCidadeViewSet(viewsets.ModelViewSet):
    queryset = GeografiaCidade.objects.order_by('nome')
    serializer_class = GeografiaCidadeSerializer
    search_fields = ['nome']
    filterset_fields = ['uf', 'pais']


class AerodromoGeralViewSet(viewsets.ModelViewSet):
    queryset = AerodromoGeral.objects.all()
    serializer_class = AerodromoGeralSerializer
    search_fields = ['nome', 'icao', 'iata']
    filterset_fields = ['cidade']


class ArtefatoEspacialViewSet(viewsets.ModelViewSet):
    queryset = ArtefatoEspacial.objects.all()
    serializer_class = ArtefatoEspacialSerializer
    search_fields = ['designacao', 'numero_serie', 'fabricante']
    filterset_fields = ['tipo_artefato', 'status']


class VeiculoLancadorViewSet(viewsets.ModelViewSet):
    queryset = VeiculoLancador.objects.select_related('artefato').all()
    serializer_class = VeiculoLancadorSerializer
    search_fields = ['artefato__designacao']
    filterset_fields = ['tipo_propulsao', 'reutilizavel']
