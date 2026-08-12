'use client';

import ResourceListPage from '@/components/crud/ResourceListPage';
import { TIPO_ARTEFATO_CHOICES } from '@/lib/choices';

export default function ArtefatosListPage() {
  return (
    <ResourceListPage
      apiPath="/api/taxonomia/artefatos-espaciais/"
      title="Artefatos Espaciais"
      createHref="/taxonomia/artefatos-espaciais/nova"
      createLabel="Novo Artefato"
      rowHref={(item) => `/taxonomia/artefatos-espaciais/${item.id}`}
      columns={[
        { key: 'designacao', label: 'Designação' },
        {
          key: 'tipo_artefato',
          label: 'Tipo',
          render: (item) => TIPO_ARTEFATO_CHOICES.find(([v]) => v === item.tipo_artefato)?.[1] || item.tipo_artefato,
        },
        { key: 'fabricante', label: 'Fabricante' },
        { key: 'status', label: 'Status' },
      ]}
    />
  );
}
