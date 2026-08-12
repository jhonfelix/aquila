'use client';

import ResourceFormPage, { FieldConfig } from '@/components/crud/ResourceFormPage';
import { TIPO_ARTEFATO_CHOICES } from '@/lib/choices';

const FIELDS: FieldConfig[] = [
  { name: 'designacao', label: 'Designação', type: 'text', required: true },
  { name: 'tipo_artefato', label: 'Tipo de Artefato', type: 'select', choices: TIPO_ARTEFATO_CHOICES, required: true },
  { name: 'numero_serie', label: 'Número de Série', type: 'text' },
  { name: 'fabricante', label: 'Fabricante', type: 'text' },
  { name: 'operador', label: 'Operador', type: 'text' },
  { name: 'pais_fabricacao', label: 'País de Fabricação', type: 'text' },
  { name: 'pais_operador', label: 'País do Operador', type: 'text' },
  { name: 'ano_fabricacao', label: 'Ano de Fabricação', type: 'number' },
  { name: 'status', label: 'Status', type: 'text', helpText: 'Ativo, Aposentado, Perdido, Destruído' },
];

export default function NovoArtefatoPage() {
  return (
    <ResourceFormPage
      apiPath="/api/taxonomia/artefatos-espaciais/"
      title="Novo Artefato Espacial"
      fields={FIELDS}
      listHref="/taxonomia/artefatos-espaciais"
    />
  );
}
