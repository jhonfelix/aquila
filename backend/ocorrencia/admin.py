from django.contrib import admin
from django.http import HttpResponse
from django.core import serializers
from django import forms as django_forms
from ocorrencia.models import *
from unfold.admin import ModelAdmin, TabularInline, StackedInline
from unfold.contrib.forms.widgets import ArrayWidget, WysiwygWidget
from unfold.decorators import display, action
from unfold.enums import ActionVariant
from rangefilter.filters import DateRangeFilter
from django.contrib.admin.filters import ChoicesFieldListFilter
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Fieldset, Row, Column
import csv

# Ocorrencia
    # -> juridico
    # ->recomendacao
    # -> laudoMaterial
    # -> apoio
    # -> controle
    # -> relatorio
    # -> fatorContribuinte
    # -> asoaci
    # -> saidaPista
    # -> TipoOcorrencia
    # -> Comissao
    # -> Violacao
    # -> Documento
    # -> FatorHumano
    # -> Confirmacao
    # -> Autenticacao
    # -> RegistroRai
    # -> RegistroRp
    # -> RegistroMinuta
    # -> RevisaoRelatorio
    # -> RevisaoRsv
    # -> RevisaoRelatorioFeedback
    # -> REvisaoSeripa
    # -> ProgressoInvestigacao
# OcorrenciaAeronave
#     -> Tripulante
#     -> Lesão
#     -> LABDATA

# Capacitação
    # -> Usuario Geral

# Prevenção
    # -> Controle de segurança de voo
    # -> Atividade de prevenção

#Labdata
    # -> Gravador de voo
    # -> Modelo
    # -> Normas

#Qualidade
    # -> gestão da qualidade
#USOAP
    # -> Auditoria ICAO
#Material de Apoio
    # -> Normas lesgilações manuais
#mensagem

class HorizontalChoicesFieldListFilter(ChoicesFieldListFilter):
    horizontal = True # Enable horizontal layout


class AuditlogHistoryMixin:
    """Substitui o history_view padrão pelo histórico do auditlog com valores antigo/novo."""

    def history_view(self, request, object_id, extra_context=None):
        from auditlog.models import LogEntry as AuditLogEntry
        from django.contrib.contenttypes.models import ContentType
        extra_context = extra_context or {}

        # Log do próprio model (pai)
        ct = ContentType.objects.get_for_model(self.model)
        extra_context['auditlog_entries'] = (
            AuditLogEntry.objects
            .filter(content_type=ct, object_pk=str(object_id))
            .order_by('-timestamp')
            .select_related('actor')
        )

        # Logs dos models filhos definidos em auditlog_related
        related_logs = []
        for related_model, related_name, label in getattr(self, 'auditlog_related', []):
            try:
                parent_obj = self.model.objects.get(pk=object_id)
                pks = list(getattr(parent_obj, related_name).values_list('pk', flat=True))
                ct_related = ContentType.objects.get_for_model(related_model)
                entries = (
                    AuditLogEntry.objects
                    .filter(content_type=ct_related, object_pk__in=[str(pk) for pk in pks])
                    .order_by('-timestamp')
                    .select_related('actor')
                )
                related_logs.append({
                    'label': label,
                    'anchor': related_name,
                    'entries': entries,
                })
            except self.model.DoesNotExist:
                pass

        extra_context['related_logs'] = related_logs
        return super().history_view(request, object_id, extra_context)

@admin.action(description="Export to Json")
def export_as_json(modeladmin, request, queryset):
    response = HttpResponse(content_type="application/json")
    serializers.serialize("json", queryset, stream=response)
    return response

@admin.action(description="Export to CSV")
def export_as_csv(self, request, queryset):
    response = HttpResponse(content_type="text/csv")
    response['content-Disposition'] = 'attachment; filename="ocorrencia.csv"'
    writer = csv.writer(response)
    writer.writerow(['id', 'classificacao'])
    for ocorrencia in queryset:
        writer.writerow([ocorrencia.id, ocorrencia.classificacao])
    return response

# Inlines para OcorrenciaAeronave
class OcorrenciaAeronaveTripulanteInline(TabularInline):
    model = OcorrenciaAeronaveTripulante
    fields = ['nome', 'funcao', 'licenca', 'horas_totais', 'horas_equipamento']
    extra = 0
    verbose_name_plural = "Tripulantes"
    tab = True

class OcorrenciaAeronaveLesaoInline(TabularInline):
    model = OcorrenciaAeronaveLesao
    fields = ['categoria', 'tipo_lesao', 'quantidade']
    extra = 0
    verbose_name_plural = "Lesões"
    tab = True

class OcorrenciaLabdataInline(StackedInline):
    model = OcorrenciaLabdata
    fields = ['tipo_gravador', 'fabricante', 'modelo', 'status_recuperacao', 'dados_extraidos']
    extra = 0
    verbose_name_plural = "LABDATA"
    tab = True

class OcorrenciaAsoaciInline(StackedInline):
    model = OcorrenciaAsoaci
    fields = ['initial_notification', 'destino_notificacao', 'dia_envio_notificacao', 'tem_rep_acred', 'nome_rep_acred', 'observacoes']
    extra = 0
    verbose_name_plural = "Internacional"
    tab = True

class OcorrenciaRelatorioInline(StackedInline):
    model = OcorrenciaRelatorio
    fields = ['relatorio_pt', 'relatorio_en', 'relatorio_es', 'publicar_site_sipae', 'comunicar_elos', 'observacoes', 'data_assinatura', 'data_publicacao', 'data_cadastro']
    extra = 0
    verbose_name = "Divulgação"
    verbose_name_plural = "Divulgação"
    tab = True
    is_grid_owner = True
    grid_slot_id = 'divulgacao'
    template = 'admin/edit_inline/grid_inline.html'

class OcorrenciaFatorContribuinteInline(StackedInline):
    model = OcorrenciaFatorContribuinte
    fields = ['fator', 'nivel_contribuicao', 'observacoes']
    extra = 0
    verbose_name = "Fator Contribuinte"
    verbose_name_plural = "Fatores Contribuintes"
    tab = False
    fake_tab = 'ocorrencia_relatorio'
    is_grid_owner = False
    grid_slot_id = 'divulgacao'
    template = 'admin/edit_inline/grid_inline.html'

@admin.register(OcorrenciaAeronave)
class OcorrenciaAeronaveAdmin(AuditlogHistoryMixin, ModelAdmin):  # Usando ModelAdmin do Unfold
    list_display = ('id','ocorrencia', 'artefato_espacial', 'operador', 'operador_detalhe', 'tipo', 'danos', 'observacoes')
    list_display_links=('id',)

    fieldsets = (
        ('Dados do Artefato Espacial', {
            'fields': ('ocorrencia', 'artefato_espacial', 'operador', 'operador_detalhe', 'tipo', 'danos', 'fase_missao', 'observacoes')
        }),
        ('Características Técnicas', {
            'fields': ('veiculo_lancador', 'massa_total', 'dimensoes', 'vida_util_prevista',
                      'sistema_propulsao', 'sistema_controle_atitude'),
            'description': 'Informações técnicas sobre o artefato espacial'
        }),
        ('Sistemas Críticos', {
            'fields': ('sistema_energia', 'sistema_comunicacao', 'sistema_navegacao', 'software_bordo'),
            'description': 'Informações sobre os sistemas críticos do artefato espacial'
        }),
        ('Informações Coletadas do Artefato Espacial', {
            'fields': (
                'dados_telemetria_brutos',
                'dados_telemetria_processados',
                'logs_eventos_falhas',
                'ultimos_comandos_enviados',
                'estado_subsistemas_antes_evento',
                'dados_orbitais_antes_depois',
                'evidencia_falha',
            ),
            'classes': ('collapse',),
            'description': 'Dados coletados do artefato e evidências de falha'
        }),
    )

    search_fields = ['id']
    autocomplete_fields = ['ocorrencia', 'artefato_espacial']
    inlines = [OcorrenciaAeronaveTripulanteInline, OcorrenciaAeronaveLesaoInline]
   # list_filter = (('ocorrencia', RelatedDropdownFilter),
   #                )
    
    """  def get_queryset(self, request):
        queryset = super().get_queryset(request)
        queryset = queryset.annotate(
            _hero_count=Count("hero", distinct=True),
            _villain_count=Count("villain", distinct=True),
        )
        return queryset
    """

    def hero_count(self,obj):
        return obj.artefato_espacial
    




