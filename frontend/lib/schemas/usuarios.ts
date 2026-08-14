import { z } from 'zod';

// Espelham backend/usuario/models.py + AUTH_PASSWORD_VALIDATORS
// (MinimumLengthValidator = 8, o default do Django) e o auth.Group nativo.

const requiredText = (max: number, message = 'Campo obrigatório') =>
  z.string().trim().min(1, message).max(max, `Máximo ${max} caracteres`);
const optionalText = (max: number) => z.string().trim().max(max, `Máximo ${max} caracteres`).optional().nullable();
const requiredChoice = (message: string) => z.string().trim().min(1, message);
const optionalPositiveInt = (message = 'Deve ser um número positivo') =>
  z.union([z.number(), z.null(), z.undefined()]).refine((v) => v == null || (Number.isInteger(v) && v > 0), { message });

const baseUsuario = {
  email: z.string().trim().min(1, 'Campo obrigatório').email('E-mail inválido'),
  nome: requiredText(150),
  nome_guerra: optionalText(100),
  local_trabalho: requiredChoice('Selecione o local de trabalho'),
  credencial: optionalText(50),
  qualificacao: optionalText(50),
  telefone: optionalPositiveInt(),
  cpf: optionalPositiveInt(),
};

// Criação: senha inicial obrigatória (mín. 8 — MinimumLengthValidator).
export const usuarioCreateSchema = z.object({
  ...baseUsuario,
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

// Edição: senha em branco mantém a atual (ver ResourceFormPage), só valida
// o tamanho mínimo se o usuário digitar algo novo.
export const usuarioEditSchema = z.object({
  ...baseUsuario,
  password: z.union([z.string().min(8, 'Mínimo 8 caracteres'), z.literal('')]).optional().nullable(),
});

export const grupoSchema = z.object({
  name: requiredText(150),
});
