'use client';

import ResourceListPage from '@/components/crud/ResourceListPage';
import { MATERIAL_APOIO_COLUMNS } from '@/lib/materialApoioColumns';

export default function FormulariosListPage() {
  return (
    <ResourceListPage
      apiPath="/api/material-apoio/materiais/"
      title="Formulários"
      extraQuery="&categoria=FORMULARIO"
      createHref="/material-apoio/formularios/nova"
      createLabel="Novo Formulário"
      rowHref={(item) => `/material-apoio/formularios/${item.id}`}
      columns={MATERIAL_APOIO_COLUMNS}
    />
  );
}
