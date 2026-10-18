import { z } from 'zod';

// Espelha só os campos marcados `required` no formulário/no model
// (backend/ocorrencia/models.py: `cidade`/`aerodromo` são FK não-nuláveis;
// `classificacao`/`tipo`/`dia` já eram obrigatórios via atributo HTML) —
// não amplia o conjunto de campos obrigatórios além do que já existe.

const requiredChoice = (message: string) => z.string().trim().min(1, message);
const requiredId = (message: string) =>
  z
    .union([z.number(), z.null(), z.undefined()])
    .refine((v) => v != null, { message });

export const redigirOcorrenciaSchema = z.object({
  classificacao: requiredChoice('Selecione a classificação'),
  tipo: requiredChoice('Selecione o tipo'),
  dia: z.string().trim().min(1, 'Informe a data da ocorrência'),
  cidade: requiredId('Selecione a cidade'),
  aerodromo: requiredChoice('Selecione a organização do segmento espacial'),
});

const requiredValue = (message: string) => z.string().trim().min(1, message);

// Aba Geral do detalhe — mesmos campos já marcados `required` no JSX hoje
// (não amplia o conjunto).
export const geralTabSchema = z.object({
  classificacao: requiredChoice('Selecione a classificação'),
  tipo: requiredChoice('Selecione o tipo'),
  dia: requiredValue('Informe o dia'),
  horario: requiredValue('Informe a hora'),
  dia_utc: requiredValue('Informe o dia UTC'),
  horario_utc: requiredValue('Informe a hora UTC'),
  cidade: requiredId('Selecione a cidade'),
  aerodromo: requiredChoice('Selecione a organização do segmento espacial'),
  danos_terceiros: requiredChoice('Selecione os danos a terceiros'),
  historico: requiredValue('Informe o histórico'),
});

// Aba Artefato Espacial — só `artefato_espacial` é obrigatório no JSX atual.
export const artefatoTabSchema = z.object({
  artefato_espacial: requiredId('Selecione o artefato espacial'),
});

const optionalText = (max: number) => z.string().trim().max(max, `Máximo ${max} caracteres`).optional().nullable();
// Arquivo de <input type="file"> — o estado guarda File | null.
const requiredFile = (message: string) => z.any().refine((v) => v != null, { message });

// Aba Gestão, formulário "Adicionar Membro" — só `investigador` é
// obrigatório; os textos respeitam o max_length de OcorrenciaComissao.
export const comissaoMembroSchema = z.object({
  investigador: requiredId('Selecione o investigador'),
  observacoes: optionalText(200),
  identificacao_rai: optionalText(100),
});

// RAI seção 15 — edição avulsa da identificação de um membro.
export const comissaoIdentificacaoSchema = z.object({
  identificacao_rai: optionalText(100),
});

// Aba Controle — tudo opcional em OcorrenciaControle; só o texto livre
// tem limite.
export const controleTabSchema = z.object({
  numero_relatorio: optionalText(100),
});

// Aba Documentos — o envio só faz sentido com arquivo (o botão já exigia).
export const documentoUploadSchema = z.object({
  arquivo: requiredFile('Selecione o arquivo'),
  descricao: optionalText(2000),
});

// Aba Internacional — OcorrenciaAsoaci, tudo opcional.
export const asoaciTabSchema = z.object({
  destino_notificacao: optionalText(100),
  nome_rep_acred: optionalText(100),
});

// Aba Divulgação — OcorrenciaRelatorio, tudo opcional.
export const divulgacaoTabSchema = z.object({
  comunicar_elos: optionalText(100),
});

// Aba Divulgação, "Adicionar Recomendação" — `descricao` é obrigatória.
export const recomendacaoSchema = z.object({
  descricao: requiredValue('Informe a descrição da recomendação'),
});

// Painel de Revisão RF, "Fazer Feedback" — setor e comentário já eram
// `required` no JSX.
export const revisaoFeedbackSchema = z.object({
  setor: requiredChoice('Selecione a área/setor'),
  comentario: requiredValue('Informe o comentário'),
});

