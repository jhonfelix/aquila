'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  Clock,
  Eye,
  FilePlus,
  FileStack,
  FileText,
  Globe2,
  Pencil,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import { apiFetch, fetchMe, type Me } from '@/lib/api';
import type { Atividade, OcorrenciaGeral, Paginated } from '@/lib/types';
import { formatRelative } from '@/lib/format';
import { Card, Centered, PageContainer, Spinner } from '@/lib/ui';
import { cn } from '@/lib/cn';
import AppShell from '@/components/AppShell';

const SHORTCUTS = [
  { href: '/ocorrencias', icon: FileStack, label: 'Ocorrências', desc: 'Redigir, confirmar e autenticar ocorrências espaciais.' },
  { href: '/taxonomia/artefatos-espaciais', icon: Globe2, label: 'Taxonomia', desc: 'Países, cidades, aeródromos, artefatos e veículos.' },
  { href: '/material-apoio/formularios', icon: FileText, label: 'Material de Apoio', desc: 'Formulários, normas, legislação e documentos.' },
  { href: '/usuarios', icon: Users, label: 'Usuários', desc: 'Contas do sistema e grupos de permissão.' },
];

type StatusCounts = { confirmar: number; autenticar: number; autenticado: number };

const ACTION_META: Record<number, { icon: React.ElementType; tone: 'success' | 'accent' | 'danger' | 'neutral' }> = {
  0: { icon: FilePlus, tone: 'success' },
  1: { icon: Pencil, tone: 'accent' },
  2: { icon: Trash2, tone: 'danger' },
  3: { icon: Eye, tone: 'neutral' },
};

export default function HomePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [counts, setCounts] = useState<StatusCounts | null>(null);
  const [atividades, setAtividades] = useState<Atividade[] | null>(null);

  useEffect(() => {
    fetchMe().then((data) => {
      if (!data) {
        router.replace('/login');
        return;
      }
      if (data.totp_enabled && !data['2fa_verified']) {
        router.replace('/2fa/verify');
        return;
      }
      if (data.totp_obrigatorio && !data.totp_enabled) {
        router.replace('/2fa/setup');
        return;
      }
      setMe(data);
    });
  }, [router]);

  useEffect(() => {
    if (!me) return;
    Promise.all(
      (['CONFIRMAR', 'AUTENTICAR', 'AUTENTICADO'] as const).map((status) =>
        apiFetch<Paginated<OcorrenciaGeral>>(`/api/ocorrencia/ocorrencias/?status=${status}`),
      ),
    ).then(([confirmar, autenticar, autenticado]) => {
      setCounts({ confirmar: confirmar.count, autenticar: autenticar.count, autenticado: autenticado.count });
    });

    apiFetch<Atividade[]>('/api/auth/atividades/?limit=8').then(setAtividades);
  }, [me]);

  if (me === undefined) {
    return (
      <Centered>
        <Spinner className="h-6 w-6 text-accent-600" />
      </Centered>
    );
  }
  if (me === null) {
    return null;
  }

  const total = counts ? counts.confirmar + counts.autenticar + counts.autenticado : null;

  return (
    <AppShell title="Início">
      <PageContainer wide>
        <div className="mb-8">
          <h1 className="font-serif text-2xl tracking-tight text-stone-900 dark:text-stone-100">
            Bem-vindo, {me.nome_guerra || me.nome}
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{me.email}</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile icon={FileStack} label="Total de Ocorrências" value={total} tone="neutral" />
          <StatTile icon={Clock} label="Aguardando Confirmação" value={counts?.confirmar} tone="warning" />
          <StatTile icon={ShieldAlert} label="Aguardando Autenticação" value={counts?.autenticar} tone="accent" />
          <StatTile icon={ShieldCheck} label="Autenticadas" value={counts?.autenticado} tone="success" />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h2 className="mb-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Suas últimas atividades</h2>
            {atividades === null && (
              <div className="flex items-center gap-2 py-6 text-sm text-stone-400 dark:text-stone-500">
                <Spinner /> Carregando…
              </div>
            )}
            {atividades && atividades.length === 0 && (
              <p className="py-2 text-sm text-stone-400 dark:text-stone-500">Nenhuma atividade registrada ainda.</p>
            )}
            {atividades && atividades.length > 0 && (
              <ul className="-mx-2">
                {atividades.map((a) => {
                  const meta = ACTION_META[a.action] || ACTION_META[3];
                  return (
                    <li
                      key={a.id}
                      className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50"
                    >
                      <ActionIcon icon={meta.icon} tone={meta.tone} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-stone-800 dark:text-stone-200">
                          <span className="font-medium">{a.action_display}</span>
                          {a.model_verbose && <span className="text-stone-400 dark:text-stone-500"> · {a.model_verbose}</span>}
                        </p>
                        <p className="truncate text-xs text-stone-400 dark:text-stone-500">{a.object_repr}</p>
                      </div>
                      <span className="shrink-0 text-xs text-stone-400 dark:text-stone-500">{formatRelative(a.timestamp)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="mb-4 text-sm font-semibold text-stone-900 dark:text-stone-100">Acesso Rápido</h2>
            <div className="space-y-1">
              {SHORTCUTS.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="group flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-400">
                    <s.icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium text-stone-800 dark:text-stone-200">{s.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-accent-500 dark:text-stone-600" strokeWidth={2} />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </PageContainer>
    </AppShell>
  );
}

const tileToneClass: Record<string, string> = {
  neutral: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  accent: 'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

function StatTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: number | null | undefined;
  tone: 'neutral' | 'warning' | 'accent' | 'success';
}) {
  return (
    <Card className="flex items-center gap-4">
      <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', tileToneClass[tone])}>
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-semibold tabular-nums tracking-tight text-stone-900 dark:text-stone-100">
          {value == null ? <Spinner className="h-5 w-5 text-stone-300 dark:text-stone-600" /> : value}
        </p>
        <p className="truncate text-xs text-stone-500 dark:text-stone-400">{label}</p>
      </div>
    </Card>
  );
}

const actionIconToneClass: Record<string, string> = {
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  accent: 'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  neutral: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300',
};

function ActionIcon({ icon: Icon, tone }: { icon: React.ElementType; tone: string }) {
  return (
    <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', actionIconToneClass[tone])}>
      <Icon className="h-4 w-4" strokeWidth={1.75} />
    </span>
  );
}
