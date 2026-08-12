import csv

from django.core import serializers as django_serializers
from django.db.models import Max, Subquery
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ocorrencia.models import (
    OcorrenciaAeronave,
    OcorrenciaAeronaveLesao,
    OcorrenciaAeronaveTripulante,
    OcorrenciaApoio,
    OcorrenciaRaiFoto,
    OcorrenciaRaiPessoal,
    OcorrenciaAsoaci,
    OcorrenciaAutenticacao,
    OcorrenciaComissao,
    OcorrenciaConfirmacao,
    OcorrenciaControle,
    OcorrenciaDocumento,
    OcorrenciaFatorContribuinte,
    OcorrenciaFatorHumano,
    OcorrenciaGeral,
    OcorrenciaJuridico,
    OcorrenciaLaudoMaterial,
    OcorrenciaProgressoInvestigacao,
    OcorrenciaRecomendacao,
    OcorrenciaRegistroMinuta,
    OcorrenciaRegistroRai,
    OcorrenciaRelatorio,
    OcorrenciaRevisaoRelatorio,
    OcorrenciaTipoOcorrencia,
    OcorrenciaViolacao,
)

from . import serializers as ser


class _OcorrenciaChildViewSet(viewsets.ModelViewSet):
    """Base para as tabelas filhas planas de OcorrenciaGeral (sem lógica própria).

    O workflow do agregado raiz (OcorrenciaGeral) fica para a Fase 2 do plano
    de migração — aqui só cobrimos os modelos 1:N sem máquina de estado.
    """

    filterset_fields = ['ocorrencia']


class OcorrenciaJuridicoViewSet(_OcorrenciaChildViewSet):
    queryset = OcorrenciaJuridico.objects.all()
    serializer_class = ser.OcorrenciaJuridicoSerializer


class OcorrenciaLaudoMaterialViewSet(_OcorrenciaChildViewSet):
    queryset = OcorrenciaLaudoMaterial.objects.all()
    serializer_class = ser.OcorrenciaLaudoMaterialSerializer


class OcorrenciaApoioViewSet(_OcorrenciaChildViewSet):
    queryset = OcorrenciaApoio.objects.all()
    serializer_class = ser.OcorrenciaApoioSerializer


class OcorrenciaConfirmacaoViewSet(_OcorrenciaChildViewSet):
    """Somente leitura na prática — os registros só são criados pela ação
    `confirmar` de OcorrenciaGeralViewSet. Exposto pra exibir "confirmado por
    / quando" no bloco de apoio da aba Controle (admin.py:OcorrenciaApoioInlineForm)."""

    queryset = OcorrenciaConfirmacao.objects.select_related('usuario').all()
    serializer_class = ser.OcorrenciaConfirmacaoSerializer


class OcorrenciaAutenticacaoViewSet(_OcorrenciaChildViewSet):
    """Idem OcorrenciaConfirmacaoViewSet, para a ação `autenticar`."""

    queryset = OcorrenciaAutenticacao.objects.select_related('usuario').all()
    serializer_class = ser.OcorrenciaAutenticacaoSerializer


class OcorrenciaFatorContribuinteViewSet(_OcorrenciaChildViewSet):
    queryset = OcorrenciaFatorContribuinte.objects.all()
    serializer_class = ser.OcorrenciaFatorContribuinteSerializer
    filterset_fields = ['ocorrencia', 'nivel_contribuicao']


class OcorrenciaFatorHumanoViewSet(_OcorrenciaChildViewSet):
    queryset = OcorrenciaFatorHumano.objects.all()
    serializer_class = ser.OcorrenciaFatorHumanoSerializer


class OcorrenciaViolacaoViewSet(_OcorrenciaChildViewSet):
    queryset = OcorrenciaViolacao.objects.all()
    serializer_class = ser.OcorrenciaViolacaoSerializer


class OcorrenciaTipoOcorrenciaViewSet(_OcorrenciaChildViewSet):
    queryset = OcorrenciaTipoOcorrencia.objects.all()
    serializer_class = ser.OcorrenciaTipoOcorrenciaSerializer


class OcorrenciaProgressoInvestigacaoViewSet(_OcorrenciaChildViewSet):
    queryset = OcorrenciaProgressoInvestigacao.objects.all()
    serializer_class = ser.OcorrenciaProgressoInvestigacaoSerializer


