'use client';

import Sidebar from './Sidebar';
import Toaster from './Toaster';

export default function AppShell({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-stone-50 dark:bg-stone-950">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {title && (
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center border-b border-stone-200 bg-white/80 px-6 backdrop-blur dark:border-stone-800 dark:bg-stone-950/80">
            <span className="text-sm font-medium text-stone-500 dark:text-stone-400">{title}</span>
          </header>
        )}
        <main className="flex-1">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
