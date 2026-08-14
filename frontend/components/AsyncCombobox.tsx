'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Search } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { errorRingClass, inputClass, Spinner } from '@/lib/ui';
import { cn } from '@/lib/cn';
import type { Paginated } from '@/lib/types';

type Props = {
  apiPath: string; // ex: '/api/taxonomia/cidades/'
  value: number | null;
  onChange: (id: number | null) => void;
  getLabel: (item: any) => string;
  placeholder?: string;
  required?: boolean;
  invalid?: boolean;
};

// Combobox genérico: busca via ?search= no DRF (SearchFilter), reusado para
// qualquer FK com autocomplete (cidade, aeródromo, veículo lançador, etc).
export default function AsyncCombobox({ apiPath, value, onChange, getLabel, placeholder, required, invalid }: Props) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<any[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value == null) {
      setSelectedLabel('');
      return;
    }
    apiFetch<any>(`${apiPath}${value}/`)
      .then((item) => setSelectedLabel(getLabel(item)))
      .catch(() => setSelectedLabel(`#${value}`));
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

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" strokeWidth={1.75} />
        <input
          className={cn(inputClass, 'pl-9', invalid && errorRingClass)}
          type="text"
          value={open ? query : selectedLabel}
          placeholder={placeholder}
          required={required && value == null}
          onFocus={() => {
            setOpen(true);
            setQuery('');
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(e) => handleQueryChange(e.target.value)}
        />
        {loading && <Spinner className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />}
      </div>
      {open && (query.trim().length >= 2 || loading) && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-lg border border-mist-200 bg-white p-1 shadow-popover dark:border-space-700 dark:bg-space-900">
          {loading && <div className="px-3 py-2 text-sm text-slate-400 dark:text-slate-500">Buscando…</div>}
          {!loading && options.length === 0 && <div className="px-3 py-2 text-sm text-slate-400 dark:text-slate-500">Nenhum resultado</div>}
          {!loading &&
            options.map((opt) => (
              <div
                key={opt.id}
                onMouseDown={() => {
                  onChange(opt.id);
                  setSelectedLabel(getLabel(opt));
                  setOpen(false);
                }}
                className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-accent-50 hover:text-accent-800 dark:text-slate-300 dark:hover:bg-space-800 dark:hover:text-accent-300"
              >
                {getLabel(opt)}
                {opt.id === value && <Check className="h-3.5 w-3.5 text-accent-600" strokeWidth={2} />}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
