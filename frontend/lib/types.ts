export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type OcorrenciaStatus = 'CONFIRMAR' | 'AUTENTICAR' | 'AUTENTICADO';

export type OcorrenciaGeral = {
  id: number;
  status: OcorrenciaStatus;
  numero_processo: string | null;
  publico: boolean | null;
  classificacao: string | null;
  tipo: string | null;
  dia_comunicacao: string | null;
  dia: string | null;
  horario: string | null;
  dia_utc: string | null;
  horario_utc: string | null;
  cidade: number;
  local: string | null;
  aerodromo: number;
  latitude: string | null;
  longitude: string | null;
  latitude_decimal: string | null;
  longitude_decimal: string | null;
  danos_terceiros: string | null;
  localizacao_tipo: string | null;
  orbita_tipo: string | null;
  tle: string | null;
  apogeu: string | null;
  perigeu: string | null;
  inclinacao: string | null;
  local_impacto: string | null;
  latitude_impacto: string | null;
  longitude_impacto: string | null;
  historico: string | null;
  observacao: string | null;
  cadastrado_por_id: number;
  cadastrado_em: string;
  artefatos: RevisaoPainelArtefato[];
};

export type VeiculoLancador = {
  id: number;
  altura_metros: number | null;
  diametro_metros: number | null;
  massa_total_kg: number | null;
  tipo_propulsao: string;
  reutilizavel: boolean;
  artefato: number;
};

export type OcorrenciaAeronave = {
  id: number;
  ocorrencia: number;
  artefato_espacial: number | null;
  artefato_espacial_detail: VeiculoLancador | null;
  operador: string | null;
  operador_detalhe: string | null;
  tipo: string | null;
  danos: string | null;
  fase_missao: string | null;
  observacoes: string | null;
  veiculo_lancador: string | null;
  massa_total: string | null;
  dimensoes: string | null;
  vida_util_prevista: string | null;
  sistema_propulsao: string | null;
  sistema_controle_atitude: string | null;
  sistema_energia: string | null;
  sistema_comunicacao: string | null;
  sistema_navegacao: string | null;
  software_bordo: string | null;
  dados_telemetria_brutos: string | null;
  dados_telemetria_processados: string | null;
  logs_eventos_falhas: string | null;
  ultimos_comandos_enviados: string | null;
  estado_subsistemas_antes_evento: string | null;
  dados_orbitais_antes_depois: string | null;
  evidencia_falha: string | null;
};

export type OcorrenciaAeronaveTripulante = {
  id: number;
  ocorrencia_aeronave: number;
  nome: string | null;
  cpf: string | null;
  funcao: string | null;
  licenca: string | null;
  habilitacao: string | null;
  validade_cma: string | null;
  validade_habilitacao: string | null;
  horas_totais: string | null;
  horas_equipamento: string | null;
  horas_ultimos_30_dias: string | null;
  horas_ultimas_24_horas: string | null;
  idade: number | null;
  formacao: string | null;
  observacoes: string | null;
};

export type OcorrenciaAeronaveLesao = {
  id: number;
  ocorrencia_aeronave: number;
  tipo_lesao: string | null;
  categoria: string | null;
  quantidade: number | null;
  descricao: string | null;
  observacoes: string | null;
};

export type OcorrenciaConfirmacao = {
  id: number;
  ocorrencia: number;
  usuario: number | null;
  data_confirmacao: string | null;
};

export type OcorrenciaAutenticacao = {
  id: number;
  ocorrencia: number;
  usuario: number | null;
  data_autenticacao: string | null;
};

export type OcorrenciaDocumento = {
  id: number;
  ocorrencia: number;
  tipo_documento: string | null;
  arquivo: string | null;
  cadastrado_por_id: number | null;
  cadastrado_em: string;
};

export type OcorrenciaControle = {
  id: number;
  ocorrencia: number;
  status: string | null;
  orgao_investigador: string | null;
  fez_acao_inicial: string | null;
  investigador: number | null;
  tipo_relatorio: string | null;
  numero_relatorio: string | null;
  prioridade: string | null;
  situacao_investigacao: string | null;
  fase_atual: string | null;
  observacoes: string | null;
  cadastrado_em: string;
};

export type OcorrenciaComissao = {
  id: number;
  ocorrencia: number;
  investigador: number | null;
  funcao: string | null;
  observacoes: string | null;
  identificacao_rai: string | null;
};

export type OcorrenciaAsoaci = {
  id: number;
  ocorrencia: number;
  initial_notification: string | null;
  destino_notificacao: string | null;
  dia_envio_notificacao: string | null;
  tem_rep_acred: string | null;
  nome_rep_acred: string | null;
  observacoes: string | null;
};

