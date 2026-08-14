'use client';

import ResourceFormPage, { FieldConfig } from '@/components/crud/ResourceFormPage';
import { POSTO_GRADUACAO_CHOICES, LOCAL_TRABALHO_CHOICES } from '@/lib/choices';
import { usuarioCreateSchema } from '@/lib/schemas/usuarios';

const FIELDS: FieldConfig[] = [
  { name: 'email', label: 'E-mail', type: 'email', required: true },
  { name: 'nome', label: 'Nome', type: 'text', required: true },
  { name: 'nome_guerra', label: 'Nome de Guerra', type: 'text' },
  { name: 'password', label: 'Senha', type: 'password', helpText: 'Senha inicial do usuário' },
  { name: 'posto_graduacao', label: 'Posto/Graduação', type: 'select', choices: POSTO_GRADUACAO_CHOICES },
  { name: 'local_trabalho', label: 'Local de Trabalho', type: 'select', choices: LOCAL_TRABALHO_CHOICES, required: true },
  { name: 'credencial', label: 'Credencial', type: 'text' },
  { name: 'qualificacao', label: 'Qualificação', type: 'text' },
  { name: 'telefone', label: 'Telefone', type: 'number' },
  { name: 'cpf', label: 'CPF', type: 'number' },
  { name: 'is_staff', label: 'Acesso ao Admin (staff)', type: 'checkbox' },
  { name: 'is_superuser', label: 'Superusuário', type: 'checkbox', helpText: 'Indica que este usuário tem todas as permissões sem atribuí-las explicitamente.' },
  { name: 'totp_obrigatorio', label: '2FA Obrigatório', type: 'checkbox' },
  {
    name: 'groups',
    label: 'Grupos',
    type: 'dual-list',
    fkApiPath: '/api/grupos/',
    fkLabel: (g) => g.name,
    dualListAvailableTitle: 'grupos disponíveis',
    dualListChosenTitle: 'grupos escolhido(s)',
    dualListAvailableHint: 'Escolha os grupos selecionando-os e clique na seta "Adicionar".',
    dualListChosenHint: 'Remova os grupos selecionando-os e clique na seta "Remover".',
    helpText: 'Os grupos que este usuário pertence. Um usuário terá todas as permissões concedidas a cada um dos seus grupos.',
  },
  {
    name: 'user_permissions',
    label: 'Permissões do usuário',
    type: 'dual-list',
    fkApiPath: '/api/permissions/',
    fkLabel: (p) => `${p.app_label_display} | ${p.model_display} | ${p.name}`,
    dualListAvailableTitle: 'permissões do usuário disponíveis',
    dualListChosenTitle: 'permissões do usuário escolhido(s)',
    dualListAvailableHint: 'Escolha as permissões do usuário selecionando-as e clique na seta "Adicionar".',
    dualListChosenHint: 'Remova as permissões do usuário selecionando-as e clique na seta "Remover".',
    helpText: 'Permissões específicas para este usuário, além das concedidas pelos grupos.',
  },
  { name: 'ojt', label: 'OJT', type: 'textarea' },
  { name: 'trilha_capacitacao', label: 'Trilha de Capacitação', type: 'textarea' },
];

export default function NovoUsuarioPage() {
  return (
    <ResourceFormPage
      apiPath="/api/usuarios/"
      title="Novo Usuário"
      fields={FIELDS}
      listHref="/usuarios"
      wide
      schema={usuarioCreateSchema}
    />
  );
}
