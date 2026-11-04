'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { cn } from '@/lib/cn';
import { ApiError, apiFetch, fetchMe, type Me } from '@/lib/api';

type Tabela = {
  titulo: string;
  colunas: string[];
  linhas: (string | number | boolean | null)[][];
  truncado?: boolean;
};

type Ficha = { titulo: string; situacao: string; paragrafo: string };

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  fichas?: Ficha[];
  tabelas?: Tabela[];
  erro?: boolean;
};

type ChatResponse = { resposta: string; fichas: Ficha[]; tabelas: Tabela[]; ferramentas: string[] };

const SUGESTOES = [
  'Apresente as ocorrências registradas no Centro de Lançamento de Alcântara (CLA)',
  'Quais ocorrências aconteceram em Brasília?',
  'Liste os incidentes de 2025',
  'Quais acidentes ocorreram no COPE?',
];

function Celula({ v }: { v: string | number | boolean | null }) {
  if (v === null || v === '') return <span className="text-slate-400">—</span>;
  if (typeof v === 'boolean') return <>{v ? 'Sim' : 'Não'}</>;
  return <>{String(v)}</>;
}

function FichaOcorrencia({ f }: { f: Ficha }) {
  return (
    <div className="mt-2 rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-space-700 dark:bg-space-900">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{f.titulo}</h3>
        {f.situacao && (
          <span className="rounded-full bg-accent-100 px-2 py-0.5 text-[11px] font-medium text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">
            {f.situacao}
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{f.paragrafo}</p>
    </div>
  );
}

function TabelaDados({ t }: { t: Tabela }) {
  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-mist-200 dark:border-space-700">
      <div className="flex items-center justify-between border-b border-mist-200 bg-mist-50 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-space-700 dark:bg-space-800 dark:text-slate-300">
        <span>{t.titulo}</span>
        <span className="font-normal text-slate-500 dark:text-slate-400">
          {t.linhas.length} {t.linhas.length === 1 ? 'registro' : 'registros'}
          {t.truncado ? ' (lista parcial)' : ''}
        </span>
      </div>
      {t.linhas.length === 0 ? (
        <p className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">Nenhum registro encontrado.</p>
      ) : (
        <div className="max-h-80 overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-white dark:bg-space-900">
              <tr>
                {t.colunas.map((c) => (
                  <th key={c} className="whitespace-nowrap border-b border-mist-200 px-3 py-2 font-semibold text-slate-600 dark:border-space-700 dark:text-slate-300">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.linhas.map((l, i) => (
                <tr key={i} className="odd:bg-mist-50/50 dark:odd:bg-space-800/40">
                  {l.map((v, j) => (
                    <td key={j} className="px-3 py-2 align-top text-slate-700 dark:text-slate-200">
                      <Celula v={v} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AssistenteIAPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMe().then(setMe).catch(() => setMe(null));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || typing) return;
    const historico = messages.filter((m) => !m.erro).map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', content }]);
    setInput('');
    setTyping(true);
    try {
      const r = await apiFetch<ChatResponse>('/api/assistente/chat/', {
        method: 'POST',
        body: JSON.stringify({ pergunta: content, historico }),
      });
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: r.resposta, fichas: r.fichas, tabelas: r.tabelas },
      ]);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Não consegui falar com o servidor.';
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: msg, erro: true }]);
    } finally {
      setTyping(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <AppShell title="Assistente IA">
      <div className="mx-auto flex h-[calc(100vh-56px)] w-full flex-col px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">
              <Bot className="h-7 w-7" strokeWidth={1.75} />
            </span>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Assistente IA</h1>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                Consulte o andamento das ocorrências: status, fase de revisão, responsáveis e demais dados cadastrados.
              </p>
            </div>
            <div className="grid w-full gap-2 sm:grid-cols-2">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="flex items-center gap-2 rounded-lg border border-mist-200 bg-white px-3.5 py-2 text-left text-sm text-slate-600 transition-colors hover:border-accent-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60 dark:border-space-700 dark:bg-space-900 dark:text-slate-300 dark:hover:border-accent-800"
                >
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent-500" strokeWidth={1.75} />
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pr-1">
            {messages.map((m) => (
              <div key={m.id}>
              <div className={cn('flex items-start gap-3', m.role === 'user' && 'flex-row-reverse')}>
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold',
                    m.role === 'user'
                      ? 'bg-mist-100 text-slate-600 dark:bg-space-800 dark:text-slate-300'
                      : 'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300',
                  )}
                >
                  {m.role === 'user' ? (
                    (me?.nome_guerra || me?.nome || '?').charAt(0).toUpperCase()
                  ) : (
                    <Bot className="h-4 w-4" strokeWidth={1.75} />
                  )}
                </span>
                <div
                  className={cn(
                    'max-w-[75%] rounded-xl px-4 py-2.5 text-sm leading-relaxed',
                    m.role === 'user'
                      ? 'bg-accent-600 text-white'
                      : 'border border-mist-200 bg-white text-slate-800 dark:border-space-700 dark:bg-space-900 dark:text-slate-200',
                  )}
                >
                  {m.content}
                </div>
              </div>
              {(m.fichas?.length || m.tabelas?.length) ? (
                <div className="ml-11 mt-1">
                  {m.fichas?.map((f, i) => <FichaOcorrencia key={`f${i}`} f={f} />)}
                  {m.tabelas?.map((t, i) => <TabelaDados key={i} t={t} />)}
                </div>
              ) : null}
              </div>
            ))}
            {typing && (
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">
                  <Bot className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div className="flex items-center gap-1 rounded-xl border border-mist-200 bg-white px-4 py-3.5 dark:border-space-700 dark:bg-space-900">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 dark:bg-slate-500" style={{ animationDelay: '0ms' }} />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 dark:bg-slate-500"
                    style={{ animationDelay: '120ms' }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 dark:bg-slate-500"
                    style={{ animationDelay: '240ms' }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex items-end gap-2 border-t border-mist-200 pt-4 dark:border-space-700">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Pergunte sobre uma ocorrência, um processo ou o fluxo de trabalho…"
            className="max-h-32 flex-1 resize-none rounded-lg border border-mist-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-space-700 dark:bg-space-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-600 text-white transition-colors hover:bg-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60 disabled:cursor-not-allowed disabled:opacity-40"
            title="Enviar"
          >
            <Send className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </form>
      </div>
    </AppShell>
  );
}
