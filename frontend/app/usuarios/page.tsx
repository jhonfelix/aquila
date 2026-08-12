'use client';

import ResourceListPage from '@/components/crud/ResourceListPage';

export default function UsuariosListPage() {
  return (
    <ResourceListPage
      apiPath="/api/usuarios/"
      title="Usuários"
      createHref="/usuarios/novo"
      createLabel="Novo Usuário"
      rowHref={(item) => `/usuarios/${item.id}`}
      columns={[
        { key: 'nome', label: 'Nome' },
        { key: 'nome_guerra', label: 'Nome de Guerra' },
        { key: 'email', label: 'E-mail' },
        { key: 'posto_graduacao', label: 'Posto/Graduação' },
        { key: 'local_trabalho', label: 'Local de Trabalho' },
      ]}
    />
  );
}
