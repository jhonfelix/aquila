"""Ferramentas SOMENTE LEITURA que o Assistente IA pode chamar.

Princípio anti-alucinação: o modelo nunca escreve SQL nem "lembra" de dados —
ele só chama estas funções, e o código decide o que consultar. Cada função:

* checa a permissão ``view_<modelo>`` do usuário logado (mesma regra da API);
* devolve ao modelo um JSON compacto com os registros reais; e
* registra uma tabela estruturada no coletor da requisição, que o front exibe
  tal como veio do banco (os números/nomes da tabela nunca passam pelo texto
  gerado pelo modelo).

Este módulo não depende de Agno/OpenAI: é testável isoladamente.
"""
from __future__ import annotations

import json
import re
from datetime import date, datetime
from typing import Any, Literal, Optional

from django.apps import apps
from django.core.exceptions import FieldDoesNotExist
from django.db import models
from django.db.models import Q

from ocorrencia.models import (
    OcorrenciaControle,
    OcorrenciaGeral,
    OcorrenciaRevisaoRelatorio,
)

LIMITE_PADRAO = 50
LIMITE_MAXIMO = 200
TEXTO_MAX = 400          # trunca textos longos devolvidos ao modelo
RESPOSTA_MAX_CHARS = 24000

# Nunca expostos (nem como coluna nem como filtro: filtro também vaza por oráculo).
CAMPOS_SENSIVEIS = {
    'password', 'cpf', 'telefone', 'totp_secret', 'totp_enabled', 'totp_obrigatorio',
    'last_login', 'last_access', 'is_superuser', 'is_staff', 'email', 'avatar',
}
# Do usuário, apenas o que identifica "quem" fez algo.
CAMPOS_USUARIO_OK = {'id', 'nome', 'nome_guerra', 'posto_graduacao', 'local_trabalho'}
LOOKUPS = {'exact', 'iexact', 'icontains', 'contains', 'gt', 'gte', 'lt', 'lte', 'in', 'isnull', 'startswith', 'range'}


class ToolError(Exception):
    """Erro de uso da ferramenta — a mensagem volta ao modelo para ele corrigir."""


def _user_model():
    from django.contrib.auth import get_user_model
    return get_user_model()


def modelos_permitidos() -> dict[str, type[models.Model]]:
    """Modelos do app `ocorrencia` (sem proxies), indexados pelo nome em minúsculas."""
    return {
        m.__name__.lower(): m
        for m in apps.get_app_config('ocorrencia').get_models()
        if not m._meta.proxy
    }


def _campo_ok(model, field) -> bool:
    if field.name in CAMPOS_SENSIVEIS or 'cpf' in field.name:
        return False
    if model is _user_model():
        return field.name in CAMPOS_USUARIO_OK
    return True


def _campos_exibiveis(model) -> list[models.Field]:
    return [f for f in model._meta.concrete_fields if _campo_ok(model, f)]


def _rotulo_usuario(u) -> str:
    if u is None:
        return ''
    posto = u.get_posto_graduacao_display() if getattr(u, 'posto_graduacao', None) else ''
    return f"{posto} {u.nome_guerra or u.nome}".strip()


def _valor(obj, field) -> Any:
    """Valor legível e JSON-safe de um campo."""
    if isinstance(field, models.FileField):
        v = getattr(obj, field.name)
        return v.name if v else None
    if field.is_relation:
        rel = getattr(obj, field.name, None)
        if rel is None:
            return None
        return _rotulo_usuario(rel) if isinstance(rel, _user_model()) else str(rel)
    v = getattr(obj, field.name)
    if v is None or v == '':
        return None
    if field.choices:
        return dict(field.flatchoices).get(v, v)
    if isinstance(v, (datetime, date)):
        return v.isoformat()
    if isinstance(v, (int, float, bool)):
        return v
    s = str(v)
    return s if len(s) <= TEXTO_MAX else s[:TEXTO_MAX] + '…[truncado]'


def _dump(obj, campos=None, omitir_vazios=False) -> dict[str, Any]:
    out = {}
    for f in campos or _campos_exibiveis(type(obj)):
        v = _valor(obj, f)
        if omitir_vazios and v is None:
            continue
        out[str(f.verbose_name) if f.verbose_name else f.name] = v
    return out


HISTORICO_MAX = 700
NOTA_FICHAS = ('Os detalhes de cada ocorrência (processo, data, local, artefato, fase, responsáveis) JÁ são exibidos '
               'ao usuário em fichas. Responda só com uma frase de abertura com a quantidade; sem listar '
               'números, nomes ou datas, e sem markdown.')


def _data_br(d) -> str:
    return d.strftime('%d/%m/%Y') if d else ''


def _lista_humana(itens: list[str]) -> str:
    itens = [i for i in itens if i]
    if len(itens) <= 1:
        return ''.join(itens)
    return ', '.join(itens[:-1]) + ' e ' + itens[-1]


_MINUSCULAS = {'de', 'da', 'do', 'das', 'dos', 'e', 'em', 'a', 'o'}


def _nome_proprio(txt: str) -> str:
    """'SÃO LUÍS DO MARANHÃO' -> 'São Luís do Maranhão' (só se veio todo em maiúsculas)."""
    if not txt or not txt.isupper():
        return txt or ''
    return ' '.join(p.lower() if i and p.lower() in _MINUSCULAS else p.capitalize()
                    for i, p in enumerate(txt.lower().split()))


