from rest_framework.routers import DefaultRouter

from . import viewsets

router = DefaultRouter()
router.register('juridico', viewsets.OcorrenciaJuridicoViewSet, basename='ocorrenciajuridico')
router.register('laudo-material', viewsets.OcorrenciaLaudoMaterialViewSet, basename='ocorrencialaudomaterial')
router.register('apoio', viewsets.OcorrenciaApoioViewSet, basename='ocorrenciaapoio')
router.register('confirmacao', viewsets.OcorrenciaConfirmacaoViewSet, basename='ocorrenciaconfirmacao')
router.register('autenticacao', viewsets.OcorrenciaAutenticacaoViewSet, basename='ocorrenciaautenticacao')
router.register('fator-contribuinte', viewsets.OcorrenciaFatorContribuinteViewSet, basename='ocorrenciafatorcontribuinte')
router.register('fator-humano', viewsets.OcorrenciaFatorHumanoViewSet, basename='ocorrenciafatorhumano')
router.register('violacao', viewsets.OcorrenciaViolacaoViewSet, basename='ocorrenciaviolacao')
router.register('tipo-ocorrencia', viewsets.OcorrenciaTipoOcorrenciaViewSet, basename='ocorrenciatipoocorrencia')
router.register('progresso-investigacao', viewsets.OcorrenciaProgressoInvestigacaoViewSet, basename='ocorrenciaprogressoinvestigacao')
router.register('recomendacao', viewsets.OcorrenciaRecomendacaoViewSet, basename='ocorrenciarecomendacao')
router.register('registro-minuta', viewsets.OcorrenciaRegistroMinutaViewSet, basename='ocorrenciaregistrominuta')
router.register('registro-rai', viewsets.OcorrenciaRegistroRaiViewSet, basename='ocorrenciaregistrorai')
router.register('rai-pessoal', viewsets.OcorrenciaRaiPessoalViewSet, basename='ocorrenciaraipessoal')
router.register('rai-fotos', viewsets.OcorrenciaRaiFotoViewSet, basename='ocorrenciaraifoto')

# Módulo carro-chefe: Ocorrência -> Foguete -> Documentos -> Gestão
router.register('ocorrencias', viewsets.OcorrenciaGeralViewSet, basename='ocorrenciageral')
router.register('aeronaves', viewsets.OcorrenciaAeronaveViewSet, basename='ocorrenciaaeronave')
router.register('tripulantes', viewsets.OcorrenciaAeronaveTripulanteViewSet, basename='ocorrenciaaeronavetripulante')
router.register('lesoes', viewsets.OcorrenciaAeronaveLesaoViewSet, basename='ocorrenciaaeronavelesao')
router.register('controle', viewsets.OcorrenciaControleViewSet, basename='ocorrenciacontrole')
router.register('checklist-item', viewsets.OcorrenciaChecklistItemViewSet, basename='ocorrenciachecklistitem')
router.register('comissao', viewsets.OcorrenciaComissaoViewSet, basename='ocorrenciacomissao')
router.register('documentos', viewsets.OcorrenciaDocumentoViewSet, basename='ocorrenciadocumento')
router.register('asoaci', viewsets.OcorrenciaAsoaciViewSet, basename='ocorrenciaasoaci')
router.register('relatorio', viewsets.OcorrenciaRelatorioViewSet, basename='ocorrenciarelatorio')
router.register('revisao-relatorio', viewsets.OcorrenciaRevisaoRelatorioViewSet, basename='ocorrenciarevisaorelatorio')
router.register('investigadas', viewsets.OcorrenciaInvestigadaViewSet, basename='ocorrenciainvestigada')

urlpatterns = router.urls