// RAI seção 3 — Pessoal Envolvido. O botão já exigia `nome`.
export const raiPessoalSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome').max(200, 'Máximo 200 caracteres'),
  funcao: optionalText(100),
});

// RAI seção 10 — Fotografias (até 15; o input já usava min=1 max=15).
export const raiFotoSchema = z.object({
  arquivo: requiredFile('Selecione a imagem'),
  numero: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .refine((v) => {
      if (v == null || v === '') return true;
      const n = Number(v);
      return Number.isInteger(n) && n >= 1 && n <= 15;
    }, 'Número entre 1 e 15')
    .optional(),
  descricao: optionalText(300),
});

// ── RAI (Relatório de Ação Inicial) ──
// backend/ocorrencia/models.py: todo campo de OcorrenciaRegistroRai é
// deliberadamente opcional (preenchimento incremental por seção, ver
// readme_rai.md) — não há nada pra marcar como obrigatório aqui. O ganho
// real de validação está nos campos numéricos: o input já é `type="number"`
// mas o valor chega como string (`set(f.name, e.target.value)`, sem
// Number()) — então valida como string numérica, checando faixa onde a
// grandeza física impõe um limite natural (graus 0–360, valores que não
// podem ser negativos), sem inventar limite nenhum pros que não têm um
// (temperatura pode ser negativa, por exemplo).

const currentYearRai = new Date().getFullYear();

function asNumberOrEmpty(v: unknown): number | null {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isNaN(n) ? NaN : n;
}

// `.optional()` no fim: sem ele o Zod 4 rejeita a chave ausente (campo
// nunca tocado) com "expected nonoptional".
const optionalNumericString = (message = 'Deve ser um número válido') =>
  z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .refine((v) => {
      const n = asNumberOrEmpty(v);
      return n === null || !Number.isNaN(n);
    }, message)
    .optional();

const rangedNumericString = (min: number, max: number, message: string) =>
  z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .refine((v) => {
      const n = asNumberOrEmpty(v);
      return n === null || (!Number.isNaN(n) && n >= min && n <= max);
    }, message)
    .optional();

const nonNegativeNumericString = (message = 'Deve ser zero ou positivo') =>
  z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .refine((v) => {
      const n = asNumberOrEmpty(v);
      return n === null || (!Number.isNaN(n) && n >= 0);
    }, message)
    .optional();

export const raiFormSchema = z.object({
  ano_fabricacao_rai: rangedNumericString(1900, currentYearRai + 1, `Ano entre 1900 e ${currentYearRai + 1}`),
  meteo_vento_direcao: rangedNumericString(0, 360, 'Direção entre 0 e 360 graus'),
  meteo_vento_velocidade: nonNegativeNumericString(),
  meteo_vento_rajada: nonNegativeNumericString(),
  meteo_visibilidade_km: nonNegativeNumericString(),
  meteo_teto_ft: nonNegativeNumericString(),
  meteo_temperatura_c: optionalNumericString(),
  meteo_ponto_orvalho_c: optionalNumericString(),
  meteo_pressao_hpa: nonNegativeNumericString(),
  destrocos_altitude_m: nonNegativeNumericString(),
  destrocos_angulo_impacto: rangedNumericString(0, 360, 'Ângulo entre 0 e 360 graus'),
  destrocos_area_dispersao_m2: nonNegativeNumericString(),
  destrocos_direcao_dispersao: rangedNumericString(0, 360, 'Direção entre 0 e 360 graus'),
  destrocos_peca_mais_distante_m: nonNegativeNumericString(),
  custo_artefato: nonNegativeNumericString('O valor não pode ser negativo'),
  custo_danos_terceiros: nonNegativeNumericString('O valor não pode ser negativo'),
  custo_operacao_resgate: nonNegativeNumericString('O valor não pode ser negativo'),
});