def _frase(txt: str) -> str:
    """Normaliza espaços, garante maiúscula inicial e ponto final."""
    t = ' '.join((txt or '').split())
    if not t:
        return ''
    t = t[0].upper() + t[1:]
    return t if t[-1] in '.!?…' else t + '.'


def _num(v) -> str:
    return f"{float(v):g}".replace('.', ',')


_ARTIGO_TIPO = {'Veículo lançador': 'o veículo lançador', 'Veículo suborbital': 'o veículo suborbital',
                'Satélite': 'o satélite'}
_DANOS_ARTEFATO = {'DESTRUÍDO': 'foi destruído', 'PARCIAL': 'sofreu danos parciais',
                   'NENHUM DANO': 'não sofreu danos', 'INDETERMINADO': 'teve a extensão dos danos indeterminada'}
_DANOS_TERCEIROS = {'SIM': 'houve danos a terceiros', 'NÃO': 'não houve danos a terceiros',
                    'INDETERMINADO': 'não foi possível determinar se houve danos a terceiros'}
_CATEGORIA = {'TRIPULANTE': ('tripulante', 'tripulantes'), 'PASSAGEIRO': ('passageiro', 'passageiros'),
              'TERCEIROS': ('terceiro', 'terceiros')}
_LESAO = {'FATAL': ('com lesão fatal', 'com lesões fatais'), 'GRAVE': ('com lesão grave', 'com lesões graves'),
          'LEVE': ('com lesão leve', 'com lesões leves'), 'ILESO': ('ileso', 'ilesos'),
          'INDETERMINADO': ('com lesão indeterminada', 'com lesões indeterminadas')}


_ORBITA = {'LEO': 'órbita baixa da Terra (LEO)', 'MEO': 'órbita média da Terra (MEO)',
           'GEO': 'órbita geoestacionária (GEO)', 'HEO': 'órbita altamente elíptica (HEO)',
           'INTERPLANETARIO': 'trajetória interplanetária'}
_MASC = {'centro', 'setor', 'campo', 'complexo', 'laboratório', 'prédio', 'hangar', 'pátio', 'galpão',
         'parque', 'posto', 'edifício', 'lançador', 'bloco', 'módulo', 'sítio', 'terreno', 'mar', 'oceano',
         'instituto', 'departamento', 'comando', 'grupo', 'ministério', 'consórcio', 'laboratório'}
_FEM = {'casa', 'base', 'área', 'zona', 'torre', 'sala', 'plataforma', 'estação', 'rampa', 'oficina',
        'divisão', 'praia', 'região', 'fazenda', 'casamata', 'unidade', 'agência', 'empresa', 'força',
        'universidade', 'organização', 'diretoria', 'companhia'}
_VAZIOS = {'-', '--', 'n/a', 'na', 'nd', 'n/d', 's/n', 'não informado', 'nao informado', 'indefinido', '.'}
CARACTERISTICA_MAX = 90


def _preenchido(v) -> str:
    """Valor útil ou '' (descarta marcadores como '-', 'N/A')."""
    s = ' '.join(str(v).split()) if v is not None else ''
    return '' if s.lower() in _VAZIOS else s


def _em(lugar: str) -> str:
    """Preposição contraída pela 1ª palavra ('no Centro…', 'na Casa…'); senão 'em'."""
    primeira = lugar.split()[0].lower() if lugar.split() else ''
    if primeira in _MASC:
        return f"no {lugar}"
    if primeira in _FEM:
        return f"na {lugar}"
    return f"em {lugar}"


def _por(agente: str) -> str:
    """'pelo Instituto…', 'pela Agência…'; senão 'por'."""
    primeira = agente.split()[0].lower() if agente.split() else ''
    if primeira in _MASC:
        return f"pelo {agente}"
    if primeira in _FEM:
        return f"pela {agente}"
    return f"por {agente}"


def _categoria_tipo(o) -> str:
    """'PROP.1 — Motores e Câmaras' -> 'PROP.1 (Motores e Câmaras)'."""
    cod, _, desc = o.get_tipo_display().partition(' — ')
    return f"{cod} ({desc})" if desc else cod


def _nome_artefato(a) -> str:
    if a.artefato_espacial_id:
        return _preenchido(str(a.artefato_espacial))
    return _preenchido(a.veiculo_lancador)


def _descricao_artefato(a) -> str:
    """'o satélite X, operado por Y, com massa total de 120 kg e …' — só o que está preenchido."""
    nome = _nome_artefato(a)
    base = _ARTIGO_TIPO.get(a.tipo, 'o artefato espacial')
    tipo_palavra = base.split(' ', 1)[1]
    if nome and nome.lower().startswith(tipo_palavra.lower()):
        texto = f"o {nome}"                     # evita "o satélite Satélite Geoestacionário…"
    else:
        texto = f"{base} {nome}" if nome else base
    operador, detalhe = _preenchido(a.operador), _preenchido(a.operador_detalhe)
    if operador:
        texto += f", operado {_por(operador)}"
        if detalhe and detalhe.lower() not in operador.lower():
            texto += f" ({detalhe})"
    caract = []
    if a.massa_total:
        caract.append(f"massa total de {_num(a.massa_total)} kg")
    for rotulo, valor in (('dimensões de', a.dimensoes), ('vida útil prevista de', a.vida_util_prevista),
                          ('sistema de propulsão', a.sistema_propulsao)):
        v = _preenchido(valor)
        if v and len(v) <= CARACTERISTICA_MAX:   # descrições longas não cabem num resumo; ficam na ficha completa
            caract.append(f"{rotulo} {v.rstrip('.')}")
    if caract:
        texto += ', com ' + _lista_humana(caract)
    return texto


