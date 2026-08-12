from django.db.models import Count
from ocorrencia.models import OcorrenciaGeral


def dashboard_callback(request, context):
    total = OcorrenciaGeral.objects.count()
    por_classificacao = dict(
        OcorrenciaGeral.objects.values_list('classificacao')
        .annotate(total=Count('id'))
    )
    por_status = dict(
        OcorrenciaGeral.objects.values_list('status')
        .annotate(total=Count('id'))
    )

    recentes = OcorrenciaGeral.objects.order_by('-dia')[:5]
    table_recentes = {
        "headers": ["ID", "N. Processo", "Classificacao", "Data", "Status"],
        "rows": [
            [
                str(o.id),
                o.numero_processo or "-",
                o.classificacao or "-",
                str(o.dia) if o.dia else "-",
                o.status or "-",
            ]
            for o in recentes
        ],
    }

    context.update({
        "total_ocorrencias": total,
        "total_acidentes": por_classificacao.get("ACIDENTE", 0),
        "total_incidentes": por_classificacao.get("INCIDENTE", 0),
        "total_infortunios": por_classificacao.get("INFORTÚNIO", 0),
        "por_status": por_status,
        "table_recentes": table_recentes,
    })
    return context
