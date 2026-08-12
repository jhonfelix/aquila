'use client';

import ResourceFormPage, { FieldConfig } from '@/components/crud/ResourceFormPage';

const FIELDS: FieldConfig[] = [
  { name: 'name', label: 'Nome', type: 'text', required: true },
  {
    name: 'permissions',
    label: 'Permissões',
    type: 'async-fk-multi',
    fkApiPath: '/api/permissions/',
    fkLabel: (p) => `${p.name} (${p.app_label}.${p.model})`,
  },
];

export default function NovoGrupoPage() {
  return <ResourceFormPage apiPath="/api/grupos/" title="Novo Grupo" fields={FIELDS} listHref="/grupos" />;
}
