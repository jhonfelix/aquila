'use client';

import ResourceFormPage, { FieldConfig } from '@/components/crud/ResourceFormPage';

const FIELDS: FieldConfig[] = [
  { name: 'nome', label: 'Nome', type: 'text', required: true },
  { name: 'icao', label: 'ICAO', type: 'text' },
  { name: 'iata', label: 'IATA', type: 'text' },
  { name: 'cidade', label: 'Cidade', type: 'async-fk', fkApiPath: '/api/taxonomia/cidades/', fkLabel: (i) => i.nome, required: true },
  { name: 'propriedade', label: 'Propriedade', type: 'text' },
  { name: 'tipo', label: 'Tipo', type: 'text' },
  { name: 'latitude', label: 'Latitude', type: 'text' },
  { name: 'longitude', label: 'Longitude', type: 'text' },
  { name: 'latitude_decimal', label: 'Latitude (decimal)', type: 'text' },
  { name: 'longitude_decimal', label: 'Longitude (decimal)', type: 'text' },
  { name: 'altitude', label: 'Altitude', type: 'text' },
  { name: 'vfr_diurno', label: 'VFR Diurno', type: 'text' },
  { name: 'vfr_noturno', label: 'VFR Noturno', type: 'text' },
  { name: 'ifr_diurno', label: 'IFR Diurno', type: 'text' },
  { name: 'ifr_noturno', label: 'IFR Noturno', type: 'text' },
];

export default function NovoAerodromoPage() {
  return (
    <ResourceFormPage apiPath="/api/taxonomia/aerodromos/" title="Novo Aeródromo" fields={FIELDS} listHref="/taxonomia/aerodromos" />
  );
}