def _lesoes_texto(artefatos) -> str:
    itens = []
    for a in artefatos:
        for l in a.ocorrencia_aeronave_lesao.all():
            if not (l.categoria or l.tipo_lesao):
                continue
            q = l.quantidade or 0
            plural = q != 1
            cat = _CATEGORIA.get(l.categoria, ('pessoa', 'pessoas'))[plural]
            les = _LESAO.get(l.tipo_lesao, ('', ''))[plural]
            itens.append(' '.join(x for x in [str(q) if q else '', cat, les] if x))
    return _lista_humana(itens)


_FASE_INVESTIGACAO = {
    'RAI': 'elaboração do Relatório de Ação Inicial (RAI)',
    'MIN': 'elaboração da minuta do relatório',
    'REV': 'revisão do relatório',
    'RF': 'Relatório Final (RF)',
    'FIM': 'encerramento',
}
_ACAO_INICIAL = {
    'SIM': 'Houve deslocamento da equipe até o local da ocorrência',
    'NÃO': 'Não houve deslocamento da equipe até o local da ocorrência',
    'INDETERMINADO': 'Não foi possível determinar se houve deslocamento da equipe até o local',
}


def _prioridade(c) -> str:
    """'3 - ALTA' -> '3 (alta)'; '1 - CENIPA' -> '1 (CENIPA)'."""
    num, _, desc = c.get_prioridade_display().partition(' - ')
    if not desc:
        return num
    return f"{num} ({desc if desc == 'CENIPA' else desc.lower()})"


def _controle_atual(o):
    """Registro de controle mais recente (o modelo permite mais de um por ocorrência)."""
    regs = sorted(o.ocorrencia_controle.all(), key=lambda c: c.pk)
    return regs[-1] if regs else None


def _controle_texto(c) -> list[str]:
    """Frases sobre a investigação, a partir de OcorrenciaControle — só o que está preenchido."""
    if c is None:
        return ["Não há registro de controle de investigação para esta ocorrência."]
    frases = []
    inv = _rotulo_usuario(c.investigador) if c.investigador_id else ''
    orgao = {'CENIPA': 'pelo CENIPA', 'OUTRO': 'por outro órgão'}.get(c.orgao_investigador, '')
    finalizada = c.situacao_investigacao == 'FINALIZADA'

    if c.status == 'INVESTIGADA':
        s = ("A ocorrência foi investigada" if finalizada else "A ocorrência será investigada") \
            + (f" {orgao}" if orgao else '')
        if inv:
            s += f", tendo como investigador responsável {inv}"
        if c.prioridade:
            s += f", com prioridade {_prioridade(c)}"
        frases.append(s)
        if finalizada:
            frases.append("A investigação está concluída"
                          + (f", tendo alcançado a fase de {_FASE_INVESTIGACAO[c.fase_atual]}"
                             if c.fase_atual and c.fase_atual != 'FIM' else ''))
        elif c.fase_atual == 'FIM':
            frases.append("A investigação está em fase de encerramento")
        elif c.fase_atual:
            frases.append(f"A investigação está em andamento, na fase de {_FASE_INVESTIGACAO[c.fase_atual]}")
        else:
            frases.append("A investigação está em andamento")
    elif c.status == 'COLETA DE DADOS':
        s = "O tratamento definido para a ocorrência é a coleta de dados, sem abertura de investigação"
        if inv:
            s += f", sob responsabilidade de {inv}"
        frases.append(s)
    elif c.fase_atual or inv:
        # tratamento não informado: relata só o que existe, sem afirmar se será investigada
        s = "A investigação" + (f", sob responsabilidade de {inv}," if inv else '')
        if c.fase_atual == 'FIM':
            s += " está em fase de encerramento"
        elif c.fase_atual:
            s += f" encontra-se na fase de {_FASE_INVESTIGACAO[c.fase_atual]}"
        else:
            s += " não tem fase registrada"
        frases.append(s)
    else:
        frases.append("Ainda não foi registrada no controle a decisão sobre a investigação desta ocorrência")

    num = _preenchido(c.numero_relatorio)
    a_definir = not num or num.upper() == 'A DEFINIR'
    if c.tipo_relatorio or not a_definir:
        tipo = 'um Relatório Final (RF)' if c.tipo_relatorio == 'RF' else 'um relatório'
        verbo = 'O relatório produzido é' if finalizada else 'O relatório a ser produzido é'
        frases.append(f"{verbo} {tipo}" + (", com número ainda a definir" if a_definir
                                            else f", registrado sob o número {num}"))
    if c.fez_acao_inicial in _ACAO_INICIAL:
        frases.append(_ACAO_INICIAL[c.fez_acao_inicial])
    obs = _preenchido(c.observacoes)
    if obs:
        frases.append("Nas observações do controle, consta: " + obs[:TEXTO_MAX])
    return frases