class OcorrenciaRecomendacaoViewSet(_OcorrenciaChildViewSet):
    queryset = OcorrenciaRecomendacao.objects.all()
    serializer_class = ser.OcorrenciaRecomendacaoSerializer


class OcorrenciaRegistroMinutaViewSet(_OcorrenciaChildViewSet):
    queryset = OcorrenciaRegistroMinuta.objects.all()
    serializer_class = ser.OcorrenciaRegistroMinutaSerializer


class OcorrenciaRegistroRaiViewSet(_OcorrenciaChildViewSet):
    queryset = OcorrenciaRegistroRai.objects.select_related('responsavel_rai').all()
    serializer_class = ser.OcorrenciaRegistroRaiSerializer

    def perform_create(self, serializer):
        serializer.save(status_rai='RASCUNHO')

    @action(detail=True, methods=['post'])
    def finalizar(self, request, pk=None):
        """"Finalizar RAI" (readme_rai.md) — muda status_rai para FINALIZADO."""
        obj = self.get_object()
        obj.status_rai = 'FINALIZADO'
        obj.save(update_fields=['status_rai'])
        return Response(ser.OcorrenciaRegistroRaiSerializer(obj).data)


class OcorrenciaRaiPessoalViewSet(viewsets.ModelViewSet):
    queryset = OcorrenciaRaiPessoal.objects.all()
    serializer_class = ser.OcorrenciaRaiPessoalSerializer
    filterset_fields = ['rai']


class OcorrenciaRaiFotoViewSet(viewsets.ModelViewSet):
    queryset = OcorrenciaRaiFoto.objects.all()
    serializer_class = ser.OcorrenciaRaiFotoSerializer
    filterset_fields = ['rai']


# ── Módulo carro-chefe: Ocorrência -> Foguete -> Documentos -> Gestão ──

