from auditlog.models import LogEntry
from django.contrib.contenttypes.models import ContentType
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ocorrencia.models import (
    OcorrenciaAeronave,
    OcorrenciaAsoaci,
    OcorrenciaComissao,
    OcorrenciaControle,
    OcorrenciaDocumento,
    OcorrenciaFatorContribuinte,
    OcorrenciaGeral,
    OcorrenciaRelatorio,
    OcorrenciaRevisaoRelatorio,
)

# Espelha OcorrenciaGeralAdmin.auditlog_related (ocorrencia/admin.py) — os
# filhos que aparecem junto com a ocorrência-mãe no histórico do Django Admin.
OCORRENCIA_GERAL_RELATED = [
    (OcorrenciaAeronave, 'ocorrencia_aeronave', 'Artefato Espacial'),
    (OcorrenciaComissao, 'ocorrencia_comissao', 'Comissão'),
    (OcorrenciaControle, 'ocorrencia_controle', 'Gestão'),
    (OcorrenciaDocumento, 'ocorrencia_documento', 'Documentos'),
    (OcorrenciaAsoaci, 'ocorrencia_asoaci', 'Internacional'),
    (OcorrenciaRevisaoRelatorio, 'ocorrencia_revisao_relatorio', 'Revisão Relatório'),
    (OcorrenciaRelatorio, 'ocorrencia_relatorio', 'Relatório'),
    (OcorrenciaFatorContribuinte, 'ocorrencia_fator_contribuinte', 'Fatores Contribuintes'),
]

RELATED_BY_MODEL = {
    OcorrenciaGeral: OCORRENCIA_GERAL_RELATED,
}


def _serialize_entries(entries):
    return [
        {
            'id': e.id,
            'action': e.action,
            'action_display': e.get_action_display(),
            'actor': e.actor.email if e.actor_id else (e.actor_email or None),
            'object_pk': e.object_pk,
            'object_repr': e.object_repr,
            'changes': e.changes,
            'timestamp': e.timestamp,
        }
        for e in entries
    ]


class AuditTrailView(APIView):
    """Histórico de auditoria de um objeto, replicando AuditlogHistoryMixin
    (ocorrencia/admin.py:70-109) em JSON.

    GET /api/audit/<app_label>.<model>/<object_id>/
    Para modelos com filhos relacionados (hoje só OcorrenciaGeral), inclui
    também o histórico de cada filho, agrupado por seção.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, content_type, object_id):
        try:
            app_label, model_name = content_type.split('.', 1)
        except ValueError:
            return Response({'detail': "content_type deve ser 'app_label.model'."}, status=400)

        ct = get_object_or_404(ContentType, app_label=app_label, model=model_name)
        model = ct.model_class()
        if model is None:
            return Response({'detail': 'Modelo não encontrado.'}, status=404)

        own_entries = (
            LogEntry.objects.filter(content_type=ct, object_pk=str(object_id))
            .select_related('actor')
            .order_by('-timestamp')
        )

        related_groups = []
        related_config = RELATED_BY_MODEL.get(model)
        if related_config:
            parent_obj = get_object_or_404(model, pk=object_id)
            for related_model, related_name, label in related_config:
                pks = list(getattr(parent_obj, related_name).values_list('pk', flat=True))
                ct_related = ContentType.objects.get_for_model(related_model)
                entries = (
                    LogEntry.objects.filter(content_type=ct_related, object_pk__in=[str(pk) for pk in pks])
                    .select_related('actor')
                    .order_by('-timestamp')
                )
                related_groups.append({
                    'label': label,
                    'anchor': related_name,
                    'entries': _serialize_entries(entries),
                })

        return Response({
            'entries': _serialize_entries(own_entries),
            'related': related_groups,
        })
