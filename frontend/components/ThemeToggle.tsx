'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/cn';

export default function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('aquila-theme', next ? 'dark' : 'light');
  }

  // Evita renderizar o ícone errado por uma fração de segundo antes do
  // useEffect ler o estado real aplicado pelo script anti-flash.
  if (!mounted) {
    return <div className={cn('h-8 w-8', className)} />;
  }

  return (
    <button
      onClick={toggle}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-mist-100 hover:text-slate-700 dark:hover:bg-space-800 dark:hover:text-slate-200',
        className,
      )}
      title={dark ? 'Modo claro' : 'Modo escuro'}
    >
      {dark ? <Sun className="h-4 w-4" strokeWidth={1.75} /> : <Moon className="h-4 w-4" strokeWidth={1.75} />}
    </button>
  );
}
