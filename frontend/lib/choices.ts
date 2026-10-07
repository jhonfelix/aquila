// Espelha os choices de ocorrencia/models.py. Hardcoded por enquanto —
// idealmente viria de um endpoint GET /api/meta/choices/ (ver plano de
// migração) pra não duplicar as ~40 listas de choices do backend em TS.

export const CLASSIFICACAO_CHOICES = [
  ['ACIDENTE', 'ACIDENTE'],
  ['INCIDENTE', 'INCIDENTE'],
  ['INFORTÚNIO', 'INFORTÚNIO'],
];

// Tipo da ocorrência varia conforme o artefato espacial: foguete (Anexo M) ou
// satélite (Anexo N). Cada grupo (PROP, ENV...) é um cabeçalho e os subtipos
// ficam abaixo; o valor salvo é o subtipo (ex.: PROP.1).
// Manter em sincronia com OcorrenciaGeral.TIPO_CHOICES (backend).
export type ChoiceGroup = { label: string; choices: string[][] };

export const TIPO_OCORRENCIA_FOGUETE_GROUPS: ChoiceGroup[] = [
  {
    label: 'PROP — Sistema de Propulsão',
    choices: [
      ['PROP.1', 'PROP.1 — Motores e Câmaras de Combustão'],
      ['PROP.2', 'PROP.2 — Sistema de Alimentação e Injeção de Propelente'],
      ['PROP.3', 'PROP.3 — Controle de Fluxo e Pressurização'],
    ],
  },
  {
    label: 'TACS — Controle de Atitude, Aviônica e Guiagem',
    choices: [
      ['TACS.1', 'TACS.1 — Unidades de Guiagem e Navegação (GNC / Computador de Voo)'],
      ['TACS.2', 'TACS.2 — Sensores e Instrumentação'],
      ['TACS.3', 'TACS.3 — Sistema Elétrico e Transmissão de Sinal'],
      ['TACS.4', 'TACS.4 — Atuadores de Vetorização de Empuxo (TVC)'],
    ],
  },
  {
    label: 'SEP-STR — Sistemas de Separação e Estrutura',
    choices: [
      ['SEP-STR.1', 'SEP-STR.1 — Mecanismos de Separação de Estágios'],
      ['SEP-STR.2', 'SEP-STR.2 — Sistema de Coifa de Proteção (Payload Fairing)'],
      ['SEP-STR.3', 'SEP-STR.3 — Integridade Estrutural e Materiais'],
    ],
  },
];

export const TIPO_OCORRENCIA_SATELITE_GROUPS: ChoiceGroup[] = [
  {
    label: 'ENV — Origem Ambiental',
    choices: [
      ['ENV.1', 'ENV.1 — Radiação Ionizante e Efeitos de Evento Único (SEE)'],
      ['ENV.2', 'ENV.2 — Carregamento Eletrostático e Descargas (ESD)'],
      ['ENV.3', 'ENV.3 — Micrometeoroides e Detritos Orbitais (MMOD)'],
      ['ENV.4', 'ENV.4 — Perturbações Geomagnéticas e Clima Espacial'],
    ],
  },
  {
    label: 'HW — Origem em Hardware Embarcado',
    choices: [
      ['HW.1', 'HW.1 — Componentes Eletrônicos e Potência Elétrica (EPS)'],
      ['HW.2', 'HW.2 — Mecanismos, Estrutura e Controle Térmico'],
      ['HW.3', 'HW.3 — Subsistema Propulsivo Embarcado'],
    ],
  },
  {
    label: 'FSW — Origem em Software Embarcado',
    choices: [
      ['FSW.1', 'FSW.1 — Erros Lógicos de Voo e RTOS'],
      ['FSW.2', 'FSW.2 — Mecanismos de Tolerância a Falhas e Memória'],
    ],
  },
  {
    label: 'OPS — Origem em Operações Terrestres e Segmento Solo',
    choices: [
      ['OPS.1', 'OPS.1 — Infraestrutura de Solo e Enlaces'],
      ['OPS.2', 'OPS.2 — Fatores Humanos e Procedimentos Operacionais'],
    ],
  },
  {
    label: 'INT — Origem Intencional e Interferência Adversária',
    choices: [
      ['INT.1', 'INT.1 — Interferência em Radiofrequência e Guerra Eletrônica'],
      ['INT.2', 'INT.2 — Ataques Ciber e Ações Antissatélite (ASAT)'],
    ],
  },
];

