'use client';

import ResourceListPage from '@/components/crud/ResourceListPage';
import { formatShortDate } from '@/lib/format';

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
        { key: 'autoridade_investigadora', label: 'Autoridade' },
        { key: 'data_ocorrencia', label: 'Data', render: (item) => (item.data_ocorrencia ? formatShortDate(item.data_ocorrencia) : '-') },
      ]}
    />
  );
}
