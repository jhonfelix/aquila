'use client';

import ResourceListPage from '@/components/crud/ResourceListPage';

export default function UfsListPage() {
  return (
    <ResourceListPage
      apiPath="/api/taxonomia/ufs/"
      title="UFs"
      createHref="/taxonomia/ufs/nova"
      createLabel="Nova UF"
      rowHref={(item) => `/taxonomia/ufs/${item.id}`}
      columns={[
        { key: 'nome', label: 'Nome' },
        { key: 'nome_codigo', label: 'Código' },
        { key: 'regiao', label: 'Região' },
      ]}
    />
  );
}
