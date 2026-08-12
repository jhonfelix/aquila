'use client';

import ResourceListPage from '@/components/crud/ResourceListPage';

export default function AerodromosListPage() {
  return (
    <ResourceListPage
      apiPath="/api/taxonomia/aerodromos/"
      title="Aeródromos"
      createHref="/taxonomia/aerodromos/nova"
      createLabel="Novo Aeródromo"
      rowHref={(item) => `/taxonomia/aerodromos/${item.id}`}
      columns={[
        { key: 'icao', label: 'ICAO' },
        { key: 'iata', label: 'IATA' },
        { key: 'nome', label: 'Nome' },
        { key: 'tipo', label: 'Tipo' },
      ]}
    />
  );
}
