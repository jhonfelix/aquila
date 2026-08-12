from rest_framework.routers import DefaultRouter

from . import viewsets

router = DefaultRouter()
router.register('materiais', viewsets.MaterialApoioViewSet, basename='materialapoio')
router.register(
    'investigacoes-outras-autoridades',
    viewsets.InvestigacaoOutrasAutoridadesViewSet,
    basename='investigacaooutrasautoridades',
)

urlpatterns = router.urls
