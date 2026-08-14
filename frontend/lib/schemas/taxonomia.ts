import { z } from 'zod';

// Espelham as constraints reais de backend/taxonomia/models.py (max_length,
// obrigatoriedade) — não inventam regra que o backend não já impõe.

const requiredText = (max: number, message = 'Campo obrigatório') => z.string().trim().min(1, message).max(max, `Máximo ${max} caracteres`);
const optionalText = (max?: number) => {
  const base = max ? z.string().trim().max(max, `Máximo ${max} caracteres`) : z.string();
  return base.optional().nullable();
};
const requiredChoice = (message: string) => z.string().trim().min(1, message);
const requiredId = (message: string) =>
  z
    .union([z.number(), z.null(), z.undefined()])
    .refine((v) => v != null, { message });

export const paisSchema = z.object({
  nome: requiredText(150),
  nome_codigo: optionalText(50),
  idioma_codigo: optionalText(10),
  continente: optionalText(50),
});

export const ufSchema = z.object({
  nome: requiredText(150),
  pais: requiredId('Selecione o país'),
  nome_codigo: optionalText(10),
  regiao: optionalText(50),
  comar: optionalText(50),
});

export const cidadeSchema = z.object({
  nome: requiredText(150),
  uf: requiredId('Selecione a UF'),
  pais: requiredId('Selecione o país'),
  latitude: optionalText(100),
  longitude: optionalText(100),
  altitude: optionalText(100),
});

export const aerodromoSchema = z.object({
  nome: requiredText(150),
  icao: optionalText(7),
  iata: optionalText(5),
  cidade: requiredId('Selecione a cidade'),
  propriedade: optionalText(150),
  tipo: optionalText(10),
  latitude: optionalText(100),
  longitude: optionalText(100),
  latitude_decimal: optionalText(100),
  longitude_decimal: optionalText(100),
  altitude: optionalText(100),
  vfr_diurno: optionalText(100),
  vfr_noturno: optionalText(100),
  ifr_diurno: optionalText(100),
  ifr_noturno: optionalText(100),
});

const currentYear = new Date().getFullYear();

export const artefatoEspacialSchema = z.object({
  designacao: requiredText(120),
  tipo_artefato: requiredChoice('Selecione o tipo de artefato'),
  numero_serie: optionalText(80),
  fabricante: optionalText(120),
  operador: optionalText(120),
  pais_fabricacao: optionalText(60),
  pais_operador: optionalText(60),
  ano_fabricacao: z
    .union([z.number(), z.null(), z.undefined()])
    .refine((v) => v == null || (Number.isInteger(v) && v >= 1900 && v <= currentYear + 1), {
      message: `Ano entre 1900 e ${currentYear + 1}`,
    }),
  status: optionalText(50),
});

const nonNegative = (message = 'Deve ser zero ou positivo') =>
  z.union([z.number(), z.null(), z.undefined()]).refine((v) => v == null || v >= 0, { message });
const nonNegativeInt = (message = 'Deve ser um número inteiro positivo') =>
  z.union([z.number(), z.null(), z.undefined()]).refine((v) => v == null || (Number.isInteger(v) && v >= 0), { message });

export const veiculoLancadorSchema = z.object({
  artefato: requiredId('Selecione o artefato espacial'),
  tipo_propulsao: requiredChoice('Selecione o tipo de propulsão'),
  altura_metros: nonNegative(),
  diametro_metros: nonNegative(),
  massa_total_kg: nonNegative(),
  carga_util_leo_kg: nonNegative(),
  carga_util_geo_kg: nonNegative(),
  numero_estagios: nonNegativeInt(),
  quantidade_motores_primeiro_estagio: nonNegativeInt(),
  empuxo_total_kN: nonNegative(),
});
