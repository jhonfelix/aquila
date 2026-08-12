'use client';

import ResourceListPage from '@/components/crud/ResourceListPage';

const CATEGORIAS_NORMA = 'NORMA,LEGISLACAO,REGULAMENTO,INSTRUCAO,PROCEDIMENTO,MANUAL';

export default function NormasListPage() {
  return (
    <ResourceListPage
      apiPath="/api/material-apoio/materiais/"
      title="Normas e Legislação"
      extraQuery={`&categoria=${CATEGORIAS_NORMA}`}
      createHref="/material-apoio/normas-legislacao/nova"
      createLabel="Nova Norma"
      rowHref={(item) => `/material-apoio/normas-legislacao/${item.id}`}
      columns={[
        { key: 'titulo', label: 'Título' },
        { key: 'categoria', label: 'Categoria' },
        { key: 'numero_norma', label: 'Número' },
        { key: 'data_publicacao', label: 'Publicação' },
      ]}
    />
  );
}
