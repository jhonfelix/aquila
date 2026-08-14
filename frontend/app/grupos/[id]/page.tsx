'use client';

import { useParams } from 'next/navigation';
import ResourceFormPage, { FieldConfig } from '@/components/crud/ResourceFormPage';
import { grupoSchema } from '@/lib/schemas/usuarios';

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

export default function EditarGrupoPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <ResourceFormPage
      apiPath="/api/grupos/"
      id={id}
      title="Editar Grupo"
      fields={FIELDS}
      listHref="/grupos"
      wide
      schema={grupoSchema}
    />
  );
}
