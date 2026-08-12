import os

from django.conf import settings
from django.http import Http404, HttpResponse, HttpResponseForbidden


def protected_media(request, path):
    """Serve MEDIA_ROOT apenas para usuários autenticados.

    O nginx não expõe mais /media/ diretamente (alias público removido de
    nginx.conf) — toda requisição para /media/<path> cai aqui, e só depois
    de autenticado é que devolvemos X-Accel-Redirect para a location
    `internal` /protected-media/, que faz o nginx servir o arquivo.
    """
    if not request.user.is_authenticated:
        return HttpResponseForbidden("Autenticação necessária para acessar este arquivo.")

    media_root = str(settings.MEDIA_ROOT)
    full_path = os.path.normpath(os.path.join(media_root, path))
    if not (full_path == media_root or full_path.startswith(media_root + os.sep)):
        raise Http404

    if not os.path.isfile(full_path):
        raise Http404

    response = HttpResponse()
    response['X-Accel-Redirect'] = f'/protected-media/{path}'
    response['Content-Type'] = ''
    return response
