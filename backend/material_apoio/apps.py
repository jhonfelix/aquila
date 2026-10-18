from django.apps import AppConfig


class MaterialApoioConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'material_apoio'

    def ready(self):
        from auditlog.registry import auditlog
        from material_apoio.models import (
            DocumentoDiverso,
            Formulario,
            InvestigacaoOutrasAutoridades,
            MaterialApoio,
            NormaLegislacao,
        )

        auditlog.register(MaterialApoio)
        auditlog.register(InvestigacaoOutrasAutoridades)
        # Proxy models: o Django dispara os signals com sender=<proxy>, então o
        # registro do pai NÃO cobre as telas do Admin. Registrados à parte; o
        # LogEntry usa o content type concreto (MaterialApoio) mesmo assim.
        auditlog.register(NormaLegislacao)
        auditlog.register(Formulario)
        auditlog.register(DocumentoDiverso)
