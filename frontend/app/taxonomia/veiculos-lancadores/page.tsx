'use client';

import ResourceListPage from '@/components/crud/ResourceListPage';
import { TIPO_PROPULSAO_CHOICES } from '@/lib/choices';

export default function VeiculosListPage() {
  return (
    <ResourceListPage
      apiPath="/api/taxonomia/veiculos-lancadores/"
      title="Veículos Lançadores"
      createHref="/taxonomia/veiculos-lancadores/nova"
      createLabel="Novo Veículo"
      rowHref={(item) => `/taxonomia/veiculos-lancadores/${item.id}`}
      columns={[
        {
          key: 'tipo_propulsao',
          label: 'Propulsão',
          render: (item) => TIPO_PROPULSAO_CHOICES.find(([v]) => v === item.tipo_propulsao)?.[1] || item.tipo_propulsao,
        },
        { key: 'altura_metros', label: 'Altura (m)' },
        { key: 'massa_total_kg', label: 'Massa Total (kg)' },
        { key: 'reutilizavel', label: 'Reutilizável', render: (item) => (item.reutilizavel ? 'Sim' : 'Não') },
      ]}
    />
  );
}
