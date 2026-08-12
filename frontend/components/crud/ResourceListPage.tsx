'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { apiFetch, fetchMe } from '@/lib/api';
import type { Paginated } from '@/lib/types';
import AppShell from '@/components/AppShell';
import { PageContainer, Spinner, buttonClass, inputClass } from '@/lib/ui';
import { cn } from '@/lib/cn';

export type Column = {
  key: string;
  label: string;
  render?: (item: any) => React.ReactNode;
};

type Props = {
  apiPath: string; // ex: '/api/taxonomia/paises/'
  title: string;
  columns: Column[];
  rowHref: (item: any) => string;
  createHref?: string;
  createLabel?: string;
  extraQuery?: string; // ex: '&categoria=FORMULARIO'
  searchPlaceholder?: string;
};

// Lista genérica reusada por todas as telas CRUD mecanicamente similares
// (taxonomia, material de apoio, usuários/grupos) — evita reescrever a
// mesma tabela com busca 11 vezes.
export default function ResourceListPage({
  apiPath,
  title,
  columns,
  rowHref,
  createHref,
  createLabel,
  extraQuery,
  searchPlaceholder,
}: Props) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [data, setData] = useState<Paginated<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
    const q = new URLSearchParams();
    if (search.trim()) q.set('search', search.trim());
    apiFetch<Paginated<any>>(`${apiPath}?${q.toString()}${extraQuery || ''}`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [authChecked, search, apiPath, extraQuery]);

  if (!authChecked) return null;

  return (
    <AppShell title={title}>
      <PageContainer wide>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">{title}</h1>
          {createHref && (
            <Link href={createHref} className={buttonClass('primary')}>
              <Plus className="h-4 w-4" strokeWidth={2} />
              {createLabel || 'Novo'}
            </Link>
          )}
        </div>

        <div className="relative mb-4 max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-500" strokeWidth={1.75} />
          <input
            type="text"
            placeholder={searchPlaceholder || 'Buscar…'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(inputClass, 'pl-9')}
          />
        </div>

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
                  {columns.map((c) => (
                    <th key={c.key} className="px-4 py-3">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.results.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => router.push(rowHref(item))}
                    className="cursor-pointer border-b border-stone-100 transition-colors last:border-0 hover:bg-accent-50/50 dark:border-stone-800 dark:hover:bg-stone-800/50"
                  >
                    {columns.map((c) => (
                      <td key={c.key} className="px-4 py-3 text-stone-700 dark:text-stone-300">
                        {c.render ? c.render(item) : item[c.key] ?? '-'}
                      </td>
                    ))}
                  </tr>
                ))}
                {data.results.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-stone-400 dark:text-stone-500" colSpan={columns.length}>
                      Nenhum registro encontrado.
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