def _paragrafo_ocorrencia(o, extras: list[str] | None = None, controle: bool = False) -> str:
    """Texto narrativo único e determinístico (nada aqui é gerado pelo modelo).

    Ordem: situação (quando, onde, operação) → artefato → o que ocorreu
    (histórico) → consequências (danos, lesões) → andamento (extras).
    Só entra o que está preenchido no banco; nada é inferido.
    """
    artefatos = list(o.ocorrencia_aeronave.all())
    frases: list[str] = []

    # 1. Situação
    quando = ''
    if o.dia:
        quando = f"No dia {_data_br(o.dia)}"
        if o.horario:
            quando += f", às {o.horario.strftime('%H:%M')} (horário local"
            if o.horario_utc:
                mesmo_dia = not o.dia_utc or o.dia_utc == o.dia
                quando += f"; {o.horario_utc.strftime('%H:%M')} UTC" + ('' if mesmo_dia else f" de {_data_br(o.dia_utc)}")
            quando += ')'
    cls = (o.classificacao or 'ocorrência').lower()
    sit = f"{quando}, registrou-se um {cls}" if quando else f"Registrou-se um {cls}"
    if o.tipo:
        sit += f", enquadrado na categoria {_categoria_tipo(o)},"
    local = _preenchido(o.local)
    if o.cidade_id:
        cid = o.cidade
        uf = getattr(cid, 'uf', None)
        municipio = _nome_proprio(cid.nome)
        if local and local.lower() == (cid.nome or '').lower():
            local = ''                                  # evita "em Brasília, no município de Brasília"
        if uf and uf.nome:
            municipio += f" ({uf.nome_codigo or _nome_proprio(uf.nome)})"
        sit += (f" {_em(local)}, no município de {municipio}" if local else f" no município de {municipio}")
    elif local:
        sit += f" {_em(local)}"
    fase = next((a.get_fase_missao_display().lower() for a in artefatos if a.fase_missao), '')
    if fase:
        sit += f", durante a fase de {fase}"
    if o.aerodromo:
        sit += f", em operação conduzida pelo {o.aerodromo}"
    frases.append(_frase(sit.replace(',,', ',')))

    if o.localizacao_tipo == 'EM_ORBITA':
        orb = _ORBITA.get(o.orbita_tipo, 'órbita')
        alt = [f"apogeu de {_num(o.apogeu)} km" if o.apogeu else '',
               f"perigeu de {_num(o.perigeu)} km" if o.perigeu else '',
               f"inclinação de {_num(o.inclinacao)}°" if o.inclinacao else '']
        alt = _lista_humana([x for x in alt if x])
        frases.append(_frase(f"O evento se deu em {orb}" + (f", com {alt}" if alt else '')))
    elif _preenchido(o.local_impacto):
        frases.append(_frase(f"Os destroços foram localizados {_em(_preenchido(o.local_impacto))}"))

    # 2. Artefato
    if len(artefatos) == 1:
        frases.append(_frase(f"Esteve envolvido {_descricao_artefato(artefatos[0])}"))
    elif artefatos:
        frases.append(_frase(f"Estiveram envolvidos {len(artefatos)} artefatos espaciais: "
                             + '; '.join(_descricao_artefato(a) for a in artefatos)))

    # 3. O que ocorreu (histórico integrado ao corpo, cortado em fim de frase)
    hist = ' '.join((o.historico or '').split())
    if hist and _preenchido(hist):
        if len(hist) > HISTORICO_MAX:
            corte = hist[:HISTORICO_MAX]
            fim = max(corte.rfind('. '), corte.rfind('.'))
            hist = corte[:fim + 1] if fim > HISTORICO_MAX // 2 else corte.rsplit(' ', 1)[0] + '…'
        frases.append(_frase(hist))
    for a in artefatos:
        if a.evidencia_falha:
            alvo = f" no {_nome_artefato(a)}" if len(artefatos) > 1 and _nome_artefato(a) else ''
            frases.append(_frase(f"Foi registrada evidência de falha de natureza "
                                 f"{a.get_evidencia_falha_display().lower()}{alvo}"))

    # 4. Consequências — omite o que o histórico já relatou, para não repetir
    h_low = hist.lower()
    cons = []
    for a in artefatos:
        if a.danos in _DANOS_ARTEFATO:
            if a.danos == 'DESTRUÍDO' and 'destru' in h_low:
                continue
            sujeito = f"o {_nome_artefato(a)}" if len(artefatos) > 1 and _nome_artefato(a) else 'o artefato'
            cons.append(f"{sujeito} {_DANOS_ARTEFATO[a.danos]}")
    if o.danos_terceiros in _DANOS_TERCEIROS and 'terceiro' not in h_low:
        cons.append(_DANOS_TERCEIROS[o.danos_terceiros])
    if cons:
        frases.append(_frase("Em decorrência do evento, " + _lista_humana(cons)))
    les = _lesoes_texto(artefatos)
    if les and 'lesõ' not in h_low and 'lesão' not in h_low:
        frases.append(_frase(f"Quanto às pessoas envolvidas, foram registrados {les}"))

    # 5. Investigação (Controle) e andamento (confirmação, revisão…)
    if controle:
        frases.extend(_frase(t) for t in _controle_texto(_controle_atual(o)))
    frases.extend(_frase(e) for e in (extras or []))
    return ' '.join(f for f in frases if f)


