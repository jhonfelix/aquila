'use client';

import { useParams } from 'next/navigation';
import ResourceFormPage, { FieldConfig } from '@/components/crud/ResourceFormPage';
import { cidadeSchema } from '@/lib/schemas/taxonomia';

const FIELDS: FieldConfig[] = [
  { name: 'nome', label: 'Nome', type: 'text', required: true },
  { name: 'uf', label: 'UF', type: 'async-fk', fkApiPath: '/api/taxonomia/ufs/', fkLabel: (i) => i.nome, required: true },
  { name: 'pais', label: 'País', type: 'async-fk', fkApiPath: '/api/taxonomia/paises/', fkLabel: (i) => i.nome, required: true },
  { name: 'latitude', label: 'Latitude', type: 'text' },
  { name: 'longitude', label: 'Longitude', type: 'text' },
  { name: 'altitude', label: 'Altitude', type: 'text' },
];

export default function EditarCidadePage() {
  const { id } = useParams<{ id: string }>();
  return (
    <ResourceFormPage
      apiPath="/api/taxonomia/cidades/"
      id={id}
      title="Editar Cidade"
      fields={FIELDS}
      listHref="/taxonomia/cidades"
      schema={cidadeSchema}
    />
  );
}