export const TIPO_OCORRENCIA_GROUPS: ChoiceGroup[] = [...TIPO_OCORRENCIA_FOGUETE_GROUPS, ...TIPO_OCORRENCIA_SATELITE_GROUPS];

// `artefatoTipo`: valor de AERONAVE_TIPO_CHOICES ('Estágio de foguete' | 'Satélite' | ...).
// Sem artefato definido (ou sonda/cápsula) mostra todos os grupos.
export function tipoOcorrenciaGroups(artefatoTipo?: string | null): ChoiceGroup[] {
  if (artefatoTipo === 'Estágio de foguete') return TIPO_OCORRENCIA_FOGUETE_GROUPS;
  if (artefatoTipo === 'Satélite') return TIPO_OCORRENCIA_SATELITE_GROUPS;
  return TIPO_OCORRENCIA_GROUPS;
}

export const DANOS_TERCEIROS_CHOICES = [
  ['SIM', 'SIM'],
  ['NÃO', 'NÃO'],
  ['INDETERMINADO', 'INDETERMINADO'],
];

export const LOCALIZACAO_TIPO_CHOICES = [
  ['EM_ORBITA', 'Em órbita'],
  ['EM_SOLO', 'Em solo (impacto ou destroços)'],
];

export const CHECKLIST_ETAPA_CHOICES: [string, string][] = [
  ['COLETA_DADOS', 'Coleta de Dados'],
  ['ANALISE', 'Análise'],
  ['FATOS', 'Fatos'],
];

export const ORGANIZACAO_SEGMENTO_ESPACIAL_CHOICES = [
  ['CLA', 'CLA'],
  ['CLBI', 'CLBI'],
  ['COPE', 'COPE'],
];

export const ORBITA_TIPO_CHOICES = [
  ['LEO', 'LEO - Órbita Baixa da Terra'],
  ['MEO', 'MEO - Órbita Média da Terra'],
  ['GEO', 'GEO - Órbita Geoestacionária'],
  ['HEO', 'HEO - Órbita Altamente Elíptica'],
  ['INTERPLANETARIO', 'Interplanetário'],
];

export const AERONAVE_TIPO_CHOICES = [
  ['Satélite', 'Satélite'],
  ['Estágio de foguete', 'Estágio de foguete'],
  ['Cápsula', 'Cápsula'],
  ['Sonda', 'Sonda'],
];

export const TRIPULANTE_FUNCAO_CHOICES = [
  ['PILOTO', 'Piloto'],
  ['COPILOTO', 'Copiloto'],
  ['MECÂNICO DE VOO', 'Mecânico de Voo'],
  ['COMISSÁRIO', 'Comissário'],
  ['INSTRUTOR', 'Instrutor'],
  ['ALUNO', 'Aluno'],
  ['OUTRO', 'Outro'],
];

export const LESAO_TIPO_CHOICES = [
  ['FATAL', 'Fatal'],
  ['GRAVE', 'Grave'],
  ['LEVE', 'Leve'],
  ['ILESO', 'Ileso'],
  ['INDETERMINADO', 'Indeterminado'],
];

export const LESAO_CATEGORIA_CHOICES = [
  ['TRIPULANTE', 'Tripulante'],
  ['PASSAGEIRO', 'Passageiro'],
  ['TERCEIROS', 'Terceiros'],
];

export const DANOS_ARTEFATO_CHOICES = [
  ['DESTRUÍDO', 'DESTRUÍDO'],
  ['NENHUM DANO', 'NENHUM DANO'],
  ['PARCIAL', 'PARCIAL'],
  ['INDETERMINADO', 'INDETERMINADO'],
];

export const EVIDENCIA_FALHA_CHOICES = [
  ['MECANICA', 'Mecânica'],
  ['ELETRICA', 'Elétrica'],
  ['SOFTWARE', 'Software'],
  ['OPERACIONAL', 'Operacional'],
  ['AMBIENTAL', 'Ambiental (radiação, clima espacial)'],
];

export const FASE_MISSAO_CHOICES = [
  ['PREPARACAO', 'Preparação'],
  ['ABASTECIMENTO', 'Abastecimento'],
  ['CONTAGEM_REGRESSIVA', 'Contagem regressiva'],
  ['LANCAMENTO', 'Lançamento'],
  ['VOO_PROPULSADO', 'Voo propulsado'],
  ['SEPARACAO_ESTAGIOS', 'Separação de estágios'],
  ['ORBITA', 'Órbita'],
  ['REENTRADA', 'Reentrada'],
];

