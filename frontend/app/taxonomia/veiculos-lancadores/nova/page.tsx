'use client';

import ResourceFormPage, { FieldConfig } from '@/components/crud/ResourceFormPage';
import { PROPELENTE_CHOICES, TIPO_PROPULSAO_CHOICES } from '@/lib/choices';

const FIELDS: FieldConfig[] = [
  {
    name: 'artefato',
    label: 'Artefato Espacial',
    type: 'async-fk',
    fkApiPath: '/api/taxonomia/artefatos-espaciais/',
    fkLabel: (i) => i.designacao,
    required: true,
  },
  { name: 'tipo_propulsao', label: 'Tipo de Propulsão', type: 'select', choices: TIPO_PROPULSAO_CHOICES, required: true },
  { name: 'propelente', label: 'Propelente', type: 'json-tags', choices: PROPELENTE_CHOICES },
  { name: 'altura_metros', label: 'Altura (m)', type: 'number' },
  { name: 'diametro_metros', label: 'Diâmetro (m)', type: 'number' },
  { name: 'massa_total_kg', label: 'Massa Total (kg)', type: 'number' },
  { name: 'carga_util_leo_kg', label: 'Carga Útil LEO (kg)', type: 'number' },
  { name: 'carga_util_geo_kg', label: 'Carga Útil GEO (kg)', type: 'number' },
  { name: 'numero_estagios', label: 'Número de Estágios', type: 'number' },
  { name: 'quantidade_motores_primeiro_estagio', label: 'Motores no 1º Estágio', type: 'number' },
  { name: 'empuxo_total_kN', label: 'Empuxo Total (kN)', type: 'number' },
  { name: 'reutilizavel', label: 'Reutilizável', type: 'checkbox' },
];

export default function NovoVeiculoPage() {
  return (
    <ResourceFormPage
      apiPath="/api/taxonomia/veiculos-lancadores/"
      title="Novo Veículo Lançador"
      fields={FIELDS}
      listHref="/taxonomia/veiculos-lancadores"
    />
  );
}
