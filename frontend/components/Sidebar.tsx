'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  CircleCheck,
  CircleCheckBig,
  ClipboardList,
  FilePlus2,
  Files,
  FileText,
  FolderOpen,
  Globe,
  Home,
  Landmark,
  ListChecks,
  ListTree,
  LogOut,
  Map,
  MapPin,
  PanelLeft,
  Pencil,
  PlaneTakeoff,
  Rocket,
  Satellite,
  Scale,
  ShieldCheck,
  Stamp,
  User,
  Users,
} from 'lucide-react';
import { apiFetch, fetchMe, hasPerm, type Me } from '@/lib/api';
import { cn } from '@/lib/cn';
import { formatUsuario } from '@/lib/format';
import OcorrenciaSearch from './OcorrenciaSearch';
import ThemeToggle from './ThemeToggle';

// Subtítulo do cabeçalho: truncado a partir de 45 caracteres (texto completo no tooltip).
const APP_SUBTITLE = 'Sistema de Gestão de Ocorrências e de Coleta e Processamento de Dados de Segurança das Atividades Espaciais';

// `perm` é a permissão Django (app_label.acao_model) exigida para o item
// aparecer no menu — espelha o que o backend (DjangoModelPermissionsWithView)
// realmente exige pra fazer GET no endpoint por trás da tela. Item sem
// `perm` fica sempre visível (ex.: telas que não dependem de um único model).
type NavItem = { href: string; label: string; icon: React.ElementType; perm?: string };
type NavSection = { label: string; icon: React.ElementType; items: NavItem[]; disabled?: boolean };

const SECTIONS: NavSection[] = [
    {
    label: 'Redigir/Autenticar',
    icon: Pencil,
    items: [
      { href: '/ocorrencias/nova', label: 'Redigir', icon: FilePlus2, perm: 'ocorrencia.add_ocorrenciageral' },
      { href: '/ocorrencias/confirmar', label: 'Confirmar', icon: CircleCheck, perm: 'ocorrencia.view_ocorrenciageral' },
      { href: '/ocorrencias/autenticar', label: 'Autenticar', icon: Stamp, perm: 'ocorrencia.view_ocorrenciageral' },
    ],
  },
  {
    label: 'Ocorrências',
    icon: AlertTriangle,
    items: [
      { href: '/ocorrencias', label: 'Ocorrências Gerais', icon: FolderOpen, perm: 'ocorrencia.view_ocorrenciageral' },
      {
        href: '/ocorrencias/revisao-rf',
        label: 'Painel de Revisão RF',
        icon: ListChecks,
        perm: 'ocorrencia.view_ocorrenciarevisaorelatorio',
      },
    ],
  },
  {
    label: 'Controle e gestão',
    icon: CircleCheckBig,
    items: [
      {
        href: '/ocorrencias/controle-investigacao',
        label: 'Controle da Investigação',
        icon: ClipboardList,
        perm: 'ocorrencia.view_ocorrenciageral',
      },
    ],
  },
  {
    label: 'Material de Apoio',
    icon: BookOpen,
    items: [
      { href: '/material-apoio/formularios', label: 'Formulários', icon: FileText, perm: 'material_apoio.view_formulario' },
      {
        href: '/material-apoio/normas-legislacao',
        label: 'Normas e Legislação',
        icon: Scale,
        perm: 'material_apoio.view_normalegislacao',
      },
      {
        href: '/material-apoio/documentos-diversos',
        label: 'Documentos Diversos',
        icon: Files,
        perm: 'material_apoio.view_documentodiverso',
      },
      {
        href: '/material-apoio/outras-autoridades',
        label: 'Investigações de Outras Autoridades',
        icon: Landmark,
        perm: 'material_apoio.view_investigacaooutrasautoridades',
      },
    ],
  },
  {
    label: 'Taxonomia',
    icon: ListTree,
    items: [
      { href: '/taxonomia/paises', label: 'Países', icon: Globe, perm: 'taxonomia.view_geografiapais' },
      { href: '/taxonomia/ufs', label: 'UFs', icon: Map, perm: 'taxonomia.view_geografiauf' },
      { href: '/taxonomia/cidades', label: 'Cidades', icon: MapPin, perm: 'taxonomia.view_geografiacidade' },
      { href: '/taxonomia/aerodromos', label: 'Aeródromos', icon: PlaneTakeoff, perm: 'taxonomia.view_aerodromogeral' },
      {
        href: '/taxonomia/artefatos-espaciais',
        label: 'Artefatos Espaciais',
        icon: Satellite,
        perm: 'taxonomia.view_artefatoespacial',
      },
      {
        href: '/taxonomia/veiculos-lancadores',
        label: 'Veículos Lançadores',
        icon: Rocket,
        perm: 'taxonomia.view_veiculolancador',
      },
    ],
  },
  {
    label: 'Usuários & Grupos',
    icon: ShieldCheck,
    items: [
      { href: '/usuarios', label: 'Usuários', icon: User, perm: 'usuario.view_user' },
      { href: '/grupos', label: 'Grupos', icon: Users, perm: 'auth.view_group' },
    ],
  },
];

