from django.apps import AppConfig


class OcorrenciaConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ocorrencia'

    def ready(self):
        from auditlog.registry import auditlog
        from ocorrencia.models import (
            OcorrenciaGeral,
            OcorrenciaRevisaoRelatorio,
            OcorrenciaControle,
            OcorrenciaAeronave,
            OcorrenciaDocumento,
            OcorrenciaComissao,
            OcorrenciaConfirmacao,
            OcorrenciaAutenticacao,
            OcorrenciaAeronaveTripulante,
            OcorrenciaAeronaveLesao,
            OcorrenciaLabdata,
            OcorrenciaAsoaci,
            OcorrenciaRelatorio,
            OcorrenciaFatorContribuinte,
            OcorrenciaRegistroRai,
            OcorrenciaRaiPessoal,
            OcorrenciaRaiFoto,
        )

        auditlog.register(OcorrenciaGeral)
        auditlog.register(OcorrenciaRevisaoRelatorio)
        auditlog.register(OcorrenciaControle)
        auditlog.register(OcorrenciaAeronave)
        auditlog.register(OcorrenciaDocumento)
        auditlog.register(OcorrenciaComissao)
        auditlog.register(OcorrenciaConfirmacao)
        auditlog.register(OcorrenciaAutenticacao)
        auditlog.register(OcorrenciaAeronaveTripulante)
        auditlog.register(OcorrenciaAeronaveLesao)
        auditlog.register(OcorrenciaLabdata)
        auditlog.register(OcorrenciaAsoaci)
        auditlog.register(OcorrenciaRelatorio)
        auditlog.register(OcorrenciaFatorContribuinte)
        auditlog.register(OcorrenciaRegistroRai)
        auditlog.register(OcorrenciaRaiPessoal)
        auditlog.register(OcorrenciaRaiFoto)