export type OcorrenciaRelatorio = {
  id: number;
  ocorrencia: number;
  relatorio_pt: string | null;
  relatorio_en: string | null;
  relatorio_es: string | null;
  publicar_site_sipae: boolean;
  comunicar_elos: string | null;
  observacoes: string | null;
  data_assinatura: string | null;
  data_publicacao: string | null;
  data_cadastro: string | null;
};

export type OcorrenciaRevisaoRelatorio = {
  id: number;
  ocorrencia: number;
  data_atribuicao: string | null;
  setor: string | null;
  revisor: number | null;
  anexo: string | null;
  observacao: string | null;
  cadastrado_por: number | null;
  cadastrado_em: string | null;
};

export type ArtefatoEspacial = {
  id: number;
  designacao: string;
  numero_serie: string | null;
  fabricante: string | null;
  operador: string | null;
  pais_fabricacao: string | null;
  pais_operador: string | null;
  ano_fabricacao: number | null;
  tipo_artefato: string;
  status: string | null;
  criado_em: string;
};

export type GeografiaPais = {
  id: number;
  nome: string | null;
  nome_codigo: string | null;
  idioma_codigo: string | null;
  continente: string | null;
};

export type GeografiaUf = {
  id: number;
  nome: string | null;
  pais: number;
  nome_codigo: string | null;
  regiao: string | null;
  comar: string | null;
};

export type GeografiaCidade = {
  id: number;
  nome: string;
  uf: number;
  pais: number;
  latitude: string | null;
  longitude: string | null;
  altitude: string | null;
};

export type AerodromoGeral = {
  id: number;
  nome: string;
  icao: string | null;
  cidade: number;
  iata: string | null;
  propriedade: string | null;
  tipo: string | null;
  latitude: string | null;
  longitude: string | null;
  latitude_decimal: string | null;
  longitude_decimal: string | null;
  altitude: string | null;
  vfr_diurno: string | null;
  vfr_noturno: string | null;
  ifr_diurno: string | null;
  ifr_noturno: string | null;
};

export type MaterialApoio = {
  id: number;
  titulo: string;
  categoria: string;
  tipo_documento: string;
  numero_norma: string | null;
  divisao_responsavel: string | null;
  setor_responsavel: string | null;
  pessoa_responsavel: number | null;
  pessoa_responsavel_display: string | null;
  tipo_documento_display: string | null;
  data_emissao: string | null;
  data_efetivacao: string | null;
  data_aprovacao: string | null;
  data_publicacao: string | null;
  documento_word: string | null;
  documento_pdf: string | null;
  observacoes: string | null;
  cadastrado_por_id: number | null;
  cadastrado_em: string;
};

export type InvestigacaoOutrasAutoridades = {
  id: number;
  titulo: string;
  pais: string;
  autoridade_investigadora: string;
  numero_relatorio: string | null;
  veiculo: string | null;
  operador: string | null;
  tipo_ocorrencia: string;
  fase_voo: string | null;
  data_ocorrencia: string | null;
  data_publicacao: string | null;
  documento_pdf: string | null;
  observacoes: string | null;
  cadastrado_por_id: number | null;
  cadastrado_em: string;
};

export type Group = {
  id: number;
  name: string;
  permissions: number[];
};

