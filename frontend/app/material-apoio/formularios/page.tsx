'use client';

import ResourceListPage from '@/components/crud/ResourceListPage';

export default function FormulariosListPage() {
  return (
    <ResourceListPage
      apiPath="/api/material-apoio/materiais/"
      title="Formulários"
      extraQuery="&categoria=FORMULARIO"
      createHref="/material-apoio/formularios/nova"
      createLabel="Novo Formulário"
      rowHref={(item) => `/material-apoio/formularios/${item.id}`}
      columns={[
        { key: 'titulo', label: 'Título' },
        { key: 'numero_norma', label: 'Número' },
        { key: 'data_publicacao', label: 'Publicação' },
      ]}
    />
  );
}