export const CONTROLE_STATUS_CHOICES = [
  ['INVESTIGADA', 'INVESTIGADA'],
  ['COLETA DE DADOS', 'COLETA DE DADOS'],
];

export const ORGAO_INVESTIGADOR_CHOICES = [
  ['CENIPA', 'CENIPA'],
  ['OUTRO', 'OUTRO'],
];

export const CONTROLE_SIM_NAO_CHOICES = [
  ['SIM', 'SIM'],
  ['NÃO', 'NÃO'],
  ['INDETERMINADO', 'INDETERMINADO'],
];

export const CONTROLE_TIPO_RELATORIO_CHOICES = [
  ['RF', 'RF'],
  ['OUTRO', 'Outro'],
];

export const PRIORIDADE_CHOICES = [
  ['1', '1 - CENIPA'],
  ['2', '2 - ALTISSÍMA'],
  ['3', '3 - ALTA'],
  ['4', '4 - MÉDIA'],
  ['5', '5 - NORMAL'],
];

export const SITUACAO_CHOICES = [
  ['ATIVA', 'ATIVA'],
  ['FINALIZADA', 'FINALIZADA'],
];

export const FASE_CHOICES = [
  ['RAI', 'RAI'],
  ['MIN', 'MINUTA'],
  ['REV', 'REVISAO'],
  ['RF', 'RF'],
  ['FIM', 'FIM'],
];

export const COMISSAO_FUNCAO_CHOICES = [
  ['ASPECTO_OPERACIONAL', 'Aspecto Operacional'],
  ['ASPECTO_MATERIAL', 'Aspecto Material'],
  ['ASPECTO_MEDICO', 'Aspecto Médico'],
  ['ASPECTO_PSICOLOGICO', 'Aspecto Psicológico'],
  ['INVESTIGADOR_ENCARREGADO', 'Investigador Encarregado'],
];

export const ASOACI_SIM_NAO_CHOICES = [
  ['SIM', 'SIM'],
  ['NÃO', 'NÃO'],
];

export const ASOACI_REP_ACRED_CHOICES = [
  ['SIM', 'SIM'],
  ['NÃO', 'NÃO'],
  ['AGUARDANDO', 'AGUARDANDO'],
];

export const RELATORIO_ELOS_CHOICES = [
  ['ANAC', 'ANAC'],
  ['DECEA', 'DECEA'],
  ['RepAcred', 'RepAcred'],
  ['ICAO', 'ICAO'],
  ['ANAC,DECEA', 'ANAC e DECEA'],
  ['ANAC,DECEA,RepAcred', 'ANAC, DECEA e RepAcred'],
  ['ANAC,DECEA,RepAcred,ICAO', 'ANAC, DECEA, RepAcred e ICAO'],
  ['TODOS', 'Todos'],
];

export const REVISAO_SETOR_CHOICES = [
  ['DESIGNACAO', 'Designação'],
  ['REVISAO_PRELIMINAR_FATOR_OPERACIONAL', 'Revisão Preliminar/Fator Operacional'],
  ['REVISAO_FATOR_HUMANO', 'Revisão Fator Humano'],
  ['REVISAO_FATOR_MATERIAL', 'Revisão Fator Material'],
  ['RECOMENDACAO_DE_SEGURANCA', 'Recomendação de Segurança'],
  ['JEDI', 'JEDI'],
  ['REVISAO_GRAMATICAL', 'Revisão Gramatical'],
  ['REVISAO_FINAL', 'Revisão Final'],
  ['APRECIACAO_CHEFE_DIP', 'Apreciação Chefe DIP'],
  ['APRECIACAO_CHEFE_DO_CENIPA', 'Apreciação Chefe do CENIPA'],
  ['CONTROLE_IMPRESSAO', 'Controle/Impressão'],
  ['TRADUCAO', 'Tradução'],
  ['ASOACI', 'ASOACI'],
  ['VALIDACAO_DE_DADOS', 'Validação de Dados'],
  ['DIVULGACAO', 'Divulgação'],
  ['ASSINATURA_CHEFE_DO_CENIPA', 'Assinatura Chefe do CENIPA'],
  ['ARQUIVO', 'Arquivo'],
  ['REABERTURA', 'Reabertura'],
];

export const FEEDBACK_SETOR_CHOICES = [
  ['COLETA', 'Coleta'],
  ['ANALISE', 'Análise'],
  ['FATOS', 'Fatos'],
  ['CONCLUSAO', 'Conclusão'],
];

