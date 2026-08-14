'use client';

import { useParams } from 'next/navigation';
import ResourceFormPage, { FieldConfig } from '@/components/crud/ResourceFormPage';
import { ufSchema } from '@/lib/schemas/taxonomia';

const FIELDS: FieldConfig[] = [
  { name: 'nome', label: 'Nome', type: 'text', required: true },
  { name: 'pais', label: 'País', type: 'async-fk', fkApiPath: '/api/taxonomia/paises/', fkLabel: (i) => i.nome, required: true },
  { name: 'nome_codigo', label: 'Código', type: 'text' },
  { name: 'regiao', label: 'Região', type: 'text' },
  { name: 'comar', label: 'COMAR', type: 'text' },
];

export default function EditarUfPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <ResourceFormPage
      apiPath="/api/taxonomia/ufs/"
      id={id}
      title="Editar UF"
      fields={FIELDS}
      listHref="/taxonomia/ufs"
      schema={ufSchema}
    />
  );
}
