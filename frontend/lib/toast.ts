// Store imperativo de toasts — qualquer componente chama toast.success(...)
// sem precisar de contexto/props; o <Toaster /> (montado uma vez no
// AppShell) escuta via subscribeToasts e renderiza.

export type ToastTone = 'success' | 'error' | 'info';

export type ToastItem = {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
};

type Listener = (items: ToastItem[]) => void;

let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener(items);
}

function push(tone: ToastTone, title: string, description?: string) {
  const id = nextId++;
  items = [...items, { id, tone, title, description }];
  emit();
  return id;
}

export function dismissToast(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  listener(items);
  return () => {
    listeners.delete(listener);
  };
}

export const toast = {
  success: (title: string, description?: string) => push('success', title, description),
  error: (title: string, description?: string) => push('error', title, description),
  info: (title: string, description?: string) => push('info', title, description),
};
