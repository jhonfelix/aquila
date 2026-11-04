"""Agente do Assistente IA — um único modelo: gpt-oss-120b na CCABR.

Sem framework de agentes: o loop de tool calling é nosso (ver `perguntar`), com
o SDK `openai` apontando para o endpoint OpenAI-compatível da CCABR (/v1).
Assim cada chamada de ferramenta é inspecionável/auditável e as falhas de rede
viram exceção. As tools consultam o banco via ORM (ver tools.py).

TLS: a verificação do certificado fica LIGADA por padrão. Se a CCABR usa
certificado de CA corporativa, aponte `CCABR_CA_BUNDLE` para o .pem da CA. Só
use `CCABR_VERIFY_SSL=False` se aceitar o risco de não validar o servidor.
"""
from __future__ import annotations

import inspect
import json
import logging
import re

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
- Perguntas por lugar, centro de lançamento, classificação ou período -> fichas_ocorrencias com \
organizacao (CLA = Centro de Lançamento de Alcântara, CLBI = Centro de Lançamento da Barreira do \
Inferno, COPE = Centro de Operações Espaciais), local (texto, ex.: um município), classificacao \
(ACIDENTE | INCIDENTE | INFORTÚNIO) e data_inicio/data_fim (AAAA-MM-DD). Se a pergunta citar um \
desses centros pelo nome ou sigla, use organizacao (não local).
- Para dados além da ficha (tripulantes, fatores contribuintes, recomendações etc.) use \
descrever_dados (conhecer tabelas/campos), consultar (filtros exatos) e detalhar_ocorrencia.
- Prefira ferramentas específicas às genéricas. Responda em português do Brasil.
"""


class AssistenteNaoConfigurado(RuntimeError):
    pass


log = logging.getLogger('assistente')

# Métodos de `Assistente` expostos ao modelo (ordem = ordem na lista de tools).
FERRAMENTAS = ('aguardando_autenticacao', 'em_revisao', 'fichas_ocorrencias',
               'descrever_dados', 'consultar', 'detalhar_ocorrencia')

_CLIENTE = None


def _verify():
    """True (padrão), caminho de um CA bundle, ou False se explicitamente configurado."""
    if settings.CCABR_CA_BUNDLE:
        return settings.CCABR_CA_BUNDLE
    return settings.CCABR_VERIFY_SSL


def _cliente():
    """Cliente OpenAI-compatível da CCABR (reutilizado entre requisições)."""
    global _CLIENTE
    if _CLIENTE is None:
        if not settings.CCABR_API_KEY:
            raise AssistenteNaoConfigurado('CCABR_API_KEY não configurada.')
        import httpx
        from openai import OpenAI

        # Conexão falha rápido (VPN fora do ar) e a leitura respeita o tempo de geração do
        # modelo; com 2 retries o pior caso ainda cabe nos 120s do nginx/gunicorn.
        _CLIENTE = OpenAI(
            api_key=settings.CCABR_API_KEY,
            base_url=f"{settings.CCABR_BASE_URL.rstrip('/')}/v1",
            max_retries=2,
            http_client=httpx.Client(verify=_verify(),
                                     timeout=httpx.Timeout(settings.CCABR_TIMEOUT, connect=8.0)),
        )
    return _CLIENTE


# ----------------------------------------------------------------- ferramentas
def _modelo_argumentos(metodo):
    """Modelo pydantic dos argumentos, gerado a partir da assinatura do método.

    Serve para DUAS coisas: o JSON schema enviado ao modelo e a validação dos
    argumentos que ele devolve (Literal vira enum no schema; tipo errado vira erro
    explícito em vez de ser ignorado em silêncio).
    """
    from typing import get_type_hints

    from pydantic import create_model

    # tools.py usa `from __future__ import annotations`: as anotações chegam como
    # texto e precisam ser resolvidas para tipos reais antes de virar schema.
    tipos = get_type_hints(metodo)
    campos = {}
    for nome, p in inspect.signature(metodo).parameters.items():
        tipo = tipos.get(nome, str)
        padrao = p.default if p.default is not inspect.Parameter.empty else ...
        campos[nome] = (tipo, padrao)
    return create_model(f'Args_{metodo.__name__}', **campos)


def _limpar_schema(schema):
    """Remove 'title' (ruído para o modelo) recursivamente."""
    if isinstance(schema, dict):
        return {k: _limpar_schema(v) for k, v in schema.items() if k != 'title'}
    if isinstance(schema, list):
        return [_limpar_schema(v) for v in schema]
    return schema


def definicoes_ferramentas(assistente) -> tuple[list[dict], dict]:
    """(tools no formato OpenAI, {nome: (método, modelo_de_args)})."""
    tools, registro = [], {}
    for nome in FERRAMENTAS:
        metodo = getattr(assistente, nome)
        modelo = _modelo_argumentos(metodo)
        registro[nome] = (metodo, modelo)
        tools.append({'type': 'function', 'function': {
            'name': nome,
            'description': inspect.cleandoc(metodo.__doc__ or ''),
            'parameters': _limpar_schema(modelo.model_json_schema()),
        }})
    return tools, registro


def _nome_ferramenta(bruto: str) -> str:
    """Normaliza quirks do formato harmony do gpt-oss:
    'functions.consultar' ou 'consultar<|channel|>commentary' -> 'consultar'."""
    nome = (bruto or '').split('<|', 1)[0].strip()
    return nome.split('.', 1)[1] if nome.startswith('functions.') else nome


def executar_ferramenta(registro: dict, nome_bruto: str, argumentos_json: str) -> tuple[str, str]:
    """Executa uma chamada do modelo. Erros de uso voltam AO MODELO como JSON, nunca estouram."""
    from pydantic import ValidationError

    nome = _nome_ferramenta(nome_bruto)
    if nome not in registro:
        return nome, json.dumps({'erro': f"Ferramenta '{nome_bruto}' inexistente. Use: {', '.join(registro)}."},
                                ensure_ascii=False)
    metodo, modelo = registro[nome]
    try:
        brutos = json.loads(argumentos_json or '{}') or {}
        if not isinstance(brutos, dict):
            raise ValueError('os argumentos devem ser um objeto JSON')
        args = modelo(**brutos)
    except (ValueError, ValidationError) as e:
        return nome, json.dumps({'erro': f'Argumentos inválidos para {nome}: {e}'}, ensure_ascii=False)
    return nome, metodo(**args.model_dump())


def montar_prompt(pergunta: str, historico: list[dict] | None) -> str:
    """Anexa os últimos turnos como contexto (o servidor não guarda sessão na etapa 1)."""
    if not historico:
        return pergunta
    linhas = [f"{'Usuário' if h['role'] == 'user' else 'Assistente'}: {h['content']}" for h in historico[-6:]]
    return "Conversa anterior (apenas contexto; dados devem vir das ferramentas):\n" + "\n".join(linhas) + \
        f"\n\nPergunta atual: {pergunta}"


def perguntar(assistente, pergunta: str, historico: list[dict] | None = None, cliente=None) -> str:
    """Loop de tool calling próprio (sem framework).

    pergunta -> modelo escolhe ferramentas -> executamos -> devolvemos o resultado -> ...
    até o modelo responder em texto ou atingir MAX_TOOL_STEPS (no último passo as
    ferramentas são desligadas para forçar a resposta). Falhas de rede/API levantam
    exceção (a view responde 502). O texto final sempre passa por validar_resposta.
    """
    cliente = cliente or _cliente()
    tools, registro = definicoes_ferramentas(assistente)
    mensagens = [{'role': 'system', 'content': INSTRUCOES},
                 {'role': 'user', 'content': montar_prompt(pergunta, historico)}]

    texto = ''
    for passo in range(MAX_TOOL_STEPS + 1):
        ultimo = passo == MAX_TOOL_STEPS
        resp = cliente.chat.completions.create(
            model=MODELO, messages=mensagens, temperature=0.1,
            tools=tools, tool_choice='none' if ultimo else 'auto',
        )
        msg = resp.choices[0].message
        chamadas = [] if ultimo else list(msg.tool_calls or [])
        if not chamadas:
            texto = (msg.content or '').strip()
            break
        mensagens.append({'role': 'assistant', 'content': msg.content or '', 'tool_calls': [
            {'id': c.id, 'type': 'function',
             'function': {'name': c.function.name, 'arguments': c.function.arguments or '{}'}}
            for c in chamadas]})
        for c in chamadas:
            nome, saida = executar_ferramenta(registro, c.function.name, c.function.arguments)
            log.info('assistente user=%s passo=%s tool=%s args=%s', getattr(assistente.user, 'pk', None),
                     passo, nome, (c.function.arguments or '')[:500])
            mensagens.append({'role': 'tool', 'tool_call_id': c.id, 'content': saida})

    return validar_resposta(assistente, texto)


NAO_CONFIAVEL = ("Não consegui formular uma resposta confiável a partir dos dados consultados. "
                 "Os registros encontrados estão abaixo.")

SEM_DADOS = ("Não encontrei esses dados com as consultas disponíveis. Tente reformular a pergunta, "
             "por exemplo citando o número do processo, o status ou a situação da investigação.")


def validar_resposta(assistente, texto: str) -> str:
    """Trava anti-alucinação aplicada no servidor, depois do modelo.

    1. Se houve fichas, a abertura é a frase montada pelo código (filtros + contagem).
    2. Se nenhuma ferramenta de DADOS retornou com sucesso, o modelo não tem base
       para afirmar nada: descarta o texto dele.
    3. Se o texto cita um número que não aparece nos dados devolvidos pelas
       ferramentas, descarta o texto (mensagem fixa).
    """
    if assistente.aberturas:
        # houve fichas: a abertura sai dos filtros realmente aplicados, nunca do modelo
        return ' '.join(dict.fromkeys(assistente.aberturas))
    if assistente.consultas_ok == 0:
        return SEM_DADOS
    citados = {int(n) for n in re.findall(r'\d+', texto)}
    if citados - assistente.numeros:
        return NAO_CONFIAVEL
    return texto
