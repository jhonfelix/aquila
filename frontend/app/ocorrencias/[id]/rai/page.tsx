'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, History, Plus, Save, Trash2 } from 'lucide-react';
import { apiFetch, primeCsrf, fetchMe, ApiError } from '@/lib/api';
import { toast } from '@/lib/toast';
import { validate } from '@/lib/validation';
import { raiFormSchema } from '@/lib/schemas/ocorrencia';
import { formatUsuario, formatShortDate } from '@/lib/format';
import type {
  OcorrenciaGeral,
  OcorrenciaAeronave,
  OcorrenciaRegistroRai,
  OcorrenciaRaiPessoal,
  OcorrenciaRaiFoto,
  OcorrenciaComissao,
  Usuario,
  Paginated,
} from '@/lib/types';
import AppShell from '@/components/AppShell';
import AsyncCombobox from '@/components/AsyncCombobox';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  ErrorText,
  Field,
  PageContainer,
  Select,
  Spinner,
  buttonClass,
  errorRingClass,
  fileInputClass,
  inputClass,
} from '@/lib/ui';
import { cn } from '@/lib/cn';
import {
  RAI_PERIODO_DIA_CHOICES,
  RAI_METEO_ORIGEM_CHOICES,
  RAI_METEO_VENTO_TIPO_CHOICES,
  RAI_METEO_NEBULOSIDADE_CHOICES,
  RAI_METEO_PERIODO_DIA_CHOICES,
  RAI_CROQUI_TIPO_CHOICES,
  RAI_DESTROCOS_TERRENO_CHOICES,
  RAI_DESTROCOS_VEGETACAO_CHOICES,
  RAI_DESTROCOS_ACESSO_CHOICES,
  RAI_DESTROCOS_TIPO_IMPACTO_CHOICES,
  LESAO_TIPO_CHOICES,
  COMISSAO_FUNCAO_CHOICES,
} from '@/lib/choices';

const userLabel = (u: Usuario) => formatUsuario(u);

type FieldCfg = {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'checkbox' | 'select';
  choices?: string[][];
};

const SEC_HISTORICO: FieldCfg[] = [
  { name: 'historico_evento', label: 'Histórico do Evento', type: 'textarea' },
  { name: 'sequencia_falhas', label: 'Sequência de Falhas', type: 'textarea' },
  { name: 'dados_telemetria_rai', label: 'Dados de Telemetria', type: 'textarea' },
];

const SEC_GERAL: FieldCfg[] = [
  { name: 'periodo_dia', label: 'Período do Dia', type: 'select', choices: RAI_PERIODO_DIA_CHOICES },
  { name: 'tempo_ate_acao_inicial', label: 'Tempo até Ação Inicial', type: 'text' },
  { name: 'fonte_informacao_ocorrencia', label: 'Fonte da Informação', type: 'textarea' },
];

const SEC_OPERACIONAL: FieldCfg[] = [
  { name: 'informacoes_operacionais', label: 'Informações Operacionais', type: 'textarea' },
  { name: 'procedimentos_em_execucao', label: 'Procedimentos em Execução', type: 'textarea' },
  { name: 'desvios_procedimento', label: 'Desvios de Procedimento', type: 'textarea' },
];

const SEC_ARTEFATO: FieldCfg[] = [
  { name: 'fabricante_rai', label: 'Fabricante', type: 'text' },
  { name: 'modelo_rai', label: 'Modelo', type: 'text' },
  { name: 'ano_fabricacao_rai', label: 'Ano de Fabricação', type: 'number' },
  { name: 'numero_serie_rai', label: 'Número de Série', type: 'text' },
  { name: 'horas_ciclos_rai', label: 'Horas/Ciclos de Operação', type: 'text' },
  { name: 'observacoes_artefato_rai', label: 'Observações', type: 'textarea' },
];

const SEC_INSTALACOES: FieldCfg[] = [
  { name: 'instalacoes_envolvidas', label: 'Instalações Envolvidas', type: 'textarea' },
  { name: 'comentarios_instalacoes', label: 'Comentários', type: 'textarea' },
];

