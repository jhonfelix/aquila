'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { Button, Card, Centered, ErrorText, Field, inputClass, Spinner } from '@/lib/ui';
import { cn } from '@/lib/cn';
import ThemeToggle from '@/components/ThemeToggle';

type SetupData = { qr_b64: string; secret: string; already_enabled: boolean };

export default function TOTPSetupPage() {
  const router = useRouter();
  const [setup, setSetup] = useState<SetupData | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<SetupData>('/api/auth/2fa/setup/')
      .then(setSetup)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Erro ao carregar setup de 2FA.');
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch('/api/auth/2fa/setup/', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      router.push('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao ativar 2FA.');
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
          <h1 className="font-serif text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100">Configurar 2FA</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Escaneie o QR code com seu aplicativo autenticador (Google Authenticator, Authy, etc.) e digite o código
            gerado para confirmar.
          </p>
        </div>
        <Card>
          {setup && (
            <div className="mb-5 flex flex-col items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${setup.qr_b64}`}
                alt="QR code de configuração do 2FA"
                className="h-44 w-44 rounded-lg border border-stone-200 bg-white p-2"
              />
              <p className="break-all text-center font-mono text-xs text-stone-400 dark:text-stone-500">{setup.secret}</p>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <Field label="Código">
              <input
                className={cn(inputClass, 'text-center font-mono text-lg tracking-[0.4em]')}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </Field>
            <ErrorText>{error}</ErrorText>
            <Button type="submit" className="w-full" disabled={loading || !setup}>
              {loading && <Spinner className="text-white" />}
              Ativar 2FA
            </Button>
          </form>
        </Card>
      </div>
    </Centered>
  );
}
