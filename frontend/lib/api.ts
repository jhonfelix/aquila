// Cliente HTTP fino para a API Django. Same-origin (via nginx), então
// cookies de sessão viajam automaticamente com fetch — só precisamos
// anexar o header X-CSRFToken nas mutações, lido do cookie `csrftoken`
// (CSRF_COOKIE_HTTPONLY=False no backend, então dá pra ler via JS).

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function primeCsrf(): Promise<void> {
  await fetch('/api/auth/csrf/', { credentials: 'same-origin' });
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    const detail =
      body && typeof body === 'object' && 'detail' in body
        ? String((body as { detail: unknown }).detail)
        : `Erro ${status}`;
    super(detail);
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData) {
    // FormData define seu próprio Content-Type (multipart + boundary) —
    // deixar o browser fazer isso sozinho, nunca sobrescrever aqui.
    headers.set('Content-Type', 'application/json');
  }

  if (method !== 'GET' && method !== 'HEAD') {
    const csrftoken = getCookie('csrftoken');
    if (csrftoken) headers.set('X-CSRFToken', csrftoken);
  }

  const res = await fetch(path, { ...options, headers, credentials: 'same-origin' });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError(res.status, body);
  }
  return body as T;
}

export type Me = {
  id: number;
  email: string;
  nome: string;
  nome_guerra: string | null;
  posto_graduacao: string | null;
  local_trabalho: string | null;
  is_staff: boolean;
  is_superuser: boolean;
  totp_enabled: boolean;
  totp_obrigatorio: boolean;
  groups: string[];
  permissions: string[];
  '2fa_verified': boolean;
};

export async function fetchMe(): Promise<Me | null> {
  try {
    return await apiFetch<Me>('/api/auth/me/');
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      return null;
    }
    throw err;
  }
}

// Espelha o `DjangoModelPermissionsWithView` do backend: permissão no
// formato "app_label.acao_model" (ex.: "ocorrencia.view_ocorrenciageral").
// Superusuário sempre tem tudo, igual ao Django (`user.has_perm`).
export function hasPerm(me: Me | null | undefined, perm: string): boolean {
  if (!me) return false;
  if (me.is_superuser) return true;
  return me.permissions.includes(perm);
}
