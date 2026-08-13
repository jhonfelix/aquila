from rest_framework.permissions import DjangoModelPermissions


class DjangoModelPermissionsWithView(DjangoModelPermissions):
    """`DjangoModelPermissions` do DRF não exige NENHUMA permissão para
    GET/HEAD/OPTIONS por padrão (`perms_map['GET'] = []`) — qualquer usuário
    autenticado conseguia listar/ver dados de qualquer modelo independente
    das permissões do seu grupo. Aqui GET também exige `view_<model>`,
    fechando esse gap (usada como DEFAULT_PERMISSION_CLASSES)."""

    perms_map = {
        **DjangoModelPermissions.perms_map,
        'GET': ['%(app_label)s.view_%(model_name)s'],
        'OPTIONS': ['%(app_label)s.view_%(model_name)s'],
        'HEAD': ['%(app_label)s.view_%(model_name)s'],
    }
