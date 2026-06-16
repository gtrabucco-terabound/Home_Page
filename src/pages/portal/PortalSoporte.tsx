import { Plus } from 'lucide-react';
import { PageHeader, DataTable, Row, Cell, Badge, AsyncState } from '../../components/admin/ui';
import { Button } from '../../components/Button';
import { useAuth } from '../../lib/AuthContext';
import { useApi } from '../../lib/useApi';
import { estadoTicketTone } from '../erp/tones';
import type { EstadoTicket } from '../../lib/mockData';

interface ProyectoRow { nombre: string; cliente: string | null }
interface TicketRow { id: string; asunto: string; estado: EstadoTicket; prioridad: 'Alta' | 'Media' | 'Baja'; fecha: string | null; proyecto: string | null }

const prioridadTone = (p: string): 'danger' | 'warning' | 'neutral' =>
  p === 'Alta' ? 'danger' : p === 'Media' ? 'warning' : 'neutral';

export function PortalSoporte() {
  const { usuario } = useAuth();
  const empresa = usuario?.empresa ?? '';
  const { data: proy } = useApi<ProyectoRow[]>('proyectos');
  const { data: tick, loading, error } = useApi<TicketRow[]>('tickets');

  const nombres = (proy ?? []).filter((p) => p.cliente === empresa).map((p) => p.nombre);
  const mios = (tick ?? []).filter((t) => t.proyecto && nombres.includes(t.proyecto));

  return (
    <div>
      <PageHeader
        title="Soporte"
        subtitle="Tus solicitudes y su estado"
        action={<Button className="gap-2"><Plus size={18} /> Nueva solicitud</Button>}
      />
      <AsyncState loading={loading} error={error}>
        <DataTable columns={['ID', 'Asunto', 'Proyecto', 'Prioridad', 'Estado', 'Fecha']}>
          {mios.map((t) => (
            <Row key={t.id}>
              <Cell className="text-[var(--muted)] font-mono text-xs">{t.id.slice(0, 8)}</Cell>
              <Cell className="font-medium max-w-[280px] whitespace-normal">{t.asunto}</Cell>
              <Cell className="text-[var(--muted)] max-w-[200px] whitespace-normal">{t.proyecto}</Cell>
              <Cell><Badge tone={prioridadTone(t.prioridad)}>{t.prioridad}</Badge></Cell>
              <Cell><Badge tone={estadoTicketTone(t.estado)}>{t.estado}</Badge></Cell>
              <Cell className="text-[var(--muted)]">{t.fecha ?? '—'}</Cell>
            </Row>
          ))}
        </DataTable>
      </AsyncState>
    </div>
  );
}