const SEC_METEO: FieldCfg[] = [
  { name: 'condicoes_ambientais', label: 'Condições Ambientais (geral)', type: 'textarea' },
  { name: 'meteo_origem_informacao', label: 'Origem da Informação', type: 'select', choices: RAI_METEO_ORIGEM_CHOICES },
  { name: 'meteo_vento_direcao', label: 'Direção do Vento (graus)', type: 'number' },
  { name: 'meteo_vento_velocidade', label: 'Velocidade do Vento', type: 'number' },
  { name: 'meteo_vento_rajada', label: 'Rajada de Vento', type: 'number' },
  { name: 'meteo_vento_tipo', label: 'Tipo de Vento', type: 'select', choices: RAI_METEO_VENTO_TIPO_CHOICES },
  { name: 'meteo_visibilidade_km', label: 'Visibilidade (km)', type: 'number' },
  { name: 'meteo_teto_ft', label: 'Teto (pés)', type: 'number' },
  { name: 'meteo_nebulosidade', label: 'Nebulosidade', type: 'select', choices: RAI_METEO_NEBULOSIDADE_CHOICES },
  { name: 'meteo_temperatura_c', label: 'Temperatura (°C)', type: 'number' },
  { name: 'meteo_ponto_orvalho_c', label: 'Ponto de Orvalho (°C)', type: 'number' },
  { name: 'meteo_pressao_hpa', label: 'Pressão Atmosférica (hPa)', type: 'number' },
  { name: 'meteo_periodo_dia', label: 'Período do Dia (Meteo)', type: 'select', choices: RAI_METEO_PERIODO_DIA_CHOICES },
  { name: 'meteo_chuva', label: 'Chuva', type: 'checkbox' },
  { name: 'meteo_trovao', label: 'Trovão', type: 'checkbox' },
  { name: 'meteo_nevoeiro', label: 'Nevoeiro', type: 'checkbox' },
  { name: 'meteo_granizo', label: 'Granizo', type: 'checkbox' },
  { name: 'meteo_turbulencia', label: 'Turbulência', type: 'checkbox' },
  { name: 'meteo_gelo', label: 'Formação de Gelo', type: 'checkbox' },
  { name: 'meteo_clima_espacial', label: 'Clima Espacial', type: 'textarea' },
  { name: 'meteo_radiacao_solar', label: 'Radiação Solar', type: 'text' },
  { name: 'meteo_debris_espacial', label: 'Debris Espacial', type: 'textarea' },
  { name: 'meteo_observacoes', label: 'Observações Meteorológicas', type: 'textarea' },
];

const SEC_CROQUI: FieldCfg[] = [
  { name: 'croqui_tipo', label: 'Tipo de Croqui', type: 'select', choices: RAI_CROQUI_TIPO_CHOICES },
  { name: 'croqui_escala', label: 'Escala', type: 'text' },
  { name: 'croqui_descricao', label: 'Descrição', type: 'textarea' },
  { name: 'croqui_norte_magnetico', label: 'Referência ao Norte Magnético', type: 'checkbox' },
  { name: 'croqui_observacoes', label: 'Observações', type: 'textarea' },
];

const SEC_DESTROCOS: FieldCfg[] = [
  { name: 'destrocos_localizacao', label: 'Localização', type: 'textarea' },
  { name: 'destrocos_latitude', label: 'Latitude', type: 'text' },
  { name: 'destrocos_longitude', label: 'Longitude', type: 'text' },
  { name: 'destrocos_altitude_m', label: 'Altitude (m)', type: 'number' },
  { name: 'destrocos_tipo_terreno', label: 'Tipo de Terreno', type: 'select', choices: RAI_DESTROCOS_TERRENO_CHOICES },
  { name: 'destrocos_vegetacao', label: 'Vegetação', type: 'select', choices: RAI_DESTROCOS_VEGETACAO_CHOICES },
  { name: 'destrocos_acesso', label: 'Acesso ao Local', type: 'select', choices: RAI_DESTROCOS_ACESSO_CHOICES },
  { name: 'destrocos_angulo_impacto', label: 'Ângulo de Impacto (graus)', type: 'number' },
  { name: 'destrocos_velocidade_impacto', label: 'Velocidade de Impacto', type: 'text' },
  { name: 'destrocos_area_dispersao_m2', label: 'Área de Dispersão (m²)', type: 'number' },
  { name: 'destrocos_direcao_dispersao', label: 'Direção da Dispersão (graus)', type: 'number' },
  { name: 'destrocos_peca_mais_distante_m', label: 'Peça Mais Distante (m)', type: 'number' },
  { name: 'destrocos_tipo_impacto', label: 'Tipo de Impacto', type: 'select', choices: RAI_DESTROCOS_TIPO_IMPACTO_CHOICES },
  { name: 'destrocos_fogo', label: 'Houve Fogo', type: 'checkbox' },
  { name: 'destrocos_fogo_antes_impacto', label: 'Fogo Antes do Impacto', type: 'checkbox' },
  { name: 'destrocos_fogo_durante_impacto', label: 'Fogo Durante o Impacto', type: 'checkbox' },
  { name: 'destrocos_fogo_apos_impacto', label: 'Fogo Após o Impacto', type: 'checkbox' },
  { name: 'destrocos_fogo_combatido', label: 'Fogo Combatido', type: 'checkbox' },
  { name: 'destrocos_fogo_descricao', label: 'Descrição do Incêndio', type: 'textarea' },
  { name: 'destrocos_fuselagem', label: 'Fuselagem Encontrada', type: 'checkbox' },
  { name: 'destrocos_motor', label: 'Motor/Propulsor Encontrado', type: 'checkbox' },
  { name: 'destrocos_paineis_solares', label: 'Painéis Solares Encontrados', type: 'checkbox' },
  { name: 'destrocos_bateria', label: 'Baterias Encontradas', type: 'checkbox' },
  { name: 'destrocos_eletronico', label: 'Componentes Eletrônicos Encontrados', type: 'checkbox' },
  { name: 'destrocos_tanque', label: 'Tanque(s) de Combustível Encontrado(s)', type: 'checkbox' },
  { name: 'destrocos_combustivel_derramado', label: 'Derramamento de Combustível', type: 'checkbox' },
  { name: 'destrocos_material_perigoso', label: 'Material Perigoso no Local', type: 'checkbox' },
  { name: 'destrocos_descricao_geral', label: 'Descrição Geral', type: 'textarea' },
  { name: 'destrocos_observacoes', label: 'Observações', type: 'textarea' },
];

