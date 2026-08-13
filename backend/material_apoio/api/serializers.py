from rest_framework import serializers

from material_apoio.models import InvestigacaoOutrasAutoridades, MaterialApoio


class MaterialApoioSerializer(serializers.ModelSerializer):
    """Campos *_display só-leitura usados pela tabela do frontend (tipo de
    documento e pessoa responsável, ambos exibidos como texto)."""

    tipo_documento_display = serializers.CharField(source='get_tipo_documento_display', read_only=True)
    pessoa_responsavel_display = serializers.SerializerMethodField()

    class Meta:
        model = MaterialApoio
        fields = '__all__'
        read_only_fields = ['cadastrado_por_id', 'cadastrado_em']

    def get_pessoa_responsavel_display(self, obj):
        return str(obj.pessoa_responsavel) if obj.pessoa_responsavel_id else None


class InvestigacaoOutrasAutoridadesSerializer(serializers.ModelSerializer):
    """Campos *_display só-leitura usados pela tabela do frontend (tipo de
    ocorrência e fase do voo, exibidos como texto)."""

    tipo_ocorrencia_display = serializers.CharField(source='get_tipo_ocorrencia_display', read_only=True)
    fase_voo_display = serializers.CharField(source='get_fase_voo_display', read_only=True)

    class Meta:
        model = InvestigacaoOutrasAutoridades
        fields = '__all__'
        read_only_fields = ['cadastrado_por_id', 'cadastrado_em']