export type OcorrenciaRegistroRai = {
  id: number;
  ocorrencia: number;
  historico_evento: string | null;
  sequencia_falhas: string | null;
  dados_telemetria_rai: string | null;
  periodo_dia: string | null;
  tempo_ate_acao_inicial: string | null;
  fonte_informacao_ocorrencia: string | null;
  informacoes_operacionais: string | null;
  procedimentos_em_execucao: string | null;
  desvios_procedimento: string | null;
  fabricante_rai: string | null;
  modelo_rai: string | null;
  ano_fabricacao_rai: number | null;
  numero_serie_rai: string | null;
  horas_ciclos_rai: string | null;
  observacoes_artefato_rai: string | null;
  instalacoes_envolvidas: string | null;
  comentarios_instalacoes: string | null;
  condicoes_ambientais: string | null;
  meteo_origem_informacao: string | null;
  meteo_vento_direcao: number | null;
  meteo_vento_velocidade: string | null;
  meteo_vento_rajada: string | null;
  meteo_vento_tipo: string | null;
  meteo_visibilidade_km: string | null;
  meteo_teto_ft: number | null;
  meteo_nebulosidade: string | null;
  meteo_temperatura_c: string | null;
  meteo_ponto_orvalho_c: string | null;
  meteo_pressao_hpa: string | null;
  meteo_periodo_dia: string | null;
  meteo_chuva: boolean | null;
  meteo_trovao: boolean | null;
  meteo_nevoeiro: boolean | null;
  meteo_granizo: boolean | null;
  meteo_turbulencia: boolean | null;
  meteo_gelo: boolean | null;
  meteo_clima_espacial: string | null;
  meteo_radiacao_solar: string | null;
  meteo_debris_espacial: string | null;
  meteo_observacoes: string | null;
  croqui_tipo: string | null;
  croqui_escala: string | null;
  croqui_descricao: string | null;
  croqui_norte_magnetico: boolean | null;
  croqui_arquivo: string | null;
  croqui_observacoes: string | null;
  destrocos_localizacao: string | null;
  destrocos_latitude: string | null;
  destrocos_longitude: string | null;
  destrocos_altitude_m: string | null;
  destrocos_tipo_terreno: string | null;
  destrocos_vegetacao: string | null;
  destrocos_acesso: string | null;
  destrocos_angulo_impacto: number | null;
  destrocos_velocidade_impacto: string | null;
  destrocos_area_dispersao_m2: string | null;
  destrocos_direcao_dispersao: number | null;
  destrocos_peca_mais_distante_m: string | null;
  destrocos_tipo_impacto: string | null;
  destrocos_fogo: boolean | null;
  destrocos_fogo_antes_impacto: boolean | null;
  destrocos_fogo_durante_impacto: boolean | null;
  destrocos_fogo_apos_impacto: boolean | null;
  destrocos_fogo_combatido: boolean | null;
  destrocos_fogo_descricao: string | null;
  destrocos_fuselagem: boolean | null;
  destrocos_motor: boolean | null;
  destrocos_paineis_solares: boolean | null;
  destrocos_bateria: boolean | null;
  destrocos_eletronico: boolean | null;
  destrocos_tanque: boolean | null;
  destrocos_combustivel_derramado: boolean | null;
  destrocos_material_perigoso: boolean | null;
  destrocos_descricao_geral: string | null;
  destrocos_observacoes: string | null;
  danos_terceiros_descricao: string | null;
  danos_terceiros_observacoes: string | null;
  informacoes_adicionais: string | null;
  informacoes_adicionais_obs: string | null;
  custo_artefato: string | null;
  custo_danos_terceiros: string | null;
  custo_operacao_resgate: string | null;
  custo_observacoes: string | null;
  procedimento_policia: boolean | null;
  procedimento_ministerio_publico: boolean | null;
  procedimento_ib: boolean | null;
  procedimento_defesa_civil: boolean | null;
  procedimento_outro: boolean | null;
  procedimento_outro_descricao: string | null;
  dificuldades_investigacao: string | null;
  adm_observacoes: string | null;
  criticas: string | null;
  status_rai: 'RASCUNHO' | 'FINALIZADO';
  data_rai: string | null;
  responsavel_rai: number | null;
  observacoes: string | null;
  cadastrado_em: string | null;
  atualizado_em: string | null;
};

export type OcorrenciaRaiPessoal = {
  id: number;
  rai: number;
  funcao: string | null;
  nome: string | null;
  contato: string | null;
  lesoes: string | null;
  posicao_no_evento: string | null;
  observacoes: string | null;
};

export type OcorrenciaRaiFoto = {
  id: number;
  rai: number;
  arquivo: string;
  numero: number | null;
  descricao: string | null;
  data_foto: string | null;
};

export type RevisaoPainelArtefato = {
  nome: string | null;
  tipo: string | null;
  operador: string | null;
  danos: string | null;
  massa_total: string | null;
  veiculo_lancador: string | null;
  evidencia_falha: string | null;
};

export type RevisaoPainelRow = {
  id: number;
  ocorrencia_id: number;
  classificacao: string | null;
  prioridade: string | null;
  prioridade_display: string | null;
  data_atribuicao: string | null;
  revisor: string | null;
  setor: string | null;
  setor_display: string | null;
  observacao: string | null;
  artefatos: RevisaoPainelArtefato[];
};

export type AuditLogEntryEntry = {
  id: number;
  action: number;
  action_display: string;
  actor: string | null;
  object_pk: string;
  object_repr: string;
  changes: Record<string, [unknown, unknown]> | null;
  timestamp: string;
};

export type AuditTrail = {
  entries: AuditLogEntryEntry[];
  related: { label: string; anchor: string; entries: AuditLogEntryEntry[] }[];
};

export type Atividade = {
  id: number;
  action: number; // 0=create, 1=update, 2=delete, 3=access (django-auditlog)
  action_display: string;
  model: string | null;
  model_verbose: string | null;
  object_repr: string;
  object_pk: string;
  timestamp: string;
};

export type Usuario = {
  id: number;
  email: string;
  nome: string;
  nome_guerra: string | null;
  password?: string;
  is_staff: boolean;
  is_superuser: boolean;
  posto_graduacao: string | null;
  hierarquia_posto_graduacao: number | null;
  credencial: string;
  qualificacao: string;
  local_trabalho: string;
  telefone: number | null;
  cpf: number | null;
  investigador: number | null;
  ojt: string | null;
  trilha_capacitacao: string | null;
  totp_enabled: boolean;
  totp_obrigatorio: boolean;
  groups: number[];
};