const SEC_DANOS_TERCEIROS: FieldCfg[] = [
  { name: 'danos_terceiros_descricao', label: 'Descrição', type: 'textarea' },
  { name: 'danos_terceiros_observacoes', label: 'Observações', type: 'textarea' },
];

const SEC_ADICIONAIS: FieldCfg[] = [
  { name: 'informacoes_adicionais', label: 'Informações Adicionais', type: 'textarea' },
  { name: 'informacoes_adicionais_obs', label: 'Observações Complementares', type: 'textarea' },
];

const SEC_ADMIN: FieldCfg[] = [
  { name: 'custo_artefato', label: 'Valor Estimado do Artefato (R$)', type: 'number' },
  { name: 'custo_danos_terceiros', label: 'Valor Estimado dos Danos a Terceiros (R$)', type: 'number' },
  { name: 'custo_operacao_resgate', label: 'Custo da Operação de Resgate (R$)', type: 'number' },
  { name: 'custo_observacoes', label: 'Observações sobre Custos', type: 'textarea' },
  { name: 'procedimento_policia', label: 'Acionamento de Polícia', type: 'checkbox' },
  { name: 'procedimento_ministerio_publico', label: 'Acionamento do Ministério Público', type: 'checkbox' },
  { name: 'procedimento_ib', label: 'Acionamento do IBAMA/ICMBio', type: 'checkbox' },
  { name: 'procedimento_defesa_civil', label: 'Acionamento da Defesa Civil', type: 'checkbox' },
  { name: 'procedimento_outro', label: 'Outro Procedimento Legal', type: 'checkbox' },
  { name: 'procedimento_outro_descricao', label: 'Descrição do Outro Procedimento', type: 'text' },
  { name: 'dificuldades_investigacao', label: 'Dificuldades na Investigação', type: 'textarea' },
  { name: 'adm_observacoes', label: 'Observações Administrativas', type: 'textarea' },
];

const SEC_CRITICAS: FieldCfg[] = [{ name: 'criticas', label: 'Críticas', type: 'textarea' }];

const SECTIONS = [
  { key: 'historico', label: '1. Histórico' },
  { key: 'geral', label: '2. Informações Gerais' },
  { key: 'pessoal', label: '3. Pessoal Envolvido' },
  { key: 'operacional', label: '4. Informações Operacionais' },
  { key: 'artefato', label: '5. Artefato' },
  { key: 'instalacoes', label: '6. Instalações' },
  { key: 'meteorologia', label: '7. Meteorologia' },
  { key: 'croqui', label: '8. Croqui' },
  { key: 'destrocos', label: '9. Destroços' },
  { key: 'fotografias', label: '10. Fotografias' },
  { key: 'danos_terceiros', label: '11. Danos a Terceiros' },
  { key: 'adicionais', label: '12. Informações Adicionais' },
  { key: 'administrativas', label: '13. Informações Administrativas' },
  { key: 'criticas', label: '14. Críticas' },
  { key: 'comissao', label: '15. Comissão de Investigação' },
] as const;