_ORGANIZACAO_NOME = {'CLA': 'Centro de Lançamento de Alcântara (CLA)',
                     'CLBI': 'Centro de Lançamento da Barreira do Inferno (CLBI)',
                     'COPE': 'Centro de Operações Espaciais (COPE)'}


def _abertura_fichas(total: int, exibidas: int, numero: str | None, status: str | None,
                     controle: dict[str, str], geral: dict | None = None) -> str:
    """Frase de abertura 100% derivada dos filtros aplicados e da contagem real."""
    if numero:
        return (f"Esta é a ocorrência de processo {numero}:" if total
                else f"Não encontrei ocorrência com o número de processo {numero}.")
    plural = total != 1
    flex = (lambda s, p: p if plural else s)
    desc = []
    trat, orgao = controle.get('status'), controle.get('orgao_investigador')
    if trat == 'INVESTIGADA':
        desc.append(flex('investigada', 'investigadas'))
    elif trat == 'COLETA DE DADOS':
        desc.append(flex('tratada', 'tratadas') + ' como coleta de dados')
    if orgao:
        if not trat:
            desc.append(flex('investigada', 'investigadas'))
        desc.append('pelo CENIPA' if orgao == 'CENIPA' else 'por outro órgão')
    sit = controle.get('situacao_investigacao')
    if sit:
        desc.append('com investigação ' + ('ativa' if sit == 'ATIVA' else 'finalizada'))
    fase = controle.get('fase_atual')
    if fase:
        desc.append(f"na fase de {_FASE_INVESTIGACAO.get(fase, fase)}")
    if status:
        desc.append({'AUTENTICAR': 'aguardando autenticação', 'CONFIRMAR': 'aguardando confirmação',
                     'AUTENTICADO': flex('autenticada', 'autenticadas')}.get(status, f"com status {status}"))
    geral = geral or {}
    if geral.get('classificacao'):
        desc.insert(0, flex('classificada', 'classificadas') + f" como {geral['classificacao'].lower()}")
    onde = []
    if geral.get('organizacao'):
        onde.append(f"no {_ORGANIZACAO_NOME[geral['organizacao']]}")
    if geral.get('local'):
        onde.append(f"em locais com “{geral['local']}”" if onde else f"em “{geral['local']}”")
    if onde:
        desc.insert(0, flex('registrada', 'registradas') + ' ' + ' e '.join(onde))
    ini, fim = geral.get('data_inicio'), geral.get('data_fim')
    if ini and fim:
        desc.append(f"entre {_data_br(ini)} e {_data_br(fim)}")
    elif ini:
        desc.append(f"a partir de {_data_br(ini)}")
    elif fim:
        desc.append(f"até {_data_br(fim)}")
    d = (' ' + ' '.join(desc)) if desc else (' ' + flex('cadastrada', 'cadastradas'))
    if total == 0:
        return f"Não encontrei ocorrências{d.replace('investigada ', 'investigadas ').replace('tratada ', 'tratadas ')}."
    frase = f"Encontrei {total} {flex('ocorrência', 'ocorrências')}{d}"
    if exibidas < total:
        frase += f" (exibindo as {exibidas} mais recentes)"
    return frase + ':'


def _titulo_ocorrencia(o) -> str:
    return f"Processo {o.numero_processo}" if o.numero_processo else f"Ocorrência sem número de processo (id {o.pk})"


