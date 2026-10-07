'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { AlertTriangle, ChevronDown, ClipboardCheck, Download, Pencil, Search, Send, Trash2, X } from 'lucide-react';
import { apiFetch, primeCsrf, fetchMe, ApiError } from '@/lib/api';
import { toast } from '@/lib/toast';
import { formatShortDate, formatUsuario } from '@/lib/format';
import type { OcorrenciaInvestigada, Paginated, Usuario } from '@/lib/types';
import { REVISAO_SETOR_CHOICES } from '@/lib/choices';
import AppShell from '@/components/AppShell';
import AsyncCombobox from '@/components/AsyncCombobox';
import ChecklistInvestigacaoModal from '@/components/ChecklistInvestigacaoModal';
import Pagination from '@/components/Pagination';
import { Badge, Button, ErrorText, Field, PageContainer, Select, Spinner, buttonClass, fileInputClass, inputClass } from '@/lib/ui';
import { cn } from '@/lib/cn';

function situacaoTone(situacao: string | null) {
  if (situacao === 'FINALIZADA') return 'success' as const;
  if (situacao === 'ATIVA') return 'accent' as const;
  return 'neutral' as const;
}

function checklistTone(pct: number | null) {
  if (pct === null) return 'neutral' as const;
  if (pct >= 100) return 'success' as const;
  if (pct > 0) return 'accent' as const;
  return 'neutral' as const;
}