function renderField(f: FieldCfg, form: Record<string, any>, set: (name: string, v: any) => void, error?: string) {
  const value = form[f.name];
  switch (f.type) {
    case 'select':
      return <Select value={value ?? ''} onChange={(v) => set(f.name, v)} choices={f.choices || []} />;
    case 'checkbox':
      return <Checkbox checked={!!value} onChange={(v) => set(f.name, v)} />;
    case 'textarea':
      return (
        <textarea
          className={cn(inputClass, 'min-h-[80px]', error && errorRingClass)}
          value={value ?? ''}
          onChange={(e) => set(f.name, e.target.value)}
        />
      );
    case 'number':
      return (
        <input
          className={cn(inputClass, error && errorRingClass)}
          type="number"
          value={value ?? ''}
          onChange={(e) => set(f.name, e.target.value === '' ? null : e.target.value)}
        />
      );
    default:
      return (
        <input
          className={cn(inputClass, error && errorRingClass)}
          type="text"
          value={value ?? ''}
          onChange={(e) => set(f.name, e.target.value)}
        />
      );
  }
}

function FieldGrid({
  fields,
  form,
  set,
  errors,
}: {
  fields: FieldCfg[];
  form: Record<string, any>;
  set: (n: string, v: any) => void;
  errors?: Record<string, string>;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
      {fields.map((f) => (
        <div key={f.name} className={f.type === 'textarea' ? 'sm:col-span-2' : undefined}>
          <Field label={f.label} error={errors?.[f.name]}>
            {renderField(f, form, set, errors?.[f.name])}
          </Field>
        </div>
      ))}
    </div>
  );
}

function ReadOnlyRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="block text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</span>
      <span className="text-sm text-slate-700 dark:text-slate-300">{value ?? '-'}</span>
    </div>
  );
}

function GeralReadOnlyBlock({ oc }: { oc: OcorrenciaGeral }) {
  return (
    <div className="mb-5 grid grid-cols-2 gap-4 rounded-lg border border-mist-200 bg-mist-100/60 p-4 dark:border-space-700 dark:bg-space-800/30 sm:grid-cols-4">
      <ReadOnlyRow label="Nº Processo" value={oc.numero_processo} />
      <ReadOnlyRow label="Classificação" value={oc.classificacao} />
      <ReadOnlyRow label="Data" value={oc.dia ? formatShortDate(oc.dia) : null} />
      <ReadOnlyRow label="Hora Local" value={oc.horario} />
      <ReadOnlyRow label="Data UTC" value={oc.dia_utc ? formatShortDate(oc.dia_utc) : null} />
      <ReadOnlyRow label="Hora UTC" value={oc.horario_utc} />
      <ReadOnlyRow label="Local" value={oc.local} />
    </div>
  );
}

function ArtefatoReadOnlyBlock({ aeronave }: { aeronave: OcorrenciaAeronave | null }) {
  if (!aeronave) return <p className="mb-4 text-sm text-slate-400 dark:text-slate-500">Nenhum artefato espacial cadastrado ainda.</p>;
  return (
    <div className="mb-5 grid grid-cols-2 gap-4 rounded-lg border border-mist-200 bg-mist-100/60 p-4 dark:border-space-700 dark:bg-space-800/30 sm:grid-cols-4">
      <ReadOnlyRow label="Tipo" value={aeronave.tipo} />
      <ReadOnlyRow label="Operador" value={aeronave.operador} />
      <ReadOnlyRow label="Danos" value={aeronave.danos} />
      <ReadOnlyRow label="Fase da Missão" value={aeronave.fase_missao} />
    </div>
  );
}

function SalveRaiPrimeiro() {
  return <p className="text-sm text-slate-400 dark:text-slate-500">Salve o rascunho do RAI primeiro para habilitar esta seção.</p>;
}