#filtro que troca as propriedades na propria tela de lista
@admin.action(description="trocar status para Autenticado")
def make_published(self, request, queryset):
    queryset.update(status="AUTENTICADO")

# Classe OcorrenciaGeralheader removida - não é mais necessária
# O Unfold gerencia o header através das configurações em settings.py (UNFOLD)

class IsVeryBenevolentFilter(admin.SimpleListFilter):
    title = 'Filtro é ACIDENTE ?'
    parameter_name = 'É acidente'

    def lookups(self, request, model_admin):
        return (
            ('Yes', 'SIM'),
            ('No', 'NÃO'),
        )

    def queryset(self, request, queryset):
        value = self.value()
        if value == 'Yes':
            return queryset.filter(classificacao='ACIDENTE')
        elif value == 'No':
            return queryset.exclude(classificacao='ACIDENTE')
        return queryset
    


# Inline de Artefato Espacial com link para editar Tripulantes, Lesões e LABDATA
class OcorrenciaAeronaveInline(StackedInline):
    model = OcorrenciaAeronave
    fieldsets = (
        ('Dados do Artefato Espacial', {
            'fields': ('ocorrencia', 'artefato_espacial', ('operador', 'operador_detalhe'), 'tipo', 'danos', 'fase_missao', 'observacoes')
        }),
        ('Características Técnicas', {
            'fields': ('veiculo_lancador', 'massa_total', 'dimensoes', 'vida_util_prevista',
                      'sistema_propulsao', 'sistema_controle_atitude'),
            'classes': ('collapse',),
            'description': 'Informações técnicas sobre o artefato espacial'
        }),
        ('Sistemas Críticos', {
            'fields': ('sistema_energia', 'sistema_comunicacao', 'sistema_navegacao', 'software_bordo'),
            'classes': ('collapse',),
            'description': 'Informações sobre os sistemas críticos do artefato espacial'
        }),
        ('Informações Coletadas do Artefato', {
            'fields': (
                'dados_telemetria_brutos',
                'dados_telemetria_processados',
                'logs_eventos_falhas',
                'ultimos_comandos_enviados',
                'estado_subsistemas_antes_evento',
                'dados_orbitais_antes_depois',
                'evidencia_falha',
            ),
            'classes': ('collapse',),
            'description': 'Dados coletados do artefato e evidências de falha'
        }),
    )
    autocomplete_fields = ['artefato_espacial']
    extra = 0
    verbose_name = "ARTEFATO ESPACIAL"
    verbose_name_plural = "ARTEFATO ESPACIAL"
    tab = True




class OcorrenciaJuridicoInline(StackedInline):
    model = OcorrenciaJuridico
    fields = []  # Adicione os campos específicos aqui
    extra = 0
    verbose_name_plural = "JURÍDICO"
    tab = True

class OcorrenciaApoioInlineForm(django_forms.ModelForm):
    confirmado_por = django_forms.CharField(required=False, label='Confirmado por', disabled=True)
    data_confirmacao = django_forms.CharField(required=False, label='Data da confirmação', disabled=True)
    autenticado_por = django_forms.CharField(required=False, label='Autenticado por', disabled=True)
    data_autenticacao = django_forms.CharField(required=False, label='Data da autenticação', disabled=True)

    class Meta:
        model = OcorrenciaApoio
        fields = []

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        instance = kwargs.get('instance')
        if instance and instance.pk:
            conf = instance.ocorrencia.ocorrencia_confirmacao.first()
            auth = instance.ocorrencia.ocorrencia_autenticacao.first()
            self.initial['confirmado_por'] = str(conf.usuario) if conf and conf.usuario else '-'
            self.initial['data_confirmacao'] = conf.data_confirmacao.strftime('%d/%m/%Y') if conf and conf.data_confirmacao else '-'
            self.initial['autenticado_por'] = str(auth.usuario) if auth and auth.usuario else '-'
            self.initial['data_autenticacao'] = auth.data_autenticacao.strftime('%d/%m/%Y') if auth and auth.data_autenticacao else '-'

        self.helper = FormHelper()
        self.helper.form_tag = False
        self.helper.template_pack = 'unfold_crispy'
        self.helper.layout = Layout(
            Row(
                Column(Fieldset('Confirmação', 'confirmado_por', 'data_confirmacao')),
                Column(Fieldset('Autenticação', 'autenticado_por', 'data_autenticacao')),
            ),
        )


