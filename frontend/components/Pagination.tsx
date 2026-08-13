'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

// Precisa bater com REST_FRAMEWORK.PAGE_SIZE em backend/dedalo/settings.py —
// a resposta paginada do DRF só traz count/next/previous, não o tamanho da
// página, então usamos essa constante pra calcular o total de páginas.
export const PAGE_SIZE = 25;

// Réplica da paginação numerada do Django Admin (changelist): números de
// página com reticências pro meio quando há muitas páginas, mantendo os
// primeiros/últimos e uma janela ao redor da página atual sempre visíveis.
export function buildPageList(current: number, total: number): (number | '…')[] {
  const onEachSide = 2;
  const onEnds = 2;
  const pages = new Set<number>();
  for (let i = 1; i <= Math.min(onEnds, total); i++) pages.add(i);
  for (let i = Math.max(1, current - onEachSide); i <= Math.min(total, current + onEachSide); i++) pages.add(i);
  for (let i = Math.max(1, total - onEnds + 1); i <= total; i++) pages.add(i);
  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | '…')[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push('…');
    result.push(p);
    prev = p;
  }
  return result;
}

// Rodapé de paginação padrão do sistema: contagem total + navegação por
// página. Usado por toda listagem que consome um endpoint paginado do DRF
// ({count, next, previous, results}) — mantém a UX de paginação idêntica em
// todas as telas, em vez de cada lista reimplementar a sua.
export default function Pagination({
  page,
  count,
  hasPrevious,
  hasNext,
  onChange,
  label,
}: {
  page: number;
  count: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onChange: (page: number) => void;
  label: string; // ex.: "cidades", "ocorrências"
}) {
  if (count === 0) return null;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-stone-500 dark:text-stone-400">
        {count} {label}
      </p>
      {totalPages > 1 && (
        <nav className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChange(Math.max(1, page - 1))}
            disabled={!hasPrevious}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-stone-400 dark:hover:bg-stone-800"
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>
          {buildPageList(page, totalPages).map((p, idx) =>
            p === '…' ? (
              <span key={`ellipsis-${idx}`} className="px-1.5 text-sm text-stone-400 dark:text-stone-500">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onChange(p)}
                className={cn(
                  'flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors',
                  p === page
                    ? 'bg-accent-600 text-white'
                    : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800',
                )}
              >
                {p}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => onChange(Math.min(totalPages, page + 1))}
            disabled={!hasNext}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-stone-400 dark:hover:bg-stone-800"
            aria-label="Próxima página"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </nav>
      )}
    </div>
  );
}
