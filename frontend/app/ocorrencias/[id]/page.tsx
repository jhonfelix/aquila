'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import * as Tabs from '@radix-ui/react-tabs';
import { ChevronDown, Download, History, Trash2, Upload } from 'lucide-react';
import { apiFetch, primeCsrf, fetchMe, ApiError } from '@/lib/api';
import { toast } from '@/lib/toast';
import { validate } from '@/lib/validation';
import { geralTabSchema, artefatoTabSchema, comissaoMembroSchema } from '@/lib/schemas/ocorrencia';
import { formatUsuario, formatShortDate } from '@/lib/format';
import type {
  OcorrenciaGeral,
  OcorrenciaAeronave,
  OcorrenciaDocumento,
  OcorrenciaControle,
  OcorrenciaConfirmacao,
  OcorrenciaAutenticacao,
  OcorrenciaComissao,
  OcorrenciaAsoaci,
  OcorrenciaRelatorio,
  OcorrenciaRevisaoRelatorio,
  GeografiaCidade,
  AerodromoGeral,
  VeiculoLancador,
  Usuario,
  Paginated,
} from '@/lib/types';
import Link from 'next/link';
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
  CLASSIFICACAO_CHOICES,
  TIPO_OCORRENCIA_CHOICES,
  DANOS_TERCEIROS_CHOICES,
  LOCALIZACAO_TIPO_CHOICES,
  ORBITA_TIPO_CHOICES,
  AERONAVE_TIPO_CHOICES,
  DANOS_ARTEFATO_CHOICES,
  EVIDENCIA_FALHA_CHOICES,
  FASE_MISSAO_CHOICES,
  TIPO_DOCUMENTO_CHOICES,
  CONTROLE_STATUS_CHOICES,
  ORGAO_INVESTIGADOR_CHOICES,
  CONTROLE_SIM_NAO_CHOICES,
  CONTROLE_TIPO_RELATORIO_CHOICES,
  PRIORIDADE_CHOICES,
  SITUACAO_CHOICES,
  FASE_CHOICES,
  COMISSAO_FUNCAO_CHOICES,
  ASOACI_SIM_NAO_CHOICES,
  ASOACI_REP_ACRED_CHOICES,
  RELATORIO_ELOS_CHOICES,
  REVISAO_SETOR_CHOICES,
} from '@/lib/choices';

const TABS = ['Geral', 'Artefato Espacial', 'Controle', 'Gestão', 'Documentos', 'Internacional', 'Divulgação', 'Revisão Relatório'] as const;
type Tab = (typeof TABS)[number];

const tabTriggerClass =
  'border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 outline-none transition-colors hover:text-slate-800 data-[state=active]:border-accent-600 data-[state=active]:text-accent-700 dark:text-slate-400 dark:hover:text-slate-200 dark:data-[state=active]:text-accent-400';

const userLabel = (u: Usuario) => formatUsuario(u);