export const TIPO_DOCUMENTO_CHOICES = [
  ['ARTEFATO_MAPA_COMPONENTES', 'Artefato Espacial - Mapa de Componentes'],
  ['ARTEFATO_SISTEMAS_SUBSISTEMAS', 'Artefato Espacial - Sistemas e Subsistemas'],
  ['ARTEFATO_MASSA_CG', 'Artefato Espacial - Massa e Centro de Gravidade'],
  ['ARTEFATO_SEGURO', 'Artefato Espacial - Seguro Espacial'],
  ['ARTEFATO_STATUS_AEB', 'Artefato Espacial - Status AEB'],
  ['ARTEFATO_CERTIFICACOES', 'Artefato Espacial - Certificações e Autorizações'],
  ['ARTEFATO_TERMO_LIBERACAO', 'Artefato Espacial - Termo de Liberação para Lançamento'],
  ['ARTEFATO_OUTROS', 'Artefato Espacial - Outros Documentos'],
  ['IMAGEM_ACAO_INICIAL', 'Imagens - Ação Inicial'],
  ['IMAGEM_CROQUI', 'Imagens - Croqui do Sítio de Lançamento'],
  ['IMAGEM_OUTRAS', 'Imagens - Outras'],
  ['LAUDO_TECNICO', 'Laudos Técnicos e Resultados'],
  ['PORTARIA_COMISSAO', 'Portaria de Designação de Comissão de Investigação'],
  ['COORDENADOR_INVESTIGACAO', 'Coordenador da Investigação'],
  ['RESPONSAVEL_COLETA_DADOS', 'Responsável pela Coleta de Dados'],
  ['VEICULO_STATUS', 'Veículo Lançador - Status Regulatório'],
  ['OPERADOR_STATUS', 'Operador Espacial - Status Regulatório'],
  ['OPERADOR_OUTROS', 'Operador Espacial - Outros Documentos'],
  ['OUTROS_DOCUMENTOS', 'Outros Documentos Gerais'],
];

// Espelha taxonomia/models.py
export const TIPO_ARTEFATO_CHOICES = [
  ['foguete', 'Foguete'],
  ['satelite', 'Satélite'],
  ['sonda', 'Sonda'],
  ['capsula', 'Cápsula'],
  ['estacao', 'Estação Espacial'],
];

export const TIPO_PROPULSAO_CHOICES = [
  ['liquido', 'Líquido'],
  ['solido', 'Sólido'],
  ['hibrido', 'Híbrido'],
];

export const PROPELENTE_CHOICES = [
  ['RP-1/LOX', 'RP-1/LOX'],
  ['LH2/LOX', 'LH2/LOX'],
  ['Metano/LOX', 'Metano/LOX'],
];

// Espelha material_apoio/models.py
export const MATERIAL_CATEGORIA_CHOICES = [
  ['NORMA', 'Norma'],
  ['LEGISLACAO', 'Legislação'],
  ['MANUAL', 'Manual'],
  ['PROCEDIMENTO', 'Procedimento'],
  ['INSTRUCAO', 'Instrução'],
  ['REGULAMENTO', 'Regulamento'],
  ['FORMULARIO', 'Formulário'],
  ['OUTRO', 'Outro'],
];

export const MATERIAL_TIPO_DOCUMENTO_CHOICES = [
  ['AUTO', 'Auto'],
  ['COMUNICACAO', 'Comunicação'],
  ['IS', 'IS'],
  ['NPA', 'NPA'],
  ['FORMULARIO', 'Formulário'],
  ['MODELO', 'Modelo'],
  ['NORMAS_MANUAIS', 'Normas e Manuais'],
  ['ORIENTACAO', 'Orientação'],
  ['LEGISLACAO', 'Legislação'],
  ['POP', 'POP'],
  ['PROCESSO', 'Processo'],
  ['PROTOCOLO', 'Protocolo'],
  ['GLOSSARIO', 'Glossário'],
  ['REQUISICAO', 'Requisição'],
  ['TERMO', 'Termo'],
  ['OUTRO', 'Outro'],
];

export const INVESTIGACAO_TIPO_OCORRENCIA_CHOICES = [
  ['ACIDENTE', 'Acidente'],
  ['INFORTÚNIO', 'Infortúnio'],
  ['INCIDENTE', 'Incidente'],
  ['ANOMALIA', 'Anomalia'],
  ['OUTRO', 'Outro'],
];

