from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings

from dedalo.media_views import protected_media

admin.site.site_header = "Sistema de Gestão de Ocorrências e de Coleta e Processamento de Dados de Segurança das Atividades Espaciais - ÁQUILA"
admin.site.site_title = "Sistema de Gestão de Ocorrências e de Coleta e Processamento de Dados de Segurança das Atividades Espaciais"
admin.site.index_title = "Sistema de Gestão de Ocorrências e de Coleta e Processamento de Dados de Segurança das Atividades Espaciais"

urlpatterns = [
    path('2fa/', include('usuario.urls')),
    path('api/', include('api.urls')),
    # /media/<path> exige autenticação (ver dedalo/media_views.py); o nginx
    # não expõe mais /media/ como alias público.
    re_path(r'^media/(?P<path>.*)$', protected_media, name='protected-media'),
    # Admin migrou de '' para 'admin/' porque a raiz do nginx agora aponta
    # para o Next.js (frontend). Fica em /admin/ como fallback operacional
    # indefinido (ver plano de migração, fase 6).
    path('admin/', admin.site.urls),
    path('_nested_admin/', include('nested_admin.urls')),
]
