from rest_framework.routers import DefaultRouter

from . import viewsets

router = DefaultRouter()
router.register('paises', viewsets.GeografiaPaisViewSet, basename='geografiapais')
router.register('ufs', viewsets.GeografiaUfViewSet, basename='geografiauf')
router.register('cidades', viewsets.GeografiaCidadeViewSet, basename='geografiacidade')
router.register('aerodromos', viewsets.AerodromoGeralViewSet, basename='aerodromogeral')
router.register('artefatos-espaciais', viewsets.ArtefatoEspacialViewSet, basename='artefatoespacial')
router.register('veiculos-lancadores', viewsets.VeiculoLancadorViewSet, basename='veiculolancador')

urlpatterns = router.urls
