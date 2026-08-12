'use client';

import { useParams } from 'next/navigation';
import ResourceFormPage, { FieldConfig } from '@/components/crud/ResourceFormPage';

const FIELDS: FieldConfig[] = [
  { name: 'nome', label: 'Nome', type: 'text', required: true },
  { name: 'nome_codigo', label: 'Código', type: 'text' },
  { name: 'idioma_codigo', label: 'Código do Idioma', type: 'text' },
  { name: 'continente', label: 'Continente', type: 'text' },
];

export default function EditarPaisPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <ResourceFormPage apiPath="/api/taxonomia/paises/" id={id} title="Editar País" fields={FIELDS} listHref="/taxonomia/paises" />
  );
}
