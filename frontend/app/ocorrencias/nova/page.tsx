'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileEdit } from 'lucide-react';
import { apiFetch, primeCsrf, fetchMe, ApiError } from '@/lib/api';
import { toast } from '@/lib/toast';
import type { OcorrenciaGeral, GeografiaCidade, AerodromoGeral, VeiculoLancador } from '@/lib/types';
import AppShell from '@/components/AppShell';
import AsyncCombobox from '@/components/AsyncCombobox';
import { Button, Card, ErrorText, Field, PageContainer, Row, Select, Spinner, inputClass } from '@/lib/ui';
import { cn } from '@/lib/cn';
import {
  CLASSIFICACAO_CHOICES,
  TIPO_OCORRENCIA_CHOICES,
  DANOS_TERCEIROS_CHOICES,
  LOCALIZACAO_TIPO_CHOICES,
  ORBITA_TIPO_CHOICES,
  AERONAVE_TIPO_CHOICES,
  DANOS_ARTEFATO_CHOICES,
  FASE_MISSAO_CHOICES,
} from '@/lib/choices';

type FormState = Omit<Partial<OcorrenciaGeral>, 'cidade' | 'aerodromo'> & {
  cidade: number | null;
  aerodromo: number | null;
};

export default function RedigirOcorrenciaPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [form, setForm] = useState<FormState>({ cidade: null, aerodromo: null });
  const [artefatoEspacial, setArtefatoEspacial] = useState<number | null>(null);
  const [aeronaveTipo, setAeronaveTipo] = useState('');
  const [operador, setOperador] = useState('');
  const [danos, setDanos] = useState('');
  const [faseMissao, setFaseMissao] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMe().then((me) => {
      if (!me) {
        router.replace('/login');
        return;
      }
      setAuthChecked(true);
    });
  }, [router]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await primeCsrf();
      const oc = await apiFetch<OcorrenciaGeral>('/api/ocorrencia/ocorrencias/', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      if (artefatoEspacial) {
        await apiFetch('/api/ocorrencia/aeronaves/', {
          method: 'POST',
          body: JSON.stringify({
            ocorrencia: oc.id,
            artefato_espacial: artefatoEspacial,
            tipo: aeronaveTipo || null,
            operador: operador || null,
            danos: danos || null,
            fase_missao: faseMissao || null,
          }),
        });
      }

      toast.success('Ocorrência redigida com sucesso');
      router.push(`/ocorrencias/${oc.id}`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao redigir ocorrência.';
      setError(message);
      toast.error('Erro ao redigir ocorrência', message);
    } finally {
      setLoading(false);
    }
  }

  if (!authChecked) return null;

  return (
    <AppShell title="Redigir Ocorrência">
      <PageContainer>
        <h1 className="mb-6 text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Redigir Ocorrência</h1>
        <form onSubmit={handleSubmit}>
          <Card className="mb-4">
            <h2 className="mb-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Informações Gerais</h2>
            <Row>
              <Field label="Classificação">
                <Select value={form.classificacao || ''} onChange={(v) => set('classificacao', v)} choices={CLASSIFICACAO_CHOICES} required />
              </Field>
              <Field label="Tipo">
                <Select value={form.tipo || ''} onChange={(v) => set('tipo', v)} choices={TIPO_OCORRENCIA_CHOICES} required />
              </Field>
            </Row>
            <Row>
              <Field label="Data da Ocorrência">
                <input className={inputClass} type="date" value={form.dia || ''} onChange={(e) => set('dia', e.target.value)} required />
              </Field>
              <Field label="Horário">
                <input className={inputClass} type="time" value={form.horario || ''} onChange={(e) => set('horario', e.target.value)} />
              </Field>
            </Row>
            <Field label="Data de Comunicação">
              <input
                className={inputClass}
                type="date"
                value={form.dia_comunicacao || ''}
                onChange={(e) => set('dia_comunicacao', e.target.value)}
              />
            </Field>
          </Card>

          <Card className="mb-4">
            <h2 className="mb-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Localização</h2>
            <Row>
              <Field label="Cidade">
                <AsyncCombobox
                  apiPath="/api/taxonomia/cidades/"
                  value={form.cidade}
                  onChange={(id) => set('cidade', id)}
                  getLabel={(c: GeografiaCidade) => c.nome}
                  placeholder="Buscar cidade…"
                  required
                />
              </Field>
              <Field label="Organização do segmento espacial (Aeródromo/Centro de Lançamento)">
                <AsyncCombobox
                  apiPath="/api/taxonomia/aerodromos/"
                  value={form.aerodromo}
                  onChange={(id) => set('aerodromo', id)}
                  getLabel={(a: AerodromoGeral) => a.nome}
                  placeholder="Buscar organização…"
                  required
                />
              </Field>
            </Row>
            <Row>
              <Field label="Local">
                <input className={inputClass} type="text" value={form.local || ''} onChange={(e) => set('local', e.target.value)} />
              </Field>
              <Field label="Tipo de Localização">
                <Select value={form.localizacao_tipo || ''} onChange={(v) => set('localizacao_tipo', v)} choices={LOCALIZACAO_TIPO_CHOICES} />
              </Field>
            </Row>
            {form.localizacao_tipo === 'EM_ORBITA' && (
              <Field label="Tipo de Órbita">
                <Select value={form.orbita_tipo || ''} onChange={(v) => set('orbita_tipo', v)} choices={ORBITA_TIPO_CHOICES} />
              </Field>
            )}
          </Card>

          <Card className="mb-4">
            <h2 className="mb-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Artefato Espacial (Foguete)</h2>
            <Field label="Veículo Lançador">
              <AsyncCombobox
                apiPath="/api/taxonomia/veiculos-lancadores/"
                value={artefatoEspacial}
                onChange={setArtefatoEspacial}
                getLabel={(v: VeiculoLancador) => `Veículo Lançador #${v.id}`}
                placeholder="Buscar veículo lançador…"
              />
            </Field>
            <Row>
              <Field label="Tipo">
                <Select value={aeronaveTipo} onChange={setAeronaveTipo} choices={AERONAVE_TIPO_CHOICES} />
              </Field>
              <Field label="Operador / Proprietário">
                <input className={inputClass} type="text" value={operador} onChange={(e) => setOperador(e.target.value)} />
              </Field>
            </Row>
            <Row>
              <Field label="Danos">
                <Select value={danos} onChange={setDanos} choices={DANOS_ARTEFATO_CHOICES} />
              </Field>
              <Field label="Fase da Missão">
                <Select value={faseMissao} onChange={setFaseMissao} choices={FASE_MISSAO_CHOICES} />
              </Field>
            </Row>
          </Card>

          <Card className="mb-4">
            <h2 className="mb-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Danos e Observações</h2>
            <Field label="Danos a Terceiros">
              <Select value={form.danos_terceiros || ''} onChange={(v) => set('danos_terceiros', v)} choices={DANOS_TERCEIROS_CHOICES} />
            </Field>
            <Field label="Histórico">
              <textarea
                className={cn(inputClass, 'min-h-[100px]')}
                value={form.historico || ''}
                onChange={(e) => set('historico', e.target.value)}
              />
            </Field>
            <Field label="Observação">
              <textarea
                className={cn(inputClass, 'min-h-[80px]')}
                value={form.observacao || ''}
                onChange={(e) => set('observacao', e.target.value)}
              />
            </Field>
          </Card>

          <ErrorText>{error}</ErrorText>
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner className="text-white" /> : <FileEdit className="h-4 w-4" strokeWidth={1.75} />}
            Redigir Ocorrência
          </Button>
        </form>
      </PageContainer>
    </AppShell>
  );
}
