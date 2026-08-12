'use client';

import ResourceFormPage, { FieldConfig } from '@/components/crud/ResourceFormPage';
import { INVESTIGACAO_TIPO_OCORRENCIA_CHOICES, INVESTIGACAO_FASE_VOO_CHOICES } from '@/lib/choices';

const FIELDS: FieldConfig[] = [
  { name: 'titulo', label: 'Título', type: 'text', required: true },
  { name: 'pais', label: 'País', type: 'text', required: true },
  { name: 'autoridade_investigadora', label: 'Autoridade Investigadora', type: 'text', required: true, helpText: 'Ex: FAA/AST, NTSB, ESA, Roscosmos' },
  { name: 'numero_relatorio', label: 'Número do Relatório', type: 'text' },
  { name: 'veiculo', label: 'Veículo', type: 'text', helpText: 'Ex: Antares 130, Falcon 9, Ariane 5' },
  { name: 'operador', label: 'Operador', type: 'text', helpText: 'Ex: Orbital Sciences, SpaceX' },
  { name: 'tipo_ocorrencia', label: 'Tipo de Ocorrência', type: 'select', choices: INVESTIGACAO_TIPO_OCORRENCIA_CHOICES, required: true },
  { name: 'fase_voo', label: 'Fase do Voo', type: 'select', choices: INVESTIGACAO_FASE_VOO_CHOICES },
  { name: 'data_ocorrencia', label: 'Data da Ocorrência', type: 'date' },
  { name: 'data_publicacao', label: 'Data de Publicação', type: 'date' },
  { name: 'documento_pdf', label: 'Documento PDF', type: 'file' },
  { name: 'observacoes', label: 'Observações', type: 'textarea' },
];

export default function NovaInvestigacaoPage() {
  return (
    <ResourceFormPage
      apiPath="/api/material-apoio/investigacoes-outras-autoridades/"
      title="Nova Investigação de Outras Autoridades"
      fields={FIELDS}
      listHref="/material-apoio/outras-autoridades"
    />
  );
}
