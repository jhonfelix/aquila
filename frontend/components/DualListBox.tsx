'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { inputClass, Spinner } from '@/lib/ui';
import { cn } from '@/lib/cn';

type Item = { id: number; [key: string]: any };

type Props = {
  apiPath: string; // endpoint sem paginação (retorna array simples), ex: '/api/permissions/'
  value: number[];
  onChange: (ids: number[]) => void;
  getLabel: (item: any) => string;
  availableTitle?: string;
  chosenTitle?: string;
  availableHint?: string;
  chosenHint?: string;
};

// Aceita tanto endpoints sem paginação (retornam array simples, ex.:
// /api/permissions/) quanto paginados no padrão DRF (ex.: /api/grupos/,
// usado também pela lista de grupos — não convém tirar a paginação de lá) —
// nesse caso segue os links `next` até reunir a lista inteira.
async function fetchAllItems(apiPath: string): Promise<Item[]> {
  let url: string | null = apiPath;
  let results: Item[] = [];
  while (url) {
    const page: any = await apiFetch<any>(url);
    if (Array.isArray(page)) return page;
    results = results.concat(page.results || []);
    url = page.next;
  }
  return results;
}

// Réplica do widget filter_horizontal (SelectFilter2) do Django Admin: duas
// listas lado a lado com filtro local, setas para mover a seleção e atalhos
// "escolher/remover todas". Carrega a lista inteira uma vez e filtra no
// cliente, igual ao widget original.
export default function DualListBox({
  apiPath,
  value,
  onChange,
  getLabel,
  availableTitle = 'disponíveis',
  chosenTitle = 'escolhido(s)',
  availableHint,
  chosenHint,
}: Props) {
  const [items, setItems] = useState<Item[] | null>(null);
  const [availableFilter, setAvailableFilter] = useState('');
  const [chosenFilter, setChosenFilter] = useState('');
  const [availableSelected, setAvailableSelected] = useState<number[]>([]);
  const [chosenSelected, setChosenSelected] = useState<number[]>([]);

  useEffect(() => {
    setItems(null);
    fetchAllItems(apiPath).then(setItems);
  }, [apiPath]);

  const chosenSet = useMemo(() => new Set(value), [value]);
  const available = useMemo(() => (items || []).filter((i) => !chosenSet.has(i.id)), [items, chosenSet]);
  const chosen = useMemo(() => {
    const byId = new Map((items || []).map((i) => [i.id, i]));
    return value.map((id) => byId.get(id)).filter((i): i is Item => !!i);
  }, [items, value]);

  const availableFiltered = useMemo(
    () => available.filter((i) => getLabel(i).toLowerCase().includes(availableFilter.trim().toLowerCase())),
    [available, availableFilter, getLabel],
  );
  const chosenFiltered = useMemo(
    () => chosen.filter((i) => getLabel(i).toLowerCase().includes(chosenFilter.trim().toLowerCase())),
    [chosen, chosenFilter, getLabel],
  );

  function moveToChosen(ids: number[]) {
    if (ids.length === 0) return;
    const idsSet = new Set(ids);
    onChange([...value, ...(items || []).filter((i) => idsSet.has(i.id) && !chosenSet.has(i.id)).map((i) => i.id)]);
    setAvailableSelected([]);
  }
  function moveToAvailable(ids: number[]) {
    if (ids.length === 0) return;
    const idsSet = new Set(ids);
    onChange(value.filter((id) => !idsSet.has(id)));
    setChosenSelected([]);
  }

  if (!items) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-stone-400 dark:text-stone-500">
        <Spinner /> Carregando…
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        <ListPane
          title={availableTitle}
          hint={availableHint}
          filter={availableFilter}
          onFilterChange={setAvailableFilter}
          items={availableFiltered}
          getLabel={getLabel}
          selected={availableSelected}
          onSelectedChange={setAvailableSelected}
          onDoubleClickItem={(id) => moveToChosen([id])}
          footer={
            available.length > 0 && (
              <button
                type="button"
                onClick={() => moveToChosen(available.map((i) => i.id))}
                className="w-full py-1.5 text-center text-xs text-accent-600 hover:underline dark:text-accent-400"
              >
                Escolher todas
              </button>
            )
          }
        />
        <div className="flex flex-col items-center gap-2 pt-20">
          <button
            type="button"
            onClick={() => moveToChosen(availableSelected)}
            disabled={availableSelected.length === 0}
            title="Adicionar"
            className="rounded-md border border-stone-200 p-1.5 text-stone-500 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
          >
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => moveToAvailable(chosenSelected)}
            disabled={chosenSelected.length === 0}
            title="Remover"
            className="rounded-md border border-stone-200 p-1.5 text-stone-500 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
        <ListPane
          title={chosenTitle}
          hint={chosenHint}
          filter={chosenFilter}
          onFilterChange={setChosenFilter}
          items={chosenFiltered}
          getLabel={getLabel}
          selected={chosenSelected}
          onSelectedChange={setChosenSelected}
          onDoubleClickItem={(id) => moveToAvailable([id])}
          footer={
            chosen.length > 0 && (
              <div className="flex items-center justify-between px-2 py-1.5 text-xs">
                <button type="button" onClick={() => setChosenSelected([])} className="text-stone-400 hover:underline dark:text-stone-500">
                  (limpar seleção)
                </button>
                <button type="button" onClick={() => onChange([])} className="font-medium text-red-500 hover:underline dark:text-red-400">
                  Remover todas
                </button>
              </div>
            )
          }
        />
      </div>
      <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">
        Pressione &quot;Control&quot;, ou &quot;Command&quot; no Mac, para selecionar mais de um. Duplo clique também move o item.
      </p>
    </div>
  );
}

