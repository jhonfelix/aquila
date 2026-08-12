'use client';

import ResourceFormPage, { FieldConfig } from '@/components/crud/ResourceFormPage';

const FIELDS: FieldConfig[] = [
  { name: 'nome', label: 'Nome', type: 'text', required: true },
  { name: 'pais', label: 'País', type: 'async-fk', fkApiPath: '/api/taxonomia/paises/', fkLabel: (i) => i.nome, required: true },
  { name: 'nome_codigo', label: 'Código', type: 'text' },
  { name: 'regiao', label: 'Região', type: 'text' },
  { name: 'comar', label: 'COMAR', type: 'text' },
];

export default function NovaUfPage() {
  return <ResourceFormPage apiPath="/api/taxonomia/ufs/" title="Nova UF" fields={FIELDS} listHref="/taxonomia/ufs" />;
}
