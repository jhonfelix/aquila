'use client';

import ResourceListPage from '@/components/crud/ResourceListPage';
import { MATERIAL_APOIO_COLUMNS } from '@/lib/materialApoioColumns';

export default function DocumentosDiversosListPage() {
  return (
    <ResourceListPage
      apiPath="/api/material-apoio/materiais/"
      title="Documentos Diversos"
      extraQuery="&categoria=OUTRO"
      createHref="/material-apoio/documentos-diversos/nova"
      createLabel="Novo Documento"
      rowHref={(item) => `/material-apoio/documentos-diversos/${item.id}`}
      columns={MATERIAL_APOIO_COLUMNS}
    />
  );
}
