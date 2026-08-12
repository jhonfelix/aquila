from rest_framework import serializers

from ocorrencia.models import (
    OcorrenciaAeronave,
    OcorrenciaAeronaveLesao,
    OcorrenciaAeronaveTripulante,
    OcorrenciaApoio,
    OcorrenciaAsoaci,
    OcorrenciaAutenticacao,
    OcorrenciaComissao,
    OcorrenciaConfirmacao,
    OcorrenciaControle,
    OcorrenciaDocumento,
    OcorrenciaFatorContribuinte,
    OcorrenciaFatorHumano,
    OcorrenciaGeral,
    OcorrenciaJuridico,
    OcorrenciaLaudoMaterial,
    OcorrenciaProgressoInvestigacao,
    OcorrenciaRaiFoto,
    OcorrenciaRaiPessoal,
    OcorrenciaRecomendacao,
    OcorrenciaRegistroMinuta,
    OcorrenciaRegistroRai,
    OcorrenciaRelatorio,
    OcorrenciaRevisaoRelatorio,
    OcorrenciaTipoOcorrencia,
    OcorrenciaViolacao,
)
from taxonomia.api.serializers import VeiculoLancadorSerializer


class OcorrenciaJuridicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcorrenciaJuridico
        fields = '__all__'


class OcorrenciaLaudoMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcorrenciaLaudoMaterial
        fields = '__all__'


class OcorrenciaApoioSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcorrenciaApoio
        fields = '__all__'


class OcorrenciaFatorContribuinteSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcorrenciaFatorContribuinte
        fields = '__all__'


class OcorrenciaAeronaveTripulanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcorrenciaAeronaveTripulante
        fields = '__all__'


class OcorrenciaAeronaveLesaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcorrenciaAeronaveLesao
        fields = '__all__'


class OcorrenciaFatorHumanoSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcorrenciaFatorHumano
        fields = '__all__'


class OcorrenciaViolacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcorrenciaViolacao
        fields = '__all__'


class OcorrenciaTipoOcorrenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcorrenciaTipoOcorrencia
        fields = '__all__'


class OcorrenciaProgressoInvestigacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcorrenciaProgressoInvestigacao
        fields = '__all__'


class OcorrenciaRecomendacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcorrenciaRecomendacao
        fields = '__all__'


class OcorrenciaRegistroMinutaSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcorrenciaRegistroMinuta
        fields = '__all__'


class OcorrenciaRegistroRaiSerializer(serializers.ModelSerializer):
    """status_rai só muda via a ação `finalizar` (equivalente ao botão "Finalizar
    RAI" do readme_rai.md), nunca por PATCH direto — mesmo padrão de
    status/numero_processo em OcorrenciaGeralSerializer."""

    class Meta:
        model = OcorrenciaRegistroRai
        fields = '__all__'
        read_only_fields = ['status_rai', 'cadastrado_em', 'atualizado_em']


class OcorrenciaRaiPessoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcorrenciaRaiPessoal
        fields = '__all__'


class OcorrenciaRaiFotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcorrenciaRaiFoto
        fields = '__all__'


# ── Módulo carro-chefe: Ocorrência -> Foguete -> Documentos -> Gestão ──

class OcorrenciaGeralSerializer(serializers.ModelSerializer):
    """`artefatos` replica o tooltip de OcorrenciaGeralAdmin.artefato_display
    (admin.py:531-576) — usado pela lista Ocorrências Gerais no Next.js."""

    artefatos = serializers.SerializerMethodField()

    class Meta:
        model = OcorrenciaGeral
        fields = '__all__'
        # status/numero_processo só mudam pelas ações confirmar/autenticar e
        # pela criação (Redigir) — nunca por PATCH direto, mesma regra do
        # admin (readonly_fields inclui os dois em OcorrenciaBaseAdminMixin).
        read_only_fields = ['status', 'numero_processo', 'cadastrado_por_id', 'cadastrado_em']

    def get_artefatos(self, obj):
        return [
            {
                'nome': str(a.artefato_espacial) if a.artefato_espacial else None,
                'tipo': a.tipo,
                'operador': a.operador,
                'danos': a.danos,
                'massa_total': a.massa_total,
                'veiculo_lancador': a.veiculo_lancador,
                'evidencia_falha': a.get_evidencia_falha_display() if a.evidencia_falha else None,
            }
            for a in obj.ocorrencia_aeronave.all()
        ]


class OcorrenciaAeronaveSerializer(serializers.ModelSerializer):
    artefato_espacial_detail = VeiculoLancadorSerializer(source='artefato_espacial', read_only=True)

    class Meta:
        model = OcorrenciaAeronave
        fields = '__all__'


class OcorrenciaControleSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcorrenciaControle
        fields = '__all__'


class OcorrenciaComissaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcorrenciaComissao
        fields = '__all__'


class OcorrenciaDocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcorrenciaDocumento
        fields = '__all__'
        read_only_fields = ['cadastrado_por_id', 'cadastrado_em']


class OcorrenciaAsoaciSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcorrenciaAsoaci
        fields = '__all__'


class OcorrenciaRelatorioSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcorrenciaRelatorio
        fields = '__all__'


class OcorrenciaRevisaoRelatorioSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcorrenciaRevisaoRelatorio
        fields = '__all__'


class OcorrenciaConfirmacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcorrenciaConfirmacao
        fields = '__all__'
        read_only_fields = ['ocorrencia', 'usuario', 'data_confirmacao']


class OcorrenciaAutenticacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = OcorrenciaAutenticacao
        fields = '__all__'
        read_only_fields = ['ocorrencia', 'usuario', 'data_autenticacao']
