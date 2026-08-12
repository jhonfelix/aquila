'use client';

import ResourceFormPage, { FieldConfig } from '@/components/crud/ResourceFormPage';
import { POSTO_GRADUACAO_CHOICES, LOCAL_TRABALHO_CHOICES } from '@/lib/choices';

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
  { name: 'is_superuser', label: 'Superusuário', type: 'checkbox' },
  { name: 'totp_obrigatorio', label: '2FA Obrigatório', type: 'checkbox' },
  { name: 'groups', label: 'Grupos', type: 'async-fk-multi', fkApiPath: '/api/grupos/', fkLabel: (g) => g.name },
  { name: 'ojt', label: 'OJT', type: 'textarea' },
  { name: 'trilha_capacitacao', label: 'Trilha de Capacitação', type: 'textarea' },
];

export default function NovoUsuarioPage() {
  return <ResourceFormPage apiPath="/api/usuarios/" title="Novo Usuário" fields={FIELDS} listHref="/usuarios" />;
}
