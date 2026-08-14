'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Rocket } from 'lucide-react';
import { apiFetch, primeCsrf, ApiError } from '@/lib/api';
import { Button, Card, ErrorText, Field, Spinner, inputClass } from '@/lib/ui';
import Starfield from '@/components/Starfield';

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
    // `dark` fixo de propósito: a tela de login sempre usa o céu noturno do
    // Starfield, independente do tema claro/escuro escolhido pro resto do
    // app (que só é aplicado depois de autenticado). Como o Tailwind resolve
    // `dark:` por ancestral com essa classe, tudo dentro (Card, inputs,
    // Starfield) já assume a aparência escura sem precisar duplicar estilos.
    <div className="dark relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <Starfield />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-600 text-white shadow-card">
            <Rocket className="h-6 w-6" strokeWidth={2} />
          </span>
          <h1 className="text-lg font-semibold tracking-tight text-white">ÁQUILA</h1>
          <p className="text-sm text-slate-400">Sistema de Gestão de Ocorrências Espaciais</p>
        </div>
        <Card className="dark:border-space-700/60 dark:bg-space-900/80 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_60px_-15px_rgba(0,0,0,0.7)] dark:backdrop-blur-sm">
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
    </div>
  );
}