export default function RaiWizardPage() {
  const params = useParams();
  const router = useRouter();
  const ocorrenciaId = Number(params.id);

  const [authChecked, setAuthChecked] = useState(false);
  const [oc, setOc] = useState<OcorrenciaGeral | null>(null);
  const [aeronave, setAeronave] = useState<OcorrenciaAeronave | null>(null);
  const [rai, setRai] = useState<OcorrenciaRegistroRai | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [section, setSection] = useState<string>('historico');
  const [croquiFile, setCroquiFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const [ocData, aeronaveData, raiData] = await Promise.all([
      apiFetch<OcorrenciaGeral>(`/api/ocorrencia/ocorrencias/${ocorrenciaId}/`),
      apiFetch<Paginated<OcorrenciaAeronave>>(`/api/ocorrencia/aeronaves/?ocorrencia=${ocorrenciaId}`),
      apiFetch<Paginated<OcorrenciaRegistroRai>>(`/api/ocorrencia/registro-rai/?ocorrencia=${ocorrenciaId}`),
    ]);
    setOc(ocData);
    setAeronave(aeronaveData.results[0] || null);
    const r = raiData.results[0] || null;
    setRai(r);
    setForm(r || {});
    setLoading(false);
  }, [ocorrenciaId]);

  useEffect(() => {
    fetchMe().then((me) => {
      if (!me) {
        router.replace('/login');
        return;
      }
      setAuthChecked(true);
      load().catch((err) => setError(err instanceof ApiError ? err.message : 'Erro ao carregar.'));
    });
  }, [load, router]);

  function set(name: string, value: any) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSave() {
    setError(null);
    setFieldErrors({});

    const result = validate(raiFormSchema, form);
    if (result.errors) {
      setFieldErrors(result.errors);
      setError('Corrija os campos destacados antes de salvar.');
      return;
    }

    setSaving(true);
    try {
      await primeCsrf();
      let saved: OcorrenciaRegistroRai;
      if (croquiFile) {
        const fd = new FormData();
        for (const [k, v] of Object.entries(form)) {
          if (v === null || v === undefined) continue;
          if (['id', 'ocorrencia', 'status_rai', 'cadastrado_em', 'atualizado_em', 'croqui_arquivo'].includes(k)) continue;
          fd.append(k, typeof v === 'boolean' ? String(v) : v);
        }
        fd.append('ocorrencia', String(ocorrenciaId));
        fd.append('croqui_arquivo', croquiFile);
        saved = rai
          ? await apiFetch<OcorrenciaRegistroRai>(`/api/ocorrencia/registro-rai/${rai.id}/`, { method: 'PATCH', body: fd })
          : await apiFetch<OcorrenciaRegistroRai>('/api/ocorrencia/registro-rai/', { method: 'POST', body: fd });
      } else {
        const payload: Record<string, any> = { ...form, ocorrencia: ocorrenciaId };
        delete payload.status_rai;
        delete payload.cadastrado_em;
        delete payload.atualizado_em;
        saved = rai
          ? await apiFetch<OcorrenciaRegistroRai>(`/api/ocorrencia/registro-rai/${rai.id}/`, { method: 'PATCH', body: JSON.stringify(payload) })
          : await apiFetch<OcorrenciaRegistroRai>('/api/ocorrencia/registro-rai/', { method: 'POST', body: JSON.stringify(payload) });
      }
      setRai(saved);
      setForm(saved);
      setCroquiFile(null);
      toast.success('Rascunho do RAI salvo');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao salvar RAI.';
      setError(message);
      toast.error('Erro ao salvar RAI', message);
    } finally {
      setSaving(false);
    }
  }

  async function handleFinalizar() {
    if (!rai) return;
    setError(null);
    setSaving(true);
    try {
      await primeCsrf();
      const updated = await apiFetch<OcorrenciaRegistroRai>(`/api/ocorrencia/registro-rai/${rai.id}/finalizar/`, { method: 'POST' });
      setRai(updated);
      setForm(updated);
      toast.success('RAI finalizado');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao finalizar RAI.';
      setError(message);
      toast.error('Erro ao finalizar RAI', message);
    } finally {
      setSaving(false);
    }
  }

  if (!authChecked || loading || !oc) {
    return (
      <AppShell title="RAI">
        <PageContainer wide>
          <ErrorText>{error}</ErrorText>
          {!error && (
            <div className="flex items-center gap-2 py-10 text-sm text-slate-400 dark:text-slate-500">
              <Spinner /> Carregando…
            </div>
          )}
        </PageContainer>
      </AppShell>
    );
  }

  return (
    <AppShell title="RAI">
      <PageContainer wide>
        <Link
          href={`/ocorrencias/${ocorrenciaId}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Voltar para a Ocorrência
        </Link>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              RAI — {oc.numero_processo || `Ocorrência #${oc.id}`}
            </h1>
            {rai && <Badge tone={rai.status_rai === 'FINALIZADO' ? 'success' : 'warning'}>{rai.status_rai === 'FINALIZADO' ? 'Finalizado' : 'Rascunho'}</Badge>}
          </div>
          <div className="flex items-center gap-2">
            {rai && (
              <Link href={`/auditoria/ocorrencia.ocorrenciaregistrorai/${rai.id}`} className={buttonClass('ghost')}>
                <History className="h-4 w-4" strokeWidth={1.75} />
                Histórico
              </Link>
            )}
            <Button variant="secondary" disabled={saving} onClick={handleSave}>
              {saving ? <Spinner /> : <Save className="h-4 w-4" strokeWidth={1.75} />}
              Salvar Rascunho
            </Button>
            {rai && rai.status_rai !== 'FINALIZADO' && (
              <Button disabled={saving} onClick={handleFinalizar}>
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
                Finalizar RAI
              </Button>
            )}
          </div>
        </div>

        <ErrorText>{error}</ErrorText>

        <Card className="mb-4">
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
            <Field label="Data de Elaboração do RAI">
              <input className={inputClass} type="date" value={form.data_rai ?? ''} onChange={(e) => set('data_rai', e.target.value)} />
            </Field>
            <Field label="Investigador Responsável">
              <AsyncCombobox apiPath="/api/usuarios/" value={form.responsavel_rai ?? null} onChange={(v) => set('responsavel_rai', v)} getLabel={userLabel} />
            </Field>
            <Field label="Observações Gerais">
              <input className={inputClass} type="text" value={form.observacoes ?? ''} onChange={(e) => set('observacoes', e.target.value)} />
            </Field>
          </div>
        </Card>

        <div className="flex flex-col gap-6 lg:flex-row">
          <nav className="flex gap-1 overflow-x-auto lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-visible lg:gap-0.5">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSection(s.key)}
                className={cn(
                  'shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  section === s.key
                    ? 'bg-accent-50 font-medium text-accent-800 dark:bg-accent-900/30 dark:text-accent-300'
                    : 'text-slate-600 hover:bg-mist-100 dark:text-slate-400 dark:hover:bg-space-800',
                )}
              >
                {s.label}
              </button>
            ))}
          </nav>

          <div className="min-w-0 flex-1">
            <Card>
              {section === 'historico' && <FieldGrid fields={SEC_HISTORICO} form={form} set={set} errors={fieldErrors} />}
              {section === 'geral' && (
                <>
                  <GeralReadOnlyBlock oc={oc} />
                  <FieldGrid fields={SEC_GERAL} form={form} set={set} errors={fieldErrors} />
                </>
              )}
              {section === 'pessoal' && (rai ? <PessoalSection raiId={rai.id} setError={setError} /> : <SalveRaiPrimeiro />)}
              {section === 'operacional' && <FieldGrid fields={SEC_OPERACIONAL} form={form} set={set} errors={fieldErrors} />}
              {section === 'artefato' && (
                <>
                  <ArtefatoReadOnlyBlock aeronave={aeronave} />
                  <FieldGrid fields={SEC_ARTEFATO} form={form} set={set} errors={fieldErrors} />
                </>
              )}
              {section === 'instalacoes' && <FieldGrid fields={SEC_INSTALACOES} form={form} set={set} errors={fieldErrors} />}
              {section === 'meteorologia' && <FieldGrid fields={SEC_METEO} form={form} set={set} errors={fieldErrors} />}
              {section === 'croqui' && (
                <>
                  <FieldGrid fields={SEC_CROQUI} form={form} set={set} errors={fieldErrors} />
                  <Field label="Arquivo do Croqui">
                    {typeof form.croqui_arquivo === 'string' && form.croqui_arquivo && (
                      <a
                        href={form.croqui_arquivo}
                        target="_blank"
                        rel="noreferrer"
                        className="mb-1.5 block text-sm text-accent-600 underline-offset-2 hover:underline dark:text-accent-400"
                      >
                        Arquivo atual
                      </a>
                    )}
                    <input className={fileInputClass} type="file" onChange={(e) => setCroquiFile(e.target.files?.[0] || null)} />
                  </Field>
                </>
              )}
              {section === 'destrocos' && <FieldGrid fields={SEC_DESTROCOS} form={form} set={set} errors={fieldErrors} />}
              {section === 'fotografias' && (rai ? <FotografiasSection raiId={rai.id} setError={setError} /> : <SalveRaiPrimeiro />)}
              {section === 'danos_terceiros' && <FieldGrid fields={SEC_DANOS_TERCEIROS} form={form} set={set} errors={fieldErrors} />}
              {section === 'adicionais' && <FieldGrid fields={SEC_ADICIONAIS} form={form} set={set} errors={fieldErrors} />}
              {section === 'administrativas' && <FieldGrid fields={SEC_ADMIN} form={form} set={set} errors={fieldErrors} />}
              {section === 'criticas' && <FieldGrid fields={SEC_CRITICAS} form={form} set={set} errors={fieldErrors} />}
              {section === 'comissao' && <ComissaoSection ocorrenciaId={ocorrenciaId} setError={setError} />}
            </Card>
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}

