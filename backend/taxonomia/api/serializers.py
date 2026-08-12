from rest_framework import serializers

from taxonomia.models import (
    AerodromoGeral,
    ArtefatoEspacial,
    GeografiaCidade,
    GeografiaPais,
    GeografiaUf,
    VeiculoLancador,
)


class GeografiaPaisSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeografiaPais
        fields = '__all__'


class GeografiaUfSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeografiaUf
        fields = '__all__'


class GeografiaCidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeografiaCidade
        fields = '__all__'


class AerodromoGeralSerializer(serializers.ModelSerializer):
    class Meta:
        model = AerodromoGeral
        fields = '__all__'


class ArtefatoEspacialSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtefatoEspacial
        fields = '__all__'


class VeiculoLancadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = VeiculoLancador
        fields = '__all__'
