"""Agente (Agno) do Assistente IA — um único modelo: gpt-oss-120b na CCABR.

Segue o padrão do sipaer_ia (OpenAILike apontando para /v1), mas com tools que
consultam o banco do Aquila via ORM (ver tools.py). Agno/OpenAI só são
importados aqui, de forma preguiçosa, para que o restante do app (e seus
testes) não dependa deles.

TLS: a verificação do certificado fica LIGADA por padrão. Se a CCABR usa
certificado de CA corporativa, aponte `CCABR_CA_BUNDLE` para o .pem da CA. Só
use `CCABR_VERIFY_SSL=False` se aceitar o risco de não validar o servidor.
"""
from __future__ import annotations

from django.conf import settings

MODELO = 'gpt-oss-120b'
MAX_TOOL_STEPS = 6

INSTRUCOES = """\
Você é o Assistente do sistema Áquila, usado na investigação de ocorrências.

REGRAS ABSOLUTAS
1. Responda SOMENTE com dados retornados pelas ferramentas. Nunca invente, complete ou \
suponha números de processo, nomes, datas, fases ou status.
2. Se a ferramenta retornar zero registros, diga claramente que nenhum registro foi \
encontrado. Se retornar erro, informe o erro; não tente adivinhar a resposta.
3. Não emita opinião, juízo, estimativa de prazo nem hipótese sobre causas. Apenas relate os dados.
4. As fichas das ocorrências (parágrafo com data, hora, local, artefato espacial e histórico) e \
as tabelas são exibidas ao usuário automaticamente pela interface. NÃO as reescreva nem liste \
números de processo, nomes ou datas. Escreva apenas UMA ou DUAS frases naturais de abertura \
(ex.: "Encontrei 3 ocorrências aguardando autenticação:"), sem jargão técnico, sem citar \
nomes de modelos/tabelas e sem a palavra "critério". Não use markdown (sem **negrito**).
5. Se não houver registros, diga isso em uma frase simples e escreva corretamente.
6. Se a pergunta fugir do que as ferramentas conseguem consultar, diga que ainda não consegue \
responder isso. Não responda de memória.

DEFINIÇÕES
- "Aguardando autenticação" = ocorrência com status AUTENTICAR -> ferramenta aguardando_autenticacao.
- "Em revisão" = ocorrência com registro no Painel de Revisão e fase_atual da investigação \
diferente de FIM. "Fase" = setor do registro de revisão mais recente; "por quem" = revisor \
responsável desse registro -> ferramenta em_revisao.
- Para listar/mostrar ocorrências, ou quando o usuário pedir "fale sobre / detalhe / mostre" uma \
ocorrência específica -> SEMPRE fichas_ocorrencias (numero_processo ou status; sem filtro lista as \
mais recentes). Nunca descreva uma ocorrência em texto corrido: a ficha é exibida pela interface.
- Perguntas sobre investigação ("foram/serão investigadas", "pelo CENIPA", "investigações ativas/ \
finalizadas", "em fase de RAI/minuta/RF") -> fichas_ocorrencias com os filtros tratamento \
(INVESTIGADA | COLETA DE DADOS), orgao_investigador (CENIPA | OUTRO), situacao_investigacao \
(ATIVA | FINALIZADA) e/ou fase_investigacao (RAI | MIN | REV | RF | FIM).
- Para dados além da ficha (tripulantes, fatores contribuintes, recomendações etc.) use \
descrever_dados (conhecer tabelas/campos), consultar (filtros exatos) e detalhar_ocorrencia.
- Prefira ferramentas específicas às genéricas. Responda em português do Brasil.
"""


class AssistenteNaoConfigurado(RuntimeError):
    pass


_MODEL = None


def _verify():
    """True (padrão), caminho de um CA bundle, ou False se explicitamente configurado."""
    if settings.CCABR_CA_BUNDLE:
        return settings.CCABR_CA_BUNDLE
    return settings.CCABR_VERIFY_SSL


