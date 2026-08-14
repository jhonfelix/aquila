import type { ZodError, ZodType } from 'zod';

// Mesmo formato que os erros de campo vindos de um 400 do DRF
// (ver ResourceFormPage/Ocorrência forms) — assim a validação local e a do
// backend alimentam o mesmo estado `fieldErrors` e o mesmo <FieldError>.
export type FieldErrors = Record<string, string>;

export function zodFieldErrors(error: ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_root';
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

// Roda o schema antes do POST/PATCH — evita um round-trip só pra descobrir
// que um campo obrigatório está vazio ou um formato está errado.
export function validate<T>(schema: ZodType<T>, data: unknown): { data: T; errors: null } | { data: null; errors: FieldErrors } {
  const result = schema.safeParse(data);
  if (result.success) return { data: result.data, errors: null };
  return { data: null, errors: zodFieldErrors(result.error) };
}