function ListPane({
  title,
  hint,
  filter,
  onFilterChange,
  items,
  getLabel,
  selected,
  onSelectedChange,
  onDoubleClickItem,
  footer,
}: {
  title: string;
  hint?: string;
  filter: string;
  onFilterChange: (v: string) => void;
  items: Item[];
  getLabel: (item: any) => string;
  selected: number[];
  onSelectedChange: (ids: number[]) => void;
  onDoubleClickItem: (id: number) => void;
  footer?: React.ReactNode;
}) {
  const [anchor, setAnchor] = useState<number | null>(null);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  function handleClick(e: React.MouseEvent, id: number, index: number) {
    if (e.shiftKey && anchor != null) {
      const lo = Math.min(anchor, index);
      const hi = Math.max(anchor, index);
      onSelectedChange(items.slice(lo, hi + 1).map((i) => i.id));
      return;
    }
    if (e.ctrlKey || e.metaKey) {
      onSelectedChange(selectedSet.has(id) ? selected.filter((s) => s !== id) : [...selected, id]);
      setAnchor(index);
      return;
    }
    onSelectedChange([id]);
    setAnchor(index);
  }

  return (
    <div className="min-w-0 flex-1 rounded-lg border border-stone-200 dark:border-stone-700">
      <div className="border-b border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">
        {title}
      </div>
      {hint && (
        <p className="border-b border-stone-100 px-3 py-2 text-xs text-stone-400 dark:border-stone-800 dark:text-stone-500">{hint}</p>
      )}
      <div className="p-2">
        <input
          className={cn(inputClass, 'text-sm')}
          type="text"
          placeholder="Filtro"
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
        />
      </div>
      <div className="h-56 overflow-y-auto border-t border-stone-100 dark:border-stone-800">
        {items.length === 0 && <div className="px-3 py-4 text-center text-xs text-stone-400 dark:text-stone-500">Nenhum item</div>}
        {items.map((item, index) => (
          <div
            key={item.id}
            onClick={(e) => handleClick(e, item.id, index)}
            onDoubleClick={() => onDoubleClickItem(item.id)}
            className={cn(
              'cursor-pointer select-none truncate px-3 py-1.5 text-xs',
              selectedSet.has(item.id)
                ? 'bg-accent-500 text-white'
                : 'text-stone-700 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800',
            )}
          >
            {getLabel(item)}
          </div>
        ))}
      </div>
      {footer && <div className="border-t border-stone-100 dark:border-stone-800">{footer}</div>}
    </div>
  );
}
