'use client';

import ResourceListPage from '@/components/crud/ResourceListPage';
import { formatShortDate } from '@/lib/format';
import FileLink from '@/components/FileLink';
import type { InvestigacaoOutrasAutoridades } from '@/lib/types';

export default function OutrasAutoridadesListPage() {
  return (
    <ResourceListPage
      apiPath="/api/material-apoio/investigacoes-outras-autoridades/"
      title="Investigações de Outras Autoridades"
      createHref="/material-apoio/outras-autoridades/nova"
      createLabel="Nova Investigação"
      rowHref={(item) => `/material-apoio/outras-autoridades/${item.id}`}
      columns={[
        { key: 'titulo', label: 'Título' },
        { key: 'pais', label: 'País' },
        { key: 'autoridade_investigadora', label: 'Autoridade Investigadora' },
        {
          key: 'numero_relatorio',
          label: 'Número do Relatório',
          render: (item: InvestigacaoOutrasAutoridades) => item.numero_relatorio || '-',
        },
        { key: 'veiculo', label: 'Veículo', render: (item: InvestigacaoOutrasAutoridades) => item.veiculo || '-' },
        {
          key: 'tipo_ocorrencia',
          label: 'Tipo de Ocorrência',
          render: (item: InvestigacaoOutrasAutoridades) => item.tipo_ocorrencia_display || '-',
        },
        {
          key: 'fase_voo',
          label: 'Fase do Voo',
          render: (item: InvestigacaoOutrasAutoridades) => item.fase_voo_display || '-',
        },
        {
          key: 'data_ocorrencia',
          label: 'Data da Ocorrência',
          render: (item: InvestigacaoOutrasAutoridades) => (item.data_ocorrencia ? formatShortDate(item.data_ocorrencia) : '-'),
        },
        {
          key: 'documento_pdf',
          label: 'PDF',
          render: (item: InvestigacaoOutrasAutoridades) => <FileLink url={item.documento_pdf} />,
        },
      ]}
    />
  );
}
