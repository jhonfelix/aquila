'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, Lock, MessageSquare, MessageSquareText, Plus, Trash2, X } from 'lucide-react';
import { apiFetch, primeCsrf, ApiError } from '@/lib/api';
import { toast } from '@/lib/toast';
import { formatUsuario } from '@/lib/format';
import type { ChecklistEtapa, OcorrenciaChecklistItem, Usuario } from '@/lib/types';
import { CHECKLIST_ETAPA_CHOICES } from '@/lib/choices';
import AsyncCombobox from '@/components/AsyncCombobox';
import { Badge, Spinner, inputClass } from '@/lib/ui';
import { cn } from '@/lib/cn';

function percentTone(pct: number) {
  if (pct >= 100) return 'success' as const;
  if (pct > 0) return 'accent' as const;
  return 'neutral' as const;
}

function ChecklistItemRow({
  item,
  onUpdate,
  onDelete,
}: {
  item: OcorrenciaChecklistItem;
  onUpdate: (id: number, patch: Partial<OcorrenciaChecklistItem>) => void;
  onDelete: (id: number) => void;
}) {
  const [showComment, setShowComment] = useState(!!item.comentario);
  const [comentario, setComentario] = useState(item.comentario || '');

  function commitComentario() {
    const value = comentario.trim() || null;
    if (value !== item.comentario) onUpdate(item.id, { comentario: value });
  }

  return (
    <div
      className={cn(
        'border-b border-mist-100 px-2 py-2.5 last:border-0 dark:border-space-800',
        item.atrasado && 'border-l-2 border-l-red-500 bg-red-50/60 dark:bg-red-900/10',
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="checkbox"
          checked={item.realizado}
          onChange={(e) => onUpdate(item.id, { realizado: e.target.checked })}
          className="h-4 w-4 shrink-0 rounded border-mist-200 text-accent-600 focus:ring-accent-500 dark:border-space-700"
        />
        <span
          className={cn(
            'min-w-[12rem] flex-1 text-sm',
            item.realizado ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-700 dark:text-slate-200',
          )}
        >
          {item.descricao}
        </span>
        {item.atrasado && (
          <span
            className="flex shrink-0 items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400"
            title="Prazo de 30 dias para conclusão da Coleta de Dados vencido"
          >
            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2} />
            Atrasado
          </span>
        )}
        <div className="w-48 shrink-0">
          <AsyncCombobox
            apiPath="/api/usuarios/"
            value={item.responsavel}
            onChange={(v) =>
              onUpdate(item.id, {
                responsavel: v,
                data_vinculacao: v && !item.data_vinculacao ? new Date().toISOString().slice(0, 10) : item.data_vinculacao,
              })
            }
            getLabel={(u: Usuario) => formatUsuario(u)}
            placeholder="Responsável…"
          />
        </div>
        <input
          type="date"
          value={item.data_vinculacao || ''}
          onChange={(e) => onUpdate(item.id, { data_vinculacao: e.target.value || null })}
          className={cn(inputClass, 'w-36 shrink-0 text-xs')}
        />
        <button
          onClick={() => setShowComment((s) => !s)}
          className={cn(
            'shrink-0 transition-colors',
            item.comentario ? 'text-accent-600 hover:text-accent-700' : 'text-slate-300 hover:text-slate-500 dark:text-slate-600',
          )}
          title="Comentário (opcional)"
          type="button"
        >
          {item.comentario ? (
            <MessageSquareText className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <MessageSquare className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>
        {item.padrao ? (
          <span className="shrink-0 text-slate-200 dark:text-slate-700" title="Item padrão — não pode ser excluído">
            <Lock className="h-4 w-4" strokeWidth={1.75} />
          </span>
        ) : (
          <button
            onClick={() => onDelete(item.id)}
            className="shrink-0 text-slate-300 transition-colors hover:text-red-500 dark:text-slate-600"
            title="Remover item"
            type="button"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
          </button>
        )}
      </div>
      {showComment && (
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          onBlur={commitComentario}
          placeholder="Comentário (se necessário)…"
          className={cn(inputClass, 'mt-2 min-h-[50px] text-xs')}
        />
      )}
    </div>
  );
}

function EtapaSection({
  etapa,
  label,
  items,
  onUpdate,
  onDelete,
  onAdd,
}: {
  etapa: ChecklistEtapa;
  label: string;
  items: OcorrenciaChecklistItem[];
  onUpdate: (id: number, patch: Partial<OcorrenciaChecklistItem>) => void;
  onDelete: (id: number) => void;
  onAdd: (etapa: ChecklistEtapa, descricao: string) => void;
}) {
  const [novo, setNovo] = useState('');
  const total = items.length;
  const realizados = items.filter((i) => i.realizado).length;
  const pct = total > 0 ? Math.round((realizados / total) * 100) : 0;
  const atrasados = items.filter((i) => i.atrasado).length;

  function handleAdd() {
    if (!novo.trim()) return;
    onAdd(etapa, novo.trim());
    setNovo('');
  }

  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">{label}</h3>
        <Badge tone={percentTone(pct)}>
          {realizados}/{total} — {pct}%
        </Badge>
      </div>
      {atrasados > 0 && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
          <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={2} />
          {atrasados} item(ns) da Coleta de Dados passou(aram) do prazo de 30 dias sem conclusão.
        </div>
      )}
      <div className="rounded-lg border border-mist-200 bg-mist-50/50 px-3 dark:border-space-700 dark:bg-space-800/30">
        {items.map((item) => (
          <ChecklistItemRow key={item.id} item={item} onUpdate={onUpdate} onDelete={onDelete} />
        ))}
        {items.length === 0 && (
          <p className="py-3 text-center text-xs text-slate-400 dark:text-slate-500">Nenhum item nesta etapa.</p>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="Adicionar item…"
          className={cn(inputClass, 'text-sm')}
        />
        <button
          onClick={handleAdd}
          type="button"
          className="shrink-0 rounded-md bg-accent-600 px-3 text-white transition-colors hover:bg-accent-700"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

export default function ChecklistInvestigacaoModal({
  ocorrenciaId,
  titulo,
  onClose,
  onChanged,
}: {
  ocorrenciaId: number;
  titulo: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [items, setItems] = useState<OcorrenciaChecklistItem[] | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      await primeCsrf();
      const existing = await apiFetch<OcorrenciaChecklistItem[]>(`/api/ocorrencia/checklist-item/?ocorrencia=${ocorrenciaId}`);
      if (cancelled) return;
      if (existing.length > 0) {
        setItems(existing);
        return;
      }
      const seeded = await apiFetch<OcorrenciaChecklistItem[]>('/api/ocorrencia/checklist-item/seed/', {
        method: 'POST',
        body: JSON.stringify({ ocorrencia: ocorrenciaId }),
      });
      if (!cancelled) setItems(seeded);
    }
    load().catch((err) => {
      const message = err instanceof ApiError ? err.message : 'Erro ao carregar checklist.';
      toast.error('Erro ao carregar checklist', message);
    });
    return () => {
      cancelled = true;
    };
  }, [ocorrenciaId]);

  async function updateItem(id: number, patch: Partial<OcorrenciaChecklistItem>) {
    setItems((prev) => (prev ? prev.map((i) => (i.id === id ? { ...i, ...patch } : i)) : prev));
    setDirty(true);
    try {
      await apiFetch(`/api/ocorrencia/checklist-item/${id}/`, { method: 'PATCH', body: JSON.stringify(patch) });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao salvar item.';
      toast.error('Erro ao salvar item', message);
    }
  }

  async function deleteItem(id: number) {
    setItems((prev) => (prev ? prev.filter((i) => i.id !== id) : prev));
    setDirty(true);
    try {
      await apiFetch(`/api/ocorrencia/checklist-item/${id}/`, { method: 'DELETE' });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao remover item.';
      toast.error('Erro ao remover item', message);
    }
  }

  async function addItem(etapa: ChecklistEtapa, descricao: string) {
    setDirty(true);
    try {
      const maxOrdem = Math.max(0, ...(items || []).filter((i) => i.etapa === etapa).map((i) => i.ordem));
      const created = await apiFetch<OcorrenciaChecklistItem>('/api/ocorrencia/checklist-item/', {
        method: 'POST',
        body: JSON.stringify({ ocorrencia: ocorrenciaId, etapa, descricao, ordem: maxOrdem + 1 }),
      });
      setItems((prev) => (prev ? [...prev, created] : [created]));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao adicionar item.';
      toast.error('Erro ao adicionar item', message);
    }
  }

  function handleClose() {
    if (dirty) onChanged();
    onClose();
  }

  const total = items?.length || 0;
  const realizados = items?.filter((i) => i.realizado).length || 0;
  const pctTotal = total > 0 ? Math.round((realizados / total) * 100) : 0;

  return (
    <Dialog.Root open onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/40 dark:bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-white p-6 shadow-popover dark:bg-space-900">
          <div className="mb-1 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-slate-900 dark:text-slate-100">Checklist da Investigação</Dialog.Title>
            <Dialog.Close className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              <X className="h-4 w-4" strokeWidth={2} />
            </Dialog.Close>
          </div>
          <Dialog.Description asChild>
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>{titulo}</span>
              {items && (
                <Badge tone={percentTone(pctTotal)}>
                  {realizados}/{total} concluído — {pctTotal}%
                </Badge>
              )}
            </div>
          </Dialog.Description>

          {!items && (
            <div className="flex items-center gap-2 py-10 text-sm text-slate-400 dark:text-slate-500">
              <Spinner /> Carregando…
            </div>
          )}

          {items &&
            CHECKLIST_ETAPA_CHOICES.map(([etapa, label]) => (
              <EtapaSection
                key={etapa}
                etapa={etapa as ChecklistEtapa}
                label={label}
                items={items.filter((i) => i.etapa === etapa)}
                onUpdate={updateItem}
                onDelete={deleteItem}
                onAdd={addItem}
              />
            ))}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
