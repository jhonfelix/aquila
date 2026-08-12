'use client';

import ResourceListPage from '@/components/crud/ResourceListPage';
import { MATERIAL_APOIO_COLUMNS } from '@/lib/materialApoioColumns';

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
      columns={MATERIAL_APOIO_COLUMNS}
    />
  );
}
