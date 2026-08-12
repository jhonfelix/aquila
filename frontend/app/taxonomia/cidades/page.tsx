'use client';

import ResourceListPage from '@/components/crud/ResourceListPage';

export default function CidadesListPage() {
  return (
    <ResourceListPage
      apiPath="/api/taxonomia/cidades/"
      title="Cidades"
      createHref="/taxonomia/cidades/nova"
      createLabel="Nova Cidade"
      rowHref={(item) => `/taxonomia/cidades/${item.id}`}
      columns={[
        { key: 'nome', label: 'Nome' },
        { key: 'latitude', label: 'Latitude' },
        { key: 'longitude', label: 'Longitude' },
      ]}
    />
  );
}
