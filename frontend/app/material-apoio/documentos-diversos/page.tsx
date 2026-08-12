'use client';

import ResourceListPage from '@/components/crud/ResourceListPage';

export default function DocumentosDiversosListPage() {
  return (
    <ResourceListPage
      apiPath="/api/material-apoio/materiais/"
      title="Documentos Diversos"
      extraQuery="&categoria=OUTRO"
      createHref="/material-apoio/documentos-diversos/nova"
      createLabel="Novo Documento"
      rowHref={(item) => `/material-apoio/documentos-diversos/${item.id}`}
      columns={[
        { key: 'titulo', label: 'Título' },
        { key: 'numero_norma', label: 'Número' },
        { key: 'data_publicacao', label: 'Publicação' },
      ]}
    />
  );
}