class OcorrenciaControleInlineForm(django_forms.ModelForm):
    class Meta:
        model = OcorrenciaControle
        fields = [
            'status', 'orgao_investigador', 'fez_acao_inicial', 'investigador',
            'tipo_relatorio', 'numero_relatorio',
            'prioridade', 'situacao_investigacao', 'fase_atual', 'observacoes',
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_tag = False
        self.helper.template_pack = 'unfold_crispy'
        self.helper.layout = Layout(
            Row(
                Column(Fieldset(
                    'Controle',
                    'status', 'orgao_investigador', 'fez_acao_inicial', 'investigador',
                )),
                Column(Fieldset(
                    'Investigação',
                    'tipo_relatorio', 'numero_relatorio',
                    'prioridade', 'situacao_investigacao', 'fase_atual',
                    'observacoes',
                )),
            ),
        )


class OcorrenciaComissaoInlineForm(django_forms.ModelForm):
    class Meta:
        model = OcorrenciaComissao
        fields = ['investigador', 'funcao', 'observacoes']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_tag = False
        self.helper.template_pack = 'unfold_crispy'
        self.helper.layout = Layout(
            Row(
                Column('investigador'),
                Column('funcao'),
                Column('observacoes'),
            ),
        )


class OcorrenciaComissaoInline(StackedInline):
    model = OcorrenciaComissao
    form = OcorrenciaComissaoInlineForm
    autocomplete_fields = ['investigador']
    extra = 0
    verbose_name = "Membro"
    verbose_name_plural = "Comissão de Investigação"
    tab = False
    fake_tab = 'controle'
    template = 'admin/edit_inline/generic_tabular.html'


class OcorrenciaApoioInline(StackedInline):
    model = OcorrenciaApoio
    form = OcorrenciaApoioInlineForm
    template = 'admin/edit_inline/crispy_stacked.html'
    extra = 0
    max_num = 0
    can_delete = False
    hide_title = True
    verbose_name_plural = "CONTROLE"
    tab = True
    fake_tab = 'controle'

class OcorrenciaControleInline(StackedInline):
    model = OcorrenciaControle
    template = 'admin/edit_inline/twocol_stacked.html'
    fieldsets = (
        ('INFORMAÇÕES DE APOIO', {
            'fields': ('status', 'orgao_investigador', 'fez_acao_inicial', 'investigador'),
        }),
        ('SITUAÇÃO DA OCORRÊNCIA', {
            'fields': ('tipo_relatorio', 'numero_relatorio', 'prioridade',  'fase_atual', 'situacao_investigacao','observacoes'),
        }),
        
    )
    autocomplete_fields = ['investigador']
    extra = 0
    verbose_name_plural = "GESTÃO"
    tab = True

class OcorrenciaDocumentoInline(TabularInline):
    model = OcorrenciaDocumento
    fields = ('tipo_documento', 'arquivo', 'cadastrado_por_id', 'cadastrado_em')
    readonly_fields = ('cadastrado_em', 'cadastrado_por_id')
    extra = 0
    verbose_name_plural = "DOCUMENTOS"
    tab = True

class OcorrenciaRevisaoRelatorioInline(StackedInline):
    model = OcorrenciaRevisaoRelatorio
    fields = ['data_atribuicao', 'setor', 'revisor', 'anexo', 'observacao', 'cadastrado_por', 'cadastrado_em']
    extra = 0
    verbose_name_plural = "REVISÃO RELATÓRIO"
    tab = True


# ── Mixin compartilhado entre OcorrenciaGeralAdmin e OcorrenciaInvestigadaAdmin ──
class OcorrenciaBaseAdminMixin:
    list_filter = (
        ('classificacao', HorizontalChoicesFieldListFilter),
        ('tipo', HorizontalChoicesFieldListFilter),
        ('localizacao_tipo', HorizontalChoicesFieldListFilter),
        ('orbita_tipo', HorizontalChoicesFieldListFilter),
        ('danos_terceiros', HorizontalChoicesFieldListFilter),
        ('dia', DateRangeFilter),
    )

    fieldsets = (
        ('Informações Gerais', {
            'fields': (('status', 'numero_processo', 'publico'), ('dia_comunicacao', 'classificacao', 'tipo')),
            'description': 'Informações básicas sobre a ocorrência'
        }),
        ('Data e Hora', {
            'fields': (('dia', 'horario'), ('dia_utc', 'horario_utc')),
            'description': 'Informações sobre data e hora da ocorrência'
        }),
        ('Localização', {
            'fields': ('cidade', 'aerodromo', 'local', 'localizacao_tipo', 'orbita_tipo',
                      ('latitude', 'longitude'), ('latitude_decimal', 'longitude_decimal'),
                      ('local_impacto', 'latitude_impacto', 'longitude_impacto'),
                      ('tle', 'apogeu', 'perigeu', 'inclinacao')),
            'description': 'Informações sobre a localização da ocorrência'
        }),
        ('Danos e Observações', {
            'fields': ('danos_terceiros', 'historico', 'observacao'),
            'description': 'Informações sobre danos e observações gerais'
        }),
        ('Cadastro', {
            'fields': ('cadastrado_por_id', 'cadastrado_em'),
            'description': 'Informações sobre quem e quando cadastrou a ocorrência'
        }),
    )

    class Media:
        js = [
            'https://cdn.jsdelivr.net/npm/inputmask@5/dist/inputmask.min.js',
            'admin/js/ocorrencia_masks.js',
        ]

    actions_list = ["assistente_ia"]

    @action(
        description="Assistente IA",
        icon="smart_toy",
        variant=ActionVariant.PRIMARY,
    )
    def assistente_ia(self, request):
        from django.shortcuts import redirect
        return redirect("/admin/assistente-ia/")

    list_display_links = ('artefato_display',)
    inlines = [OcorrenciaAeronaveInline, OcorrenciaApoioInline, OcorrenciaComissaoInline, OcorrenciaControleInline, OcorrenciaDocumentoInline, OcorrenciaRevisaoRelatorioInline, OcorrenciaLabdataInline, OcorrenciaAsoaciInline, OcorrenciaRelatorioInline, OcorrenciaFatorContribuinteInline]

    advanced_filter_fields = ('classificacao')
    search_fields = ['id', 'classificacao']
    readonly_fields = ('cadastrado_em', 'cadastrado_por_id', 'status', 'numero_processo')
    autocomplete_fields = ['cidade', 'aerodromo']
    actions = [make_published, export_as_json, export_as_csv]
    date_hierarchy = 'dia'

    def save_model(self, request, obj, form, change):
        if not obj.cadastrado_por_id_id:
            obj.cadastrado_por_id = request.user
        super().save_model(request, obj, form, change)
        OcorrenciaApoio.objects.get_or_create(ocorrencia=obj)

    def save_formset(self, request, form, formset, change):
        if formset.model == OcorrenciaDocumento:
            instances = formset.save(commit=False)
            for obj in instances:
                if not obj.cadastrado_por_id_id:
                    obj.cadastrado_por_id = request.user
                obj.save()
            for obj in formset.deleted_objects:
                obj.delete()
            formset.save_m2m()
        else:
            super().save_formset(request, form, formset, change)

    def artefato_display(self, obj):
        from django.utils.html import mark_safe, escape
        aeronaves = obj.ocorrencia_aeronave.all()
        if not aeronaves:
            return "-"
        items_html = []
        for a in aeronaves:
            nome = escape(str(a.artefato_espacial) if a.artefato_espacial else "N/A")
            linhas = []
            if a.tipo:
                linhas.append(f"<strong>Tipo:</strong> {escape(a.tipo)}")
            if a.operador:
                linhas.append(f"<strong>Operador:</strong> {escape(a.operador)}")
            if a.danos:
                linhas.append(f"<strong>Danos:</strong> {escape(a.danos)}")
            if a.massa_total:
                linhas.append(f"<strong>Massa:</strong> {a.massa_total} kg")
            if a.veiculo_lancador:
                linhas.append(f"<strong>Satélite:</strong> {escape(a.veiculo_lancador)}")
            if a.evidencia_falha:
                linhas.append(f"<strong>Evidência de falha:</strong> {escape(a.get_evidencia_falha_display())}")
            tooltip_content = "<br>".join(linhas) if linhas else "Sem detalhes"
            items_html.append(
                '<span x-data="{open: false}" class="relative inline-block">'
                '<span x-ref="trigger"'
                ' x-on:mouseenter="open = true" x-on:mouseleave="open = false"'
                ' class="cursor-pointer underline decoration-dotted underline-offset-4 decoration-base-400">'
                f'{nome}</span>'
                '<template x-teleport="body">'
                '<div x-show="open"'
                ' x-anchor.top.offset.8="$refs.trigger"'
                ' x-on:mouseenter="open = true" x-on:mouseleave="open = false"'
                ' x-transition'
                ' class="w-72 p-3'
                ' bg-white dark:bg-base-800 border border-base-200 dark:border-base-700'
                ' rounded-default shadow-lg text-xs text-base-700 dark:text-base-200 leading-relaxed"'
                ' style="z-index:999"'
                ' x-cloak>'
                f'<div class="font-semibold text-sm mb-1.5 text-base-900 dark:text-base-100">{nome}</div>'
                f'{tooltip_content}'
                '</div>'
                '</template>'
                '</span>'
            )
        return mark_safe(", ".join(items_html))
    artefato_display.short_description = "Artefato Espacial"

    def dia_horario(self, obj):
        from django.utils.html import mark_safe
        dia = obj.dia.strftime('%d/%m/%Y') if obj.dia else '-'
        hora = obj.horario.strftime('%H:%M') if obj.horario else '-'
        return mark_safe(f'<span style="white-space:nowrap">{dia}<br><small class="text-base-400">{hora}</small></span>')
    dia_horario.short_description = 'Data / Hora'
    dia_horario.admin_order_field = 'dia'


# ── Ocorrência Geral ──
@admin.register(OcorrenciaGeral)
class OcorrenciaGeralAdmin(AuditlogHistoryMixin, OcorrenciaBaseAdminMixin, ModelAdmin):

    auditlog_related = [
        (OcorrenciaAeronave,         'ocorrencia_aeronave',          'Artefato Espacial'),
        (OcorrenciaComissao,         'ocorrencia_comissao',          'Comissão'),
        (OcorrenciaControle,         'ocorrencia_controle',          'Gestão'),
        (OcorrenciaDocumento,        'ocorrencia_documento',         'Documentos'),
#        (OcorrenciaLabdata,          'ocorrencia_labdata',           'LABDATA'),
        (OcorrenciaAsoaci,           'ocorrencia_asoaci',            'Internacional'),
        (OcorrenciaRevisaoRelatorio, 'ocorrencia_revisao_relatorio', 'Revisão Relatório'),
        (OcorrenciaRelatorio,        'ocorrencia_relatorio',         'Relatório'),
        (OcorrenciaFatorContribuinte,'ocorrencia_fator_contribuinte','Fatores Contribuintes'),
    ]

    list_display = ('id', 'artefato_display', 'verificar_igualdade', 'classificacao', 'dia_horario', 'status', 'acao_dropdown')

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['latitude'].help_text = 'Utilizar o formato: 23:26:08-S'
        form.base_fields['longitude'].help_text = 'Utilizar o formato: 023:26:08-W'
        return form

    def get_queryset(self, request):
        return super().get_queryset(request).filter(
            status='AUTENTICADO'
        ).prefetch_related(
            'ocorrencia_aeronave', 'ocorrencia_aeronave__artefato_espacial'
        )

    def verificar_igualdade(self, obj):
        return obj.classificacao == 'ACIDENTE'
    verificar_igualdade.boolean = True

    def acao_dropdown(self, obj):
        from django.utils.html import mark_safe
        from django.urls import reverse
        url_editar = reverse('admin:ocorrencia_ocorrenciageral_change', args=[obj.pk])
        url_minuta = "#"
        url_doc    = "#"
        return mark_safe(f"""
<span x-data="{{ open: false }}" class="relative inline-block" @click.window="open = false">
  <button type="button" x-ref="trigger" @click.stop="open = !open"
    class="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium
           bg-primary-600 text-white border border-primary-700
           hover:bg-primary-700 transition-colors cursor-pointer">
    Ação
    <span class="material-symbols-outlined" style="font-size:14px;line-height:1">expand_more</span>
  </button>
  <template x-teleport="body">
    <div x-show="open" x-anchor.bottom-start.offset.4="$refs.trigger" x-transition
         class="w-56 py-1 bg-white dark:bg-base-800 border border-base-200 dark:border-base-700 rounded-default shadow-lg"
         style="z-index:9999" x-cloak>
      <a href="{url_editar}"
         class="flex items-center gap-2 px-4 py-2.5 text-sm text-base-700 dark:text-base-200 hover:bg-base-50 dark:hover:bg-base-700 transition-colors no-underline">
        <span class="material-symbols-outlined" style="font-size:16px">edit</span>
        Editar
      </a>
      <div class="my-1 border-t border-base-100 dark:border-base-700"></div>
      <a href="{url_minuta}"
         class="flex items-center gap-2 px-4 py-2.5 text-sm text-base-700 dark:text-base-200 hover:bg-base-50 dark:hover:bg-base-700 transition-colors no-underline">
        <span class="material-symbols-outlined" style="font-size:16px">upload_file</span>
        Upload RAI
      </a>
      <a href="{url_minuta}"
         class="flex items-center gap-2 px-4 py-2.5 text-sm text-base-700 dark:text-base-200 hover:bg-base-50 dark:hover:bg-base-700 transition-colors no-underline">
        <span class="material-symbols-outlined" style="font-size:16px">upload_file</span>
        Upload Minuta
      </a>
      <a href="{url_doc}"
         class="flex items-center gap-2 px-4 py-2.5 text-sm text-base-700 dark:text-base-200 hover:bg-base-50 dark:hover:bg-base-700 transition-colors no-underline">
        <span class="material-symbols-outlined" style="font-size:16px">upload</span>
        Upload de Documento Geral
      </a>
    </div>
  </template>
</span>
""")
    acao_dropdown.short_description = 'Ação'


# ── Redigir (proxy simplificado para criação rápida) ──
class RedigirAeronaveInline(StackedInline):
    model = OcorrenciaAeronave
    fieldsets = (
        ('Dados do Artefato Espacial', {
            'fields': ('artefato_espacial', ('operador', 'operador_detalhe'), 'tipo', 'danos', 'fase_missao', 'observacoes')
        }),
        ('Características Técnicas', {
            'fields': ('veiculo_lancador', 'massa_total', 'dimensoes', 'vida_util_prevista',
                       'sistema_propulsao', 'sistema_controle_atitude'),
            'classes': ('collapse',),
        }),
        ('Sistemas Críticos', {
            'fields': ('sistema_energia', 'sistema_comunicacao', 'sistema_navegacao', 'software_bordo'),
            'classes': ('collapse',),
        }),
        ('Informações Coletadas do Artefato', {
            'fields': (
                'dados_telemetria_brutos',
                'dados_telemetria_processados',
                'logs_eventos_falhas',
                'ultimos_comandos_enviados',
                'estado_subsistemas_antes_evento',
                'dados_orbitais_antes_depois',
                'evidencia_falha',
            ),
            'classes': ('collapse',),
        }),
    )
    autocomplete_fields = ['artefato_espacial']
    extra = 1
    verbose_name = "Artefato Espacial"
    verbose_name_plural = "Artefatos Espaciais"


@admin.register(OcorrenciaRedigir)
class OcorrenciaRedigirAdmin(ModelAdmin):
    fieldsets = (
        ('Informações Gerais', {
            'fields': (('publico', 'dia_comunicacao'), ('classificacao', 'tipo')),
            'description': 'Informações básicas sobre a ocorrência'
        }),
        ('Data e Hora', {
            'fields': (('dia', 'horario'), ('dia_utc', 'horario_utc')),
            'description': 'Informações sobre data e hora da ocorrência'
        }),
        ('Localização', {
            'fields': ('cidade', 'aerodromo', 'local', 'localizacao_tipo', 'orbita_tipo',
                       ('latitude', 'longitude'), ('latitude_decimal', 'longitude_decimal'),
                       ('local_impacto', 'latitude_impacto', 'longitude_impacto'),
                       ('tle', 'apogeu', 'perigeu', 'inclinacao')),
            'description': 'Informações sobre a localização da ocorrência'
        }),
        ('Danos e Observações', {
            'fields': ('danos_terceiros', 'historico', 'observacao'),
            'description': 'Informações sobre danos e observações gerais'
        }),
    )

    inlines = [RedigirAeronaveInline]
    autocomplete_fields = ['cidade', 'aerodromo']

    def save_model(self, request, obj, form, change):
        if not change:
            obj.status = 'CONFIRMAR'
            obj.cadastrado_por_id = request.user
        super().save_model(request, obj, form, change)
        if not change and obj.pk:
            obj.numero_processo = f'{obj.dia.strftime("%Y%m%d")}{str(obj.pk).zfill(4)}'
            obj.save(update_fields=['numero_processo'])

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def response_add(self, request, obj, post_url_continue=None):
        from django.shortcuts import redirect
        from django.contrib import messages
        messages.success(request, f"Ocorrência #{obj.pk} redigida com sucesso. Status: CONFIRMAR")
        return redirect("admin:ocorrencia_ocorrenciageral_changelist")


# ── Confirmar (lista status=CONFIRMAR, permite editar e avançar para AUTENTICAR) ──
class ConfirmarAeronaveInline(StackedInline):
    model = OcorrenciaAeronave
    fieldsets = (
        ('Dados do Artefato Espacial', {
            'fields': ('artefato_espacial', ('operador', 'operador_detalhe'), 'tipo', 'danos', 'fase_missao', 'observacoes')
        }),
        ('Características Técnicas', {
            'fields': ('veiculo_lancador', 'massa_total', 'dimensoes', 'vida_util_prevista',
                       'sistema_propulsao', 'sistema_controle_atitude'),
            'classes': ('collapse',),
        }),
        ('Sistemas Críticos', {
            'fields': ('sistema_energia', 'sistema_comunicacao', 'sistema_navegacao', 'software_bordo'),
            'classes': ('collapse',),
        }),
        ('Informações Coletadas do Artefato', {
            'fields': (
                'dados_telemetria_brutos',
                'dados_telemetria_processados',
                'logs_eventos_falhas',
                'ultimos_comandos_enviados',
                'estado_subsistemas_antes_evento',
                'dados_orbitais_antes_depois',
                'evidencia_falha',
            ),
            'classes': ('collapse',),
        }),
    )
    autocomplete_fields = ['artefato_espacial']
    extra = 0
    max_num = 1
    verbose_name = "Artefato Espacial"
    verbose_name_plural = "Artefatos Espaciais"


class ConfirmarControleInline(StackedInline):
    model = OcorrenciaControle
    fieldsets = (
        (None, {
            'fields': (
                ('status', 'orgao_investigador', 'fez_acao_inicial', 'investigador'),
                ('tipo_relatorio', 'numero_relatorio'),
                ('prioridade', 'situacao_investigacao', 'fase_atual'),
                'observacoes',
            )
        }),
    )
    autocomplete_fields = ['investigador']
    extra = 1
    max_num = 1
    verbose_name = "Gestão"
    verbose_name_plural = "Gestão"


@admin.register(OcorrenciaConfirmar)
class OcorrenciaConfirmarAdmin(ModelAdmin):
    list_display = ('id', 'numero_processo', 'artefato_display', 'classificacao', 'dia', 'horario', 'status')
    list_display_links = ('numero_processo',)
    search_fields = ['id', 'numero_processo', 'classificacao']

    STATUS_CONFIRMAR_CHOICES = [
        ('CONFIRMAR', 'CONFIRMAR - Manter em edição'),
        ('AUTENTICAR', 'AUTENTICAR - Enviar para autenticação'),
    ]

    fieldsets = (
        ('Status da Ocorrência', {
            'fields': ('status',),
            'description': 'Selecione AUTENTICAR para enviar a ocorrência para autenticação'
        }),
        ('Informações Gerais', {
            'fields': (('numero_processo', 'publico', 'dia_comunicacao'), ('classificacao', 'tipo')),
        }),
        ('Data e Hora', {
            'fields': (('dia', 'horario'), ('dia_utc', 'horario_utc')),
        }),
        ('Localização', {
            'fields': ('cidade', 'aerodromo', 'local', 'localizacao_tipo', 'orbita_tipo',
                       ('latitude', 'longitude'), ('latitude_decimal', 'longitude_decimal'),
                       ('local_impacto', 'latitude_impacto', 'longitude_impacto'),
                       ('tle', 'apogeu', 'perigeu', 'inclinacao')),
        }),
        ('Danos e Observações', {
            'fields': ('danos_terceiros', 'historico', 'observacao'),
        }),
    )

    inlines = [ConfirmarAeronaveInline, ConfirmarControleInline]
    autocomplete_fields = ['cidade', 'aerodromo']
    readonly_fields = ('cadastrado_em', 'cadastrado_por_id')

    def get_queryset(self, request):
        return super().get_queryset(request).filter(
            status='CONFIRMAR'
        ).prefetch_related(
            'ocorrencia_aeronave', 'ocorrencia_aeronave__artefato_espacial'
        )

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name == 'status':
            from django import forms
            kwargs['widget'] = forms.Select(choices=self.STATUS_CONFIRMAR_CHOICES)
        return super().formfield_for_dbfield(db_field, request, **kwargs)

    def artefato_display(self, obj):
        return ", ".join([
            str(c.artefato_espacial) for c in obj.ocorrencia_aeronave.all()
        ]) or "-"
    artefato_display.short_description = "Artefato Espacial"

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def response_change(self, request, obj):
        from django.shortcuts import redirect
        from django.contrib import messages
        from django.utils import timezone
        if obj.status == 'AUTENTICAR':
            OcorrenciaConfirmacao.objects.update_or_create(
                ocorrencia=obj,
                defaults={'usuario': request.user, 'data_confirmacao': timezone.now().date()},
            )
            messages.success(request, f"Ocorrência #{obj.pk} confirmada e enviada para autenticação.")
        else:
            messages.info(request, f"Ocorrência #{obj.pk} salva. Status mantido: CONFIRMAR")
        return redirect("admin:ocorrencia_ocorrenciaconfirmar_changelist")


# ── Autenticar (lista status=AUTENTICAR, permite autenticar ou devolver) ──
class AutenticarAeronaveInline(StackedInline):
    model = OcorrenciaAeronave
    fieldsets = (
        ('Dados do Artefato Espacial', {
            'fields': ('artefato_espacial', ('operador', 'operador_detalhe'), 'tipo', 'danos', 'fase_missao', 'observacoes')
        }),
        ('Características Técnicas', {
            'fields': ('veiculo_lancador', 'massa_total', 'dimensoes', 'vida_util_prevista',
                       'sistema_propulsao', 'sistema_controle_atitude'),
            'classes': ('collapse',),
        }),
        ('Sistemas Críticos', {
            'fields': ('sistema_energia', 'sistema_comunicacao', 'sistema_navegacao', 'software_bordo'),
            'classes': ('collapse',),
        }),
        ('Informações Coletadas do Artefato', {
            'fields': (
                'dados_telemetria_brutos',
                'dados_telemetria_processados',
                'logs_eventos_falhas',
                'ultimos_comandos_enviados',
                'estado_subsistemas_antes_evento',
                'dados_orbitais_antes_depois',
                'evidencia_falha',
            ),
            'classes': ('collapse',),
        }),
    )
    autocomplete_fields = ['artefato_espacial']
    extra = 0
    max_num = 1
    verbose_name = "Artefato Espacial"
    verbose_name_plural = "Artefatos Espaciais"


class AutenticarControleInline(StackedInline):
    model = OcorrenciaControle
    fieldsets = (
        (None, {
            'fields': (
                ('status', 'orgao_investigador', 'fez_acao_inicial', 'investigador'),
                ('tipo_relatorio', 'numero_relatorio'),
                ('prioridade', 'situacao_investigacao', 'fase_atual'),
                'observacoes',
            )
        }),
    )
    autocomplete_fields = ['investigador']
    extra = 0
    max_num = 1
    verbose_name = "Gestão"
    verbose_name_plural = "Gestão"


@admin.register(OcorrenciaAutenticar)
class OcorrenciaAutenticarAdmin(ModelAdmin):
    list_display = ('id', 'numero_processo', 'artefato_display', 'classificacao', 'dia', 'horario', 'status')
    list_display_links = ('numero_processo',)
    search_fields = ['id', 'numero_processo', 'classificacao']

    STATUS_AUTENTICAR_CHOICES = [
        ('AUTENTICAR', 'AUTENTICAR - Manter em revisão'),
        ('AUTENTICADO', 'AUTENTICADO - Autenticar ocorrência'),
        ('CONFIRMAR', 'CONFIRMAR - Devolver para confirmação'),
    ]

    fieldsets = (
        ('Status da Ocorrência', {
            'fields': ('status',),
            'description': 'Selecione AUTENTICADO para finalizar ou CONFIRMAR para devolver'
        }),
        ('Informações Gerais', {
            'fields': (('numero_processo', 'publico', 'dia_comunicacao'), ('classificacao', 'tipo')),
        }),
        ('Data e Hora', {
            'fields': (('dia', 'horario'), ('dia_utc', 'horario_utc')),
        }),
        ('Localização', {
            'fields': ('cidade', 'aerodromo', 'local', 'localizacao_tipo', 'orbita_tipo',
                       ('latitude', 'longitude'), ('latitude_decimal', 'longitude_decimal'),
                       ('local_impacto', 'latitude_impacto', 'longitude_impacto'),
                       ('tle', 'apogeu', 'perigeu', 'inclinacao')),
        }),
        ('Danos e Observações', {
            'fields': ('danos_terceiros', 'historico', 'observacao'),
        }),
    )

    inlines = [AutenticarAeronaveInline, AutenticarControleInline]
    autocomplete_fields = ['cidade', 'aerodromo']
    readonly_fields = ('cadastrado_em', 'cadastrado_por_id')

    def get_queryset(self, request):
        return super().get_queryset(request).filter(
            status='AUTENTICAR'
        ).prefetch_related(
            'ocorrencia_aeronave', 'ocorrencia_aeronave__artefato_espacial'
        )

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name == 'status':
            from django import forms
            kwargs['widget'] = forms.Select(choices=self.STATUS_AUTENTICAR_CHOICES)
        return super().formfield_for_dbfield(db_field, request, **kwargs)

    def artefato_display(self, obj):
        return ", ".join([
            str(c.artefato_espacial) for c in obj.ocorrencia_aeronave.all()
        ]) or "-"
    artefato_display.short_description = "Artefato Espacial"

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def response_change(self, request, obj):
        from django.shortcuts import redirect
        from django.contrib import messages
        from django.utils import timezone
        if obj.status == 'AUTENTICADO':
            OcorrenciaAutenticacao.objects.update_or_create(
                ocorrencia=obj,
                defaults={'usuario': request.user, 'data_autenticacao': timezone.now().date()},
            )
            messages.success(request, f"Ocorrência #{obj.pk} autenticada com sucesso.")
        elif obj.status == 'CONFIRMAR':
            messages.warning(request, f"Ocorrência #{obj.pk} devolvida para confirmação.")
        else:
            messages.info(request, f"Ocorrência #{obj.pk} salva. Status mantido: AUTENTICAR")
        return redirect("admin:ocorrencia_ocorrenciaautenticar_changelist")


# ── Controle de Investigação (ocorrências com OcorrenciaControle.status=INVESTIGADA) ──
@admin.register(OcorrenciaInvestigada)
class OcorrenciaInvestigadaAdmin(OcorrenciaBaseAdminMixin, ModelAdmin):

    list_display = ('id', 'artefato_display', 'classificacao_investigador', 'dia_horario', 'data_autenticacao_display', 'situacao_investigacao_display', 'acao_dropdown')

    def get_queryset(self, request):
        return super().get_queryset(request).filter(
            ocorrencia_controle__status='INVESTIGADA',
            status='AUTENTICADO'
        ).prefetch_related(
            'ocorrencia_aeronave', 'ocorrencia_aeronave__artefato_espacial',
            'ocorrencia_autenticacao',
            'ocorrencia_controle',
        ).distinct()

    def classificacao_investigador(self, obj):
        from django.utils.html import mark_safe, escape
        controle = obj.ocorrencia_controle.first()
        investigador = str(controle.investigador) if controle and controle.investigador else ''
        small = f'<br><small class="text-base-400">{escape(investigador)}</small>' if investigador else ''
        return mark_safe(f'{escape(obj.classificacao or "-")}{small}')
    classificacao_investigador.short_description = 'Classificação'
    classificacao_investigador.admin_order_field = 'classificacao'

    def data_autenticacao_display(self, obj):
        auth = obj.ocorrencia_autenticacao.first()
        return auth.data_autenticacao.strftime('%d/%m/%Y') if auth and auth.data_autenticacao else '-'
    data_autenticacao_display.short_description = 'Autenticado em'
    data_autenticacao_display.admin_order_field = 'ocorrencia_autenticacao__data_autenticacao'

    def situacao_investigacao_display(self, obj):
        controle = obj.ocorrencia_controle.first()
        return controle.get_situacao_investigacao_display() if controle and controle.situacao_investigacao else '-'
    situacao_investigacao_display.short_description = 'Status da Investigação'

    def acao_dropdown(self, obj):
        from django.utils.html import mark_safe
        from django.urls import reverse
        url_editar  = reverse('admin:ocorrencia_ocorrenciainvestigada_change', args=[obj.pk])
        url_revisao = reverse('admin:ocorrencia_ocorrenciarevisaorelatorio_add') + f'?ocorrencia={obj.pk}'
        url_doc     = "#"
        return mark_safe(f"""
<span x-data="{{ open: false }}" class="relative inline-block" @click.window="open = false">
  <button type="button" x-ref="trigger" @click.stop="open = !open"
    class="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium
           bg-primary-600 text-white border border-primary-700
           hover:bg-primary-700 transition-colors cursor-pointer">
    Ação
    <span class="material-symbols-outlined" style="font-size:14px;line-height:1">expand_more</span>
  </button>
  <template x-teleport="body">
    <div x-show="open" x-anchor.bottom-start.offset.4="$refs.trigger" x-transition
         class="w-56 py-1 bg-white dark:bg-base-800 border border-base-200 dark:border-base-700 rounded-default shadow-lg"
         style="z-index:9999" x-cloak>
      <a href="{url_editar}"
         class="flex items-center gap-2 px-4 py-2.5 text-sm text-base-700 dark:text-base-200 hover:bg-base-50 dark:hover:bg-base-700 transition-colors no-underline">
        <span class="material-symbols-outlined" style="font-size:16px">edit</span>
        Editar
      </a>
      <div class="my-1 border-t border-base-100 dark:border-base-700"></div>
      <a href="{url_revisao}"
         class="flex items-center gap-2 px-4 py-2.5 text-sm text-base-700 dark:text-base-200 hover:bg-base-50 dark:hover:bg-base-700 transition-colors no-underline">
        <span class="material-symbols-outlined" style="font-size:16px">rate_review</span>
        Iniciar Processo de Revisão
      </a>
      <a href="{url_doc}"
         class="flex items-center gap-2 px-4 py-2.5 text-sm text-base-700 dark:text-base-200 hover:bg-base-50 dark:hover:bg-base-700 transition-colors no-underline">
        <span class="material-symbols-outlined">settings_b_roll</span>
        Atualizar progresso da Investigação <small>(Interim Statement)</small>
      </a>
    </div>
  </template>
</span>
""")
    acao_dropdown.short_description = 'Ação'


"""@admin.register(OcorrenciaJuridico)
class OcorrenciaJuridicoAdmin(ModelAdmin):
    list_display = ['id', 'ocorrencia']
    autocomplete_fields = ['ocorrencia']

@admin.register(OcorrenciaRecomendacao)
class OcorrenciaRecomendacaoAdmin(ModelAdmin):
    list_display = ['id', 'ocorrencia']
    autocomplete_fields = ['ocorrencia']

@admin.register(OcorrenciaLaudoMaterial)
class OcorrenciaLaudoMaterialAdmin(ModelAdmin):
    list_display = ['id', 'ocorrencia']
    autocomplete_fields = ['ocorrencia']
"""
@admin.register(OcorrenciaApoio)
class OcorrenciaApoioAdmin(ModelAdmin):
    list_display = ['id', 'ocorrencia']
    autocomplete_fields = ['ocorrencia']

@admin.register(OcorrenciaControle)
class OcorrenciaControleAdmin(AuditlogHistoryMixin, ModelAdmin):
    list_display = ['id', 'ocorrencia']
    autocomplete_fields = ['ocorrencia']

"""@admin.register(OcorrenciaRelatorio)
class OcorrenciaRelatorioAdmin(ModelAdmin):
    list_display = ['id', 'ocorrencia']
    autocomplete_fields = ['ocorrencia']

@admin.register(OcorrenciaFatorContribuinte)
class OcorrenciaFatorContribuinteAdmin(ModelAdmin):
    list_display = ['id', 'ocorrencia']
    autocomplete_fields = ['ocorrencia']
"""
@admin.register(OcorrenciaAsoaci)
class OcorrenciaAsoaciAdmin(AuditlogHistoryMixin, ModelAdmin):
    list_display = ['id', 'ocorrencia']
    autocomplete_fields = ['ocorrencia']

"""
@admin.register(OcorrenciaTipoOcorrencia)
class OcorrenciaTipoOcorrenciaAdmin(ModelAdmin):
    list_display = ['id', 'ocorrencia']
    autocomplete_fields = ['ocorrencia']

@admin.register(OcorrenciaViolacao)
class OcorrenciaViolacaoAdmin(ModelAdmin):
    list_display = ['id', 'ocorrencia']
    autocomplete_fields = ['ocorrencia']
"""

@admin.register(OcorrenciaComissao)
class OcorrenciaComissaoAdmin(AuditlogHistoryMixin, ModelAdmin):
    list_display = ['id', 'ocorrencia', 'investigador', 'funcao']
    autocomplete_fields = ['ocorrencia', 'investigador']

@admin.register(OcorrenciaDocumento)
class OcorrenciaDocumentoAdmin(AuditlogHistoryMixin, ModelAdmin):
    list_display = ['id', 'ocorrencia', 'tipo_documento', 'arquivo', 'cadastrado_por_id', 'cadastrado_em']
    autocomplete_fields = ['ocorrencia']
    readonly_fields = ('cadastrado_em',)
    fieldsets = (
        ('Vínculo', {
            'fields': ('ocorrencia',),
        }),
        ('Documento', {
            'fields': ('tipo_documento', 'arquivo'),
            
        }),
        ('Cadastro', {
            'fields': ('cadastrado_por_id', 'cadastrado_em'),
            'description': 'Informações sobre quem e quando cadastrou'
        }),
    )

    def save_model(self, request, obj, form, change):
        if not obj.cadastrado_por_id_id:
            obj.cadastrado_por_id = request.user
        super().save_model(request, obj, form, change)

"""@admin.register(OcorrenciaFatorHumano)
class OcorrenciaFatorHumanoAdmin(ModelAdmin):
    list_display = ['id', 'ocorrencia']
    autocomplete_fields = ['ocorrencia']
"""
@admin.register(OcorrenciaConfirmacao)
class OcorrenciaConfirmacaoAdmin(AuditlogHistoryMixin, ModelAdmin):
    list_display = ['id', 'ocorrencia']
    autocomplete_fields = ['ocorrencia']

@admin.register(OcorrenciaAutenticacao)
class OcorrenciaAutenticacaoAdmin(AuditlogHistoryMixin, ModelAdmin):
    list_display = ['id', 'ocorrencia']
    autocomplete_fields = ['ocorrencia']
"""
@admin.register(OcorrenciaRegistroRai)
class OcorrenciaRegistroRaiAdmin(ModelAdmin):
    list_display = ['id', 'ocorrencia']
    autocomplete_fields = ['ocorrencia']

@admin.register(OcorrenciaRegistroRp)
class OcorrenciaRegistroRpAdmin(ModelAdmin):
    list_display = ['id', 'ocorrencia']
    autocomplete_fields = ['ocorrencia']

@admin.register(OcorrenciaRegistroMinuta)
class OcorrenciaRegistroMinutaAdmin(ModelAdmin):
    list_display = ['id', 'ocorrencia']
    autocomplete_fields = ['ocorrencia']
"""

# ── Painel de Revisão RF ──
@admin.register(OcorrenciaRevisaoRelatorio)
class OcorrenciaRevisaoRelatorioAdmin(AuditlogHistoryMixin, ModelAdmin):

    list_display = ('id', 'artefato_display', 'classificacao_display', 'observacao', 'prioridade_display',
                    'data_atribuicao_fmt', 'revisor', 'setor', 'acao_dropdown')
    autocomplete_fields = ['revisor']
    list_filter = (
        ('setor', HorizontalChoicesFieldListFilter),
        'revisor',
        ('data_atribuicao', DateRangeFilter),
        ('ocorrencia__classificacao', HorizontalChoicesFieldListFilter),
    )
    readonly_fields = ('cadastrado_por', 'cadastrado_em')

    fieldsets = (
        ('Informações da Revisão', {
            'fields': (('setor'), ('revisor'), ('data_atribuicao'), ('anexo'), ('observacao')),
        }),
    )

    def add_view(self, request, form_url='', extra_context=None):
        if 'ocorrencia' not in request.GET:
            from django.contrib import messages
            from django.shortcuts import redirect
            messages.error(
                request,
                'Acesso inválido: nenhuma ocorrência foi informada. '
                'Use o botão "Iniciar Processo de Revisão" a partir do Controle de Investigação.'
            )
            return redirect('admin:ocorrencia_ocorrenciarevisaorelatorio_changelist')
        return super().add_view(request, form_url, extra_context)

    def save_model(self, request, obj, form, change):
        if not obj.ocorrencia_id and 'ocorrencia' in request.GET:
            obj.ocorrencia_id = request.GET['ocorrencia']
        super().save_model(request, obj, form, change)

    def get_urls(self):
        from django.urls import path
        urls = super().get_urls()
        custom = [
            path(
                '<int:ocorrencia_pk>/revisao/',
                self.admin_site.admin_view(self.historico_view),
                name='ocorrencia_revisao_historico',
            ),
        ]
        return custom + urls

    def historico_view(self, request, ocorrencia_pk):
        from django.shortcuts import get_object_or_404, render
        from django.urls import reverse
        ocorrencia = get_object_or_404(OcorrenciaGeral, pk=ocorrencia_pk)
        revisoes = (
            OcorrenciaRevisaoRelatorio.objects
            .filter(ocorrencia=ocorrencia)
            .select_related('revisor', 'cadastrado_por')
            .order_by('-data_atribuicao', '-id')
        )
        url_add = (
            reverse('admin:ocorrencia_ocorrenciarevisaorelatorio_add')
            + f'?ocorrencia={ocorrencia_pk}'
        )
        context = {
            **self.admin_site.each_context(request),
            'ocorrencia': ocorrencia,
            'revisoes': revisoes,
            'url_add': url_add,
            'title': f'Histórico de Revisões',
            'subtitle': str(ocorrencia),
            'opts': self.model._meta,
        }
        return render(request, 'admin/ocorrencia/revisao_historico.html', context)

    def get_queryset(self, request):
        from django.db.models import Max, Subquery
        latest_ids = (
            OcorrenciaRevisaoRelatorio.objects
            .values('ocorrencia_id')
            .annotate(max_id=Max('id'))
            .values('max_id')
        )
        return (
            super().get_queryset(request)
            .filter(id__in=Subquery(latest_ids))
            .select_related('ocorrencia', 'cadastrado_por', 'revisor')
            .prefetch_related(
                'ocorrencia__ocorrencia_aeronave',
                'ocorrencia__ocorrencia_aeronave__artefato_espacial',
                'ocorrencia__ocorrencia_controle',
            )
        )

    def artefato_display(self, obj):
        from django.utils.html import mark_safe, escape
        aeronaves = obj.ocorrencia.ocorrencia_aeronave.all()
        if not aeronaves:
            return "-"
        items_html = []
        for a in aeronaves:
            nome = escape(str(a.artefato_espacial) if a.artefato_espacial else "N/A")
            linhas = []
            if a.tipo:
                linhas.append(f"<strong>Tipo:</strong> {escape(a.tipo)}")
            if a.operador:
                linhas.append(f"<strong>Operador:</strong> {escape(a.operador)}")
            if a.danos:
                linhas.append(f"<strong>Danos:</strong> {escape(a.danos)}")
            if a.massa_total:
                linhas.append(f"<strong>Massa:</strong> {a.massa_total} kg")
            if a.veiculo_lancador:
                linhas.append(f"<strong>Satélite:</strong> {escape(a.veiculo_lancador)}")
            if a.evidencia_falha:
                linhas.append(f"<strong>Evidência de falha:</strong> {escape(a.get_evidencia_falha_display())}")
            tooltip_content = "<br>".join(linhas) if linhas else "Sem detalhes"
            items_html.append(
                '<span x-data="{open: false}" class="relative inline-block">'
                '<span x-ref="trigger"'
                ' x-on:mouseenter="open = true" x-on:mouseleave="open = false"'
                ' class="cursor-pointer underline decoration-dotted underline-offset-4 decoration-base-400">'
                f'{nome}</span>'
                '<template x-teleport="body">'
                '<div x-show="open"'
                ' x-anchor.top.offset.8="$refs.trigger"'
                ' x-on:mouseenter="open = true" x-on:mouseleave="open = false"'
                ' x-transition'
                ' class="w-72 p-3'
                ' bg-white dark:bg-base-800 border border-base-200 dark:border-base-700'
                ' rounded-default shadow-lg text-xs text-base-700 dark:text-base-200 leading-relaxed"'
                ' style="z-index:999"'
                ' x-cloak>'
                f'<div class="font-semibold text-sm mb-1.5 text-base-900 dark:text-base-100">{nome}</div>'
                f'{tooltip_content}'
                '</div>'
                '</template>'
                '</span>'
            )
        return mark_safe(", ".join(items_html))
    artefato_display.short_description = "Artefato Espacial"

    def classificacao_display(self, obj):
        from django.utils.html import mark_safe, escape
        return mark_safe(escape(obj.ocorrencia.classificacao or '-'))
    classificacao_display.short_description = 'Classificação'
    classificacao_display.admin_order_field = 'ocorrencia__classificacao'

    def prioridade_display(self, obj):
        from django.utils.html import mark_safe
        controle = obj.ocorrencia.ocorrencia_controle.first()
        if not controle or not controle.prioridade:
            return '-'
        styles = {
            '1': ('background:#fee2e2;color:#b91c1c', 'CENIPA'),
            '2': ('background:#fef9c3;color:#a16207', 'ALTÍSSIMA'),
            '3': ('background:#ffedd5;color:#c2410c', 'ALTA'),
            '4': ('background:#dbeafe;color:#1d4ed8', 'MÉDIA'),
            '5': ('background:#dcfce7;color:#15803d', 'NORMAL'),
        }
        style, text = styles.get(controle.prioridade, ('background:#f3f4f6;color:#374151', controle.prioridade))
        return mark_safe(f'<span style="display:inline-flex;align-items:center;border-radius:4px;padding:2px 8px;font-size:0.75rem;font-weight:500;{style}">{text}</span>')
    prioridade_display.short_description = 'Prioridade'
    prioridade_display.admin_order_field = 'ocorrencia__ocorrencia_controle__prioridade'

    def data_atribuicao_fmt(self, obj):
        return obj.data_atribuicao.strftime('%d/%m/%Y') if obj.data_atribuicao else '-'
    data_atribuicao_fmt.short_description = 'Data de Atribuição'
    data_atribuicao_fmt.admin_order_field = 'data_atribuicao'

    def acao_dropdown(self, obj):
        from django.utils.html import mark_safe
        from django.urls import reverse
        url_editar    = reverse('admin:ocorrencia_ocorrenciarevisaorelatorio_change', args=[obj.pk])
        url_historico = reverse('admin:ocorrencia_revisao_historico', args=[obj.ocorrencia_id])
        return mark_safe(f"""
<span x-data="{{ open: false }}" class="relative inline-block" @click.window="open = false">
  <button type="button" x-ref="trigger" @click.stop="open = !open"
    class="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium
           bg-primary-600 text-white border border-primary-700
           hover:bg-primary-700 transition-colors cursor-pointer">
    Ação
    <span class="material-symbols-outlined" style="font-size:14px;line-height:1">expand_more</span>
  </button>
  <template x-teleport="body">
    <div x-show="open" x-anchor.bottom-start.offset.4="$refs.trigger" x-transition
         class="w-56 py-1 bg-white dark:bg-base-800 border border-base-200 dark:border-base-700 rounded-default shadow-lg"
         style="z-index:9999" x-cloak>
      <a href="{url_editar}"
         class="flex items-center gap-2 px-4 py-2.5 text-sm text-base-700 dark:text-base-200 hover:bg-base-50 dark:hover:bg-base-700 transition-colors no-underline">
        <span class="material-symbols-outlined" style="font-size:16px">edit</span>
        Editar
      </a>
      <div class="my-1 border-t border-base-100 dark:border-base-700"></div>
      <a href="{url_historico}"
         class="flex items-center gap-2 px-4 py-2.5 text-sm text-base-700 dark:text-base-200 hover:bg-base-50 dark:hover:bg-base-700 transition-colors no-underline">
        <span class="material-symbols-outlined" style="font-size:16px">forward</span>
        Encaminhar Revisão / Histórico
      </a>
      <a href="#"
         class="flex items-center gap-2 px-4 py-2.5 text-sm text-base-700 dark:text-base-200 hover:bg-base-50 dark:hover:bg-base-700 transition-colors no-underline">
        <span class="material-symbols-outlined" style="font-size:16px">public</span>
        Finalizar e Publicar Relatório
      </a>
    </div>
  </template>
</span>
""")
    acao_dropdown.short_description = 'Ação'

"""@admin.register(OcorrenciaRevisaoRsv)
class OcorrenciaRevisaoRsvAdmin(ModelAdmin):
    list_display = ['id', 'ocorrencia']
    autocomplete_fields = ['ocorrencia']

@admin.register(OcorrenciaRevisaoRelatorioFeedback)
class OcorrenciaRevisaoRelatorioFeedbackAdmin(ModelAdmin):
    list_display = ['id', 'ocorrencia']
    autocomplete_fields = ['ocorrencia']

@admin.register(OcorrenciaRevisaoSeripa)
class OcorrenciaRevisaoSeripaAdmin(ModelAdmin):
    list_display = ['id', 'ocorrencia']
    autocomplete_fields = ['ocorrencia']

@admin.register(OcorrenciaProgressoInvestigacao)
class OcorrenciaProgressoInvestigacaoAdmin(ModelAdmin):
    list_display = ['id', 'ocorrencia']
    autocomplete_fields = ['ocorrencia']

@admin.register(OcorrenciaAeronaveTripulante)
class OcorrenciaAeronaveTripulanteAdmin(AuditlogHistoryMixin, ModelAdmin):
    list_display = ['id', 'ocorrencia_aeronave', 'nome', 'funcao', 'licenca', 'horas_totais']
    list_filter = ['funcao']
    search_fields = ['nome', 'cpf', 'licenca']
    autocomplete_fields = ['ocorrencia_aeronave']
    fieldsets = (
        ('Vínculo', {
            'fields': ('ocorrencia_aeronave',)
        }),
        ('Identificação', {
            'fields': ('nome', 'cpf', 'idade', 'funcao', 'formacao')
        }),
        ('Licença e Habilitação', {
            'fields': ('licenca', 'habilitacao', 'validade_cma', 'validade_habilitacao')
        }),
        ('Experiência de Voo', {
            'fields': ('horas_totais', 'horas_equipamento', 'horas_ultimos_30_dias', 'horas_ultimas_24_horas')
        }),
        ('Observações', {
            'fields': ('observacoes',),
            'classes': ('collapse',)
        }),
    )

@admin.register(OcorrenciaAeronaveLesao)
class OcorrenciaAeronaveLesaoAdmin(AuditlogHistoryMixin, ModelAdmin):
    list_display = ['id', 'ocorrencia_aeronave', 'categoria', 'tipo_lesao', 'quantidade']
    list_filter = ['tipo_lesao', 'categoria']
    search_fields = ['descricao']
    autocomplete_fields = ['ocorrencia_aeronave']
    fieldsets = (
        ('Vínculo', {
            'fields': ('ocorrencia_aeronave',)
        }),
        ('Dados da Lesão', {
            'fields': ('categoria', 'tipo_lesao', 'quantidade')
        }),
        ('Detalhes', {
            'fields': ('descricao', 'observacoes'),
            'classes': ('collapse',)
        }),
    )
"""
@admin.register(OcorrenciaLabdata)
class OcorrenciaLabdataAdmin(AuditlogHistoryMixin, ModelAdmin):
    list_display = ['id', 'ocorrencia', 'tipo_gravador', 'fabricante', 'status_recuperacao', 'dados_extraidos']
    list_filter = ['tipo_gravador', 'status_recuperacao', 'dados_extraidos']
    search_fields = ['fabricante', 'modelo', 'numero_serie']
    autocomplete_fields = ['ocorrencia']
    fieldsets = (
        ('Vínculo', {
            'fields': ('ocorrencia',)
        }),
        ('Identificação do Gravador', {
            'fields': ('tipo_gravador', 'fabricante', 'modelo', 'numero_serie')
        }),
        ('Status de Recuperação', {
            'fields': ('status_recuperacao', 'dados_extraidos', 'data_extracao')
        }),
        ('Análise', {
            'fields': ('duracao_gravacao', 'qualidade_dados')
        }),
        ('Laudo e Observações', {
            'fields': ('laudo', 'observacoes'),
            'classes': ('collapse',)
        }),
    )



#admin.site.register(OcorrenciaGeral,OcorrenciaGeralAdmin)
#admin.site.register(OcorrenciaAeronave,OcorrenciaAeronaveAdmin)
admin.site.add_action(export_as_json, "export_selected")
#admin.site.disable_action("delete_selected")