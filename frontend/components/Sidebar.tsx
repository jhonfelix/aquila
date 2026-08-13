'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  CircleCheckBig,
  Home,
  ListTree,
  LogOut,
  PanelLeft,
  Pencil,
  Rocket,
  ShieldCheck,
} from 'lucide-react';
import { apiFetch, fetchMe, hasPerm, type Me } from '@/lib/api';
import { cn } from '@/lib/cn';
import { formatUsuario } from '@/lib/format';
import OcorrenciaSearch from './OcorrenciaSearch';
import ThemeToggle from './ThemeToggle';

// `perm` é a permissão Django (app_label.acao_model) exigida para o item
// aparecer no menu — espelha o que o backend (DjangoModelPermissionsWithView)
// realmente exige pra fazer GET no endpoint por trás da tela. Item sem
// `perm` fica sempre visível (ex.: telas que não dependem de um único model).
type NavItem = { href: string; label: string; perm?: string };
type NavSection = { label: string; icon: React.ElementType; items: NavItem[]; disabled?: boolean };

// Paleta azul-marinho/ciano fixa (não segue o toggle claro/escuro do app) —
// pedido explícito do usuário pra igualar o visual do menu do Django Admin
// (Unfold). Só o Sidebar usa essas cores; o resto do app mantém o tema
// terracota/claro-escuro normal.
const SECTIONS: NavSection[] = [
    {
    label: 'Redigir/Autenticar',
    icon: Pencil,
    items: [
      { href: '/ocorrencias/nova', label: 'Redigir', perm: 'ocorrencia.add_ocorrenciageral' },
      { href: '/ocorrencias/confirmar', label: 'Confirmar', perm: 'ocorrencia.view_ocorrenciageral' },
      { href: '/ocorrencias/autenticar', label: 'Autenticar', perm: 'ocorrencia.view_ocorrenciageral' },
    ],
  },
  {
    label: 'Ocorrências',
    icon: AlertTriangle,
    items: [
      { href: '/ocorrencias', label: 'Ocorrências Gerais', perm: 'ocorrencia.view_ocorrenciageral' },
      { href: '/ocorrencias/revisao-rf', label: 'Painel de Revisão RF', perm: 'ocorrencia.view_ocorrenciarevisaorelatorio' },
    ],
  },
  {
    label: 'Controle e gestão',
    icon: CircleCheckBig,
    items: [],
    disabled: true,
  },
  {
    label: 'Material de Apoio',
    icon: BookOpen,
    items: [
      { href: '/material-apoio/formularios', label: 'Formulários', perm: 'material_apoio.view_formulario' },
      { href: '/material-apoio/normas-legislacao', label: 'Normas e Legislação', perm: 'material_apoio.view_normalegislacao' },
      { href: '/material-apoio/documentos-diversos', label: 'Documentos Diversos', perm: 'material_apoio.view_documentodiverso' },
      {
        href: '/material-apoio/outras-autoridades',
        label: 'Investigações de Outras Autoridades',
        perm: 'material_apoio.view_investigacaooutrasautoridades',
      },
    ],
  },
  {
    label: 'Taxonomia',
    icon: ListTree,
    items: [
      { href: '/taxonomia/paises', label: 'Países', perm: 'taxonomia.view_geografiapais' },
      { href: '/taxonomia/ufs', label: 'UFs', perm: 'taxonomia.view_geografiauf' },
      { href: '/taxonomia/cidades', label: 'Cidades', perm: 'taxonomia.view_geografiacidade' },
      { href: '/taxonomia/aerodromos', label: 'Aeródromos', perm: 'taxonomia.view_aerodromogeral' },
      { href: '/taxonomia/artefatos-espaciais', label: 'Artefatos Espaciais', perm: 'taxonomia.view_artefatoespacial' },
      { href: '/taxonomia/veiculos-lancadores', label: 'Veículos Lançadores', perm: 'taxonomia.view_veiculolancador' },
    ],
  },
  {
    label: 'Usuários & Grupos',
    icon: ShieldCheck,
    items: [
      { href: '/usuarios', label: 'Usuários', perm: 'usuario.view_user' },
      { href: '/grupos', label: 'Grupos', perm: 'auth.view_group' },
    ],
  },
];

function sectionIsActive(section: NavSection, pathname: string) {
  return section.items.some((i) => pathname.startsWith(i.href));
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

  function isOpen(section: NavSection) {
    return section.label in openOverrides ? openOverrides[section.label] : sectionIsActive(section, pathname);
  }

  function toggleSection(section: NavSection) {
    if (section.disabled) return;
    setOpenOverrides((prev) => ({ ...prev, [section.label]: !isOpen(section) }));
  }

  async function handleLogout() {
    await apiFetch('/api/auth/logout/', { method: 'POST' });
    router.replace('/login');
  }

  const topItemClass = (active: boolean) =>
    cn(
      'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
      active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/70 hover:text-white',
    );

  const subItemClass = (active: boolean) =>
    cn(
      'block rounded-lg py-1.5 pl-9 pr-2.5 text-sm transition-colors',
      active ? 'bg-slate-800 font-medium text-sky-300' : 'text-slate-400 hover:bg-slate-800/70 hover:text-white',
    );

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen shrink-0 flex-col border-r border-slate-800 bg-slate-950 transition-[width] duration-150',
        collapsed ? 'w-16' : 'w-72',
      )}
    >
      <div className={cn('flex items-center px-3 pt-4', collapsed ? 'flex-col gap-1' : 'justify-between')}>
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 px-1 text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-600 text-white">
              <Rocket className="h-4 w-4" strokeWidth={2} />
            </span>
            <span className="font-serif text-lg tracking-tight">ÁQUILA</span>
          </Link>
        )}
        <div className={cn('flex items-center gap-1', collapsed && 'flex-col')}>
          <ThemeToggle className="text-slate-400 hover:bg-slate-800 hover:text-white" />
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
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
            const active = sectionIsActive(section, pathname);
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
                        'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 transition-colors',
                        section.disabled && 'cursor-default opacity-40',
                      )}
                    >
                      <span
                        className={cn(
                          'flex items-center gap-2 text-[13px] font-medium tracking-normal',
                          active ? 'text-sky-400' : 'text-slate-200',
                        )}
                      >
                        <section.icon className={cn('h-4 w-4', active ? 'text-sky-400' : 'text-slate-400')} strokeWidth={1.75} />
                        {section.label}
                      </span>
                      {!section.disabled && (
                        <ChevronDown className={cn('h-3.5 w-3.5 text-slate-500 transition-transform', open && 'rotate-180')} />
                      )}
                    </button>
                    {open && (
                      <div className="mt-0.5 space-y-0.5">
                        {section.items.map((item) => (
                          <Link key={item.href} href={item.href} className={subItemClass(pathname.startsWith(item.href))}>
                            {item.label}
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

      <div className="border-t border-slate-800 p-3">
        <div className={cn('flex items-center gap-2.5 rounded-lg px-1.5 py-1.5', collapsed && 'justify-center')}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-900/40 text-sm font-semibold text-accent-300">
            {(me?.nome_guerra || me?.nome || '?').charAt(0).toUpperCase()}
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-white">{me ? formatUsuario(me) : '…'}</span>
              <span className="block truncate text-xs text-slate-400">{me?.email}</span>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            title="Sair"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </aside>
  );
}
