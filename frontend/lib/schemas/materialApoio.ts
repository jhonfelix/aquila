import { z } from 'zod';

// Espelham backend/material_apoio/models.py (max_length, obrigatoriedade).
// As três telas (Formulários/Normas/Documentos Diversos) compartilham o
// mesmo model MaterialApoio, só variando `categoria` — mesma base aqui.

const requiredText = (max: number, message = 'Campo obrigatório') =>
  z.string().trim().min(1, message).max(max, `Máximo ${max} caracteres`);
const optionalText = (max: number) => z.string().trim().max(max, `Máximo ${max} caracteres`).optional().nullable();
const requiredChoice = (message: string) => z.string().trim().min(1, message);

const baseMaterial = {
  titulo: requiredText(300),
  tipo_documento: requiredChoice('Selecione o tipo de documento'),
  numero_norma: optionalText(100),
  divisao_responsavel: optionalText(200),
  setor_responsavel: optionalText(200),
};

export const formularioSchema = z.object({ ...baseMaterial });
export const documentoDiversoSchema = z.object({ ...baseMaterial });
export const normaLegislacaoSchema = z.object({
  ...baseMaterial,
  categoria: requiredChoice('Selecione a categoria'),
});

export const investigacaoOutrasAutoridadesSchema = z.object({
  titulo: requiredText(300),
  pais: requiredText(100),
  autoridade_investigadora: requiredText(200),
  numero_relatorio: optionalText(100),
  veiculo: optionalText(200),
  operador: optionalText(200),
  tipo_ocorrencia: requiredChoice('Selecione o tipo de ocorrência'),
  fase_voo: z.string().optional().nullable(),
});
