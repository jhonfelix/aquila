'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { apiFetch, fetchMe } from '@/lib/api';
import type { AuditLogEntryEntry, AuditTrail } from '@/lib/types';
import AppShell from '@/components/AppShell';
import { Badge, Card, PageContainer, Spinner, buttonClass } from '@/lib/ui';

function actionTone(action: number) {
  if (action === 0) return 'success' as const; // create
  if (action === 1) return 'accent' as const; // update
  if (action === 2) return 'danger' as const; // delete
  return 'neutral' as const; // access
}

function EntryRow({ entry }: { entry: AuditLogEntryEntry }) {
  const changeKeys = entry.changes ? Object.keys(entry.changes) : [];
  return (
    <li className="rounded-lg border border-mist-200 p-3 text-sm dark:border-space-700">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge tone={actionTone(entry.action)}>{entry.action_display}</Badge>
          <span className="font-medium text-slate-800 dark:text-slate-200">{entry.object_repr}</span>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {entry.actor || 'Sistema'} · {new Date(entry.timestamp).toLocaleString('pt-BR')}
        </span>
      </div>
      {changeKeys.length > 0 && (
        <table className="mt-2 w-full text-xs">
          <tbody>
            {changeKeys.map((field) => (
              <tr key={field} className="border-t border-mist-200 dark:border-space-700">
                <td className="py-1 pr-3 font-medium text-slate-500 dark:text-slate-400">{field}</td>
                <td className="py-1 pr-3 text-slate-400 line-through dark:text-slate-600">{String(entry.changes![field][0])}</td>
                <td className="py-1 text-slate-700 dark:text-slate-300">{String(entry.changes![field][1])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </li>
  );
}

export default function AuditoriaPage() {
  const params = useParams();
  const router = useRouter();
  const contentType = decodeURIComponent(params.content_type as string);
  const objectId = params.object_id as string;

  const [authChecked, setAuthChecked] = useState(false);
  const [trail, setTrail] = useState<AuditTrail | null>(null);

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
    apiFetch<AuditTrail>(`/api/audit/${contentType}/${objectId}/`).then(setTrail);
  }, [authChecked, contentType, objectId]);

  if (!authChecked) return null;

  return (
    <AppShell title="Histórico de Auditoria">
      <PageContainer wide>
        <button onClick={() => router.back()} className={buttonClass('ghost', 'mb-4')}>
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Voltar
        </button>

        <h1 className="mb-6 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Histórico de Auditoria</h1>

        {!trail && (
          <div className="flex items-center gap-2 py-10 text-sm text-slate-400 dark:text-slate-500">
            <Spinner /> Carregando…
          </div>
        )}

        {trail && (
          <div className="space-y-6">
            <Card>
              <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Registro Principal</h2>
              <ol className="space-y-2">
                {trail.entries.map((e) => (
                  <EntryRow key={e.id} entry={e} />
                ))}
                {trail.entries.length === 0 && <li className="text-sm text-slate-400 dark:text-slate-500">Sem registros.</li>}
              </ol>
            </Card>

            {trail.related.map((group) => (
              <Card key={group.anchor}>
                <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">{group.label}</h2>
                <ol className="space-y-2">
                  {group.entries.map((e) => (
                    <EntryRow key={e.id} entry={e} />
                  ))}
                  {group.entries.length === 0 && <li className="text-sm text-slate-400 dark:text-slate-500">Sem registros.</li>}
                </ol>
              </Card>
            ))}
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}
