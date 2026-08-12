// Padrão único pra exibir usuário em toda a aplicação: Posto/Graduação Nome
// de Guerra [ Local de Trabalho ] — espelha usuario.models.User.__str__ no
// backend (usado por toda referência a usuário: cadastrado por, investigador,
// confirmado/autenticado por, pessoa responsável, etc.).
export function formatUsuario(
  u: { posto_graduacao?: string | null; nome_guerra?: string | null; nome: string; local_trabalho?: string | null } | null | undefined,
): string {
  if (!u) return '-';
  const nome = u.nome_guerra || u.nome;
  const nomeComPosto = [u.posto_graduacao, nome].filter(Boolean).join(' ');
  return u.local_trabalho ? `${nomeComPosto} [ ${u.local_trabalho} ]` : nomeComPosto;
}

// Regra padrão de exibição de datas em toda a aplicação: dd/mm/yyyy.
export function formatShortDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatRelative(iso: string): string {
  const date = new Date(iso);
  const diffSec = Math.round((Date.now() - date.getTime()) / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffSec < 60) return 'agora mesmo';
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffHour < 24) return `há ${diffHour}h`;
  if (diffDay === 1) return 'ontem';
  if (diffDay < 7) return `há ${diffDay} dias`;
  return date.toLocaleDateString('pt-BR');
}
