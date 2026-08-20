'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Rocket } from 'lucide-react';
import { apiFetch, primeCsrf, ApiError } from '@/lib/api';
import { Button, ErrorText, Spinner, inputClass } from '@/lib/ui';
import { cn } from '@/lib/cn';
import Starfield from '@/components/Starfield';

// `dark` fixo de propósito: a tela de login sempre usa o céu noturno do
// Starfield, independente do tema claro/escuro escolhido pro resto do app
// (que só é aplicado depois de autenticado).
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
    <div className="dark relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <Starfield />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-600 text-white shadow-[0_0_30px_-6px_rgba(36,105,176,0.7)]">
            <Rocket className="h-7 w-7" strokeWidth={2} />
          </span>
          <h1 className="text-3xl font-bold tracking-[0.15em] text-white">ÁQUILA</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Sistema de Gestão de Ocorrências Espaciais</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl border border-space-700/60 bg-space-900/80 p-7 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-sm"
        >
          <input
            className={cn(inputClass, 'mb-3')}
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <input
            className={cn(inputClass, 'mb-4')}
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <ErrorText>{error}</ErrorText>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Spinner className="text-white" /> : <LogIn className="h-4 w-4" strokeWidth={1.75} />}
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