function matchesHref(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Vários itens podem "bater" com o pathname atual por prefixo (ex.:
// /ocorrencias/confirmar também começa com /ocorrencias, o href de
// "Ocorrências Gerais") — pega sempre o href mais específico (mais longo)
// entre TODOS os itens do menu, não só dentro da própria seção, senão dois
// itens de seções diferentes podiam ficar ativos ao mesmo tempo.
function getActiveHref(pathname: string, sections: NavSection[]): string | null {
  let best: string | null = null;
  for (const section of sections) {
    for (const item of section.items) {
      if (matchesHref(pathname, item.href) && (!best || item.href.length > best.length)) {
        best = item.href;
      }
    }
  }
  return best;
}

function sectionIsActive(section: NavSection, activeHref: string | null) {
  return section.items.some((i) => i.href === activeHref);
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [openOverrides, setOpenOverrides] = useState<Record<string, boolean>>({});
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetchMe().then(setMe).catch(() => setMe(null));
  }, []);

  // Só mostra no menu o que o usuário de fato pode acessar — sem isso, um
  // usuário com permissões restritas (ex.: só o grupo "Material de Apoio")
  // via menu itens de telas que o backend bloqueia com 403.
  const visibleSections = SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.perm || hasPerm(me, item.perm)),
  })).filter((section) => section.disabled || section.items.length > 0);

  const activeHref = getActiveHref(pathname, visibleSections);

  function isOpen(section: NavSection) {
    return section.label in openOverrides ? openOverrides[section.label] : sectionIsActive(section, activeHref);
  }

  function toggleSection(section: NavSection) {
    if (section.disabled) return;
    setOpenOverrides((prev) => ({ ...prev, [section.label]: !isOpen(section) }));
  }

  async function handleLogout() {
    await apiFetch('/api/auth/logout/', { method: 'POST' });
    router.replace('/login');
  }

  const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60';

  const topItemClass = (active: boolean) =>
    cn(
      'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
      focusRing,
      active
        ? 'bg-accent-50 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300'
        : 'text-slate-600 hover:bg-mist-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-space-800 dark:hover:text-slate-100',
    );

  // Item ativo marcado por uma risca âmbar de 2px na borda esquerda (fita de
  // altímetro/aba de pasta), não por um preenchimento sólido — ver plano de
  // redesign do shell.
  const subItemClass = (active: boolean) =>
    cn(
      'flex items-center gap-2 border-l-2 py-1.5 pl-[26px] pr-2.5 text-sm transition-colors',
      focusRing,
      active
        ? 'border-accent-500 font-medium text-slate-900 dark:text-slate-100'
        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-100',
    );

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen shrink-0 flex-col border-r border-mist-200 bg-mist-50 transition-[width] duration-150 dark:border-space-700 dark:bg-space-950',
        collapsed ? 'w-16' : 'w-72',
      )}
    >
      <div className={cn('flex items-center px-3 pt-4', collapsed ? 'flex-col gap-1' : 'justify-between')}>
        {!collapsed && (
          <Link href="/" className={cn('flex items-center gap-2.5 rounded-md px-1 py-0.5', focusRing)}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-600 text-white shadow-card">
              <Rocket className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold tracking-wide text-slate-900 dark:text-white">ÁQUILA</span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400" title={APP_SUBTITLE}>
                {APP_SUBTITLE.length > 45 ? `${APP_SUBTITLE.slice(0, 45)}…` : APP_SUBTITLE}
              </span>
            </span>
          </Link>
        )}
        <div className={cn('flex items-center gap-1', collapsed && 'flex-col')}>
          <ThemeToggle className={focusRing} />
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-mist-100 hover:text-slate-700 dark:hover:bg-space-800 dark:hover:text-slate-200',
              focusRing,
            )}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            <PanelLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className={cn('px-3 pt-4', collapsed && 'flex justify-center')}>
        <OcorrenciaSearch collapsed={collapsed} onExpand={() => setCollapsed(false)} />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-0.5">
          <Link href="/" className={topItemClass(pathname === '/')} title="Início">
            <Home className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            {!collapsed && 'Início'}
          </Link>
        </div>

        <div className="mt-5 space-y-3">
          {visibleSections.map((section) => {
            const active = sectionIsActive(section, activeHref);
            const open = !section.disabled && isOpen(section);
            return (
              <div key={section.label}>
                {collapsed ? (
                  section.disabled ? (
                    <span className={topItemClass(false)} title={`${section.label} (em breve)`}>
                      <section.icon className="h-4 w-4 shrink-0 opacity-40" strokeWidth={1.75} />
                    </span>
                  ) : (
                    <Link href={section.items[0].href} className={topItemClass(active)} title={section.label}>
                      <section.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                    </Link>
                  )
                ) : (
                  <>
                    <button
                      onClick={() => toggleSection(section)}
                      disabled={section.disabled}
                      title={section.disabled ? 'Em breve' : undefined}
                      className={cn(
                        'flex w-full items-center justify-between rounded-md px-2.5 py-1.5 transition-colors',
                        focusRing,
                        section.disabled && 'cursor-default opacity-40',
                      )}
                    >
                      <span
                        className={cn(
                          'flex items-center gap-2 text-xs font-semibold uppercase tracking-wide',
                          active ? 'text-accent-600 dark:text-accent-400' : 'text-slate-500 dark:text-slate-400',
                        )}
                      >
                        <section.icon
                          className={cn('h-4 w-4', active ? 'text-accent-600 dark:text-accent-400' : 'text-slate-400 dark:text-slate-500')}
                          strokeWidth={1.75}
                        />
                        {section.label}
                      </span>
                      {!section.disabled && (
                        <ChevronDown
                          className={cn('h-3.5 w-3.5 text-slate-400 transition-transform dark:text-slate-500', open && 'rotate-180')}
                        />
                      )}
                    </button>
                    {open && (
                      <div className="mt-0.5 space-y-0.5">
                        {section.items.map((item) => (
                          <Link key={item.href} href={item.href} className={subItemClass(item.href === activeHref)}>
                            <item.icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-mist-200 p-3 dark:border-space-700">
        <div className={cn('flex items-center gap-2.5 rounded-md px-1.5 py-1.5', collapsed && 'justify-center')}>
          {/* Tag retangular (crachá/etiqueta de evidência), não avatar circular. */}
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-100 text-xs font-semibold text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">
            {(me?.nome_guerra || me?.nome || '?').charAt(0).toUpperCase()}
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">{me ? formatUsuario(me) : '…'}</span>
              <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{me?.email}</span>
            </span>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-mist-100 hover:text-slate-700 dark:hover:bg-space-800 dark:hover:text-slate-200',
              focusRing,
            )}
            title="Sair"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </aside>
  );
}
