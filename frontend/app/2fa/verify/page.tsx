'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { Button, Card, Centered, ErrorText, Field, Spinner } from '@/lib/ui';
import ThemeToggle from '@/components/ThemeToggle';

export default function TOTPVerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch('/api/auth/2fa/verify/', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      router.push('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao verificar código.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Centered>
      <ThemeToggle className="fixed right-4 top-4" />
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-600 text-white shadow-card">
            <ShieldCheck className="h-6 w-6" strokeWidth={2} />
          </span>
          <h1 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100">Verificação em Dois Fatores</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">Digite o código do seu aplicativo autenticador.</p>
        </div>
        <Card>
          <form onSubmit={handleSubmit}>
            <Field label="Código">
              <input
                className="block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-center font-mono text-lg tracking-[0.4em] text-stone-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                autoFocus
              />
            </Field>
            <ErrorText>{error}</ErrorText>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Spinner className="text-white" />}
              Verificar
            </Button>
          </form>
        </Card>
      </div>
    </Centered>
  );
}
