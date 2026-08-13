'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Rocket } from 'lucide-react';
import { apiFetch, primeCsrf, ApiError } from '@/lib/api';
import { Button, Card, Centered, ErrorText, Field, Spinner, inputClass } from '@/lib/ui';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await primeCsrf();
      const data = await apiFetch<{ status: string }>('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.status === '2fa_required') {
        router.push('/verificacao-2fa/verify');
      } else if (data.status === '2fa_setup_required') {
        router.push('/verificacao-2fa/setup');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Centered>
      <ThemeToggle className="fixed right-4 top-4" />
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-600 text-white shadow-card">
            <Rocket className="h-6 w-6" strokeWidth={2} />
          </span>
          <h1 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100">ÁQUILA</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">Sistema de Gestão de Ocorrências Espaciais</p>
        </div>
        <Card>
          <form onSubmit={handleSubmit}>
            <Field label="E-mail">
              <input
                className={inputClass}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </Field>
            <Field label="Senha">
              <input
                className={inputClass}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
            <ErrorText>{error}</ErrorText>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Spinner className="text-white" /> : <LogIn className="h-4 w-4" strokeWidth={1.75} />}
              Entrar
            </Button>
          </form>
        </Card>
      </div>
    </Centered>
  );
}
