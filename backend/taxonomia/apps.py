from django.apps import AppConfig


class TaxonomiaConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'taxonomia'

    def ready(self):
        from auditlog.registry import auditlog
        from taxonomia.models import (
            AerodromoGeral,
            ArtefatoEspacial,
            GeografiaCidade,
            GeografiaPais,
            GeografiaUf,
            VeiculoLancador,
        )

        auditlog.register(GeografiaPais)
        auditlog.register(GeografiaUf)
        auditlog.register(GeografiaCidade)
        auditlog.register(AerodromoGeral)
        auditlog.register(ArtefatoEspacial)
        auditlog.register(VeiculoLancador)
