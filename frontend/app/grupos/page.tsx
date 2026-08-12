'use client';

import ResourceListPage from '@/components/crud/ResourceListPage';

export default function GruposListPage() {
  return (
    <ResourceListPage
      apiPath="/api/grupos/"
      title="Grupos"
      createHref="/grupos/novo"
      createLabel="Novo Grupo"
      rowHref={(item) => `/grupos/${item.id}`}
      columns={[{ key: 'name', label: 'Nome' }]}
    />
  );
}
