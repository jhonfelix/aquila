'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ArrowDownWideNarrow, Calendar, ChevronDown, Download, FilterX, History, MessageSquareText, Send, X } from 'lucide-react';
import { apiFetch, primeCsrf, fetchMe, ApiError } from '@/lib/api';
import { toast } from '@/lib/toast';
import type { OcorrenciaRevisaoRelatorio, OcorrenciaRevisaoRelatorioFeedback, Paginated, RevisaoPainelRow, Usuario } from '@/lib/types';
import { CLASSIFICACAO_CHOICES, FEEDBACK_SETOR_CHOICES, REVISAO_SETOR_CHOICES } from '@/lib/choices';
import { formatUsuario, formatShortDate, formatRelative } from '@/lib/format';
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

function diasDesdeAtribuicao(dataAtribuicao: string | null): number | null {
  if (!dataAtribuicao) return null;
  const inicio = new Date(`${dataAtribuicao}T00:00:00`);
  return Math.max(0, Math.floor((Date.now() - inicio.getTime()) / 86400000));
}

function AcaoDropdown({
  row,
  onHistorico,
  onEncaminhar,
  onFeedback,
}: {
  row: RevisaoPainelRow;
  onHistorico: () => void;
  onEncaminhar: () => void;
  onFeedback: () => void;
}) {
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
            onClick={onFeedback}
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

function FeedbackModal({ row, readOnly, onClose }: { row: RevisaoPainelRow; readOnly?: boolean; onClose: () => void }) {
  const [feedbacks, setFeedbacks] = useState<OcorrenciaRevisaoRelatorioFeedback[] | null>(null);
  const [setor, setSetor] = useState('');
  const [comentario, setComentario] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadFeedbacks() {
    apiFetch<Paginated<OcorrenciaRevisaoRelatorioFeedback> | OcorrenciaRevisaoRelatorioFeedback[]>(
      `/api/ocorrencia/revisao-relatorio-feedback/?ocorrencia=${row.ocorrencia_id}`,
    ).then((res) => setFeedbacks(Array.isArray(res) ? res : res.results));
  }

  useEffect(() => {
    loadFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row.ocorrencia_id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!comentario.trim() || !setor) return;
    setError(null);
    setSaving(true);
    try {
      await primeCsrf();
      await apiFetch('/api/ocorrencia/revisao-relatorio-feedback/', {
        method: 'POST',
        body: JSON.stringify({ ocorrencia: row.ocorrencia_id, setor, comentario: comentario.trim() }),
      });
      setSetor('');
      setComentario('');
      loadFeedbacks();
      toast.success('Feedback registrado');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao registrar feedback.';
      setError(message);
      toast.error('Erro ao registrar feedback', message);
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
            <Dialog.Title className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {readOnly ? 'Feedbacks' : 'Fazer Feedback'}
            </Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              <X className="h-4 w-4" strokeWidth={2} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Comentários sobre a revisão de{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {row.artefatos.length > 0 ? row.artefatos.map((a) => a.nome).join(', ') : `Ocorrência #${row.ocorrencia_id}`}
            </span>
            .
          </Dialog.Description>

          {!feedbacks && (
            <div className="flex items-center gap-2 py-4 text-sm text-slate-400 dark:text-slate-500">
              <Spinner /> Carregando…
            </div>
          )}

          {feedbacks && (
            <ol className="mb-4 max-h-64 space-y-3 overflow-y-auto">
              {feedbacks.map((f) => (
                <li key={f.id} className="rounded-lg border border-mist-200 p-3 text-sm dark:border-space-700">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{formatUsuario(f.autor_display)}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{formatRelative(f.criado_em)}</span>
                  </div>
                  {f.setor_display && (
                    <div className="mt-1">
                      <Badge tone="accent">{f.setor_display}</Badge>
                    </div>
                  )}
                  <p className="mt-1 whitespace-pre-wrap text-slate-600 dark:text-slate-400">{f.comentario}</p>
                </li>
              ))}
              {feedbacks.length === 0 && <li className="text-sm text-slate-400 dark:text-slate-500">Nenhum feedback registrado ainda.</li>}
            </ol>
          )}

          {readOnly ? (
            <div className="flex justify-end">
              <Button type="button" variant="secondary" onClick={onClose}>
                Fechar
              </Button>
            </div>
          ) : (
            <>
              <ErrorText>{error}</ErrorText>

              <form onSubmit={handleSubmit}>
                <Field label="Área/Setor Relacionado">
                  <Select value={setor} onChange={setSetor} choices={FEEDBACK_SETOR_CHOICES} required />
                </Field>
                <Field label="Comentário">
                  <textarea
                    className={cn(inputClass, 'min-h-[80px]')}
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    required
                  />
                </Field>

                <div className="mt-2 flex justify-end gap-3">
                  <Button type="button" variant="secondary" onClick={onClose}>
                    Fechar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? <Spinner className="text-white" /> : <MessageSquareText className="h-4 w-4" strokeWidth={1.75} />}
                    Enviar
                  </Button>
                </div>
              </form>
            </>
          )}
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
  const [feedbackFor, setFeedbackFor] = useState<RevisaoPainelRow | null>(null);
  const [feedbackViewFor, setFeedbackViewFor] = useState<RevisaoPainelRow | null>(null);

  const [setorFiltro, setSetorFiltro] = useState('');
  const [revisorFiltro, setRevisorFiltro] = useState<number | null>(null);
  const [classificacaoFiltro, setClassificacaoFiltro] = useState('');
  const [dataInicioFiltro, setDataInicioFiltro] = useState('');
  const [dataFimFiltro, setDataFimFiltro] = useState('');

  const hasFiltro = !!(setorFiltro || revisorFiltro || classificacaoFiltro || dataInicioFiltro || dataFimFiltro);

  function limparFiltros() {
    setSetorFiltro('');
    setRevisorFiltro(null);
    setClassificacaoFiltro('');
    setDataInicioFiltro('');
    setDataFimFiltro('');
  }

  function loadRows(p: number) {
    setLoading(true);
    const q = new URLSearchParams({ page: String(p) });
    if (setorFiltro) q.set('setor', setorFiltro);
    if (revisorFiltro) q.set('revisor', String(revisorFiltro));
    if (classificacaoFiltro) q.set('classificacao', classificacaoFiltro);
    if (dataInicioFiltro) q.set('data_inicio', dataInicioFiltro);
    if (dataFimFiltro) q.set('data_fim', dataFimFiltro);
    apiFetch<Paginated<RevisaoPainelRow>>(`/api/ocorrencia/revisao-relatorio/painel/?${q.toString()}`)
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
  }, [authChecked, page, setorFiltro, revisorFiltro, classificacaoFiltro, dataInicioFiltro, dataFimFiltro]);

  useEffect(() => {
    if (page !== 1) setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setorFiltro, revisorFiltro, classificacaoFiltro, dataInicioFiltro, dataFimFiltro]);

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

        <div className="mb-6 rounded-xl border border-mist-200 bg-white p-4 shadow-card dark:border-space-700 dark:bg-space-900">
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2 lg:grid-cols-5">
            <Field label="Setor Responsável">
              <Select value={setorFiltro} onChange={setSetorFiltro} choices={REVISAO_SETOR_CHOICES} emptyLabel="Todos" />
            </Field>
            <Field label="Classificação">
              <Select value={classificacaoFiltro} onChange={setClassificacaoFiltro} choices={CLASSIFICACAO_CHOICES} emptyLabel="Todas" />
            </Field>
            <Field label="Revisor Responsável">
              <AsyncCombobox apiPath="/api/usuarios/" value={revisorFiltro} onChange={setRevisorFiltro} getLabel={userLabel} />
            </Field>
            <Field label="Atribuído de">
              <input className={inputClass} type="date" value={dataInicioFiltro} onChange={(e) => setDataInicioFiltro(e.target.value)} />
            </Field>
            <Field label="Atribuído até">
              <input className={inputClass} type="date" value={dataFimFiltro} onChange={(e) => setDataFimFiltro(e.target.value)} />
            </Field>
          </div>
          {hasFiltro && (
            <button
              type="button"
              onClick={limparFiltros}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-accent-600 dark:text-slate-400 dark:hover:text-accent-400"
            >
              <FilterX className="h-3.5 w-3.5" strokeWidth={1.75} />
              Limpar filtros
            </button>
          )}
        </div>

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
                  <th className="px-4 py-3">Anexo</th>
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
                    <td className="max-w-xs px-4 py-3 text-slate-700 dark:text-slate-300">
                      <p className="truncate" title={row.observacao || undefined}>{row.observacao || '-'}</p>
                      <div className="mt-1.5 flex items-center gap-2.5 text-slate-400 dark:text-slate-500">
                        <span
                          title={
                            diasDesdeAtribuicao(row.data_atribuicao) !== null
                              ? `${diasDesdeAtribuicao(row.data_atribuicao)} dia(s) desde o início da revisão`
                              : 'Sem data de atribuição'
                          }
                          className="inline-flex cursor-default"
                        >
                          <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </span>
                        <button
                          type="button"
                          onClick={() => setFeedbackViewFor(row)}
                          title="Ver feedbacks"
                          className="inline-flex transition-colors hover:text-accent-600 dark:hover:text-accent-400"
                        >
                          <MessageSquareText className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {row.prioridade_display ? <Badge tone={prioridadeTone(row.prioridade)}>{row.prioridade_display}</Badge> : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {row.data_atribuicao ? formatShortDate(row.data_atribuicao) : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.revisor || '-'}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.setor_display || '-'}</td>
                    <td className="px-4 py-3">
                      {row.anexo ? (
                        <a
                          href={row.anexo}
                          target="_blank"
                          rel="noreferrer"
                          title="Baixar anexo"
                          className="inline-flex items-center justify-center rounded-full bg-accent-50 p-1.5 text-accent-700 shadow-sm transition-colors hover:bg-accent-100 dark:bg-accent-900/40 dark:text-accent-300 dark:hover:bg-accent-900/60"
                        >
                          <Download className="h-3.5 w-3.5" strokeWidth={2} />
                        </a>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <AcaoDropdown
                        row={row}
                        onHistorico={() => setHistoricoFor(row)}
                        onEncaminhar={() => setEncaminharFor(row)}
                        onFeedback={() => setFeedbackFor(row)}
                      />
                    </td>
                  </tr>
                ))}
                {data.results.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-400 dark:text-slate-500" colSpan={9}>
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

              <p className="mb-4 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                <ArrowDownWideNarrow className="h-3.5 w-3.5" strokeWidth={1.75} />
                Mais recente primeiro
              </p>

              {!historico && (
                <div className="flex items-center gap-2 py-6 text-sm text-slate-400 dark:text-slate-500">
                  <Spinner /> Carregando…
                </div>
              )}

              {historico && (
                <ol className="space-y-3">
                  {historico.map((h) => (
                    <li key={h.id} className="rounded-lg border border-mist-200 p-3 text-sm dark:border-space-700">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{h.setor || '-'}</span>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {h.data_atribuicao ? formatShortDate(h.data_atribuicao) : '-'}
                          </span>
                          {h.anexo && (
                            <a
                              href={h.anexo}
                              target="_blank"
                              rel="noreferrer"
                              title="Baixar anexo"
                              className="inline-flex items-center justify-center rounded-full bg-accent-50 p-1.5 text-accent-700 shadow-sm transition-colors hover:bg-accent-100 dark:bg-accent-900/40 dark:text-accent-300 dark:hover:bg-accent-900/60"
                            >
                              <Download className="h-3.5 w-3.5" strokeWidth={2} />
                            </a>
                          )}
                        </div>
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

        {feedbackFor && <FeedbackModal row={feedbackFor} onClose={() => setFeedbackFor(null)} />}
        {feedbackViewFor && <FeedbackModal row={feedbackViewFor} readOnly onClose={() => setFeedbackViewFor(null)} />}
      </PageContainer>
    </AppShell>
  );
}