class Assistente:
    """Ferramentas ligadas a um usuário e a uma requisição."""

    def __init__(self, user):
        self.user = user
        self.tabelas: list[dict] = []
        self.fichas: list[dict] = []
        self.ferramentas_usadas: list[str] = []
        self.consultas_ok = 0          # ferramentas de dados que retornaram com sucesso
        self.totais: set[int] = set()  # contagens que elas devolveram
        self.numeros: set[int] = set() # todo inteiro presente nos dados devolvidos ao modelo
        # Frases de abertura montadas pelo CÓDIGO a partir dos filtros realmente aplicados.
        # Quando existem, substituem o texto do modelo (ver agent.validar_resposta).
        self.aberturas: list[str] = []

    def _qs_fichas(self):
        return (OcorrenciaGeral.objects.select_related('cidade__uf')
                .prefetch_related('ocorrencia_aeronave__artefato_espacial',
                                  'ocorrencia_aeronave__ocorrencia_aeronave_lesao',
                                  'ocorrencia_controle__investigador'))

    def _registrar_ficha(self, o, extras=None, situacao=None) -> None:
        self.fichas.append({
            'titulo': _titulo_ocorrencia(o),
            'situacao': situacao or (o.status or ''),
            'paragrafo': _paragrafo_ocorrencia(
                o, extras, controle=self.user.has_perm('ocorrencia.view_ocorrenciacontrole')),
        })

    def fichas_ocorrencias(
        self,
        status: Optional[Literal['CONFIRMAR', 'AUTENTICAR', 'AUTENTICADO']] = None,
        numero_processo: Optional[str] = None,
        tratamento: Optional[Literal['INVESTIGADA', 'COLETA DE DADOS']] = None,
        orgao_investigador: Optional[Literal['CENIPA', 'OUTRO']] = None,
        situacao_investigacao: Optional[Literal['ATIVA', 'FINALIZADA']] = None,
        fase_investigacao: Optional[Literal['RAI', 'MIN', 'REV', 'RF', 'FIM']] = None,
        organizacao: Optional[Literal['CLA', 'CLBI', 'COPE']] = None,
        local: Optional[str] = None,
        classificacao: Optional[Literal['ACIDENTE', 'INCIDENTE', 'INFORTÚNIO']] = None,
        data_inicio: Optional[str] = None,
        data_fim: Optional[str] = None,
        limite: int = 20,
    ) -> str:
        """Apresenta ocorrências como fichas legíveis (data, hora, local, artefato, histórico e investigação).

        Use para 'liste/mostre/quais ocorrências', para uma ocorrência específica e para perguntas
        sobre investigação. Filtros (todos opcionais, combináveis):
        - status: status do registro (CONFIRMAR, AUTENTICAR, AUTENTICADO)
        - numero_processo: número do processo
        - tratamento: INVESTIGADA ou COLETA DE DADOS (se foi/será investigada)
        - orgao_investigador: CENIPA ou OUTRO
        - situacao_investigacao: ATIVA ou FINALIZADA
        - fase_investigacao: RAI, MIN (minuta), REV (revisão), RF (relatório final) ou FIM
        - organizacao: organização do segmento espacial responsável — CLA (Centro de Lançamento de
          Alcântara), CLBI (Centro de Lançamento da Barreira do Inferno) ou COPE (Centro de Operações
          Espaciais). Use para perguntas como "ocorrências no/do CLA".
        - local: texto livre buscado no local, no local de impacto e no município (ex.: "Alcântara")
        - classificacao: ACIDENTE, INCIDENTE ou INFORTÚNIO
        - data_inicio / data_fim: período da ocorrência, formato AAAA-MM-DD (ex.: ano de 2020 ->
          data_inicio=2020-01-01 e data_fim=2020-12-31)
        """
        def run():
            self._exigir_view(OcorrenciaGeral)

            def txt(v):
                return v.strip() if isinstance(v, str) and v.strip() else None

            filtros_controle = {k: txt(v) for k, v in {
                'status': tratamento, 'orgao_investigador': orgao_investigador,
                'situacao_investigacao': situacao_investigacao, 'fase_atual': fase_investigacao,
            }.items() if txt(v)}
            if filtros_controle:
                self._exigir_view(OcorrenciaControle)
            qs = self._qs_fichas().order_by('-dia', '-id')
            if txt(status):
                qs = qs.filter(status=txt(status).upper())
            if txt(numero_processo):
                qs = qs.filter(numero_processo=txt(numero_processo))
            geral = {}
            if txt(organizacao):
                geral['organizacao'] = txt(organizacao).upper()
                qs = qs.filter(aerodromo=geral['organizacao'])
            if txt(local):
                geral['local'] = txt(local)
                qs = qs.filter(Q(local__icontains=geral['local']) | Q(local_impacto__icontains=geral['local'])
                               | Q(cidade__nome__icontains=geral['local']))
            if txt(classificacao):
                geral['classificacao'] = txt(classificacao).upper()
                qs = qs.filter(classificacao=geral['classificacao'])
            for chave, valor, lookup in (('data_inicio', data_inicio, 'dia__gte'), ('data_fim', data_fim, 'dia__lte')):
                if txt(valor):
                    try:
                        geral[chave] = date.fromisoformat(txt(valor))
                    except ValueError:
                        raise ToolError(f"Data inválida em {chave}: '{valor}'. Use o formato AAAA-MM-DD.")
                    qs = qs.filter(**{lookup: geral[chave]})
            if filtros_controle:
                ids = OcorrenciaControle.objects.filter(
                    **{k: v.upper() for k, v in filtros_controle.items()}).values('ocorrencia_id')
                qs = qs.filter(pk__in=ids)
            total = qs.count()
            lim = max(1, min(int(limite) if str(limite).isdigit() else 20, 50))
            objs = list(qs[:lim])
            for o in objs:
                self._registrar_ficha(o)
            self.aberturas.append(_abertura_fichas(
                total, len(objs), txt(numero_processo), txt(status),
                {k: v.upper() for k, v in filtros_controle.items()}, geral))
            return self._resposta('fichas_ocorrencias', {
                'total_encontrado': total, 'exibidas': len(objs),
                'nota': NOTA_FICHAS,
            })
        return self._seguro('fichas_ocorrencias', run)

    # ------------------------------------------------------------------ util
    def _exigir_view(self, model) -> None:
        perm = f'{model._meta.app_label}.view_{model._meta.model_name}'
        if not self.user.has_perm(perm):
            raise ToolError(f"Sem permissão para consultar '{model._meta.verbose_name}'.")

    def _registrar(self, titulo: str, colunas: list[str], linhas: list[list], truncado=False) -> None:
        self.tabelas.append({'titulo': titulo, 'colunas': colunas, 'linhas': linhas, 'truncado': truncado})

    def _resposta(self, nome: str, payload: dict) -> str:
        self.ferramentas_usadas.append(nome)
        if nome != 'descrever_dados':
            # contagens reais devolvidas por ferramentas de DADOS — base da trava anti-alucinação
            for chave in ('total', 'total_encontrado', 'exibidas', 'retornados'):
                if isinstance(payload.get(chave), int):
                    self.totais.add(payload[chave])
            self.consultas_ok += 1
            bruto = json.dumps(payload, ensure_ascii=False, default=str)
            self.numeros.update(int(n) for n in re.findall(r'\d+', bruto))
            self.numeros.update(self.totais)
        texto = json.dumps(payload, ensure_ascii=False, default=str)
        if len(texto) > RESPOSTA_MAX_CHARS:
            payload = {**payload, 'aviso': 'Resultado grande demais; refine os filtros ou peça menos campos.'}
            payload.pop('registros', None)
            payload.pop('secoes', None)
            texto = json.dumps(payload, ensure_ascii=False, default=str)
        return texto

    def _seguro(self, nome: str, fn):
        try:
            return fn()
        except ToolError as e:
            self.ferramentas_usadas.append(nome)
            return json.dumps({'erro': str(e)}, ensure_ascii=False)

    # ------------------------------------------------- consultas canônicas
    def aguardando_autenticacao(self) -> str:
        """Ocorrências com status AUTENTICAR (confirmadas, aguardando autenticação)."""
        def run():
            self._exigir_view(OcorrenciaGeral)
            qs = (self._qs_fichas().filter(status='AUTENTICAR')
                  .prefetch_related('ocorrencia_confirmacao__usuario').order_by('id'))
            objs = list(qs)
            for o in objs:
                conf = next(iter(o.ocorrencia_confirmacao.all()), None)
                extra = []
                if conf and conf.usuario:
                    extra.append(f"O registro foi confirmado por {_rotulo_usuario(conf.usuario)}"
                                 + (f" em {_data_br(conf.data_confirmacao)}" if conf.data_confirmacao else '')
                                 + " e aguarda autenticação")
                else:
                    extra.append("O registro aguarda autenticação")
                self._registrar_ficha(o, extra, situacao='Aguardando autenticação')
            n = len(objs)
            self.aberturas.append(
                f"Encontrei {n} {'ocorrência' if n == 1 else 'ocorrências'} aguardando autenticação:" if n
                else "Nenhuma ocorrência está aguardando autenticação no momento.")
            return self._resposta('aguardando_autenticacao', {
                'criterio': "status = AUTENTICAR (confirmada e aguardando autenticação)",
                'total': len(objs),
                'nota': NOTA_FICHAS,
            })
        return self._seguro('aguardando_autenticacao', run)

    def em_revisao(self) -> str:
        """Ocorrências em revisão: fase (setor) e revisor atuais."""
        def run():
            self._exigir_view(OcorrenciaRevisaoRelatorio)
            self._exigir_view(OcorrenciaGeral)
            em_fim = OcorrenciaControle.objects.filter(fase_atual='FIM').values('ocorrencia_id')
            revs = (OcorrenciaRevisaoRelatorio.objects
                    .exclude(ocorrencia_id__in=em_fim)
                    .select_related('ocorrencia', 'revisor')
                    .order_by('ocorrencia_id', '-id'))
            atuais: dict[int, OcorrenciaRevisaoRelatorio] = {}
            for r in revs:                      # 1ª linha por ocorrência = a mais recente
                atuais.setdefault(r.ocorrencia_id, r)
            ocs = {o.pk: o for o in self._qs_fichas().filter(pk__in=atuais)}
            resumo = []
            for oid, r in atuais.items():
                o = ocs[oid]
                frases = []
                fase = r.get_setor_display() if r.setor else None
                quem = _rotulo_usuario(r.revisor)
                # investigador e fase da investigação já entram pelo Controle na ficha
                andamento = "O relatório está em revisão" + (f" na etapa {fase}" if fase else '')
                andamento += (f", sob responsabilidade de {quem}" if quem else '')
                andamento += (f", desde {_data_br(r.data_atribuicao)}" if r.data_atribuicao else '')
                frases.append(andamento)
                if r.observacao:
                    frases.append("Na revisão, consta a seguinte observação: "
                                  + ' '.join(r.observacao.split())[:TEXTO_MAX])
                self._registrar_ficha(o, frases, situacao=f"Em revisão — {fase}" if fase else 'Em revisão')
                resumo.append({'processo': o.numero_processo, 'fase': fase, 'revisor': quem})
            n = len(resumo)
            self.aberturas.append(
                f"Encontrei {n} {'ocorrência' if n == 1 else 'ocorrências'} com relatório em revisão:" if n
                else "Nenhuma ocorrência está com relatório em revisão no momento.")
            return self._resposta('em_revisao', {
                'criterio': "Possui registro no Painel de Revisão e fase_atual da investigação != FIM; "
                            "fase = setor do registro de revisão mais recente (maior id).",
                'total': len(resumo),
                'nota': NOTA_FICHAS,
            })
        return self._seguro('em_revisao', run)

    # ----------------------------------------------- acesso geral aos dados
    def descrever_dados(self, modelo: str | None = None) -> str:
        """Sem argumento: lista as tabelas consultáveis. Com `modelo`: lista seus campos."""
        def run():
            mods = modelos_permitidos()
            if not modelo:
                return self._resposta('descrever_dados', {'modelos': {
                    k: str(m._meta.verbose_name_plural) for k, m in mods.items()
                    if self.user.has_perm(f'{m._meta.app_label}.view_{m._meta.model_name}')
                }})
            m = mods.get(modelo.lower())
            if not m:
                raise ToolError(f"Modelo '{modelo}' inexistente. Use descrever_dados() para listar.")
            self._exigir_view(m)
            campos = [{'campo': f.name, 'rotulo': str(f.verbose_name), 'tipo': f.get_internal_type(),
                       **({'opcoes': [c[0] for c in f.flatchoices]} if f.choices else {}),
                       **({'aponta_para': f.related_model.__name__} if f.is_relation else {})}
                      for f in _campos_exibiveis(m)]
            reversas = [r.get_accessor_name() for r in m._meta.related_objects]
            return self._resposta('descrever_dados', {'modelo': modelo.lower(), 'campos': campos,
                                                       'relacionamentos_para_filtro': reversas})
        return self._seguro('descrever_dados', run)

    def _validar_caminho(self, model, caminho: str):
        """Valida `campo__rel__campo__lookup` contra a lista de campos permitidos."""
        partes = caminho.split('__')
        atual = model
        for i, p in enumerate(partes):
            ultimo = i == len(partes) - 1
            if ultimo and p in LOOKUPS and i > 0:
                return
            try:
                f = atual._meta.get_field(p)
            except FieldDoesNotExist:
                raise ToolError(f"Campo inválido em filtro: '{p}' (modelo {atual.__name__}).")
            if p in CAMPOS_SENSIVEIS or 'cpf' in p or (atual is _user_model() and p not in CAMPOS_USUARIO_OK):
                raise ToolError(f"Campo '{p}' não é consultável.")
            if f.is_relation:
                atual = f.related_model
                if atual is not _user_model() and atual._meta.app_label == 'ocorrencia':
                    self._exigir_view(atual)
            elif not ultimo:
                raise ToolError(f"'{p}' não é uma relação; não pode ser seguido de '{partes[i + 1]}'.")

    def consultar(self, modelo: str, filtros: dict | None = None, campos: list[str] | None = None,
                  ordenar_por: str | None = None, limite: int = LIMITE_PADRAO) -> str:
        """Consulta registros de um modelo com filtros exatos (ver descrever_dados)."""
        def run():
            m = modelos_permitidos().get((modelo or '').lower())
            if not m:
                raise ToolError(f"Modelo '{modelo}' inexistente. Use descrever_dados() para listar.")
            self._exigir_view(m)
            q = Q()
            for chave, valor in (filtros or {}).items():
                self._validar_caminho(m, chave)
                q &= Q(**{chave: valor})
            lim = max(1, min(int(limite or LIMITE_PADRAO), LIMITE_MAXIMO))
            exib = {f.name: f for f in _campos_exibiveis(m)}
            if campos:
                ruins = [c for c in campos if c not in exib]
                if ruins:
                    raise ToolError(f"Campos inexistentes/indisponíveis: {ruins}.")
                sel = [exib[c] for c in campos]
            else:
                sel = list(exib.values())
            ordem = ordenar_por or 'id'
            self._validar_caminho(m, ordem.lstrip('-'))
            try:
                qs = m.objects.filter(q).order_by(ordem)
                fks = [f.name for f in sel if f.is_relation and f.many_to_one]
                if fks:
                    qs = qs.select_related(*fks)
                total = qs.count()
                objs = list(qs[:lim])
            except Exception as e:  # valor incompatível com o tipo do campo etc.
                raise ToolError(f"Filtro inválido: {e}")
            colunas = [str(f.verbose_name) for f in sel]
            linhas = [[_valor(o, f) for f in sel] for o in objs]
            truncado = total > len(linhas)
            self._registrar(str(m._meta.verbose_name_plural).capitalize(), colunas, linhas, truncado)
            return self._resposta('consultar', {
                'modelo': modelo.lower(), 'filtros': filtros or {}, 'total_encontrado': total,
                'retornados': len(linhas), 'truncado': truncado, 'colunas': colunas, 'registros': linhas,
            })
        return self._seguro('consultar', run)

    def detalhar_ocorrencia(self, identificador: str) -> str:
        """Todos os dados de uma ocorrência (número do processo ou id) e de suas tabelas relacionadas."""
        def run():
            self._exigir_view(OcorrenciaGeral)
            ident = str(identificador).strip()
            o = OcorrenciaGeral.objects.filter(numero_processo=ident).first()
            if o is None and ident.isdigit():
                o = OcorrenciaGeral.objects.filter(pk=int(ident)).first()
            if o is None:
                raise ToolError(f"Ocorrência '{ident}' não encontrada.")
            secoes: dict[str, Any] = {'Dados gerais': _dump(o, omitir_vazios=True)}
            self._registrar('Dados gerais', ['Campo', 'Valor'],
                            [[k, v] for k, v in secoes['Dados gerais'].items()])
            for rel in o._meta.related_objects:
                if not rel.one_to_many or rel.related_model._meta.proxy:
                    continue
                rm = rel.related_model
                if not self.user.has_perm(f'{rm._meta.app_label}.view_{rm._meta.model_name}'):
                    continue
                itens = list(getattr(o, rel.get_accessor_name()).all()[:20])
                if not itens:
                    continue
                nome = str(rm._meta.verbose_name_plural)
                secoes[nome] = [_dump(i, omitir_vazios=True) for i in itens]
                cols = sorted({k for d in secoes[nome] for k in d})
                self._registrar(nome, cols, [[d.get(c) for c in cols] for d in secoes[nome]])
            return self._resposta('detalhar_ocorrencia', {
                'ocorrencia': o.numero_processo, 'secoes': secoes,
                'observacao': 'Campos vazios foram omitidos; tabelas sem registros não aparecem.',
            })
        return self._seguro('detalhar_ocorrencia', run)
