from rest_framework.routers import DefaultRouter

from . import viewsets

router = DefaultRouter()
router.register('usuarios', viewsets.UserViewSet, basename='user')
router.register('grupos', viewsets.GroupViewSet, basename='group')
router.register('permissions', viewsets.PermissionViewSet, basename='permission')

urlpatterns = router.urls