export default function OcorrenciaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [authChecked, setAuthChecked] = useState(false);
  const [oc, setOc] = useState<OcorrenciaGeral | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const data = await apiFetch<OcorrenciaGeral>(`/api/ocorrencia/ocorrencias/${id}/`);
    setOc(data);
  }, [id]);

  useEffect(() => {
    fetchMe().then((me) => {
      if (!me) {
        router.replace('/login');
        return;
      }
      setAuthChecked(true);
      reload().catch((err) => setError(err instanceof ApiError ? err.message : 'Erro ao carregar.'));
    });
  }, [reload, router]);

  if (!authChecked || !oc) {
    return (
      <AppShell title="Ocorrência">
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
    <AppShell title={oc.numero_processo || `#${oc.id}`}>
      <PageContainer wide>
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{oc.numero_processo || `Ocorrência #${oc.id}`}</h1>
          <div className="flex items-center gap-3">
            <Link href={`/auditoria/ocorrencia.ocorrenciageral/${oc.id}`} className={buttonClass('ghost')}>
              <History className="h-4 w-4" strokeWidth={1.75} />
              Histórico
            </Link>
            <StatusBadge status={oc.status} />
          </div>
        </div>

        <ErrorText>{error}</ErrorText>

        <Tabs.Root defaultValue="Geral">
          <Tabs.List className="mb-5 flex flex-wrap gap-1 border-b border-mist-200 dark:border-space-700">
            {TABS.map((t) => (
              <Tabs.Trigger key={t} value={t} className={tabTriggerClass}>
                {t}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value="Geral">
            <GeralTab oc={oc} onSaved={reload} setError={setError} />
          </Tabs.Content>
          <Tabs.Content value="Artefato Espacial">
            <ArtefatoTab ocorrenciaId={id} setError={setError} />
          </Tabs.Content>
          <Tabs.Content value="Controle">
            <ControleTab ocorrenciaId={id} setError={setError} />
          </Tabs.Content>
          <Tabs.Content value="Gestão">
            <GestaoTab ocorrenciaId={id} setError={setError} />
          </Tabs.Content>
          <Tabs.Content value="Documentos">
            <DocumentosTab ocorrenciaId={id} setError={setError} />
          </Tabs.Content>
          <Tabs.Content value="Internacional">
            <InternacionalTab ocorrenciaId={id} setError={setError} />
          </Tabs.Content>
          <Tabs.Content value="Divulgação">
            <DivulgacaoTab ocorrenciaId={id} setError={setError} />
          </Tabs.Content>
          <Tabs.Content value="Revisão Relatório">
            <RevisaoRelatorioTab ocorrenciaId={id} setError={setError} />
          </Tabs.Content>
        </Tabs.Root>
      </PageContainer>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === 'CONFIRMAR' ? 'warning' : status === 'AUTENTICAR' ? 'accent' : status === 'AUTENTICADO' ? 'success' : 'neutral';
  return <Badge tone={tone as any}>{status}</Badge>;
}

// ── Aba Geral ──
function GeralTab({
  oc,
  onSaved,
  setError,
}: {
  oc: OcorrenciaGeral;
  onSaved: () => Promise<void>;
  setError: (e: string | null) => void;
}) {
  const [form, setForm] = useState(oc);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [cadastradoPor, setCadastradoPor] = useState<Usuario | null>(null);

  useEffect(() => setForm(oc), [oc]);

  useEffect(() => {
    if (!oc.cadastrado_por_id) return;
    apiFetch<Usuario>(`/api/usuarios/${oc.cadastrado_por_id}/`)
      .then(setCadastradoPor)
      .catch(() => setCadastradoPor(null));
  }, [oc.cadastrado_por_id]);

  function set<K extends keyof OcorrenciaGeral>(key: K, value: OcorrenciaGeral[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const result = validate(geralTabSchema, form);
    if (result.errors) {
      setFieldErrors(result.errors);
      setError('Corrija os campos destacados antes de salvar.');
      return;
    }

    setSaving(true);
    try {
      await primeCsrf();
      await apiFetch(`/api/ocorrencia/ocorrencias/${oc.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(form),
      });
      await onSaved();
      toast.success('Informações gerais salvas');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao salvar.';
      setError(message);
      toast.error('Erro ao salvar', message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} noValidate>
      <SectionCard title="Informações Gerais" subtitle="Informações básicas sobre a ocorrência">
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <ReadOnlyField label="Status da Ocorrência" value={<StatusBadge status={oc.status} />} />
          <ReadOnlyField label="Número do Processo" value={oc.numero_processo} />
        </div>
        <Field label="Público nos Painéis">
          <Checkbox checked={!!form.publico} onChange={(v) => set('publico', v)} />
        </Field>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
          <Field label="Dia comunicação">
            <input className={inputClass} type="date" value={form.dia_comunicacao || ''} onChange={(e) => set('dia_comunicacao', e.target.value)} />
          </Field>
          <Field label="Classificação" error={fieldErrors.classificacao}>
            <Select
              value={form.classificacao || ''}
              onChange={(v) => set('classificacao', v)}
              choices={CLASSIFICACAO_CHOICES}
              required
              className={fieldErrors.classificacao ? errorRingClass : undefined}
            />
          </Field>
          <Field label="Tipo" error={fieldErrors.tipo}>
            <Select
              value={form.tipo || ''}
              onChange={(v) => set('tipo', v)}
              choices={TIPO_OCORRENCIA_CHOICES}
              required
              className={fieldErrors.tipo ? errorRingClass : undefined}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Data e Hora" subtitle="Informações sobre data e hora da ocorrência">
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Field label="Dia" error={fieldErrors.dia}>
            <input
              className={cn(inputClass, fieldErrors.dia && errorRingClass)}
              type="date"
              value={form.dia || ''}
              onChange={(e) => set('dia', e.target.value)}
              required
            />
          </Field>
          <Field label="Hora" error={fieldErrors.horario}>
            <input
              className={cn(inputClass, fieldErrors.horario && errorRingClass)}
              type="time"
              value={form.horario || ''}
              onChange={(e) => set('horario', e.target.value)}
              required
            />
          </Field>
          <Field label="Dia UTC" error={fieldErrors.dia_utc}>
            <input
              className={cn(inputClass, fieldErrors.dia_utc && errorRingClass)}
              type="date"
              value={form.dia_utc || ''}
              onChange={(e) => set('dia_utc', e.target.value)}
              required
            />
          </Field>
          <Field label="Hora UTC" error={fieldErrors.horario_utc}>
            <input
              className={cn(inputClass, fieldErrors.horario_utc && errorRingClass)}
              type="time"
              value={form.horario_utc || ''}
              onChange={(e) => set('horario_utc', e.target.value)}
              required
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Localização" subtitle="Informações sobre a localização da ocorrência">
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Field label="Cidade" error={fieldErrors.cidade}>
            <AsyncCombobox
              apiPath="/api/taxonomia/cidades/"
              value={form.cidade}
              onChange={(v) => set('cidade', v as number)}
              getLabel={(c: GeografiaCidade) => c.nome}
              required
              invalid={!!fieldErrors.cidade}
            />
          </Field>
          <Field label="Organização do segmento espacial" error={fieldErrors.aerodromo}>
            <AsyncCombobox
              apiPath="/api/taxonomia/aerodromos/"
              value={form.aerodromo}
              onChange={(v) => set('aerodromo', v as number)}
              getLabel={(a: AerodromoGeral) => a.nome}
              required
              invalid={!!fieldErrors.aerodromo}
            />
          </Field>
        </div>
        <Field label="Local">
          <input className={inputClass} type="text" value={form.local || ''} onChange={(e) => set('local', e.target.value)} />
        </Field>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Field label="Tipo de Localização">
            <Select value={form.localizacao_tipo || ''} onChange={(v) => set('localizacao_tipo', v)} choices={LOCALIZACAO_TIPO_CHOICES} />
          </Field>
          <Field label="Tipo de Órbita">
            <Select value={form.orbita_tipo || ''} onChange={(v) => set('orbita_tipo', v)} choices={ORBITA_TIPO_CHOICES} />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Field label="Latitude" hint="Utilizar o formato: 23:26:08-S">
            <input className={inputClass} type="text" value={form.latitude || ''} onChange={(e) => set('latitude', e.target.value)} />
          </Field>
          <Field label="Longitude" hint="Utilizar o formato: 023:26:08-W">
            <input className={inputClass} type="text" value={form.longitude || ''} onChange={(e) => set('longitude', e.target.value)} />
          </Field>
          <Field label="Latitude decimal">
            <input className={inputClass} type="text" value={form.latitude_decimal || ''} onChange={(e) => set('latitude_decimal', e.target.value)} />
          </Field>
          <Field label="Longitude decimal">
            <input className={inputClass} type="text" value={form.longitude_decimal || ''} onChange={(e) => set('longitude_decimal', e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
          <Field label="Local de Impacto/Destroços">
            <input className={inputClass} type="text" value={form.local_impacto || ''} onChange={(e) => set('local_impacto', e.target.value)} />
          </Field>
          <Field label="Latitude do Impacto">
            <input className={inputClass} type="text" value={form.latitude_impacto || ''} onChange={(e) => set('latitude_impacto', e.target.value)} />
          </Field>
          <Field label="Longitude do Impacto">
            <input className={inputClass} type="text" value={form.longitude_impacto || ''} onChange={(e) => set('longitude_impacto', e.target.value)} />
          </Field>
        </div>
        <Field label="TLE (Two-Line Element)">
          <textarea className={cn(inputClass, 'min-h-[70px] font-mono')} value={form.tle || ''} onChange={(e) => set('tle', e.target.value)} />
        </Field>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
          <Field label="Apogeu (km)">
            <input className={inputClass} type="number" value={form.apogeu ?? ''} onChange={(e) => set('apogeu', (e.target.value || null) as any)} />
          </Field>
          <Field label="Perigeu (km)">
            <input className={inputClass} type="number" value={form.perigeu ?? ''} onChange={(e) => set('perigeu', (e.target.value || null) as any)} />
          </Field>
          <Field label="Inclinação (graus)">
            <input className={inputClass} type="number" value={form.inclinacao ?? ''} onChange={(e) => set('inclinacao', (e.target.value || null) as any)} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Danos e Observações" subtitle="Informações sobre danos e observações gerais">
        <Field label="Danos a Terceiros" error={fieldErrors.danos_terceiros}>
          <Select
            value={form.danos_terceiros || ''}
            onChange={(v) => set('danos_terceiros', v)}
            choices={DANOS_TERCEIROS_CHOICES}
            required
            className={fieldErrors.danos_terceiros ? errorRingClass : undefined}
          />
        </Field>
        <Field label="Histórico" error={fieldErrors.historico}>
          <textarea
            className={cn(inputClass, 'min-h-[100px]', fieldErrors.historico && errorRingClass)}
            value={form.historico || ''}
            onChange={(e) => set('historico', e.target.value)}
            required
          />
        </Field>
        <Field label="Observação">
          <textarea
            className={cn(inputClass, 'min-h-[80px]')}
            value={form.observacao || ''}
            onChange={(e) => set('observacao', e.target.value)}
          />
        </Field>
      </SectionCard>

      <SectionCard title="Cadastro" subtitle="Informações sobre quem e quando cadastrou a ocorrência">
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <ReadOnlyField label="Cadastrado por" value={cadastradoPor ? formatUsuario(cadastradoPor) : `#${oc.cadastrado_por_id}`} />
          <ReadOnlyField label="Cadastrado em" value={oc.cadastrado_em ? formatShortDate(oc.cadastrado_em) : null} />
        </div>
      </SectionCard>

      <Button type="submit" disabled={saving}>
        {saving && <Spinner className="text-white" />}
        Salvar
      </Button>
    </form>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
  collapsible,
  defaultOpen = true,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="mb-4">
      <div className={cn('flex items-center justify-between', (open || !collapsible) && 'mb-4')}>
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>}
        </div>
        {collapsible && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-mist-100 hover:text-slate-700 dark:hover:bg-space-800 dark:hover:text-slate-200"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} strokeWidth={1.75} />
          </button>
        )}
      </div>
      {open && children}
    </Card>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Field label={label}>
      <div className={cn(inputClass, 'flex items-center bg-mist-100 text-slate-500 dark:bg-space-800/60 dark:text-slate-400')}>
        {value ?? '-'}
      </div>
    </Field>
  );
}

// ── Aba Artefato Espacial (foguete) ──
function ArtefatoTab({ ocorrenciaId, setError }: { ocorrenciaId: number; setError: (e: string | null) => void }) {
  const [aeronave, setAeronave] = useState<OcorrenciaAeronave | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    apiFetch<Paginated<OcorrenciaAeronave>>(`/api/ocorrencia/aeronaves/?ocorrencia=${ocorrenciaId}`).then((data) => {
      const a = data.results[0] || null;
      setAeronave(a);
      setForm(a || {});
      setLoaded(true);
    });
  }, [ocorrenciaId]);

  function set(name: string, value: any) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const result = validate(artefatoTabSchema, form);
    if (result.errors) {
      setFieldErrors(result.errors);
      setError('Corrija os campos destacados antes de salvar.');
      return;
    }

    setSaving(true);
    try {
      await primeCsrf();
      const body = { ...form, ocorrencia: ocorrenciaId };
      if (aeronave) {
        const updated = await apiFetch<OcorrenciaAeronave>(`/api/ocorrencia/aeronaves/${aeronave.id}/`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
        setAeronave(updated);
        setForm(updated);
        toast.success('Artefato espacial salvo');
      } else {
        const created = await apiFetch<OcorrenciaAeronave>('/api/ocorrencia/aeronaves/', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        setAeronave(created);
        setForm(created);
        toast.success('Artefato espacial cadastrado');
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao salvar artefato espacial.';
      setError(message);
      toast.error('Erro ao salvar', message);
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-slate-400 dark:text-slate-500">
        <Spinner /> Carregando…
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} noValidate>
      <SectionCard title="Dados do Artefato Espacial">
        <Field label="Artefato Espacial" error={fieldErrors.artefato_espacial}>
          <AsyncCombobox
            apiPath="/api/taxonomia/veiculos-lancadores/"
            value={form.artefato_espacial ?? null}
            onChange={(v) => set('artefato_espacial', v)}
            getLabel={(v: VeiculoLancador) => `Veículo Lançador #${v.id}`}
            required
            invalid={!!fieldErrors.artefato_espacial}
          />
        </Field>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Field label="Operador / Proprietário">
            <input className={inputClass} type="text" value={form.operador || ''} onChange={(e) => set('operador', e.target.value)} />
          </Field>
          <Field label="Detalhes do Operador / Proprietário">
            <input className={inputClass} type="text" value={form.operador_detalhe || ''} onChange={(e) => set('operador_detalhe', e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Field label="Tipo">
            <Select value={form.tipo || ''} onChange={(v) => set('tipo', v)} choices={AERONAVE_TIPO_CHOICES} />
          </Field>
          <Field label="Danos">
            <Select value={form.danos || ''} onChange={(v) => set('danos', v)} choices={DANOS_ARTEFATO_CHOICES} />
          </Field>
        </div>
        <Field label="Fase da Missão">
          <Select value={form.fase_missao || ''} onChange={(v) => set('fase_missao', v)} choices={FASE_MISSAO_CHOICES} />
        </Field>
        <Field label="Observações Adicionais">
          <textarea className={cn(inputClass, 'min-h-[80px]')} value={form.observacoes || ''} onChange={(e) => set('observacoes', e.target.value)} />
        </Field>
      </SectionCard>

      <SectionCard title="Características Técnicas" subtitle="Informações técnicas sobre o artefato espacial">
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Field label="Satélite">
            <input className={inputClass} type="text" value={form.veiculo_lancador || ''} onChange={(e) => set('veiculo_lancador', e.target.value)} />
          </Field>
          <Field label="Massa Total (kg)">
            <input
              className={inputClass}
              type="number"
              value={form.massa_total ?? ''}
              onChange={(e) => set('massa_total', e.target.value || null)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Field label="Dimensões">
            <input className={inputClass} type="text" value={form.dimensoes || ''} onChange={(e) => set('dimensoes', e.target.value)} />
          </Field>
          <Field label="Vida Útil Prevista">
            <input className={inputClass} type="text" value={form.vida_util_prevista || ''} onChange={(e) => set('vida_util_prevista', e.target.value)} />
          </Field>
        </div>
        <Field label="Sistema de Propulsão">
          <textarea className={cn(inputClass, 'min-h-[70px]')} value={form.sistema_propulsao || ''} onChange={(e) => set('sistema_propulsao', e.target.value)} />
        </Field>
        <Field label="Sistema de Controle de Atitude">
          <textarea
            className={cn(inputClass, 'min-h-[70px]')}
            value={form.sistema_controle_atitude || ''}
            onChange={(e) => set('sistema_controle_atitude', e.target.value)}
          />
        </Field>
      </SectionCard>

      <SectionCard title="Sistemas Críticos" subtitle="Informações sobre os sistemas críticos do artefato espacial">
        <Field label="Sistema de Energia">
          <textarea className={cn(inputClass, 'min-h-[70px]')} value={form.sistema_energia || ''} onChange={(e) => set('sistema_energia', e.target.value)} />
        </Field>
        <Field label="Sistema de Comunicação">
          <textarea
            className={cn(inputClass, 'min-h-[70px]')}
            value={form.sistema_comunicacao || ''}
            onChange={(e) => set('sistema_comunicacao', e.target.value)}
          />
        </Field>
        <Field label="Sistema de Navegação">
          <textarea
            className={cn(inputClass, 'min-h-[70px]')}
            value={form.sistema_navegacao || ''}
            onChange={(e) => set('sistema_navegacao', e.target.value)}
          />
        </Field>
        <Field label="Software de Bordo">
          <textarea className={cn(inputClass, 'min-h-[70px]')} value={form.software_bordo || ''} onChange={(e) => set('software_bordo', e.target.value)} />
        </Field>
      </SectionCard>

      <SectionCard
        title="Informações Coletadas do Artefato Espacial"
        subtitle="Dados coletados do artefato e evidências de falha"
        collapsible
        defaultOpen={false}
      >
        <Field label="Dados de Telemetria (brutos)">
          <textarea
            className={cn(inputClass, 'min-h-[70px]')}
            value={form.dados_telemetria_brutos || ''}
            onChange={(e) => set('dados_telemetria_brutos', e.target.value)}
          />
        </Field>
        <Field label="Dados de Telemetria (processados)">
          <textarea
            className={cn(inputClass, 'min-h-[70px]')}
            value={form.dados_telemetria_processados || ''}
            onChange={(e) => set('dados_telemetria_processados', e.target.value)}
          />
        </Field>
        <Field label="Logs de Eventos e Falhas">
          <textarea
            className={cn(inputClass, 'min-h-[70px]')}
            value={form.logs_eventos_falhas || ''}
            onChange={(e) => set('logs_eventos_falhas', e.target.value)}
          />
        </Field>
        <Field label="Últimos Comandos Enviados">
          <textarea
            className={cn(inputClass, 'min-h-[70px]')}
            value={form.ultimos_comandos_enviados || ''}
            onChange={(e) => set('ultimos_comandos_enviados', e.target.value)}
          />
        </Field>
        <Field label="Estado dos Subsistemas Antes do Evento">
          <textarea
            className={cn(inputClass, 'min-h-[70px]')}
            value={form.estado_subsistemas_antes_evento || ''}
            onChange={(e) => set('estado_subsistemas_antes_evento', e.target.value)}
          />
        </Field>
        <Field label="Dados Orbitais Antes e Depois da Ocorrência">
          <textarea
            className={cn(inputClass, 'min-h-[70px]')}
            value={form.dados_orbitais_antes_depois || ''}
            onChange={(e) => set('dados_orbitais_antes_depois', e.target.value)}
          />
        </Field>
        <Field label="Evidência de Falha">
          <Select value={form.evidencia_falha || ''} onChange={(v) => set('evidencia_falha', v)} choices={EVIDENCIA_FALHA_CHOICES} />
        </Field>
      </SectionCard>

      <Button type="submit" disabled={saving}>
        {saving && <Spinner className="text-white" />}
        {aeronave ? 'Salvar' : 'Cadastrar Artefato Espacial'}
      </Button>
    </form>
  );
}

// ── Aba Controle ──
function ControleTab({ ocorrenciaId, setError }: { ocorrenciaId: number; setError: (e: string | null) => void }) {
  const [controle, setControle] = useState<OcorrenciaControle | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState<Partial<OcorrenciaControle>>({});
  const [saving, setSaving] = useState(false);
  const [confirmacao, setConfirmacao] = useState<OcorrenciaConfirmacao | null>(null);
  const [autenticacao, setAutenticacao] = useState<OcorrenciaAutenticacao | null>(null);
  const [confirmadoPor, setConfirmadoPor] = useState<Usuario | null>(null);
  const [autenticadoPor, setAutenticadoPor] = useState<Usuario | null>(null);

  useEffect(() => {
    apiFetch<Paginated<OcorrenciaControle>>(`/api/ocorrencia/controle/?ocorrencia=${ocorrenciaId}`).then((data) => {
      const c = data.results[0] || null;
      setControle(c);
      setForm(c || {});
      setLoaded(true);
    });
    apiFetch<Paginated<OcorrenciaConfirmacao>>(`/api/ocorrencia/confirmacao/?ocorrencia=${ocorrenciaId}`).then((data) =>
      setConfirmacao(data.results[0] || null),
    );
    apiFetch<Paginated<OcorrenciaAutenticacao>>(`/api/ocorrencia/autenticacao/?ocorrencia=${ocorrenciaId}`).then((data) =>
      setAutenticacao(data.results[0] || null),
    );
  }, [ocorrenciaId]);

  useEffect(() => {
    if (!confirmacao?.usuario) return;
    apiFetch<Usuario>(`/api/usuarios/${confirmacao.usuario}/`).then(setConfirmadoPor).catch(() => setConfirmadoPor(null));
  }, [confirmacao]);

  useEffect(() => {
    if (!autenticacao?.usuario) return;
    apiFetch<Usuario>(`/api/usuarios/${autenticacao.usuario}/`).then(setAutenticadoPor).catch(() => setAutenticadoPor(null));
  }, [autenticacao]);

  function set<K extends keyof OcorrenciaControle>(key: K, value: OcorrenciaControle[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await primeCsrf();
      const body = { ...form, ocorrencia: ocorrenciaId };
      if (controle) {
        const updated = await apiFetch<OcorrenciaControle>(`/api/ocorrencia/controle/${controle.id}/`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
        setControle(updated);
        setForm(updated);
        toast.success('Controle salvo');
      } else {
        const created = await apiFetch<OcorrenciaControle>('/api/ocorrencia/controle/', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        setControle(created);
        setForm(created);
        toast.success('Controle cadastrado');
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao salvar controle.';
      setError(message);
      toast.error('Erro ao salvar controle', message);
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-slate-400 dark:text-slate-500">
        <Spinner /> Carregando…
      </div>
    );
  }

  return (
    <form onSubmit={handleSave}>
      <SectionCard title="Informações de Apoio">
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <ReadOnlyField label="Confirmado por" value={confirmadoPor ? formatUsuario(confirmadoPor) : '-'} />
          <ReadOnlyField label="Data da confirmação" value={confirmacao?.data_confirmacao ? formatShortDate(confirmacao.data_confirmacao) : null} />
          <ReadOnlyField label="Autenticado por" value={autenticadoPor ? formatUsuario(autenticadoPor) : '-'} />
          <ReadOnlyField
            label="Data da autenticação"
            value={autenticacao?.data_autenticacao ? formatShortDate(autenticacao.data_autenticacao) : null}
          />
        </div>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Field label="Tratamento da Ocorrência">
            <Select value={form.status || ''} onChange={(v) => set('status', v)} choices={CONTROLE_STATUS_CHOICES} />
          </Field>
          <Field label="Órgão Investigador">
            <Select value={form.orgao_investigador || ''} onChange={(v) => set('orgao_investigador', v)} choices={ORGAO_INVESTIGADOR_CHOICES} />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Field label="Houve deslocamento até o local">
            <Select value={form.fez_acao_inicial || ''} onChange={(v) => set('fez_acao_inicial', v)} choices={CONTROLE_SIM_NAO_CHOICES} />
          </Field>
          <Field label="Investigador Responsável">
            <AsyncCombobox apiPath="/api/usuarios/" value={form.investigador ?? null} onChange={(v) => set('investigador', v)} getLabel={userLabel} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Situação da Ocorrência">
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Field label="Tipo de Relatório a Produzir">
            <Select value={form.tipo_relatorio || ''} onChange={(v) => set('tipo_relatorio', v)} choices={CONTROLE_TIPO_RELATORIO_CHOICES} />
          </Field>
          <Field label="Número do Relatório">
            <input className={inputClass} type="text" value={form.numero_relatorio || ''} onChange={(e) => set('numero_relatorio', e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Field label="Prioridade">
            <Select value={form.prioridade || ''} onChange={(v) => set('prioridade', v)} choices={PRIORIDADE_CHOICES} />
          </Field>
          <Field label="Situação da Investigação">
            <Select value={form.situacao_investigacao || ''} onChange={(v) => set('situacao_investigacao', v)} choices={SITUACAO_CHOICES} />
          </Field>
        </div>
        <Field label="Fase Atual">
          <Select value={form.fase_atual || ''} onChange={(v) => set('fase_atual', v)} choices={FASE_CHOICES} />
        </Field>
        <Field label="Observações">
          <textarea
            className={cn(inputClass, 'min-h-[80px]')}
            value={form.observacoes || ''}
            onChange={(e) => set('observacoes', e.target.value)}
          />
        </Field>
        {controle && <ReadOnlyField label="Cadastrado em" value={controle.cadastrado_em ? formatShortDate(controle.cadastrado_em) : null} />}
      </SectionCard>

      <Button type="submit" disabled={saving}>
        {saving && <Spinner className="text-white" />}
        {controle ? 'Salvar' : 'Cadastrar Controle'}
      </Button>
    </form>
  );
}

// ── Aba Gestão (Comissão de Investigação) ──
function GestaoTab({ ocorrenciaId, setError }: { ocorrenciaId: number; setError: (e: string | null) => void }) {
  const [membros, setMembros] = useState<OcorrenciaComissao[]>([]);
  const [investigador, setInvestigador] = useState<number | null>(null);
  const [funcao, setFuncao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [identificacaoRai, setIdentificacaoRai] = useState('');
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [investigadores, setInvestigadores] = useState<Record<number, Usuario>>({});

  const load = useCallback(() => {
    apiFetch<Paginated<OcorrenciaComissao>>(`/api/ocorrencia/comissao/?ocorrencia=${ocorrenciaId}`).then((data) =>
      setMembros(data.results),
    );
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

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const result = validate(comissaoMembroSchema, { investigador });
    if (result.errors) {
      setFieldErrors(result.errors);
      return;
    }

    setSaving(true);
    try {
      await primeCsrf();
      await apiFetch('/api/ocorrencia/comissao/', {
        method: 'POST',
        body: JSON.stringify({
          ocorrencia: ocorrenciaId,
          investigador,
          funcao: funcao || null,
          observacoes: observacoes || null,
          identificacao_rai: identificacaoRai || null,
        }),
      });
      setInvestigador(null);
      setFuncao('');
      setObservacoes('');
      setIdentificacaoRai('');
      load();
      toast.success('Membro adicionado à comissão');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao adicionar membro.';
      setError(message);
      toast.error('Erro ao adicionar membro', message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(memberId: number) {
    if (!confirm('Remover este membro da comissão?')) return;
    setError(null);
    try {
      await primeCsrf();
      await apiFetch(`/api/ocorrencia/comissao/${memberId}/`, { method: 'DELETE' });
      load();
      toast.success('Membro removido da comissão');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao remover membro.';
      setError(message);
      toast.error('Erro ao remover membro', message);
    }
  }

  return (
    <div>
      <Card className="mb-4">
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Adicionar Membro</h2>
        <form onSubmit={handleAdd} noValidate>
          <Field label="Investigador" error={fieldErrors.investigador}>
            <AsyncCombobox
              apiPath="/api/usuarios/"
              value={investigador}
              onChange={setInvestigador}
              getLabel={userLabel}
              required
              invalid={!!fieldErrors.investigador}
            />
          </Field>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
            <Field label="Função">
              <Select value={funcao} onChange={setFuncao} choices={COMISSAO_FUNCAO_CHOICES} />
            </Field>
            <Field label="Observações">
              <input className={inputClass} type="text" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
            </Field>
            <Field label="Identificação no RAI" hint="Ex.: nº portaria">
              <input className={inputClass} type="text" value={identificacaoRai} onChange={(e) => setIdentificacaoRai(e.target.value)} />
            </Field>
          </div>
          <Button type="submit" disabled={saving || !investigador}>
            {saving && <Spinner className="text-white" />}
            Adicionar
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Comissão de Investigação</h2>
        {membros.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500">Nenhum membro designado ainda.</p>}
        {membros.map((m) => {
          const inv = m.investigador ? investigadores[m.investigador] : null;
          return (
            <div key={m.id} className="flex items-center justify-between border-b border-mist-200 py-2.5 text-sm last:border-0 dark:border-space-700">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-800 dark:text-slate-200">{inv ? formatUsuario(inv) : `Investigador #${m.investigador}`}</p>
                <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                  {COMISSAO_FUNCAO_CHOICES.find(([v]) => v === m.funcao)?.[1] || m.funcao || '-'}
                  {m.observacoes ? ` · ${m.observacoes}` : ''}
                  {m.identificacao_rai ? ` · RAI: ${m.identificacao_rai}` : ''}
                </p>
              </div>
              <button
                onClick={() => handleRemove(m.id)}
                className="ml-3 shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                title="Remover"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ── Aba Documentos ──
function DocumentosTab({ ocorrenciaId, setError }: { ocorrenciaId: number; setError: (e: string | null) => void }) {
  const [docs, setDocs] = useState<OcorrenciaDocumento[]>([]);
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaders, setUploaders] = useState<Record<number, Usuario>>({});

  const load = useCallback(() => {
    apiFetch<Paginated<OcorrenciaDocumento>>(`/api/ocorrencia/documentos/?ocorrencia=${ocorrenciaId}`).then((data) =>
      setDocs(data.results),
    );
  }, [ocorrenciaId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const missing = Array.from(
      new Set(docs.map((d) => d.cadastrado_por_id).filter((id): id is number => id != null && !(id in uploaders))),
    );
    if (missing.length === 0) return;
    Promise.all(
      missing.map((id) =>
        apiFetch<Usuario>(`/api/usuarios/${id}/`)
          .then((u) => [id, u] as const)
          .catch(() => null),
      ),
    ).then((pairs) => {
      setUploaders((prev) => {
        const next = { ...prev };
        for (const p of pairs) if (p) next[p[0]] = p[1];
        return next;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docs]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      await primeCsrf();
      const fd = new FormData();
      fd.append('ocorrencia', String(ocorrenciaId));
      if (tipoDocumento) fd.append('tipo_documento', tipoDocumento);
      fd.append('arquivo', file);
      await apiFetch('/api/ocorrencia/documentos/', { method: 'POST', body: fd });
      setFile(null);
      setTipoDocumento('');
      load();
      toast.success('Documento enviado');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao enviar documento.';
      setError(message);
      toast.error('Erro ao enviar documento', message);
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove(id: number) {
    if (!confirm('Remover este documento?')) return;
    setError(null);
    try {
      await primeCsrf();
      await apiFetch(`/api/ocorrencia/documentos/${id}/`, { method: 'DELETE' });
      load();
      toast.success('Documento removido');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao remover documento.';
      setError(message);
      toast.error('Erro ao remover documento', message);
    }
  }

  return (
    <div>
      <Card className="mb-4">
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Enviar Documento</h2>
        <form onSubmit={handleUpload}>
          <Field label="Tipo de Documento">
            <Select value={tipoDocumento} onChange={setTipoDocumento} choices={TIPO_DOCUMENTO_CHOICES} />
          </Field>
          <Field label="Arquivo">
            <input className={fileInputClass} type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </Field>
          <Button type="submit" disabled={uploading || !file}>
            {uploading ? <Spinner className="text-white" /> : <Upload className="h-4 w-4" strokeWidth={1.75} />}
            Enviar
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Documentos Anexados</h2>
        {docs.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500">Nenhum documento anexado.</p>}
        {docs.map((d) => {
          const uploader = d.cadastrado_por_id ? uploaders[d.cadastrado_por_id] : null;
          return (
            <div key={d.id} className="flex items-center justify-between gap-3 border-b border-mist-200 py-2.5 text-sm last:border-0 dark:border-space-700">
              <div className="min-w-0">
                <p className="truncate text-slate-700 dark:text-slate-300">
                  {TIPO_DOCUMENTO_CHOICES.find(([v]) => v === d.tipo_documento)?.[1] || d.tipo_documento || 'Documento'}
                </p>
                <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                  {uploader ? formatUsuario(uploader) : '-'} {d.cadastrado_em ? `· ${formatShortDate(d.cadastrado_em)}` : ''}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {d.arquivo && (
                  <a
                    href={d.arquivo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-accent-600 hover:underline dark:text-accent-400"
                  >
                    <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Baixar
                  </a>
                )}
                <button
                  onClick={() => handleRemove(d.id)}
                  className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                  title="Remover"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ── Aba Internacional (Representante Acreditado / ASOACI) ──
function InternacionalTab({ ocorrenciaId, setError }: { ocorrenciaId: number; setError: (e: string | null) => void }) {
  const [asoaci, setAsoaci] = useState<OcorrenciaAsoaci | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState<Partial<OcorrenciaAsoaci>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<Paginated<OcorrenciaAsoaci>>(`/api/ocorrencia/asoaci/?ocorrencia=${ocorrenciaId}`).then((data) => {
      const a = data.results[0] || null;
      setAsoaci(a);
      setForm(a || {});
      setLoaded(true);
    });
  }, [ocorrenciaId]);

  function set<K extends keyof OcorrenciaAsoaci>(key: K, value: OcorrenciaAsoaci[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await primeCsrf();
      const body = { ...form, ocorrencia: ocorrenciaId };
      if (asoaci) {
        const updated = await apiFetch<OcorrenciaAsoaci>(`/api/ocorrencia/asoaci/${asoaci.id}/`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
        setAsoaci(updated);
        toast.success('Informações internacionais salvas');
      } else {
        const created = await apiFetch<OcorrenciaAsoaci>('/api/ocorrencia/asoaci/', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        setAsoaci(created);
        toast.success('Informações internacionais cadastradas');
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao salvar informações internacionais.';
      setError(message);
      toast.error('Erro ao salvar', message);
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-slate-400 dark:text-slate-500">
        <Spinner /> Carregando…
      </div>
    );
  }

  return (
    <form onSubmit={handleSave}>
      <Card className="mb-4">
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Field label="Initial Notification">
            <Select value={form.initial_notification || ''} onChange={(v) => set('initial_notification', v)} choices={ASOACI_SIM_NAO_CHOICES} />
          </Field>
          <Field label="Destinatário / Instituição">
            <input className={inputClass} type="text" value={form.destino_notificacao || ''} onChange={(e) => set('destino_notificacao', e.target.value)} />
          </Field>
        </div>
        <Field label="Data da Notificação">
          <input className={inputClass} type="date" value={form.dia_envio_notificacao || ''} onChange={(e) => set('dia_envio_notificacao', e.target.value)} />
        </Field>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Field label="Tem Representante Acreditado?">
            <Select value={form.tem_rep_acred || ''} onChange={(v) => set('tem_rep_acred', v)} choices={ASOACI_REP_ACRED_CHOICES} />
          </Field>
          <Field label="Nome do Representante">
            <input className={inputClass} type="text" value={form.nome_rep_acred || ''} onChange={(e) => set('nome_rep_acred', e.target.value)} />
          </Field>
        </div>
        <Field label="Observações">
          <textarea
            className={cn(inputClass, 'min-h-[80px]')}
            value={form.observacoes || ''}
            onChange={(e) => set('observacoes', e.target.value)}
          />
        </Field>
      </Card>
      <Button type="submit" disabled={saving}>
        {saving && <Spinner className="text-white" />}
        {asoaci ? 'Salvar' : 'Cadastrar Informações Internacionais'}
      </Button>
    </form>
  );
}

// ── Aba Divulgação (Relatório Final) ──
function DivulgacaoTab({ ocorrenciaId, setError }: { ocorrenciaId: number; setError: (e: string | null) => void }) {
  const [relatorio, setRelatorio] = useState<OcorrenciaRelatorio | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState<Partial<OcorrenciaRelatorio>>({ publicar_site_sipae: true });
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<Paginated<OcorrenciaRelatorio>>(`/api/ocorrencia/relatorio/?ocorrencia=${ocorrenciaId}`).then((data) => {
      const r = data.results[0] || null;
      setRelatorio(r);
      setForm(r || { publicar_site_sipae: true });
      setLoaded(true);
    });
  }, [ocorrenciaId]);

  function set<K extends keyof OcorrenciaRelatorio>(key: K, value: OcorrenciaRelatorio[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await primeCsrf();
      const hasFile = Object.values(files).some((f) => f != null);
      let body: FormData | string;
      if (hasFile) {
        const fd = new FormData();
        fd.append('ocorrencia', String(ocorrenciaId));
        for (const [key, value] of Object.entries(form)) {
          if (key === 'relatorio_pt' || key === 'relatorio_en' || key === 'relatorio_es' || key === 'ocorrencia' || key === 'id') continue;
          if (value === null || value === undefined) continue;
          fd.append(key, String(value));
        }
        for (const [name, file] of Object.entries(files)) {
          if (file) fd.append(name, file);
        }
        body = fd;
      } else {
        body = JSON.stringify({ ...form, ocorrencia: ocorrenciaId });
      }

      if (relatorio) {
        const updated = await apiFetch<OcorrenciaRelatorio>(`/api/ocorrencia/relatorio/${relatorio.id}/`, { method: 'PATCH', body });
        setRelatorio(updated);
        toast.success('Divulgação salva');
      } else {
        const created = await apiFetch<OcorrenciaRelatorio>('/api/ocorrencia/relatorio/', { method: 'POST', body });
        setRelatorio(created);
        toast.success('Divulgação cadastrada');
      }
      setFiles({});
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao salvar divulgação.';
      setError(message);
      toast.error('Erro ao salvar divulgação', message);
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-slate-400 dark:text-slate-500">
        <Spinner /> Carregando…
      </div>
    );
  }

  return (
    <form onSubmit={handleSave}>
      <Card className="mb-4">
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
          <FileField label="Relatório PT" current={form.relatorio_pt} onChange={(f) => setFiles((p) => ({ ...p, relatorio_pt: f }))} />
          <FileField label="Relatório EN" current={form.relatorio_en} onChange={(f) => setFiles((p) => ({ ...p, relatorio_en: f }))} />
          <FileField label="Relatório ES" current={form.relatorio_es} onChange={(f) => setFiles((p) => ({ ...p, relatorio_es: f }))} />
        </div>
        <Field label="Publicar no site e Painel Sipae?">
          <Checkbox checked={!!form.publicar_site_sipae} onChange={(v) => set('publicar_site_sipae', v)} />
        </Field>
        <Field label="Comunicar aos Elos de Coordenação" hint="Ex: DCTA e/ou RepAcred.">
          <Select value={form.comunicar_elos || ''} onChange={(v) => set('comunicar_elos', v)} choices={RELATORIO_ELOS_CHOICES} />
        </Field>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
          <Field label="Data da Assinatura">
            <input className={inputClass} type="date" value={form.data_assinatura || ''} onChange={(e) => set('data_assinatura', e.target.value)} />
          </Field>
          <Field label="Data de Publicação">
            <input className={inputClass} type="date" value={form.data_publicacao || ''} onChange={(e) => set('data_publicacao', e.target.value)} />
          </Field>
          <Field label="Data de Cadastro">
            <input className={inputClass} type="date" value={form.data_cadastro || ''} onChange={(e) => set('data_cadastro', e.target.value)} />
          </Field>
        </div>
        <Field label="Observações">
          <textarea
            className={cn(inputClass, 'min-h-[80px]')}
            value={form.observacoes || ''}
            onChange={(e) => set('observacoes', e.target.value)}
          />
        </Field>
      </Card>
      <Button type="submit" disabled={saving}>
        {saving && <Spinner className="text-white" />}
        {relatorio ? 'Salvar' : 'Cadastrar Divulgação'}
      </Button>
    </form>
  );
}

function FileField({ label, current, onChange }: { label: string; current?: string | null; onChange: (f: File | null) => void }) {
  return (
    <Field label={label}>
      {typeof current === 'string' && current && (
        <a href={current} target="_blank" rel="noreferrer" className="mb-1.5 block text-xs text-accent-600 underline-offset-2 hover:underline dark:text-accent-400">
          Arquivo atual
        </a>
      )}
      <input className={fileInputClass} type="file" onChange={(e) => onChange(e.target.files?.[0] || null)} />
    </Field>
  );
}

// ── Aba Revisão Relatório (Painel de Revisão RF) ──
function RevisaoRelatorioTab({ ocorrenciaId, setError }: { ocorrenciaId: number; setError: (e: string | null) => void }) {
  const [entradas, setEntradas] = useState<OcorrenciaRevisaoRelatorio[]>([]);
  const [setor, setSetor] = useState('');
  const [revisor, setRevisor] = useState<number | null>(null);
  const [dataAtribuicao, setDataAtribuicao] = useState('');
  const [anexo, setAnexo] = useState<File | null>(null);
  const [observacao, setObservacao] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    apiFetch<Paginated<OcorrenciaRevisaoRelatorio>>(`/api/ocorrencia/revisao-relatorio/?ocorrencia=${ocorrenciaId}`).then((data) =>
      setEntradas(data.results),
    );
  }, [ocorrenciaId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await primeCsrf();
      const me = await fetchMe();
      const fd = new FormData();
      fd.append('ocorrencia', String(ocorrenciaId));
      if (setor) fd.append('setor', setor);
      if (revisor) fd.append('revisor', String(revisor));
      if (dataAtribuicao) fd.append('data_atribuicao', dataAtribuicao);
      if (observacao) fd.append('observacao', observacao);
      fd.append('cadastrado_em', new Date().toISOString().slice(0, 10));
      if (me) fd.append('cadastrado_por', String(me.id));
      if (anexo) fd.append('anexo', anexo);
      await apiFetch('/api/ocorrencia/revisao-relatorio/', { method: 'POST', body: fd });
      setSetor('');
      setRevisor(null);
      setDataAtribuicao('');
      setAnexo(null);
      setObservacao('');
      load();
      toast.success('Etapa de revisão adicionada');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao adicionar revisão.';
      setError(message);
      toast.error('Erro ao adicionar revisão', message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(entryId: number) {
    if (!confirm('Remover esta etapa de revisão?')) return;
    setError(null);
    try {
      await primeCsrf();
      await apiFetch(`/api/ocorrencia/revisao-relatorio/${entryId}/`, { method: 'DELETE' });
      load();
      toast.success('Etapa de revisão removida');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao remover revisão.';
      setError(message);
      toast.error('Erro ao remover revisão', message);
    }
  }

  return (
    <div>
      <Card className="mb-4">
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Nova Etapa de Revisão</h2>
        <form onSubmit={handleAdd}>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Field label="Setor Responsável">
              <Select value={setor} onChange={setSetor} choices={REVISAO_SETOR_CHOICES} />
            </Field>
            <Field label="Revisor Responsável">
              <AsyncCombobox apiPath="/api/usuarios/" value={revisor} onChange={setRevisor} getLabel={userLabel} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Field label="Data da Atribuição">
              <input className={inputClass} type="date" value={dataAtribuicao} onChange={(e) => setDataAtribuicao(e.target.value)} />
            </Field>
            <Field label="Anexo">
              <input className={fileInputClass} type="file" onChange={(e) => setAnexo(e.target.files?.[0] || null)} />
            </Field>
          </div>
          <Field label="Observação">
            <textarea className={cn(inputClass, 'min-h-[70px]')} value={observacao} onChange={(e) => setObservacao(e.target.value)} />
          </Field>
          <Button type="submit" disabled={saving}>
            {saving && <Spinner className="text-white" />}
            Adicionar
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Histórico de Revisões</h2>
        {entradas.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500">Nenhuma etapa de revisão registrada.</p>}
        {entradas.map((r) => (
          <div key={r.id} className="flex items-center justify-between border-b border-mist-200 py-2.5 text-sm last:border-0 dark:border-space-700">
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-800 dark:text-slate-200">
                {REVISAO_SETOR_CHOICES.find(([v]) => v === r.setor)?.[1] || r.setor || 'Etapa'}
              </p>
              <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                {r.data_atribuicao ? formatShortDate(r.data_atribuicao) : '-'} {r.observacao ? `· ${r.observacao}` : ''}
              </p>
            </div>
            <div className="ml-3 flex shrink-0 items-center gap-2">
              {r.anexo && (
                <a href={r.anexo} target="_blank" rel="noreferrer" className="text-accent-600 hover:underline dark:text-accent-400">
                  <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
                </a>
              )}
              <button
                onClick={() => handleRemove(r.id)}
                className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                title="Remover"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