function IniciarRevisaoModal({ ocorrencia, onClose }: { ocorrencia: OcorrenciaInvestigada; onClose: () => void }) {
  const [setor, setSetor] = useState('');
  const [revisor, setRevisor] = useState<number | null>(null);
  const [dataAtribuicao, setDataAtribuicao] = useState('');
  const [observacao, setObservacao] = useState('');
  const [anexo, setAnexo] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await primeCsrf();
      const me = await fetchMe();
      const fd = new FormData();
      fd.append('ocorrencia', String(ocorrencia.id));
      if (setor) fd.append('setor', setor);
      if (revisor) fd.append('revisor', String(revisor));
      if (dataAtribuicao) fd.append('data_atribuicao', dataAtribuicao);
      if (observacao) fd.append('observacao', observacao);
      fd.append('cadastrado_em', new Date().toISOString().slice(0, 10));
      if (me) fd.append('cadastrado_por', String(me.id));
      if (anexo) fd.append('anexo', anexo);
      await apiFetch('/api/ocorrencia/revisao-relatorio/', { method: 'POST', body: fd });
      toast.success('Processo de revisão iniciado', ocorrencia.numero_processo || `#${ocorrencia.id}`);
      onClose();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao iniciar processo de revisão.';
      setError(message);
      toast.error('Erro ao iniciar processo de revisão', message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/40 dark:bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-white p-6 shadow-popover dark:bg-space-900">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-slate-900 dark:text-slate-100">Iniciar Processo de Revisão</Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              <X className="h-4 w-4" strokeWidth={2} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Cria a primeira etapa de revisão para{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {ocorrencia.artefatos.length > 0 ? ocorrencia.artefatos.map((a) => a.nome).join(', ') : `Ocorrência #${ocorrencia.id}`}
            </span>
            .
          </Dialog.Description>

          <ErrorText>{error}</ErrorText>

          <form onSubmit={handleSubmit}>
            <Field label="Setor Responsável">
              <Select value={setor} onChange={setSetor} choices={REVISAO_SETOR_CHOICES} />
            </Field>
            <Field label="Revisor Responsável">
              <AsyncCombobox apiPath="/api/usuarios/" value={revisor} onChange={setRevisor} getLabel={(u: Usuario) => formatUsuario(u)} />
            </Field>
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <Field label="Data da Atribuição">
                <input className={inputClass} type="date" value={dataAtribuicao} onChange={(e) => setDataAtribuicao(e.target.value)} />
              </Field>
              <Field label="Anexo">
                <input className={fileInputClass} type="file" onChange={(e) => setAnexo(e.target.files?.[0] || null)} />
              </Field>
            </div>
            <Field label="Observação">
              <textarea
                className={cn(inputClass, 'min-h-[80px]')}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </Field>

            <div className="mt-2 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Spinner className="text-white" /> : <Send className="h-4 w-4" strokeWidth={1.75} />}
                Iniciar
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function AcaoDropdown({
  ocorrencia,
  onIniciarRevisao,
  onChecklist,
  onCancelarRevisao,
}: {
  ocorrencia: OcorrenciaInvestigada;
  onIniciarRevisao: () => void;
  onChecklist: () => void;
  onCancelarRevisao: () => void;
}) {
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
          className="z-50 w-64 rounded-lg border border-mist-200 bg-white py-1 shadow-popover dark:border-space-700 dark:bg-space-800"
        >
          <DropdownMenu.Item asChild>
            <Link
              href={`/ocorrencias/${ocorrencia.id}`}
              className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors hover:bg-mist-100 dark:text-slate-200 dark:hover:bg-space-800"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
              Editar
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 border-t border-mist-200 dark:border-space-700" />
          {ocorrencia.revisao_iniciada ? (
            <DropdownMenu.Item
              onClick={onCancelarRevisao}
              className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-red-600 outline-none transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-space-800"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              Cancelar revisão
            </DropdownMenu.Item>
          ) : (
            <DropdownMenu.Item
              onClick={onIniciarRevisao}
              className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors hover:bg-mist-100 dark:text-slate-200 dark:hover:bg-space-800"
            >
              <Send className="h-4 w-4" strokeWidth={1.75} />
              Iniciar Processo de Revisão
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item
            onClick={onChecklist}
            className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors hover:bg-mist-100 dark:text-slate-200 dark:hover:bg-space-800"
          >
            <ClipboardCheck className="h-4 w-4" strokeWidth={1.75} />
            Checklist da Investigação
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default function ControleInvestigacaoPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [data, setData] = useState<Paginated<OcorrenciaInvestigada> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [revisaoFor, setRevisaoFor] = useState<OcorrenciaInvestigada | null>(null);
  const [checklistFor, setChecklistFor] = useState<OcorrenciaInvestigada | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    fetchMe().then((me) => {
      if (!me) {
        router.replace('/login');
        return;
      }
      setAuthChecked(true);
    });
  }, [router]);

  // Busca nova invalida a página atual — volta pro início do resultado filtrado.
  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (!authChecked) return;
    setLoading(true);
    const q = new URLSearchParams();
    if (search.trim()) q.set('search', search.trim());
    q.set('page', String(page));
    apiFetch<Paginated<OcorrenciaInvestigada>>(`/api/ocorrencia/investigadas/?${q.toString()}`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [authChecked, search, page, refreshTick]);

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

  async function cancelarRevisao(oc: OcorrenciaInvestigada) {
    if (!confirm('Cancelar o processo de revisão desta ocorrência? Todas as etapas de revisão serão removidas.')) return;
    try {
      await primeCsrf();
      await apiFetch(`/api/ocorrencia/revisao-relatorio/excluir-processo/?ocorrencia=${oc.id}`, { method: 'DELETE' });
      toast.success('Revisão cancelada', oc.numero_processo || `#${oc.id}`);
      setRefreshTick((t) => t + 1);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao cancelar revisão.';
      toast.error('Erro ao cancelar revisão', message);
    }
  }

  function exportSelected(filetype: 'json' | 'csv') {
    const ids = Array.from(selected).join(',');
    window.open(`/api/ocorrencia/ocorrencias/export/?ids=${ids}&filetype=${filetype}`, '_blank');
    toast.success(`Exportação ${filetype.toUpperCase()} iniciada`, `${selected.size} ocorrência(s)`);
  }

  if (!authChecked) return null;

  return (
    <AppShell title="Controle da Investigação">
      <PageContainer wide>
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Controle da Investigação</h1>
        </div>

        <div className="relative mb-4 max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Buscar…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(inputClass, 'pl-9')}
          />
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
                  <th className="px-4 py-3">Data / Hora</th>
                  <th className="px-4 py-3">Autenticado em</th>
                  <th className="px-4 py-3">Status da Investigação</th>
                  <th className="px-4 py-3">Checklist</th>
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
                    <td className="px-4 py-3 text-slate-800 underline decoration-dotted underline-offset-4 dark:text-slate-200">
                      {oc.artefatos.length > 0 ? oc.artefatos.map((a) => a.nome).join(', ') : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {oc.classificacao || '-'}
                      <br />
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {oc.investigador ? formatUsuario(oc.investigador) : '-'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">
                      {oc.dia ? formatShortDate(oc.dia) : '-'}
                      <br />
                      <span className="text-xs text-slate-400 dark:text-slate-500">{oc.horario ? oc.horario.slice(0, 5) : '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {oc.autenticado_em ? formatShortDate(oc.autenticado_em) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={situacaoTone(oc.situacao_investigacao)}>{oc.situacao_investigacao || '-'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setChecklistFor(oc);
                        }}
                        className="flex items-center gap-1.5 hover:underline"
                      >
                        <Badge tone={checklistTone(oc.checklist_percentual)}>
                          {oc.checklist_percentual === null ? '-' : `${oc.checklist_percentual}%`}
                        </Badge>
                        {oc.checklist_pendencias_atrasadas > 0 && (
                          <span
                            className="text-red-500 dark:text-red-400"
                            title={`${oc.checklist_pendencias_atrasadas} item(ns) da Coleta de Dados atrasado(s) (prazo de 30 dias vencido)`}
                          >
                            <AlertTriangle className="h-4 w-4" strokeWidth={2} />
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <AcaoDropdown
                        ocorrencia={oc}
                        onIniciarRevisao={() => setRevisaoFor(oc)}
                        onChecklist={() => setChecklistFor(oc)}
                        onCancelarRevisao={() => cancelarRevisao(oc)}
                      />
                    </td>
                  </tr>
                ))}
                {data.results.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-400 dark:text-slate-500" colSpan={9}>
                      Nenhuma ocorrência investigada encontrada.
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
            label="ocorrências investigadas"
          />
        )}
      </PageContainer>

      {revisaoFor && (
        <IniciarRevisaoModal
          ocorrencia={revisaoFor}
          onClose={() => {
            setRevisaoFor(null);
            setRefreshTick((t) => t + 1);
          }}
        />
      )}
      {checklistFor && (
        <ChecklistInvestigacaoModal
          ocorrenciaId={checklistFor.id}
          titulo={checklistFor.artefatos.length > 0 ? checklistFor.artefatos.map((a) => a.nome).join(', ') : `Ocorrência #${checklistFor.id}`}
          onClose={() => setChecklistFor(null)}
          onChanged={() => setRefreshTick((t) => t + 1)}
        />
      )}
    </AppShell>
  );
}
