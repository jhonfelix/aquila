'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Download, FileText, Pencil, Upload } from 'lucide-react';
import { apiFetch, fetchMe } from '@/lib/api';
import { toast } from '@/lib/toast';
import { formatShortDate, formatUsuario } from '@/lib/format';
import type { OcorrenciaGeral, Paginated, RevisaoPainelArtefato, Usuario } from '@/lib/types';
import { CLASSIFICACAO_CHOICES, FASE_CHOICES } from '@/lib/choices';
import AppShell from '@/components/AppShell';
import AsyncCombobox from '@/components/AsyncCombobox';
import Pagination from '@/components/Pagination';
import { Badge, PageContainer, Select, Spinner, buttonClass, inputClass } from '@/lib/ui';

type Filters = {
  classificacao: string;
  status: string;
  fase: string;
  investigador: number | null;
  diaInicio: string;
  diaFim: string;
};

const DEFAULT_FILTERS: Filters = {
  classificacao: '',
  status: 'AUTENTICADO',
  fase: '',
  investigador: null,
  diaInicio: '',
  diaFim: '',
};

function buildQuery(filters: Filters, page: number) {
  const q = new URLSearchParams();
  if (filters.status) q.set('status', filters.status);
  if (filters.classificacao) q.set('classificacao', filters.classificacao);
  if (filters.fase) q.set('fase', filters.fase);
  if (filters.investigador) q.set('investigador', String(filters.investigador));
  if (filters.diaInicio) q.set('dia_inicio', filters.diaInicio);
  if (filters.diaFim) q.set('dia_fim', filters.diaFim);
  q.set('page', String(page));
  return q.toString();
}

function statusTone(status: string) {
  if (status === 'CONFIRMAR') return 'warning' as const;
  if (status === 'AUTENTICAR') return 'accent' as const;
  if (status === 'AUTENTICADO') return 'success' as const;
  return 'neutral' as const;
}