export const INVESTIGACAO_FASE_VOO_CHOICES = [
  ['LANCAMENTO', 'Lançamento'],
  ['ASCENSAO', 'Ascensão'],
  ['ORBITA', 'Órbita'],
  ['REENTRADA', 'Reentrada'],
  ['POUSO', 'Pouso'],
  ['PRE_LANCAMENTO', 'Pré-Lançamento'],
  ['OUTRO', 'Outro'],
];

// Espelha usuario/models.py
export const POSTO_GRADUACAO_CHOICES = [
  ['MB', 'Major-Brigadeiro'],
  ['BR', 'Brigadeiro'],
  ['CEL', 'Coronel'],
  ['TC', 'Tenente-Coronel'],
  ['MAJ', 'Major'],
  ['CAP', 'Capitão'],
  ['1T', '1º Tenente'],
  ['2T', '2º Tenente'],
  ['ASP', 'Aspirante a Oficial'],
  ['SO', 'Suboficial'],
  ['1S', '1º Sargento'],
  ['2S', '2º Sargento'],
  ['3S', '3º Sargento'],
  ['CB', 'Cabo'],
  ['CV', 'CIVIL'],
];

export const LOCAL_TRABALHO_CHOICES = [
  ['CENIPA', 'CENIPA'],
  ['SERIPA 1', 'SERIPA 1'],
  ['SERIPA 2', 'SERIPA 2'],
  ['SERIPA 3', 'SERIPA 3'],
  ['SERIPA 4', 'SERIPA 4'],
  ['SERIPA 5', 'SERIPA 5'],
  ['SERIPA 6', 'SERIPA 6'],
  ['SERIPA 7', 'SERIPA 7'],
  ['DCTA', 'DCTA'],
];

// Espelha ocorrencia/models.py:OcorrenciaRegistroRai (readme_rai.md) — RAI (Relatório de Ação Inicial)
export const RAI_PERIODO_DIA_CHOICES = [
  ['DIA', 'Dia'],
  ['NOITE', 'Noite'],
  ['CREPUSCULO', 'Crepúsculo'],
];

export const RAI_METEO_ORIGEM_CHOICES = [
  ['PILOTO', 'Piloto'],
  ['ORGAO_METEO', 'Órgão Meteorológico'],
  ['TESTEMUNHA', 'Testemunha'],
  ['OUTRO', 'Outro'],
];

export const RAI_METEO_VENTO_TIPO_CHOICES = [
  ['CALMO', 'Calmo'],
  ['VARIAVEL', 'Variável'],
  ['CONSTANTE', 'Constante'],
];

export const RAI_METEO_NEBULOSIDADE_CHOICES = [
  ['SKC', 'SKC'],
  ['FEW', 'FEW'],
  ['SCT', 'SCT'],
  ['BKN', 'BKN'],
  ['OVC', 'OVC'],
];

export const RAI_METEO_PERIODO_DIA_CHOICES = [
  ['DIA', 'Dia'],
  ['NOITE', 'Noite'],
  ['CREPUSCULO_MATUTINO', 'Crepúsculo Matutino'],
  ['CREPUSCULO_VESPERTINO', 'Crepúsculo Vespertino'],
];

export const RAI_CROQUI_TIPO_CHOICES = [
  ['SITIO_LANCAMENTO', 'Sítio de Lançamento'],
  ['TRAJETORIA', 'Trajetória'],
  ['DESTROCOS', 'Destroços'],
  ['OUTRO', 'Outro'],
];

export const RAI_DESTROCOS_TERRENO_CHOICES = [
  ['PLANO', 'Plano'],
  ['ACIDENTADO', 'Acidentado'],
  ['ALAGADO', 'Alagado'],
  ['URBANO', 'Urbano'],
  ['MAR', 'Mar'],
  ['OUTRO', 'Outro'],
];

export const RAI_DESTROCOS_VEGETACAO_CHOICES = [
  ['NENHUMA', 'Nenhuma'],
  ['RASTEIRA', 'Rasteira'],
  ['ARBUSTIVA', 'Arbustiva'],
  ['FLORESTA', 'Floresta'],
  ['DENSA', 'Densa'],
];

export const RAI_DESTROCOS_ACESSO_CHOICES = [
  ['FACIL', 'Fácil'],
  ['DIFICIL', 'Difícil'],
  ['INACESSIVEL', 'Inacessível'],
];

export const RAI_DESTROCOS_TIPO_IMPACTO_CHOICES = [
  ['PONTO_UNICO', 'Ponto Único'],
  ['DISPERSO', 'Disperso'],
  ['RASTRO', 'Rastro'],
];