// ── Seção 3 — Pessoal Envolvido (repetível) ──
function PessoalSection({ raiId, setError }: { raiId: number; setError: (e: string | null) => void }) {
  const [itens, setItens] = useState<OcorrenciaRaiPessoal[]>([]);
  const [nome, setNome] = useState('');
  const [funcao, setFuncao] = useState('');
  const [lesoes, setLesoes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    apiFetch<Paginated<OcorrenciaRaiPessoal>>(`/api/ocorrencia/rai-pessoal/?rai=${raiId}`).then((data) => setItens(data.results));
  }, [raiId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd() {
    if (!nome) return;
    setError(null);
    setSaving(true);
    try {
      await primeCsrf();
      await apiFetch('/api/ocorrencia/rai-pessoal/', {
        method: 'POST',
        body: JSON.stringify({ rai: raiId, nome, funcao: funcao || null, lesoes: lesoes || null }),
      });
      setNome('');
      setFuncao('');
      setLesoes('');
      load();
      toast.success('Pessoa adicionada');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao adicionar pessoa.';
      setError(message);
      toast.error('Erro ao adicionar pessoa', message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: number) {
    if (!confirm('Remover esta pessoa?')) return;
    setError(null);
    try {
      await primeCsrf();
      await apiFetch(`/api/ocorrencia/rai-pessoal/${id}/`, { method: 'DELETE' });
      load();
      toast.success('Pessoa removida');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao remover pessoa.';
      setError(message);
      toast.error('Erro ao remover pessoa', message);
    }
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3">
        <Field label="Nome">
          <input className={inputClass} type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
        </Field>
        <Field label="Função no Evento">
          <input className={inputClass} type="text" value={funcao} onChange={(e) => setFuncao(e.target.value)} />
        </Field>
        <Field label="Lesões">
          <Select value={lesoes} onChange={setLesoes} choices={LESAO_TIPO_CHOICES} />
        </Field>
      </div>
      <Button type="button" disabled={saving || !nome} onClick={handleAdd}>
        {saving && <Spinner className="text-white" />}
        <Plus className="h-4 w-4" strokeWidth={2} />
        Adicionar Pessoa
      </Button>

      <div className="mt-4">
        {itens.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500">Nenhuma pessoa cadastrada ainda.</p>}
        {itens.map((p) => (
          <div key={p.id} className="flex items-center justify-between border-b border-mist-200 py-2.5 text-sm last:border-0 dark:border-space-700">
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-800 dark:text-slate-200">{p.nome || 'Pessoa'}</p>
              <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                {p.funcao || '-'} {p.lesoes ? `· ${LESAO_TIPO_CHOICES.find(([v]) => v === p.lesoes)?.[1] || p.lesoes}` : ''}
              </p>
            </div>
            <button
              onClick={() => handleRemove(p.id)}
              className="ml-3 shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
              title="Remover"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Seção 10 — Fotografias (repetível, upload) ──
function FotografiasSection({ raiId, setError }: { raiId: number; setError: (e: string | null) => void }) {
  const [itens, setItens] = useState<OcorrenciaRaiFoto[]>([]);
  const [descricao, setDescricao] = useState('');
  const [numero, setNumero] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    apiFetch<Paginated<OcorrenciaRaiFoto>>(`/api/ocorrencia/rai-fotos/?rai=${raiId}`).then((data) => setItens(data.results));
  }, [raiId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd() {
    if (!file) return;
    setError(null);
    setSaving(true);
    try {
      await primeCsrf();
      const fd = new FormData();
      fd.append('rai', String(raiId));
      fd.append('arquivo', file);
      if (descricao) fd.append('descricao', descricao);
      if (numero) fd.append('numero', numero);
      await apiFetch('/api/ocorrencia/rai-fotos/', { method: 'POST', body: fd });
      setDescricao('');
      setNumero('');
      setFile(null);
      load();
      toast.success('Fotografia enviada');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao enviar fotografia.';
      setError(message);
      toast.error('Erro ao enviar fotografia', message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: number) {
    if (!confirm('Remover esta fotografia?')) return;
    setError(null);
    try {
      await primeCsrf();
      await apiFetch(`/api/ocorrencia/rai-fotos/${id}/`, { method: 'DELETE' });
      load();
      toast.success('Fotografia removida');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao remover fotografia.';
      setError(message);
      toast.error('Erro ao remover fotografia', message);
    }
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3">
        <Field label="Número">
          <input className={inputClass} type="number" min="1" max="15" value={numero} onChange={(e) => setNumero(e.target.value)} />
        </Field>
        <Field label="Descrição/Legenda">
          <input className={inputClass} type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </Field>
        <Field label="Arquivo">
          <input className={fileInputClass} type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </Field>
      </div>
      <Button type="button" disabled={saving || !file} onClick={handleAdd}>
        {saving && <Spinner className="text-white" />}
        <Plus className="h-4 w-4" strokeWidth={2} />
        Adicionar Fotografia
      </Button>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {itens.map((f) => (
          <div key={f.id} className="group relative overflow-hidden rounded-lg border border-mist-200 dark:border-space-700">
            <a href={f.arquivo} target="_blank" rel="noreferrer">
              <img src={f.arquivo} alt={f.descricao || 'Fotografia'} className="h-28 w-full object-cover" />
            </a>
            <div className="p-2">
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{f.numero ? `#${f.numero} ` : ''}{f.descricao || '-'}</p>
            </div>
            <button
              onClick={() => handleRemove(f.id)}
              className="absolute right-1 top-1 rounded-md bg-white/90 p-1 text-slate-500 opacity-0 shadow-sm transition-opacity hover:text-red-600 group-hover:opacity-100 dark:bg-space-900/90"
              title="Remover"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>
        ))}
        {itens.length === 0 && <p className="col-span-full text-sm text-slate-400 dark:text-slate-500">Nenhuma fotografia enviada ainda.</p>}
      </div>
    </div>
  );
}

// ── Seção 15 — Comissão de Investigação (somente leitura + identificação no RAI) ──
function ComissaoSection({ ocorrenciaId, setError }: { ocorrenciaId: number; setError: (e: string | null) => void }) {
  const [membros, setMembros] = useState<OcorrenciaComissao[]>([]);
  const [edits, setEdits] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [investigadores, setInvestigadores] = useState<Record<number, Usuario>>({});

  const load = useCallback(() => {
    apiFetch<Paginated<OcorrenciaComissao>>(`/api/ocorrencia/comissao/?ocorrencia=${ocorrenciaId}`).then((data) => setMembros(data.results));
  }, [ocorrenciaId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const missing = Array.from(
      new Set(membros.map((m) => m.investigador).filter((id): id is number => id != null && !(id in investigadores))),
    );
    if (missing.length === 0) return;
    Promise.all(
      missing.map((id) =>
        apiFetch<Usuario>(`/api/usuarios/${id}/`)
          .then((u) => [id, u] as const)
          .catch(() => null),
      ),
    ).then((pairs) => {
      setInvestigadores((prev) => {
        const next = { ...prev };
        for (const p of pairs) if (p) next[p[0]] = p[1];
        return next;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membros]);

  async function handleSaveIdentificacao(id: number) {
    setError(null);
    setSaving(id);
    try {
      await primeCsrf();
      await apiFetch(`/api/ocorrencia/comissao/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ identificacao_rai: edits[id] ?? '' }),
      });
      load();
      toast.success('Identificação salva');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao salvar identificação.';
      setError(message);
      toast.error('Erro ao salvar identificação', message);
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      {membros.length === 0 && (
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Nenhum membro na Comissão de Investigação ainda — cadastre na aba Gestão da ocorrência.
        </p>
      )}
      {membros.map((m) => (
        <div key={m.id} className="flex flex-wrap items-center gap-3 border-b border-mist-200 py-3 text-sm last:border-0 dark:border-space-700">
          <div className="min-w-[180px] flex-1">
            <p className="font-medium text-slate-800 dark:text-slate-200">
              {m.investigador && investigadores[m.investigador] ? formatUsuario(investigadores[m.investigador]) : `Membro #${m.investigador ?? '-'}`}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{COMISSAO_FUNCAO_CHOICES.find(([v]) => v === m.funcao)?.[1] || m.funcao || '-'}</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              className={cn(inputClass, 'w-56')}
              type="text"
              placeholder="Identificação no RAI (ex.: nº portaria)"
              value={edits[m.id] ?? m.identificacao_rai ?? ''}
              onChange={(e) => setEdits((prev) => ({ ...prev, [m.id]: e.target.value }))}
            />
            <Button type="button" variant="secondary" disabled={saving === m.id} onClick={() => handleSaveIdentificacao(m.id)}>
              {saving === m.id ? <Spinner /> : <Save className="h-4 w-4" strokeWidth={1.75} />}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
