import logging

from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from . import agent
from .tools import Assistente

log = logging.getLogger(__name__)


class MensagemSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=['user', 'assistant'])
    content = serializers.CharField(max_length=4000)


class ChatSerializer(serializers.Serializer):
    pergunta = serializers.CharField(max_length=2000)
    historico = MensagemSerializer(many=True, required=False)


class ChatView(APIView):
    """POST {pergunta, historico?} -> {resposta, fichas, tabelas, ferramentas}.

    `tabelas` vem direto do banco (coletadas pelas tools); `resposta` é só o
    resumo escrito pelo modelo.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        s = ChatSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        assistente = Assistente(request.user)
        try:
            resposta = agent.perguntar(assistente, s.validated_data['pergunta'], s.validated_data.get('historico'))
        except agent.AssistenteNaoConfigurado as e:
            return Response({'detail': f'Assistente indisponível: {e}'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception:
            log.exception('Falha ao consultar o modelo')
            return Response({'detail': 'Não consegui consultar o modelo de IA agora. Tente novamente.'},
                            status=status.HTTP_502_BAD_GATEWAY)
        return Response({
            'resposta': resposta,
            'fichas': assistente.fichas,
            'tabelas': assistente.tabelas,
            'ferramentas': assistente.ferramentas_usadas,
        })
