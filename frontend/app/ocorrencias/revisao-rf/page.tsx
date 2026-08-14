'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, History, MessageSquareText, Send, X } from 'lucide-react';
import { apiFetch, primeCsrf, fetchMe, ApiError } from '@/lib/api';
import { toast } from '@/lib/toast';
import type { OcorrenciaRevisaoRelatorio, Paginated, RevisaoPainelRow, Usuario } from '@/lib/types';
import { REVISAO_SETOR_CHOICES } from '@/lib/choices';
import { formatUsuario, formatShortDate } from '@/lib/format';
import AppShell from '@/components/AppShell';
import AsyncCombobox from '@/components/AsyncCombobox';
import Pagination from '@/components/Pagination';
import { Badge, Button, ErrorText, Field, PageContainer, Select, Spinner, fileInputClass, inputClass } from '@/lib/ui';
import { cn } from '@/lib/cn';

const userLabel = (u: Usuario) => formatUsuario(u);

function prioridadeTone(prioridade: string | null) {
  if (prioridade === '1') return 'danger' as const;
  if (prioridade === '2' || prioridade === '3') return 'warning' as const;
  if (prioridade === '4') return 'accent' as const;
  return 'success' as const;
}

function AcaoDropdown({
  row,
  onHistorico,
  onEncaminhar,
}: {
  row: RevisaoPainelRow;
  onHistorico: () => void;
  onEncaminhar: () => void;
}) {
  function fakeAction() {
    toast.info('Funcionalidade ainda não implementada');
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="inline-flex items-center gap-1 rounded-md bg-accent-600 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-700">
          Ação
          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-50 w-56 rounded-lg border border-mist-200 bg-white py-1 shadow-popover dark:border-space-700 dark:bg-space-800"
        >
          <DropdownMenu.Item
            onClick={onHistorico}
            className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors hover:bg-mist-100 dark:text-slate-200 dark:hover:bg-space-800"
          >
            <History className="h-4 w-4" strokeWidth={1.75} />
            Histórico
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 border-t border-mist-200 dark:border-space-700" />
          <DropdownMenu.Item
            onClick={onEncaminhar}
            className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors hover:bg-mist-100 dark:text-slate-200 dark:hover:bg-space-800"
          >
            <Send className="h-4 w-4" strokeWidth={1.75} />
            Encaminhar Revisão
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onClick={fakeAction}
            className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors hover:bg-mist-100 dark:text-slate-200 dark:hover:bg-space-800"
          >
            <MessageSquareText className="h-4 w-4" strokeWidth={1.75} />
            Fazer Feedback
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function EncaminharModal({ row, onClose, onSaved }: { row: RevisaoPainelRow; onClose: () => void; onSaved: () => void }) {
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
      fd.append('ocorrencia', String(row.ocorrencia_id));
      if (setor) fd.append('setor', setor);
      if (revisor) fd.append('revisor', String(revisor));
      if (dataAtribuicao) fd.append('data_atribuicao', dataAtribuicao);
      if (observacao) fd.append('observacao', observacao);
      fd.append('cadastrado_em', new Date().toISOString().slice(0, 10));
      if (me) fd.append('cadastrado_por', String(me.id));
      if (anexo) fd.append('anexo', anexo);
      await apiFetch('/api/ocorrencia/revisao-relatorio/', { method: 'POST', body: fd });
      toast.success('Revisão encaminhada');
      onSaved();
      onClose();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao encaminhar revisão.';
      setError(message);
      toast.error('Erro ao encaminhar revisão', message);
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
            <Dialog.Title className="text-base font-semibold text-slate-900 dark:text-slate-100">Encaminhar Revisão</Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              <X className="h-4 w-4" strokeWidth={2} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Cria a próxima etapa de revisão para{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {row.artefatos.length > 0 ? row.artefatos.map((a) => a.nome).join(', ') : `Ocorrência #${row.ocorrencia_id}`}
            </span>
            .
          </Dialog.Description>

          <ErrorText>{error}</ErrorText>

          <form onSubmit={handleSubmit}>
            <Field label="Setor Responsável">
              <Select value={setor} onChange={setSetor} choices={REVISAO_SETOR_CHOICES} />
            </Field>
            <Field label="Revisor Responsável">
              <AsyncCombobox apiPath="/api/usuarios/" value={revisor} onChange={setRevisor} getLabel={userLabel} />
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
                Encaminhar
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function RevisaoRfPainelPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [data, setData] = useState<Paginated<RevisaoPainelRow> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [historicoFor, setHistoricoFor] = useState<RevisaoPainelRow | null>(null);
  const [historico, setHistorico] = useState<OcorrenciaRevisaoRelatorio[] | null>(null);
  const [encaminharFor, setEncaminharFor] = useState<RevisaoPainelRow | null>(null);

  function loadRows(p: number) {
    setLoading(true);
    apiFetch<Paginated<RevisaoPainelRow>>(`/api/ocorrencia/revisao-relatorio/painel/?page=${p}`)
      .then(setData)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchMe().then((me) => {
      if (!me) {
        router.replace('/login');
        return;
      }
      setAuthChecked(true);
    });
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;
    loadRows(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, page]);

  useEffect(() => {
    if (!historicoFor) return;
    setHistorico(null);
    apiFetch<OcorrenciaRevisaoRelatorio[]>(`/api/ocorrencia/revisao-relatorio/historico/?ocorrencia=${historicoFor.ocorrencia_id}`).then(
      setHistorico,
    );
  }, [historicoFor]);

  if (!authChecked) return null;

  return (
    <AppShell title="Painel de Revisão RF">
      <PageContainer wide>
        <h1 className="mb-6 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Painel de Revisão RF</h1>

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
                  <th className="px-4 py-3">Artefato Espacial</th>
                  <th className="px-4 py-3">Classificação</th>
                  <th className="px-4 py-3">Observação</th>
                  <th className="px-4 py-3">Prioridade</th>
                  <th className="px-4 py-3">Data de Atribuição</th>
                  <th className="px-4 py-3">Revisor Responsável</th>
                  <th className="px-4 py-3">Setor Responsável</th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((row) => (
                  <tr key={row.id} className="border-b border-mist-200 last:border-0 dark:border-space-700">
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {row.artefatos.length > 0 ? row.artefatos.map((a) => a.nome).join(', ') : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.classificacao || '-'}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-slate-700 dark:text-slate-300">{row.observacao || '-'}</td>
                    <td className="px-4 py-3">
                      {row.prioridade_display ? <Badge tone={prioridadeTone(row.prioridade)}>{row.prioridade_display}</Badge> : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {row.data_atribuicao ? formatShortDate(row.data_atribuicao) : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.revisor || '-'}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.setor_display || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <AcaoDropdown row={row} onHistorico={() => setHistoricoFor(row)} onEncaminhar={() => setEncaminharFor(row)} />
                    </td>
                  </tr>
                ))}
                {data.results.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-400 dark:text-slate-500" colSpan={8}>
                      Nenhuma revisão em andamento.
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
            label="revisões"
          />
        )}

        <Dialog.Root open={!!historicoFor} onOpenChange={(open) => !open && setHistoricoFor(null)}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/40 dark:bg-black/60" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[80vh] w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-white p-6 shadow-popover dark:bg-space-900">
              <div className="mb-4 flex items-center justify-between">
                <Dialog.Title className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Histórico de Revisões
                </Dialog.Title>
                <Dialog.Close className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                  <X className="h-4 w-4" strokeWidth={2} />
                </Dialog.Close>
              </div>

              {!historico && (
                <div className="flex items-center gap-2 py-6 text-sm text-slate-400 dark:text-slate-500">
                  <Spinner /> Carregando…
                </div>
              )}

              {historico && (
                <ol className="space-y-3">
                  {historico.map((h) => (
                    <li key={h.id} className="rounded-lg border border-mist-200 p-3 text-sm dark:border-space-700">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{h.setor || '-'}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {h.data_atribuicao ? formatShortDate(h.data_atribuicao) : '-'}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-600 dark:text-slate-400">
                        Revisor: {h.revisor_display ? formatUsuario(h.revisor_display) : '-'}
                      </p>
                      {h.observacao && <p className="mt-1 text-slate-600 dark:text-slate-400">{h.observacao}</p>}
                    </li>
                  ))}
                  {historico.length === 0 && <li className="text-sm text-slate-400 dark:text-slate-500">Sem registros.</li>}
                </ol>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {encaminharFor && (
          <EncaminharModal row={encaminharFor} onClose={() => setEncaminharFor(null)} onSaved={() => loadRows(page)} />
        )}
      </PageContainer>
    </AppShell>
  );
}
