import django_filters
from rest_framework import viewsets

from material_apoio.models import InvestigacaoOutrasAutoridades, MaterialApoio

from .serializers import InvestigacaoOutrasAutoridadesSerializer, MaterialApoioSerializer


class CategoriaInFilter(django_filters.BaseInFilter, django_filters.CharFilter):
    pass


class MaterialApoioFilterSet(django_filters.FilterSet):
    # A tela "Normas e Legislação" cobre várias categorias de uma vez
    # (NORMA, LEGISLACAO, REGULAMENTO, ...); ?categoria=NORMA,LEGISLACAO
    # faz o mesmo papel do filtro dos proxy models do Admin.
    categoria = CategoriaInFilter(field_name='categoria')

    class Meta:
        model = MaterialApoio
        fields = ['categoria', 'tipo_documento']


class MaterialApoioViewSet(viewsets.ModelViewSet):
    """Cobre Formulário/Norma-Legislação/Documento-Diverso via ?categoria=.

    Os proxy models do admin (NormaLegislacao/Formulario/DocumentoDiverso)
    existem só para telas separadas no Django Admin; na API a distinção
    fica a cargo do filtro `categoria`, evitando 3 viewsets idênticos.
    """

    queryset = MaterialApoio.objects.select_related('pessoa_responsavel', 'cadastrado_por_id').all()
    serializer_class = MaterialApoioSerializer
    search_fields = ['titulo', 'numero_norma', 'divisao_responsavel', 'setor_responsavel']
    filterset_class = MaterialApoioFilterSet

    def perform_create(self, serializer):
        serializer.save(cadastrado_por_id=self.request.user)


class InvestigacaoOutrasAutoridadesViewSet(viewsets.ModelViewSet):
    queryset = InvestigacaoOutrasAutoridades.objects.select_related('cadastrado_por_id').all()
    serializer_class = InvestigacaoOutrasAutoridadesSerializer
    search_fields = ['titulo', 'autoridade_investigadora', 'numero_relatorio', 'veiculo']
    filterset_fields = ['pais', 'tipo_ocorrencia', 'fase_voo']

    def perform_create(self, serializer):
        serializer.save(cadastrado_por_id=self.request.user)