function ArtefatoCell({ artefatos }: { artefatos: RevisaoPainelArtefato[] }) {
  if (artefatos.length === 0) return <span className="text-slate-400 dark:text-slate-500">-</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {artefatos.map((a, i) => (
        <div key={i} className="group relative inline-block">
          <span className="cursor-pointer text-slate-800 underline decoration-dotted underline-offset-4 dark:text-slate-200">
            {a.nome || 'N/A'}
          </span>
          <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-72 rounded-lg border border-mist-200 bg-white p-3 text-xs leading-relaxed text-slate-700 opacity-0 shadow-popover transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 dark:border-space-700 dark:bg-space-800 dark:text-slate-200">
            <div className="mb-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100">{a.nome || 'N/A'}</div>
            {a.tipo && (
              <div>
                <strong>Tipo:</strong> {a.tipo}
              </div>
            )}
            {a.operador && (
              <div>
                <strong>Operador:</strong> {a.operador}
              </div>
            )}
            {a.danos && (
              <div>
                <strong>Danos:</strong> {a.danos}
              </div>
            )}
            {a.massa_total && (
              <div>
                <strong>Massa:</strong> {a.massa_total} kg
              </div>
            )}
            {a.veiculo_lancador && (
              <div>
                <strong>Satélite:</strong> {a.veiculo_lancador}
              </div>
            )}
            {a.evidencia_falha && (
              <div>
                <strong>Evidência de falha:</strong> {a.evidencia_falha}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AcaoDropdown({ ocorrenciaId }: { ocorrenciaId: number }) {
  function fakeAction() {
    toast.info('Funcionalidade ainda não implementada');
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 rounded-md bg-accent-600 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-700"
        >
          Ação
          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          onClick={(e) => e.stopPropagation()}
          className="z-50 w-56 rounded-lg border border-mist-200 bg-white py-1 shadow-popover dark:border-space-700 dark:bg-space-800"
        >
          <DropdownMenu.Item asChild>
            <Link
              href={`/ocorrencias/${ocorrenciaId}`}
              className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors hover:bg-mist-100 dark:text-slate-200 dark:hover:bg-space-800"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
              Editar
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 border-t border-mist-200 dark:border-space-700" />
          <DropdownMenu.Item asChild>
            <Link
              href={`/ocorrencias/${ocorrenciaId}/rai`}
              className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors hover:bg-mist-100 dark:text-slate-200 dark:hover:bg-space-800"
            >
              <FileText className="h-4 w-4" strokeWidth={1.75} />
              RAI
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onClick={fakeAction}
            className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors hover:bg-mist-100 dark:text-slate-200 dark:hover:bg-space-800"
          >
            <Upload className="h-4 w-4" strokeWidth={1.75} />
            Upload Minuta
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onClick={fakeAction}
            className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors hover:bg-mist-100 dark:text-slate-200 dark:hover:bg-space-800"
          >
            <Upload className="h-4 w-4" strokeWidth={1.75} />
            Upload de Documento Geral
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default function OcorrenciasListPage() {
  const router = useRouter();
  const [data, setData] = useState<Paginated<OcorrenciaGeral> | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  const filtersActive =
    filters.classificacao !== DEFAULT_FILTERS.classificacao ||
    filters.status !== DEFAULT_FILTERS.status ||
    filters.fase !== DEFAULT_FILTERS.fase ||
    filters.investigador !== DEFAULT_FILTERS.investigador ||
    filters.diaInicio !== DEFAULT_FILTERS.diaInicio ||
    filters.diaFim !== DEFAULT_FILTERS.diaFim;

  useEffect(() => {
    fetchMe().then((me) => {
      if (!me) {
        router.replace('/login');
        return;
      }
      setAuthChecked(true);
    });
  }, [router]);

  // Filtro novo invalida a página atual — volta pro início do resultado filtrado.
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    if (!authChecked) return;
    setLoading(true);
    apiFetch<Paginated<OcorrenciaGeral>>(`/api/ocorrencia/ocorrencias/?${buildQuery(filters, page)}`)
      .then(setData)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, filters, page]);

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (!data) return;
    setSelected((prev) => (prev.size === data.results.length ? new Set() : new Set(data.results.map((oc) => oc.id))));
  }

  function exportSelected(filetype: 'json' | 'csv') {
    const ids = Array.from(selected).join(',');
    window.open(`/api/ocorrencia/ocorrencias/export/?ids=${ids}&filetype=${filetype}`, '_blank');
    toast.success(`Exportação ${filetype.toUpperCase()} iniciada`, `${selected.size} ocorrência(s)`);
  }

  if (!authChecked) return null;

  return (
    <AppShell title="Ocorrências">
      <PageContainer wide>
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Ocorrências</h1>
        </div>

        <div className="mb-4 rounded-xl border border-mist-200 bg-white p-4 shadow-card dark:border-space-700 dark:bg-space-900">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Classificação</label>
              <Select
                value={filters.classificacao}
                onChange={(v) => setFilter('classificacao', v)}
                choices={CLASSIFICACAO_CHOICES}
                emptyLabel="Todas"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Fase</label>
              <Select value={filters.fase} onChange={(v) => setFilter('fase', v)} choices={FASE_CHOICES} emptyLabel="Todas" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Investigador Responsável</label>
              <AsyncCombobox
                apiPath="/api/usuarios/"
                value={filters.investigador}
                onChange={(v) => setFilter('investigador', v)}
                getLabel={(u: Usuario) => formatUsuario(u)}
                placeholder="Buscar…"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Período — de</label>
              <input
                className={inputClass}
                type="date"
                value={filters.diaInicio}
                onChange={(e) => setFilter('diaInicio', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Período — até</label>
              <input className={inputClass} type="date" value={filters.diaFim} onChange={(e) => setFilter('diaFim', e.target.value)} />
            </div>
          </div>
          {filtersActive && (
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="mt-3 text-xs font-medium text-accent-700 hover:underline dark:text-accent-400"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {selected.size > 0 && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-accent-200 bg-accent-50 px-4 py-2.5 text-sm dark:border-accent-900/50 dark:bg-accent-900/20">
            <span className="text-accent-800 dark:text-accent-300">{selected.size} selecionada(s)</span>
            <div className="flex gap-2">
              <button onClick={() => exportSelected('json')} className={buttonClass('secondary')}>
                <Download className="h-4 w-4" strokeWidth={2} />
                Exportar JSON
              </button>
              <button onClick={() => exportSelected('csv')} className={buttonClass('secondary')}>
                <Download className="h-4 w-4" strokeWidth={2} />
                Exportar CSV
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 py-10 text-sm text-slate-400 dark:text-slate-500">
            <Spinner /> Carregando…
          </div>
        )}

        {!loading && data && (
          <div className="overflow-visible rounded-xl border border-mist-200 bg-white shadow-card dark:border-space-700 dark:bg-space-900">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-mist-200 bg-mist-100/60 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:border-space-700 dark:bg-space-800/40 dark:text-slate-400">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={data.results.length > 0 && selected.size === data.results.length}
                      onChange={toggleAll}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 rounded border-mist-200 text-accent-600 focus:ring-accent-500 dark:border-space-700"
                    />
                  </th>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Artefato Espacial</th>
                  <th className="px-4 py-3">Classificação</th>
                  <th className="px-4 py-3">Localização</th>
                  <th className="px-4 py-3">Data / Hora</th>
                  <th className="px-4 py-3">Status da Ocorrência</th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((oc) => (
                  <tr
                    key={oc.id}
                    onClick={() => router.push(`/ocorrencias/${oc.id}`)}
                    className="cursor-pointer border-b border-mist-200 transition-colors last:border-0 hover:bg-accent-50/50 dark:border-space-700 dark:hover:bg-space-800/50"
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(oc.id)}
                        onChange={() => toggleOne(oc.id)}
                        className="h-4 w-4 rounded border-mist-200 text-accent-600 focus:ring-accent-500 dark:border-space-700"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{oc.id}</td>
                    <td className="px-4 py-3">
                      <ArtefatoCell artefatos={oc.artefatos} />
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {oc.classificacao || '-'}
                      <br />
                      <span className="text-xs text-slate-400 dark:text-slate-500">{oc.tipo_display || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {oc.cidade_nome || '-'}
                      <br />
                      <span className="text-xs text-slate-400 dark:text-slate-500">{oc.local || '-'}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">
                      {oc.dia ? formatShortDate(oc.dia) : '-'}
                      <br />
                      <span className="text-xs text-slate-400 dark:text-slate-500">{oc.horario || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(oc.status)}>{oc.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <AcaoDropdown ocorrenciaId={oc.id} />
                    </td>
                  </tr>
                ))}
                {data.results.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-400 dark:text-slate-500" colSpan={8}>
                      Nenhuma ocorrência encontrada para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && data && (
          <Pagination
            page={page}
            count={data.count}
            hasPrevious={!!data.previous}
            hasNext={!!data.next}
            onChange={setPage}
            label="ocorrências"
          />
        )}
      </PageContainer>
    </AppShell>
  );
}
