'use client';

import { useEffect, useState } from 'react';
import * as RadixToast from '@radix-ui/react-toast';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { dismissToast, subscribeToasts, type ToastItem } from '@/lib/toast';
import { cn } from '@/lib/cn';

const toneConfig: Record<ToastItem['tone'], { icon: React.ElementType; classes: string; iconClasses: string }> = {
  success: {
    icon: CheckCircle2,
    classes: 'border-mint-200 bg-mint-50 text-mint-800 dark:border-mint-900/50 dark:bg-mint-950/40 dark:text-mint-300',
    iconClasses: 'text-mint-600 dark:text-mint-400',
  },
  error: {
    icon: XCircle,
    classes: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300',
    iconClasses: 'text-red-600 dark:text-red-400',
  },
  info: {
    icon: Info,
    classes: 'border-accent-200 bg-accent-50 text-accent-800 dark:border-accent-900/50 dark:bg-accent-900/20 dark:text-accent-300',
    iconClasses: 'text-accent-600 dark:text-accent-400',
  },
};

// Montado uma vez em AppShell. Alertas de CRUD em qualquer tela chamam
// toast.success/error/info (lib/toast.ts) e aparecem aqui automaticamente.
export default function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => subscribeToasts(setItems), []);

  return (
    <RadixToast.Provider swipeDirection="right" duration={4000}>
      {items.map((t) => {
        const { icon: Icon, classes, iconClasses } = toneConfig[t.tone];
        return (
          <RadixToast.Root
            key={t.id}
            onOpenChange={(open) => !open && dismissToast(t.id)}
            className={cn(
              'flex items-start gap-2.5 rounded-xl border px-4 py-3 shadow-popover transition-transform data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
              classes,
            )}
          >
            <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', iconClasses)} strokeWidth={2} />
            <div className="min-w-0 flex-1">
              <RadixToast.Title className="text-sm font-medium">{t.title}</RadixToast.Title>
              {t.description && <RadixToast.Description className="mt-0.5 text-xs opacity-80">{t.description}</RadixToast.Description>}
            </div>
            <RadixToast.Close className="shrink-0 opacity-60 transition-opacity hover:opacity-100">
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </RadixToast.Close>
          </RadixToast.Root>
        );
      })}
      <RadixToast.Viewport className="fixed bottom-0 right-0 z-[100] m-0 flex w-96 max-w-[100vw] list-none flex-col gap-2 p-6 outline-none" />
    </RadixToast.Provider>
  );
}
