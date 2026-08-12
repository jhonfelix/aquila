from django.contrib import admin
from unfold.admin import ModelAdmin
from material_apoio.models import (
    MaterialApoio, InvestigacaoOutrasAutoridades,
    NormaLegislacao, Formulario, DocumentoDiverso,
)
from ocorrencia.admin import AuditlogHistoryMixin


@admin.register(MaterialApoio)
class MaterialApoioAdmin(AuditlogHistoryMixin, ModelAdmin):
    list_display = ('titulo', 'categoria', 'tipo_documento', 'numero_norma', 'pessoa_responsavel', 'data_publicacao', 'download_word', 'download_pdf')
    list_filter = ('categoria', 'tipo_documento')
    search_fields = ['titulo', 'numero_norma']

    def download_word(self, obj):
        from django.utils.html import mark_safe
        if obj.documento_word:
            return mark_safe(
                f'<a href="{obj.documento_word.url}" target="_blank" title="Download Word">'
                '<span class="material-symbols-outlined" style="color:var(--color-primary-600)">description</span>'
                '</a>'
            )
        return '-'
    download_word.short_description = "Word"

    def download_pdf(self, obj):
        from django.utils.html import mark_safe
        if obj.documento_pdf:
            return mark_safe(
                f'<a href="{obj.documento_pdf.url}" target="_blank" title="Download PDF">'
                '<span class="material-symbols-outlined" style="color:var(--color-primary-600)">picture_as_pdf</span>'
                '</a>'
            )
        return '-'
    download_pdf.short_description = "PDF"

    fieldsets = (
        ('Identificação', {
            'fields': ('titulo', ('categoria', 'tipo_documento'), 'numero_norma'),
        }),
        ('Responsáveis', {
            'fields': ('divisao_responsavel', 'setor_responsavel', 'pessoa_responsavel'),
        }),
        ('Datas', {
            'fields': (('data_emissao', 'data_efetivacao'), ('data_aprovacao', 'data_publicacao')),
        }),
        ('Documentos', {
            'fields': ('documento_word', 'documento_pdf'),
        }),
        ('Observações', {
            'fields': ('observacoes',),
            'classes': ('collapse',),
        }),
        ('Cadastro', {
            'fields': ('cadastrado_por_id', 'cadastrado_em'),
            'classes': ('collapse',),
        }),
    )
    readonly_fields = ('cadastrado_em', 'cadastrado_por_id')

    def save_model(self, request, obj, form, change):
        if not change:
            obj.cadastrado_por_id = request.user
        super().save_model(request, obj, form, change)


class _MaterialApoioBaseAdmin(AuditlogHistoryMixin, ModelAdmin):
    """Base compartilhada para os admins de proxy de MaterialApoio."""

    list_display = ('titulo', 'categoria', 'tipo_documento', 'numero_norma', 'pessoa_responsavel', 'data_publicacao', 'download_word', 'download_pdf')
    search_fields = ['titulo', 'numero_norma']

    def download_word(self, obj):
        from django.utils.html import mark_safe
        if obj.documento_word:
            return mark_safe(
                f'<a href="{obj.documento_word.url}" target="_blank" title="Download Word">'
                '<span class="material-symbols-outlined" style="color:var(--color-primary-600)">description</span>'
                '</a>'
            )
        return '-'
    download_word.short_description = "Word"

    def download_pdf(self, obj):
        from django.utils.html import mark_safe
        if obj.documento_pdf:
            return mark_safe(
                f'<a href="{obj.documento_pdf.url}" target="_blank" title="Download PDF">'
                '<span class="material-symbols-outlined" style="color:var(--color-primary-600)">picture_as_pdf</span>'
                '</a>'
            )
        return '-'
    download_pdf.short_description = "PDF"

    readonly_fields = ('cadastrado_em', 'cadastrado_por_id')

    def save_model(self, request, obj, form, change):
        if not change:
            obj.cadastrado_por_id = request.user
        super().save_model(request, obj, form, change)

    # Subclasses definem _CATEGORIAS_ALLOWED e _CATEGORIA_FIXA (opcional)
    _CATEGORIAS_ALLOWED = None
    _CATEGORIA_FIXA = None

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if self._CATEGORIAS_ALLOWED and 'categoria' in form.base_fields:
            form.base_fields['categoria'].choices = [
                c for c in MaterialApoio.CATEGORIA_CHOICES
                if c[0] in self._CATEGORIAS_ALLOWED
            ]
        return form