class OcorrenciaGeralViewSet(viewsets.ModelViewSet):
    """CRUD + máquina de estado (Redigir -> Confirmar -> Autenticar).

    Porta a lógica que hoje vive em ocorrencia/admin.py nos 4 ModelAdmin
    proxy (OcorrenciaRedigir/Confirmar/Autenticar/Investigada,
    admin.py:704-1021). status/numero_processo são somente-leitura no
    serializer — só mudam via create() (Redigir) e via as ações abaixo,
    nunca por PATCH direto, replicando has_change_permission=False do
    admin nesses campos.
    """

    queryset = OcorrenciaGeral.objects.select_related('cidade', 'aerodromo', 'cadastrado_por_id').prefetch_related(
        'ocorrencia_aeronave', 'ocorrencia_aeronave__artefato_espacial', 'ocorrencia_aeronave__artefato_espacial__artefato',
    ).all()
    serializer_class = ser.OcorrenciaGeralSerializer
    search_fields = ['numero_processo', 'classificacao']
    filterset_fields = ['status', 'classificacao', 'tipo', 'localizacao_tipo']

    def perform_create(self, serializer):
        obj = serializer.save(cadastrado_por_id=self.request.user, status='CONFIRMAR')
        if obj.dia:
            obj.numero_processo = f'{obj.dia:%Y%m%d}{str(obj.pk).zfill(4)}'
            obj.save(update_fields=['numero_processo'])

    @action(detail=True, methods=['post'])
    def confirmar(self, request, pk=None):
        """Equivalente a OcorrenciaConfirmarAdmin.response_change (admin.py:870-882)."""
        if not request.user.has_perm('ocorrencia.change_ocorrenciageral'):
            return Response({'detail': 'Permissão negada.'}, status=status.HTTP_403_FORBIDDEN)

        obj = self.get_object()
        if obj.status != 'CONFIRMAR':
            return Response(
                {'detail': f"Ocorrência não está em CONFIRMAR (status atual: {obj.status})."},
                status=status.HTTP_409_CONFLICT,
            )

        if request.data.get('enviar_autenticacao'):
            obj.status = 'AUTENTICAR'
            obj.save(update_fields=['status'])
            OcorrenciaConfirmacao.objects.update_or_create(
                ocorrencia=obj,
                defaults={'usuario': request.user, 'data_confirmacao': timezone.now().date()},
            )

        return Response(ser.OcorrenciaGeralSerializer(obj).data)

    @action(detail=True, methods=['post'])
    def autenticar(self, request, pk=None):
        """Equivalente a OcorrenciaAutenticarAdmin.response_change (admin.py:1003-1017)."""
        if not request.user.has_perm('ocorrencia.change_ocorrenciageral'):
            return Response({'detail': 'Permissão negada.'}, status=status.HTTP_403_FORBIDDEN)

        obj = self.get_object()
        if obj.status != 'AUTENTICAR':
            return Response(
                {'detail': f"Ocorrência não está em AUTENTICAR (status atual: {obj.status})."},
                status=status.HTTP_409_CONFLICT,
            )

        decisao = request.data.get('decisao')
        if decisao == 'AUTENTICADO':
            obj.status = 'AUTENTICADO'
            obj.save(update_fields=['status'])
            OcorrenciaAutenticacao.objects.update_or_create(
                ocorrencia=obj,
                defaults={'usuario': request.user, 'data_autenticacao': timezone.now().date()},
            )
        elif decisao == 'CONFIRMAR':
            obj.status = 'CONFIRMAR'
            obj.save(update_fields=['status'])
        else:
            return Response(
                {'detail': "'decisao' deve ser 'AUTENTICADO' ou 'CONFIRMAR'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(ser.OcorrenciaGeralSerializer(obj).data)

    @action(detail=False, methods=['get'])
    def export(self, request):
        """Exportação em massa — porta export_as_json/export_as_csv (admin.py:111-125).

        GET .../ocorrencias/export/?ids=1,2,3&filetype=json|csv

        Usa 'filetype', não 'format' — este último é o nome reservado do DRF
        para negociação de conteúdo (URL_FORMAT_OVERRIDE); passá-lo faz
        DefaultContentNegotiation.filter_renderers levantar Http404 porque
        não há renderer CSV registrado, antes mesmo do código do action rodar.
        """
        pks = [pk for pk in request.query_params.get('ids', '').split(',') if pk]
        if not pks:
            return Response({'detail': "Informe 'ids' (lista separada por vírgula)."}, status=status.HTTP_400_BAD_REQUEST)

        queryset = self.filter_queryset(self.get_queryset()).filter(pk__in=pks)
        fmt = request.query_params.get('filetype', 'json')

        if fmt == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="ocorrencias.csv"'
            writer = csv.writer(response)
            writer.writerow(['id', 'classificacao'])
            for ocorrencia in queryset:
                writer.writerow([ocorrencia.id, ocorrencia.classificacao])
            return response

        response = HttpResponse(content_type='application/json')
        response['Content-Disposition'] = 'attachment; filename="ocorrencias.json"'
        django_serializers.serialize('json', queryset, stream=response)
        return response


class OcorrenciaAeronaveViewSet(_OcorrenciaChildViewSet):
    """O "foguete" da ocorrência — FK para VeiculoLancador (autocomplete, não criação inline)."""

    queryset = OcorrenciaAeronave.objects.select_related('artefato_espacial', 'artefato_espacial__artefato').all()
    serializer_class = ser.OcorrenciaAeronaveSerializer
    filterset_fields = ['ocorrencia', 'artefato_espacial', 'tipo']


class OcorrenciaAeronaveTripulanteViewSet(viewsets.ModelViewSet):
    """Filho de OcorrenciaAeronave (2º nível: Ocorrência -> Aeronave -> Tripulante)."""

    queryset = OcorrenciaAeronaveTripulante.objects.all()
    serializer_class = ser.OcorrenciaAeronaveTripulanteSerializer
    filterset_fields = ['ocorrencia_aeronave']


class OcorrenciaAeronaveLesaoViewSet(viewsets.ModelViewSet):
    """Filho de OcorrenciaAeronave (2º nível: Ocorrência -> Aeronave -> Lesão)."""

    queryset = OcorrenciaAeronaveLesao.objects.all()
    serializer_class = ser.OcorrenciaAeronaveLesaoSerializer
    filterset_fields = ['ocorrencia_aeronave']


class OcorrenciaControleViewSet(_OcorrenciaChildViewSet):
    queryset = OcorrenciaControle.objects.select_related('investigador').all()
    serializer_class = ser.OcorrenciaControleSerializer
    filterset_fields = ['ocorrencia', 'status', 'fase_atual', 'situacao_investigacao']


class OcorrenciaComissaoViewSet(_OcorrenciaChildViewSet):
    queryset = OcorrenciaComissao.objects.select_related('investigador').all()
    serializer_class = ser.OcorrenciaComissaoSerializer
    filterset_fields = ['ocorrencia', 'investigador', 'funcao']


class OcorrenciaDocumentoViewSet(_OcorrenciaChildViewSet):
    """Upload multipart; download é o /media/<path> autenticado (dedalo/media_views.py)."""

    queryset = OcorrenciaDocumento.objects.select_related('cadastrado_por_id').all()
    serializer_class = ser.OcorrenciaDocumentoSerializer
    filterset_fields = ['ocorrencia', 'tipo_documento']

    def perform_create(self, serializer):
        serializer.save(cadastrado_por_id=self.request.user)


class OcorrenciaAsoaciViewSet(_OcorrenciaChildViewSet):
    queryset = OcorrenciaAsoaci.objects.all()
    serializer_class = ser.OcorrenciaAsoaciSerializer


class OcorrenciaRelatorioViewSet(_OcorrenciaChildViewSet):
    queryset = OcorrenciaRelatorio.objects.all()
    serializer_class = ser.OcorrenciaRelatorioSerializer


def _serialize_revisao_painel_row(r):
    """Mesma composição de artefato_display/classificacao_display/prioridade_display
    de OcorrenciaRevisaoRelatorioAdmin (ocorrencia/admin.py:1304-1372), em JSON."""
    controle = r.ocorrencia.ocorrencia_controle.first()
    artefatos = [
        {
            'nome': str(a.artefato_espacial) if a.artefato_espacial else None,
            'tipo': a.tipo,
            'operador': a.operador,
            'danos': a.danos,
            'massa_total': a.massa_total,
            'veiculo_lancador': a.veiculo_lancador,
            'evidencia_falha': a.get_evidencia_falha_display() if a.evidencia_falha else None,
        }
        for a in r.ocorrencia.ocorrencia_aeronave.all()
    ]
    return {
        'id': r.id,
        'ocorrencia_id': r.ocorrencia_id,
        'classificacao': r.ocorrencia.classificacao,
        'prioridade': controle.prioridade if controle else None,
        'prioridade_display': controle.get_prioridade_display() if controle and controle.prioridade else None,
        'data_atribuicao': r.data_atribuicao,
        'revisor': str(r.revisor) if r.revisor else None,
        'setor': r.setor,
        'setor_display': r.get_setor_display() if r.setor else None,
        'observacao': r.observacao,
        'artefatos': artefatos,
    }


class OcorrenciaRevisaoRelatorioViewSet(_OcorrenciaChildViewSet):
    queryset = OcorrenciaRevisaoRelatorio.objects.select_related('revisor', 'cadastrado_por').all()
    serializer_class = ser.OcorrenciaRevisaoRelatorioSerializer
    filterset_fields = ['ocorrencia', 'setor', 'revisor']

    @action(detail=False, methods=['get'])
    def painel(self, request):
        """Painel de Revisão RF — porta OcorrenciaRevisaoRelatorioAdmin.get_queryset
        (admin.py:1285-1302): última revisão por ocorrência (dedup via Subquery(Max(id)))."""
        latest_ids = (
            OcorrenciaRevisaoRelatorio.objects
            .values('ocorrencia_id')
            .annotate(max_id=Max('id'))
            .values('max_id')
        )
        rows = (
            OcorrenciaRevisaoRelatorio.objects
            .filter(id__in=Subquery(latest_ids))
            .select_related('ocorrencia', 'cadastrado_por', 'revisor')
            .prefetch_related(
                'ocorrencia__ocorrencia_aeronave',
                'ocorrencia__ocorrencia_aeronave__artefato_espacial',
                'ocorrencia__ocorrencia_controle',
            )
            .order_by('-data_atribuicao', '-id')
        )
        return Response([_serialize_revisao_painel_row(r) for r in rows])

    @action(detail=False, methods=['get'])
    def historico(self, request):
        """Histórico de revisões de uma ocorrência — porta historico_view (admin.py:1260-1283)."""
        ocorrencia_id = request.query_params.get('ocorrencia')
        if not ocorrencia_id:
            return Response({'detail': "Informe 'ocorrencia'."}, status=status.HTTP_400_BAD_REQUEST)
        rows = (
            OcorrenciaRevisaoRelatorio.objects
            .filter(ocorrencia_id=ocorrencia_id)
            .select_related('revisor', 'cadastrado_por')
            .order_by('-data_atribuicao', '-id')
        )
        return Response(ser.OcorrenciaRevisaoRelatorioSerializer(rows, many=True).data)
