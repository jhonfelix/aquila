'use client';

import { useParams } from 'next/navigation';
import ResourceFormPage, { FieldConfig } from '@/components/crud/ResourceFormPage';
import { MATERIAL_TIPO_DOCUMENTO_CHOICES } from '@/lib/choices';

const FIELDS: FieldConfig[] = [
  { name: 'titulo', label: 'Título', type: 'text', required: true },
  { name: 'tipo_documento', label: 'Tipo de Documento', type: 'select', choices: MATERIAL_TIPO_DOCUMENTO_CHOICES, required: true },
  { name: 'numero_norma', label: 'Número', type: 'text' },
  { name: 'divisao_responsavel', label: 'Divisão Responsável', type: 'text' },
  { name: 'setor_responsavel', label: 'Setor Responsável', type: 'text' },
  {
    name: 'pessoa_responsavel',
    label: 'Pessoa Responsável',
    type: 'async-fk',
    fkApiPath: '/api/usuarios/',
    fkLabel: (i) => i.nome_guerra || i.nome,
  },
  { name: 'data_emissao', label: 'Data da Emissão', type: 'date' },
  { name: 'data_publicacao', label: 'Data da Publicação', type: 'date' },
  { name: 'documento_word', label: 'Documento Word', type: 'file' },
  { name: 'documento_pdf', label: 'Documento PDF', type: 'file' },
  { name: 'observacoes', label: 'Observações', type: 'textarea' },
];

export default function EditarDocumentoDiversoPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <ResourceFormPage
      apiPath="/api/material-apoio/materiais/"
      id={id}
      title="Editar Documento Diverso"
      fields={FIELDS}
      listHref="/material-apoio/documentos-diversos"
    />
  );
}