@admin.register(NormaLegislacao)
class NormaLegislacaoAdmin(_MaterialApoioBaseAdmin):
    list_filter = ('categoria', 'tipo_documento')
    _CATEGORIAS_ALLOWED = MaterialApoio.CATEGORIAS_NORMA

    fieldsets = (
        ('Identificação', {
            'fields': ('titulo', ('categoria', 'tipo_documento'), 'numero_norma'),
        }),
        ('Responsáveis', {
            'fields': ('divisao_responsavel', 'setor_responsavel', 'pessoa_responsavel'),
        }),
        ('Datas', {
            'fields': (('data_emissao', 'data_efetivacao'), ('data_aprovacao', 'data_publicacao')),
        }),
        ('Documentos', {
            'fields': ('documento_word', 'documento_pdf'),
        }),
        ('Observações', {
            'fields': ('observacoes',),
            'classes': ('collapse',),
        }),
        ('Cadastro', {
            'fields': ('cadastrado_por_id', 'cadastrado_em'),
            'classes': ('collapse',),
        }),
    )


@admin.register(Formulario)
class FormularioAdmin(_MaterialApoioBaseAdmin):
    list_display = ('titulo', 'tipo_documento', 'numero_norma', 'pessoa_responsavel', 'data_publicacao', 'download_word', 'download_pdf')
    list_filter = ('tipo_documento',)
    _CATEGORIAS_ALLOWED = MaterialApoio.CATEGORIAS_FORMULARIO

    fieldsets = (
        ('Identificação', {
            'fields': ('titulo', 'tipo_documento', 'numero_norma'),
        }),
        ('Responsáveis', {
            'fields': ('divisao_responsavel', 'setor_responsavel', 'pessoa_responsavel'),
        }),
        ('Datas', {
            'fields': (('data_emissao', 'data_efetivacao'), ('data_aprovacao', 'data_publicacao')),
        }),
        ('Documentos', {
            'fields': ('documento_word', 'documento_pdf'),
        }),
        ('Observações', {
            'fields': ('observacoes',),
            'classes': ('collapse',),
        }),
        ('Cadastro', {
            'fields': ('cadastrado_por_id', 'cadastrado_em'),
            'classes': ('collapse',),
        }),
    )


@admin.register(DocumentoDiverso)
class DocumentoDiversoAdmin(_MaterialApoioBaseAdmin):
    list_display = ('titulo', 'tipo_documento', 'numero_norma', 'pessoa_responsavel', 'data_publicacao', 'download_word', 'download_pdf')
    list_filter = ('tipo_documento',)
    _CATEGORIAS_ALLOWED = MaterialApoio.CATEGORIAS_DOCUMENTO

    fieldsets = (
        ('Identificação', {
            'fields': ('titulo', 'tipo_documento', 'numero_norma'),
        }),
        ('Responsáveis', {
            'fields': ('divisao_responsavel', 'setor_responsavel', 'pessoa_responsavel'),
        }),
        ('Datas', {
            'fields': (('data_emissao', 'data_efetivacao'), ('data_aprovacao', 'data_publicacao')),
        }),
        ('Documentos', {
            'fields': ('documento_word', 'documento_pdf'),
        }),
        ('Observações', {
            'fields': ('observacoes',),
            'classes': ('collapse',),
        }),
        ('Cadastro', {
            'fields': ('cadastrado_por_id', 'cadastrado_em'),
            'classes': ('collapse',),
        }),
    )


@admin.register(InvestigacaoOutrasAutoridades)
class InvestigacaoOutrasAutoridadesAdmin(AuditlogHistoryMixin, ModelAdmin):
    list_display = ('titulo', 'pais', 'autoridade_investigadora', 'numero_relatorio', 'veiculo', 'tipo_ocorrencia', 'fase_voo', 'data_ocorrencia', 'download_pdf')
    list_filter = ('tipo_ocorrencia', 'fase_voo', 'pais')
    search_fields = ['titulo', 'numero_relatorio', 'pais', 'autoridade_investigadora', 'veiculo', 'operador']

    def download_pdf(self, obj):
        from django.utils.html import mark_safe
        if obj.documento_pdf:
            return mark_safe(
                f'<a href="{obj.documento_pdf.url}" target="_blank" title="Download PDF">'
                '<span class="material-symbols-outlined" style="color:var(--color-primary-600)">picture_as_pdf</span>'
                '</a>'
            )
        return '-'
    download_pdf.short_description = "PDF"

    fieldsets = (
        ('Identificação', {
            'fields': ('titulo', 'numero_relatorio', ('tipo_ocorrencia', 'fase_voo')),
        }),
        ('Origem', {
            'fields': ('pais', 'autoridade_investigadora', ('veiculo', 'operador')),
        }),
        ('Datas', {
            'fields': ('data_ocorrencia', 'data_publicacao'),
        }),
        ('Documento', {
            'fields': ('documento_pdf',),
        }),
        ('Observações', {
            'fields': ('observacoes',),
            'classes': ('collapse',),
        }),
        ('Cadastro', {
            'fields': ('cadastrado_por_id', 'cadastrado_em'),
            'classes': ('collapse',),
        }),
    )
    readonly_fields = ('cadastrado_em', 'cadastrado_por_id')

    def save_model(self, request, obj, form, change):
        if not change:
            obj.cadastrado_por_id = request.user
        super().save_model(request, obj, form, change)