def _modelo():
    global _MODEL
    if _MODEL is None:
        if not settings.CCABR_API_KEY:
            raise AssistenteNaoConfigurado('CCABR_API_KEY não configurada.')
        import httpx
        from agno.models.openai import OpenAILike
        from openai import AsyncOpenAI, OpenAI

        base = f"{settings.CCABR_BASE_URL.rstrip('/')}/v1"
        # Conexão falha rápido (VPN fora do ar) e a leitura respeita o tempo de geração do
        # modelo; com 2 retries o pior caso ainda cabe nos 120s do nginx/gunicorn.
        timeout = httpx.Timeout(settings.CCABR_TIMEOUT, connect=8.0)
        verify = _verify()
        _MODEL = OpenAILike(
            id=MODELO,
            api_key=settings.CCABR_API_KEY,
            base_url=base,
            temperature=0.1,
            client=OpenAI(api_key=settings.CCABR_API_KEY, base_url=base, max_retries=2,
                          http_client=httpx.Client(verify=verify, timeout=timeout)),
            async_client=AsyncOpenAI(api_key=settings.CCABR_API_KEY, base_url=base, max_retries=2,
                                     http_client=httpx.AsyncClient(verify=verify, timeout=timeout)),
        )
    return _MODEL


def montar_prompt(pergunta: str, historico: list[dict] | None) -> str:
    """Anexa os últimos turnos como contexto (o servidor não guarda sessão na etapa 1)."""
    if not historico:
        return pergunta
    linhas = [f"{'Usuário' if h['role'] == 'user' else 'Assistente'}: {h['content']}" for h in historico[-6:]]
    return "Conversa anterior (apenas contexto; dados devem vir das ferramentas):\n" + "\n".join(linhas) + \
        f"\n\nPergunta atual: {pergunta}"


def perguntar(assistente, pergunta: str, historico: list[dict] | None = None) -> str:
    """Executa o agente com as tools ligadas ao usuário e devolve o resumo em texto."""
    from agno.agent import Agent

    agente = Agent(
        model=_modelo(),
        instructions=INSTRUCOES,
        tools=[
            assistente.aguardando_autenticacao,
            assistente.em_revisao,
            assistente.fichas_ocorrencias,
            assistente.descrever_dados,
            assistente.consultar,
            assistente.detalhar_ocorrencia,
        ],
        tool_call_limit=MAX_TOOL_STEPS,
        markdown=False,
    )
    resultado = agente.run(montar_prompt(pergunta, historico))
    # O Agno não levanta exceção em falha de rede: devolve status ERROR com a
    # mensagem do erro em `content`. Sem isto, "Connection error." chegaria ao
    # usuário como se fosse a resposta do assistente.
    status = getattr(getattr(resultado, 'status', None), 'value', '')
    if status in ('ERROR', 'CANCELLED'):
        raise RuntimeError(f'Agente terminou com status {status}: {resultado.content}')
    return validar_resposta(assistente, (resultado.content or '').strip())


NAO_CONFIAVEL = ("Não consegui formular uma resposta confiável a partir dos dados consultados. "
                 "Os registros encontrados estão abaixo.")

SEM_DADOS = ("Não encontrei esses dados com as consultas disponíveis. Tente reformular a pergunta, "
             "por exemplo citando o número do processo, o status ou a situação da investigação.")


def validar_resposta(assistente, texto: str) -> str:
    """Trava anti-alucinação aplicada no servidor, depois do modelo.

    1. Se nenhuma ferramenta de DADOS retornou com sucesso, o modelo não tem base
       para afirmar nada: descarta o texto dele.
    0. Se houve fichas, a abertura é a frase montada pelo código (filtros + contagem).
    2. Se o texto cita um número que não aparece nos dados devolvidos pelas
       ferramentas, descarta o texto (mensagem fixa).
    """
    import re

    if assistente.aberturas:
        # houve fichas: a abertura sai dos filtros realmente aplicados, nunca do modelo
        return ' '.join(dict.fromkeys(assistente.aberturas))
    if assistente.consultas_ok == 0:
        return SEM_DADOS
    citados = {int(n) for n in re.findall(r'\d+', texto)}
    if citados - assistente.numeros:
        return NAO_CONFIAVEL
    return texto
