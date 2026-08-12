from django.urls import include, path

from . import audit_views

urlpatterns = [
    path('auth/', include('usuario.api.urls')),
    path('', include('usuario.api.crud_urls')),
    path('taxonomia/', include('taxonomia.api.urls')),
    path('material-apoio/', include('material_apoio.api.urls')),
    path('ocorrencia/', include('ocorrencia.api.urls')),
    path('audit/<str:content_type>/<int:object_id>/', audit_views.AuditTrailView.as_view(), name='audit-trail'),
]
