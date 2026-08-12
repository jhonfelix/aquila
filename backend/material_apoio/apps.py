from django.apps import AppConfig


class MaterialApoioConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'material_apoio'

    def ready(self):
        from auditlog.registry import auditlog
        from material_apoio.models import MaterialApoio, InvestigacaoOutrasAutoridades

        auditlog.register(MaterialApoio)
        auditlog.register(InvestigacaoOutrasAutoridades)
        # Proxy models compartilham a mesma tabela; auditlog do pai já cobre
