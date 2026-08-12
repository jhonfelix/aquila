import { FileText } from 'lucide-react';
import type { Column } from '@/components/crud/ResourceListPage';
import type { MaterialApoio } from '@/lib/types';
import { formatShortDate } from '@/lib/format';

function FileLink({ url }: { url: string | null }) {
  if (!url) return <span className="text-stone-400 dark:text-stone-500">-</span>;
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

// Reusado pelas 3 listas que compartilham o model MaterialApoio
// (Formulários, Normas e Legislação, Documentos Diversos).
export const MATERIAL_APOIO_COLUMNS: Column[] = [
  { key: 'titulo', label: 'Título' },
  {
    key: 'tipo_documento',
    label: 'Tipo de Documento',
    render: (item: MaterialApoio) => item.tipo_documento_display || '-',
  },
  {
    key: 'numero_norma',
    label: 'Número da Norma',
    render: (item: MaterialApoio) => item.numero_norma || '-',
  },
  {
    key: 'pessoa_responsavel',
    label: 'Pessoa Responsável',
    render: (item: MaterialApoio) => item.pessoa_responsavel_display || '-',
  },
  {
    key: 'data_publicacao',
    label: 'Data da Publicação',
    render: (item: MaterialApoio) => (item.data_publicacao ? formatShortDate(item.data_publicacao) : '-'),
  },
  {
    key: 'documento_word',
    label: 'Word',
    render: (item: MaterialApoio) => <FileLink url={item.documento_word} />,
  },
  {
    key: 'documento_pdf',
    label: 'PDF',
    render: (item: MaterialApoio) => <FileLink url={item.documento_pdf} />,
  },
];
