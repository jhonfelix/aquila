'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { inputClass, Spinner } from '@/lib/ui';
import { cn } from '@/lib/cn';
import type { Paginated } from '@/lib/types';

type Props = {
  apiPath: string; // ex: '/api/grupos/'
  value: number[];
  onChange: (ids: number[]) => void;
  getLabel: (item: any) => string;
  placeholder?: string;
};

// Variante multi-seleção de AsyncCombobox — para campos M2M (ex.: grupos de
// um usuário, permissões de um grupo). Guarda os itens selecionados como
// chips removíveis e busca via ?search= no DRF para adicionar novos.
export default function AsyncMultiCombobox({ apiPath, value, onChange, getLabel, placeholder }: Props) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<number, any>>({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const missing = value.filter((id) => !(id in selectedItems));
    if (missing.length === 0) return;
    Promise.all(
      missing.map((id) =>
        apiFetch<any>(`${apiPath}${id}/`)
          .then((item) => [id, item] as const)
          .catch(() => [id, { id, __unknown: true }] as const),
      ),
    ).then((pairs) => {
      setSelectedItems((prev) => {
        const next = { ...prev };
        for (const [id, item] of pairs) next[id] = item;
        return next;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, apiPath]);

  function handleQueryChange(q: string) {
    setQuery(q);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setOptions([]);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await apiFetch<Paginated<any>>(`${apiPath}?search=${encodeURIComponent(q)}`);
        setOptions(data.results.slice(0, 20));
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function addItem(item: any) {
    if (!value.includes(item.id)) {
      setSelectedItems((prev) => ({ ...prev, [item.id]: item }));
      onChange([...value, item.id]);
    }
    setQuery('');
    setOptions([]);
  }

  function removeItem(id: number) {
    onChange(value.filter((v) => v !== id));
  }

  return (
    <div>
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {value.map((id) => (
            <span
              key={id}
              className="inline-flex items-center gap-1.5 rounded-md bg-accent-50 px-2 py-1 text-xs font-medium text-accent-800 dark:bg-accent-900/30 dark:text-accent-300"
            >
              {selectedItems[id] ? getLabel(selectedItems[id]) : `#${id}`}
              <button type="button" onClick={() => removeItem(id)} className="text-accent-500 hover:text-accent-800 dark:hover:text-accent-100">
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" strokeWidth={1.75} />
          <input
            className={cn(inputClass, 'pl-9')}
            type="text"
            value={query}
            placeholder={placeholder}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onChange={(e) => handleQueryChange(e.target.value)}
          />
          {loading && <Spinner className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />}
        </div>
        {open && query.trim().length >= 2 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-lg border border-mist-200 bg-white p-1 shadow-popover dark:border-space-700 dark:bg-space-900">
            {loading && <div className="px-3 py-2 text-sm text-slate-400 dark:text-slate-500">Buscando…</div>}
            {!loading && options.length === 0 && <div className="px-3 py-2 text-sm text-slate-400 dark:text-slate-500">Nenhum resultado</div>}
            {!loading &&
              options.map((opt) => (
                <div
                  key={opt.id}
                  onMouseDown={() => addItem(opt)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-accent-50 hover:text-accent-800 dark:text-slate-300 dark:hover:bg-space-800 dark:hover:text-accent-300',
                    value.includes(opt.id) && 'opacity-50',
                  )}
                >
                  {getLabel(opt)}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
