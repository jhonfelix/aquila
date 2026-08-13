'use client';

import ResourceFormPage, { FieldConfig } from '@/components/crud/ResourceFormPage';

const FIELDS: FieldConfig[] = [
  { name: 'name', label: 'Nome', type: 'text', required: true },
  {
    name: 'permissions',
    label: 'Permissões',
    type: 'dual-list',
    fkApiPath: '/api/permissions/',
    fkLabel: (p) => `${p.app_label_display} | ${p.model_display} | ${p.name}`,
    dualListAvailableTitle: 'permissões disponíveis',
    dualListChosenTitle: 'permissões escolhido(s)',
    dualListAvailableHint: 'Escolha as permissões selecionando-as e clique na seta "Adicionar".',
    dualListChosenHint: 'Remova as permissões selecionando-as e clique na seta "Remover".',
  },
];

export default function NovoGrupoPage() {
  return <ResourceFormPage apiPath="/api/grupos/" title="Novo Grupo" fields={FIELDS} listHref="/grupos" wide />;
}
