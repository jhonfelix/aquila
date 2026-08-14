'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { cn } from '@/lib/cn';
import { fetchMe, type Me } from '@/lib/api';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const SUGESTOES = [
  'Quais ocorrências estão aguardando autenticação?',
  'Explique o fluxo Redigir → Confirmar → Autenticar',
  'Como cadastro uma nova ocorrência?',
];

// Protótipo visual: sem backend real por trás ainda, só respostas
// pré-definidas por palavra-chave pra dar uma ideia de uso real.
function respostaSimulada(pergunta: string): string {
  const q = pergunta.toLowerCase();
  if (q.includes('autentic')) {
    return 'No fluxo atual, uma ocorrência confirmada aparece em Redigir/Autenticar → Autenticar. Autenticar grava o número de processo definitivo e trava o registro contra novas edições.';
  }
  if (q.includes('confirm')) {
    return 'Confirmar é o segundo estágio do fluxo: valida os dados redigidos antes da autenticação final. Só depois de confirmada a ocorrência pode ser autenticada.';
  }
  if (q.includes('cadastr') || q.includes('nova ocorrência') || q.includes('redigir')) {
    return 'Para abrir uma ocorrência, use Redigir/Autenticar → Redigir na barra lateral. O registro começa em rascunho e segue para Confirmar e depois Autenticar.';
  }
  return 'Ainda não tenho acesso aos dados reais de ocorrências — esta é uma prévia visual do Assistente IA. Quando conectado, vou poder consultar o status de processos, resumir relatórios e apontar pendências direto por aqui.';
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

  function send(text: string) {
    const content = text.trim();
    if (!content || typing) return;
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', content }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: respostaSimulada(content) }]);
      setTyping(false);
    }, 900);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  const avisoPrototipo = (
    <div className="flex items-center justify-center gap-2 rounded-lg border border-accent-200 bg-accent-50 px-3 py-2 text-xs text-accent-700 dark:border-accent-900/50 dark:bg-accent-900/20 dark:text-accent-300">
      <Sparkles className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
      Protótipo — respostas simuladas, ainda não conectado aos dados reais de ocorrências.
    </div>
  );

  return (
    <AppShell title="Assistente IA">
      <div className="mx-auto flex h-[calc(100vh-56px)] w-full max-w-3xl flex-col px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">
              <Bot className="h-7 w-7" strokeWidth={1.75} />
            </span>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Assistente IA</h1>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                Pergunte sobre o andamento de uma ocorrência, o fluxo de trabalho ou onde encontrar algo no sistema.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
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
            <div className="w-full max-w-sm">{avisoPrototipo}</div>
          </div>
        ) : (
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pr-1">
            {avisoPrototipo}
            {messages.map((m) => (
              <div key={m.id} className={cn('flex items-start gap-3', m.role === 'user' && 'flex-row-reverse')}>
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
