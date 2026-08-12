from rest_framework import serializers

from material_apoio.models import InvestigacaoOutrasAutoridades, MaterialApoio


class MaterialApoioSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialApoio
        fields = '__all__'
        read_only_fields = ['cadastrado_por_id', 'cadastrado_em']


class InvestigacaoOutrasAutoridadesSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestigacaoOutrasAutoridades
        fields = '__all__'
        read_only_fields = ['cadastrado_por_id', 'cadastrado_em']
