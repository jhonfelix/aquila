import { z } from 'zod';
import type { ZodError, ZodType } from 'zod';

// Mensagens padrão do Zod em português e em linguagem de usuário final.
// Só entra em ação quando o schema não define mensagem própria (as
// mensagens explícitas dos schemas em lib/schemas/* sempre têm prioridade).
z.config({
  customError: (iss) => {
    const vazio = iss.input === undefined || iss.input === null || iss.input === '';
    switch (iss.code) {
      case 'invalid_type':
        if (vazio || iss.expected === 'nonoptional') return 'Campo obrigatório';
        if (iss.expected === 'number' || iss.expected === 'int') return 'Informe um número válido';
        if (iss.expected === 'date') return 'Informe uma data válida';
        return 'Valor inválido';
      case 'too_small':
        if (iss.origin === 'string') return Number(iss.minimum) <= 1 ? 'Campo obrigatório' : `Mínimo de ${iss.minimum} caracteres`;
        if (iss.origin === 'array' || iss.origin === 'set') return `Selecione pelo menos ${iss.minimum} item(ns)`;
        return `O valor deve ser no mínimo ${iss.minimum}`;
      case 'too_big':
        if (iss.origin === 'string') return `Máximo de ${iss.maximum} caracteres`;
        if (iss.origin === 'array' || iss.origin === 'set') return `Selecione no máximo ${iss.maximum} item(ns)`;
        return `O valor deve ser no máximo ${iss.maximum}`;
      case 'invalid_format':
        if (iss.format === 'email') return 'E-mail inválido';
        if (iss.format === 'url') return 'Endereço (URL) inválido';
        if (iss.format === 'date' || iss.format === 'datetime') return 'Data inválida';
        return 'Formato inválido';
      case 'invalid_value':
        return 'Selecione uma opção válida';
      case 'not_multiple_of':
        return `O valor deve ser múltiplo de ${iss.divisor}`;
      default:
        return 'Valor inválido';
    }
  },
});

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
