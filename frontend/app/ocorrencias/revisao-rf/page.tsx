'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { History, X } from 'lucide-react';
import { apiFetch, fetchMe } from '@/lib/api';
import type { OcorrenciaRevisaoRelatorio, RevisaoPainelRow } from '@/lib/types';
import AppShell from '@/components/AppShell';
import { Badge, PageContainer, Spinner } from '@/lib/ui';

function prioridadeTone(prioridade: string | null) {
  if (prioridade === '1') return 'danger' as const;
  if (prioridade === '2' || prioridade === '3') return 'warning' as const;
  if (prioridade === '4') return 'accent' as const;
  return 'success' as const;
}

export default function RevisaoRfPainelPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [rows, setRows] = useState<RevisaoPainelRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [historicoFor, setHistoricoFor] = useState<RevisaoPainelRow | null>(null);
  const [historico, setHistorico] = useState<OcorrenciaRevisaoRelatorio[] | null>(null);

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
    apiFetch<RevisaoPainelRow[]>('/api/ocorrencia/revisao-relatorio/painel/')
      .then(setRows)
      .finally(() => setLoading(false));
  }, [authChecked]);

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
        <h1 className="mb-6 text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Painel de Revisão RF</h1>

        {loading && (
          <div className="flex items-center gap-2 py-10 text-sm text-stone-400 dark:text-stone-500">
            <Spinner /> Carregando…
          </div>
        )}

        {!loading && rows && (
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-card dark:border-stone-800 dark:bg-stone-900">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/60 text-left text-xs font-medium uppercase tracking-wide text-stone-500 dark:border-stone-800 dark:bg-stone-800/40 dark:text-stone-400">
                  <th className="px-4 py-3">Artefato</th>
                  <th className="px-4 py-3">Classificação</th>
                  <th className="px-4 py-3">Prioridade</th>
                  <th className="px-4 py-3">Setor Atual</th>
                  <th className="px-4 py-3">Revisor</th>
                  <th className="px-4 py-3">Data Atribuição</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-stone-100 last:border-0 dark:border-stone-800">
                    <td className="px-4 py-3 text-stone-700 dark:text-stone-300">
                      {row.artefatos.length > 0 ? row.artefatos.map((a) => a.nome).join(', ') : '-'}
                    </td>
                    <td className="px-4 py-3 text-stone-700 dark:text-stone-300">{row.classificacao || '-'}</td>
                    <td className="px-4 py-3">
                      {row.prioridade_display ? <Badge tone={prioridadeTone(row.prioridade)}>{row.prioridade_display}</Badge> : '-'}
                    </td>
                    <td className="px-4 py-3 text-stone-700 dark:text-stone-300">{row.setor_display || '-'}</td>
                    <td className="px-4 py-3 text-stone-700 dark:text-stone-300">{row.revisor || '-'}</td>
                    <td className="px-4 py-3 text-stone-700 dark:text-stone-300">{row.data_atribuicao || '-'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setHistoricoFor(row)}
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-accent-700 hover:bg-accent-50 dark:text-accent-400 dark:hover:bg-stone-800"
                      >
                        <History className="h-3.5 w-3.5" strokeWidth={2} />
                        Histórico
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-stone-400 dark:text-stone-500" colSpan={7}>
                      Nenhuma revisão em andamento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <Dialog.Root open={!!historicoFor} onOpenChange={(open) => !open && setHistoricoFor(null)}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-stone-900/40 dark:bg-black/60" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[80vh] w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-white p-6 shadow-popover dark:bg-stone-900">
              <div className="mb-4 flex items-center justify-between">
                <Dialog.Title className="text-base font-semibold text-stone-900 dark:text-stone-100">
                  Histórico de Revisões
                </Dialog.Title>
                <Dialog.Close className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200">
                  <X className="h-4 w-4" strokeWidth={2} />
                </Dialog.Close>
              </div>

              {!historico && (
                <div className="flex items-center gap-2 py-6 text-sm text-stone-400 dark:text-stone-500">
                  <Spinner /> Carregando…
                </div>
              )}

              {historico && (
                <ol className="space-y-3">
                  {historico.map((h) => (
                    <li key={h.id} className="rounded-lg border border-stone-200 p-3 text-sm dark:border-stone-800">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-stone-800 dark:text-stone-200">{h.setor || '-'}</span>
                        <span className="text-xs text-stone-400 dark:text-stone-500">{h.data_atribuicao || '-'}</span>
                      </div>
                      {h.observacao && <p className="mt-1 text-stone-600 dark:text-stone-400">{h.observacao}</p>}
                    </li>
                  ))}
                  {historico.length === 0 && <li className="text-sm text-stone-400 dark:text-stone-500">Sem registros.</li>}
                </ol>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </PageContainer>
    </AppShell>
  );
}
