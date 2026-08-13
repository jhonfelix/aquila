from django.contrib.auth.models import Group, Permission
from rest_framework import viewsets

from usuario.models import User

from .serializers import GroupSerializer, PermissionSerializer, UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.prefetch_related('groups').order_by('nome')
    serializer_class = UserSerializer
    search_fields = ['nome', 'nome_guerra', 'email', 'credencial']
    filterset_fields = ['local_trabalho', 'posto_graduacao', 'is_staff', 'is_superuser']


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all().order_by('name')
    serializer_class = GroupSerializer
    search_fields = ['name']


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    """Somente-leitura — alimenta o widget de transferência de permissões no
    form de Grupo. Sem paginação: o widget carrega a lista inteira uma vez e
    filtra no cliente, igual ao SelectFilter2 do Django Admin."""

    queryset = Permission.objects.select_related('content_type').order_by('content_type__app_label', 'codename')
    serializer_class = PermissionSerializer
    search_fields = ['name', 'codename']
    filterset_fields = ['content_type__app_label']
    pagination_class = None
