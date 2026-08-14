'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowRight, Hash, Search } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import type { OcorrenciaGeral, Paginated } from '@/lib/types';
import { cn } from '@/lib/cn';

// Busca global de ocorrências no sidebar (Ctrl+K) — abre um modal estilo
// command-palette, no lugar do antigo atalho "+ Nova Ocorrência". Criar
// ocorrência agora só é possível via Redigir/Autenticar → Redigir.
export default function OcorrenciaSearch({ collapsed, onExpand }: { collapsed: boolean; onExpand: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OcorrenciaGeral[]>([]);
  const [count, setCount] = useState(0);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openModal() {
    if (collapsed) onExpand();
    setOpen(true);
  }

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openModal();
      }
    }
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsed]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setQuery('');
      setResults([]);
      setCount(0);
      setElapsed(null);
    }
  }, [open]);

  function handleChange(q: string) {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setResults([]);
      setCount(0);
      setElapsed(null);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const start = performance.now();
      try {
        const data = await apiFetch<Paginated<OcorrenciaGeral>>(`/api/ocorrencia/ocorrencias/?search=${encodeURIComponent(q)}`);
        setResults(data.results.slice(0, 20));
        setCount(data.count);
        setElapsed((performance.now() - start) / 1000);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function goTo(id: number) {
    setOpen(false);
    router.push(`/ocorrencias/${id}`);
  }

  return (
    <>
      {collapsed ? (
        <button
          onClick={openModal}
          className="flex h-9 w-9 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-mist-100 hover:text-slate-700 dark:hover:bg-space-800 dark:hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
          title="Buscar ocorrência (Ctrl+K)"
        >
          <Search className="h-4 w-4" strokeWidth={1.75} />
        </button>
      ) : (
        <button
          onClick={openModal}
          className="flex w-full items-center gap-2 rounded-md border border-mist-200 bg-white py-2 pl-3 pr-2 text-left text-sm text-slate-400 transition-colors hover:border-slate-400 dark:border-space-700 dark:bg-space-900 dark:text-slate-500 dark:hover:border-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
        >
          <Search className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span className="flex-1">Buscar ocorrência…</span>
          <kbd className="shrink-0 rounded border border-mist-200 bg-mist-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500 dark:border-space-700 dark:bg-space-800 dark:text-slate-400">
            Ctrl+K
          </kbd>
        </button>
      )}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/60" />
          <Dialog.Content
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="fixed left-1/2 top-[12vh] z-[101] w-[92vw] max-w-xl -translate-x-1/2 overflow-hidden rounded-lg border border-mist-200 bg-white shadow-2xl dark:border-space-700 dark:bg-space-900"
          >
            <Dialog.Title className="sr-only">Buscar ocorrência</Dialog.Title>
            <div className="flex items-center gap-3 border-b border-mist-200 px-4 py-3.5 dark:border-space-700">
              <Search className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" strokeWidth={1.75} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Buscar ocorrência por número de processo ou classificação…"
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              <kbd className="shrink-0 rounded border border-mist-200 bg-mist-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500 dark:border-space-700 dark:bg-space-800 dark:text-slate-400">
                esc
              </kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {loading && <div className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">Buscando…</div>}
              {!loading && query.trim().length >= 2 && results.length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">Nenhum resultado</div>
              )}
              {!loading && query.trim().length < 2 && (
                <div className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">Digite ao menos 2 caracteres para buscar.</div>
              )}
              {!loading &&
                results.map((oc) => (
                  <button
                    key={oc.id}
                    onClick={() => goTo(oc.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-mist-100 dark:hover:bg-space-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60',
                    )}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-mist-100 text-slate-400 dark:bg-space-800 dark:text-slate-500">
                      <Hash className="h-3.5 w-3.5" strokeWidth={2} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{oc.numero_processo || `#${oc.id}`}</span>
                      <span className="text-slate-500 dark:text-slate-400"> • Ocorrência{oc.classificacao ? ` · ${oc.classificacao}` : ''}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" strokeWidth={1.75} />
                  </button>
                ))}
            </div>

            {!loading && query.trim().length >= 2 && (
              <div className="border-t border-mist-200 px-4 py-2.5 text-center text-xs text-slate-500 dark:border-space-700 dark:text-slate-400">
                {count > 0
                  ? `Encontrado${count === 1 ? '' : 's'} ${count} resultado${count === 1 ? '' : 's'}${
                      elapsed != null ? ` em ${elapsed.toFixed(2).replace('.', ',')} segundos` : ''
                    }`
                  : 'Nenhum resultado'}
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
