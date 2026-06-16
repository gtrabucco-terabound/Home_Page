import { Plus } from 'lucide-react';
import { PageHeader, DataTable, Row, Cell, Badge, AsyncState } from '../../components/admin/ui';
import { Button } from '../../components/Button';
import { moneda } from '../../lib/mockData';
import { useApi } from '../../lib/useApi';
import { estadoProspectoTone } from './tones';
import type { EstadoProspecto } from '../../lib/mockData';

interface ProspectoRow {
  id: string;
  empresa: string;
  contacto: string | null;
  email: string | null;
  estado: EstadoProspecto;
  valorEstimado: string | null;
  ultimoContacto: string | null;
}

export function Prospectos() {
  const { data, loading, error } = useApi<ProspectoRow[]>('prospectos');
  const prospectos = data ?? [];
  const total = prospectos.reduce((s, p) => s + Number(p.valorEstimado ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="Prospectos"
        subtitle={loading ? 'Cargando…' : `${prospectos.length} oportunidades · pipeline ${moneda(total)}`}
        action={<Button className="gap-2"><Plus size={18} /> Nuevo prospecto</Button>}
      />
      <AsyncState loading={loading} error={error}>
        <DataTable columns={['ID', 'Empresa', 'Contacto', 'Estado', 'Valor estimado', 'Último contacto']}>
          {prospectos.map((p) => (
            <Row key={p.id}>
              <Cell className="text-[var(--muted)] font-mono text-xs">{p.id.slice(0, 8)}</Cell>
              <Cell className="font-medium">{p.empresa}</Cell>
              <Cell>
                <div>{p.contacto}</div>
                <div className="text-xs text-[var(--muted)]">{p.email}</div>
              </Cell>
              <Cell><Badge tone={estadoProspectoTone(p.estado)}>{p.estado}</Badge></Cell>
              <Cell className="font-medium">{moneda(Number(p.valorEstimado ?? 0))}</Cell>
              <Cell className="text-[var(--muted)]">{p.ultimoContacto ?? '—'}</Cell>
            </Row>
          ))}
        </DataTable>
      </AsyncState>
    </div>
  );
}
