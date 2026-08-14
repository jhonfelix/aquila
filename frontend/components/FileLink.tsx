'use client';

import { FileText } from 'lucide-react';

// Ícone de download/abrir reusado em colunas de arquivo (PDF/Word) nas
// listas de Material de Apoio.
export default function FileLink({ url }: { url: string | null }) {
  if (!url) return <span className="text-slate-400 dark:text-slate-500">-</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex text-accent-600 hover:text-accent-700 dark:text-accent-400"
    >
      <FileText className="h-4 w-4" strokeWidth={1.75} />
    </a>
  );
}
