'use client';

import ResourceFormPage, { FieldConfig } from '@/components/crud/ResourceFormPage';
import { paisSchema } from '@/lib/schemas/taxonomia';

const FIELDS: FieldConfig[] = [
  { name: 'nome', label: 'Nome', type: 'text', required: true },
  { name: 'nome_codigo', label: 'Código', type: 'text' },
  { name: 'idioma_codigo', label: 'Código do Idioma', type: 'text' },
  { name: 'continente', label: 'Continente', type: 'text' },
];

export default function NovoPaisPage() {
  return (
    <ResourceFormPage
      apiPath="/api/taxonomia/paises/"
      title="Novo País"
      fields={FIELDS}
      listHref="/taxonomia/paises"
      schema={paisSchema}
    />
  );
}
