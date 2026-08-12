'use client';

import ResourceListPage from '@/components/crud/ResourceListPage';

export default function PaisesListPage() {
  return (
    <ResourceListPage
      apiPath="/api/taxonomia/paises/"
      title="Países"
      createHref="/taxonomia/paises/nova"
      createLabel="Novo País"
      rowHref={(item) => `/taxonomia/paises/${item.id}`}
      columns={[
        { key: 'nome', label: 'Nome' },
        { key: 'nome_codigo', label: 'Código' },
        { key: 'continente', label: 'Continente' },
      ]}
    />
  );
}
