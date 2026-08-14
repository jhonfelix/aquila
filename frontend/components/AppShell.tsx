'use client';

import Link from 'next/link';
import { Bot } from 'lucide-react';
import Sidebar from './Sidebar';
import Toaster from './Toaster';

export default function AppShell({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-mist-50 dark:bg-space-950">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {title && (
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-mist-200 bg-white/80 px-6 backdrop-blur dark:border-space-700 dark:bg-space-950/80">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
            <Link
              href="/assistente"
              className="flex items-center gap-2 rounded-lg bg-accent-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
            >
              <Bot className="h-4 w-4" strokeWidth={2} />
              Assistente IA
            </Link>
          </header>
        )}
        <main className="flex-1">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
