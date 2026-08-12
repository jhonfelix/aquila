'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CornerUpLeft, ShieldCheck } from 'lucide-react';
import { apiFetch, primeCsrf, fetchMe, ApiError } from '@/lib/api';
import { toast } from '@/lib/toast';
import { formatShortDate } from '@/lib/format';
import type { OcorrenciaGeral, Paginated } from '@/lib/types';
import AppShell from '@/components/AppShell';
import { Badge, Button, ErrorText, PageContainer, Spinner } from '@/lib/ui';

// Menu dedicado "Redigir/Autenticar" (espelha os proxy models do Django
// Admin) — autentica/devolve direto na linha, sem precisar abrir o detalhe
// da ocorrência.
export default function AutenticarOcorrenciasPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [data, setData] = useState<Paginated<OcorrenciaGeral> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch<Paginated<OcorrenciaGeral>>('/api/ocorrencia/ocorrencias/?status=AUTENTICAR')
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMe().then((me) => {
      if (!me) {
        router.replace('/login');
        return;
      }
      setAuthChecked(true);
      load();
    });
  }, [router, load]);

  async function handleDecisao(oc: OcorrenciaGeral, decisao: 'AUTENTICADO' | 'CONFIRMAR') {
    setError(null);
    setActingId(oc.id);
    try {
      await primeCsrf();
      await apiFetch(`/api/ocorrencia/ocorrencias/${oc.id}/autenticar/`, {
        method: 'POST',
        body: JSON.stringify({ decisao }),
      });
      toast.success(
        decisao === 'AUTENTICADO' ? 'Ocorrência autenticada' : 'Ocorrência devolvida para confirmação',
        oc.numero_processo || `#${oc.id}`,
      );
      load();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao executar ação.';
      setError(message);
      toast.error('Erro ao executar ação', message);
    } finally {
      setActingId(null);
    }
  }

  if (!authChecked) return null;

  return (
    <AppShell title="Autenticar Ocorrências">
      <PageContainer wide>
        <h1 className="mb-6 text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Autenticar Ocorrências</h1>

        <ErrorText>{error}</ErrorText>

        {loading && (
          <div className="flex items-center gap-2 py-10 text-sm text-stone-400 dark:text-stone-500">
            <Spinner /> Carregando…
          </div>
        )}

        {!loading && data && (
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-card dark:border-stone-800 dark:bg-stone-900">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/60 text-left text-xs font-medium uppercase tracking-wide text-stone-500 dark:border-stone-800 dark:bg-stone-800/40 dark:text-stone-400">
                  <th className="px-4 py-3">Nº Processo</th>
                  <th className="px-4 py-3">Classificação</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.results.map((oc) => (
                  <tr
                    key={oc.id}
                    className="border-b border-stone-100 last:border-0 hover:bg-accent-50/50 dark:border-stone-800 dark:hover:bg-stone-800/50"
                  >
                    <td
                      className="cursor-pointer px-4 py-3 font-medium text-stone-900 dark:text-stone-100"
                      onClick={() => router.push(`/ocorrencias/${oc.id}`)}
                    >
                      {oc.numero_processo || `#${oc.id}`}
                    </td>
                    <td className="px-4 py-3 text-stone-700 dark:text-stone-300">{oc.classificacao || '-'}</td>
                    <td className="px-4 py-3 text-stone-700 dark:text-stone-300">{oc.tipo || '-'}</td>
                    <td className="px-4 py-3 text-stone-700 dark:text-stone-300">{oc.dia ? formatShortDate(oc.dia) : '-'}</td>
                    <td className="px-4 py-3">
                      <Badge tone="accent">{oc.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button disabled={actingId === oc.id} onClick={() => handleDecisao(oc, 'AUTENTICADO')}>
                          {actingId === oc.id ? <Spinner className="text-white" /> : <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />}
                          Autenticar
                        </Button>
                        <Button variant="secondary" disabled={actingId === oc.id} onClick={() => handleDecisao(oc, 'CONFIRMAR')}>
                          <CornerUpLeft className="h-4 w-4" strokeWidth={1.75} />
                          Devolver
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.results.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-stone-400 dark:text-stone-500" colSpan={6}>
                      Nenhuma ocorrência aguardando autenticação.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}
