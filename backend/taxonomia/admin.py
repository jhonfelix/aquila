from django.contrib import admin
from django import forms
from unfold.admin import ModelAdmin
from unfold.widgets import CHECKBOX_CLASSES, LABEL_CLASSES
from .models import AerodromoGeral, GeografiaCidade, GeografiaPais, GeografiaUf, ArtefatoEspacial, VeiculoLancador


class UnfoldCheckboxSelectMultiple(forms.CheckboxSelectMultiple):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.attrs["class"] = "flex flex-col gap-3"

    def create_option(self, name, value, label, selected, index, subindex=None, attrs=None):
        option = super().create_option(name, value, label, selected, index, subindex, attrs)
        option["attrs"]["class"] = " ".join(CHECKBOX_CLASSES)
        return option


class VeiculoLancadorForm(forms.ModelForm):
    propelente = forms.MultipleChoiceField(
        choices=VeiculoLancador.PROPELENTE_CHOICES,
        widget=UnfoldCheckboxSelectMultiple,
        required=False,
        label="Propelente",
    )

    class Meta:
        model = VeiculoLancador
        fields = '__all__'


admin.site.register(GeografiaPais)
admin.site.register(GeografiaUf)

@admin.register(ArtefatoEspacial)
class ArtefatoEspacialAdmin(ModelAdmin):
    list_display = ('id', 'designacao', 'fabricante', 'tipo_artefato', 'status')
    list_display_links = ('designacao',)
    search_fields = ['designacao', 'fabricante']

@admin.register(VeiculoLancador)
class VeiculoLancadorAdmin(ModelAdmin):
    form = VeiculoLancadorForm
    list_display = ('id', 'artefato', 'tipo_propulsao', 'propelente_display', 'numero_estagios', 'reutilizavel')
    list_display_links = ('artefato',)
    search_fields = ['artefato__designacao']
    autocomplete_fields = ['artefato']

    def propelente_display(self, obj):
        if obj.propelente:
            return ", ".join(obj.propelente)
        return "-"
    propelente_display.short_description = "Propelente"

@admin.register(GeografiaCidade)
class GeografiaCidadeAdmin(ModelAdmin):
    fields = ['nome']
    search_fields = ['nome']
    def get_search_results(self, request, queryset, search_term):
        print("In get search results")
        results = super().get_search_results(request, queryset, search_term)
        return results

@admin.register(AerodromoGeral)
class AerodromoGeralAdmin(ModelAdmin):
    fields = ['nome', 'icao']
    search_fields = ['nome']
    def get_search_results(self, request, queryset, search_term):
        print("In get search results")
        results = super().get_search_results(request, queryset, search_term)
        return results
    
    
