// Espelha os choices de ocorrencia/models.py. Hardcoded por enquanto —
// idealmente viria de um endpoint GET /api/meta/choices/ (ver plano de
// migração) pra não duplicar as ~40 listas de choices do backend em TS.

export const CLASSIFICACAO_CHOICES = [
  ['ACIDENTE', 'ACIDENTE'],
  ['INCIDENTE', 'INCIDENTE'],
  ['INFORTÚNIO', 'INFORTÚNIO'],
];

export const TIPO_OCORRENCIA_CHOICES = [
  ['explosao', 'Explosão'],
  ['falha_estagio', 'Falha de Estágio'],
  ['perda_telemetria', 'Perda de Telemetria'],
  ['falha_motor', 'Falha de Motor'],
  ['reentrada_nao_controlada', 'Reentrada Não Controlada'],
  ['colisao_orbital', 'Colisão Orbital'],
  ['outro', 'Outro'],
];

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
