'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { CheckCircle2, ChevronDown, Download, Pencil, Plus, Upload, XCircle } from 'lucide-react';
import { apiFetch, fetchMe } from '@/lib/api';
import { toast } from '@/lib/toast';
import type { OcorrenciaGeral, Paginated, RevisaoPainelArtefato } from '@/lib/types';
import AppShell from '@/components/AppShell';
import { Badge, PageContainer, Spinner, buttonClass } from '@/lib/ui';

function statusTone(status: string) {
  if (status === 'CONFIRMAR') return 'warning' as const;
  if (status === 'AUTENTICAR') return 'accent' as const;
  if (status === 'AUTENTICADO') return 'success' as const;
  return 'neutral' as const;
}

function ArtefatoCell({ artefatos }: { artefatos: RevisaoPainelArtefato[] }) {
  if (artefatos.length === 0) return <span className="text-stone-400 dark:text-stone-500">-</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {artefatos.map((a, i) => (
        <div key={i} className="group relative inline-block">
          <span className="cursor-pointer text-stone-800 underline decoration-dotted underline-offset-4 dark:text-stone-200">
            {a.nome || 'N/A'}
          </span>
          <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-72 rounded-lg border border-stone-200 bg-white p-3 text-xs leading-relaxed text-stone-700 opacity-0 shadow-popover transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
            <div className="mb-1.5 text-sm font-semibold text-stone-900 dark:text-stone-100">{a.nome || 'N/A'}</div>
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
          className="z-50 w-56 rounded-lg border border-stone-200 bg-white py-1 shadow-popover dark:border-stone-700 dark:bg-stone-800"
        >
          <DropdownMenu.Item asChild>
            <Link
              href={`/ocorrencias/${ocorrenciaId}`}
              className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-stone-700 outline-none transition-colors hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-700"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
              Editar
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 border-t border-stone-100 dark:border-stone-700" />
          <DropdownMenu.Item
            onClick={fakeAction}
            className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-stone-700 outline-none transition-colors hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-700"
          >
            <Upload className="h-4 w-4" strokeWidth={1.75} />
            Upload RAI
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onClick={fakeAction}
            className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-stone-700 outline-none transition-colors hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-700"
          >
            <Upload className="h-4 w-4" strokeWidth={1.75} />
            Upload Minuta
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onClick={fakeAction}
            className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-stone-700 outline-none transition-colors hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-700"
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
    setLoading(true);
    apiFetch<Paginated<OcorrenciaGeral>>('/api/ocorrencia/ocorrencias/?status=AUTENTICADO')
      .then(setData)
      .finally(() => setLoading(false));
  }, [authChecked]);

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
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Ocorrências</h1>
          <Link href="/ocorrencias/nova" className={buttonClass('primary')}>
            <Plus className="h-4 w-4" strokeWidth={2} />
            Redigir Ocorrência
          </Link>
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
          <div className="flex items-center gap-2 py-10 text-sm text-stone-400 dark:text-stone-500">
            <Spinner /> Carregando…
          </div>
        )}

        {!loading && data && (
          <div className="overflow-visible rounded-xl border border-stone-200 bg-white shadow-card dark:border-stone-800 dark:bg-stone-900">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/60 text-left text-xs font-medium uppercase tracking-wide text-stone-500 dark:border-stone-800 dark:bg-stone-800/40 dark:text-stone-400">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={data.results.length > 0 && selected.size === data.results.length}
                      onChange={toggleAll}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 rounded border-stone-300 text-accent-600 focus:ring-accent-500 dark:border-stone-600"
                    />
                  </th>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Artefato Espacial</th>
                  <th className="px-4 py-3">Verificar igualdade</th>
                  <th className="px-4 py-3">Classificação</th>
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
                    className="cursor-pointer border-b border-stone-100 transition-colors last:border-0 hover:bg-accent-50/50 dark:border-stone-800 dark:hover:bg-stone-800/50"
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(oc.id)}
                        onChange={() => toggleOne(oc.id)}
                        className="h-4 w-4 rounded border-stone-300 text-accent-600 focus:ring-accent-500 dark:border-stone-600"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">{oc.id}</td>
                    <td className="px-4 py-3">
                      <ArtefatoCell artefatos={oc.artefatos} />
                    </td>
                    <td className="px-4 py-3">
                      {oc.classificacao === 'ACIDENTE' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" strokeWidth={2} />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" strokeWidth={2} />
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-700 dark:text-stone-300">{oc.classificacao || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-stone-700 dark:text-stone-300">
                      {oc.dia || '-'}
                      <br />
                      <span className="text-xs text-stone-400 dark:text-stone-500">{oc.horario || '-'}</span>
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
                    <td className="px-4 py-8 text-center text-stone-400 dark:text-stone-500" colSpan={8}>
                      Nenhuma ocorrência autenticada ainda.
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
