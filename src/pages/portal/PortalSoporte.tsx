import React from 'react';
import { Plus } from 'lucide-react';
import { PageHeader, DataTable, Row, Cell, Badge, AsyncState } from '../../components/admin/ui';
import { Button } from '../../components/Button';
import { FormModal, Field } from '../../components/admin/FormModal';
import { useAuth } from '../../lib/AuthContext';
import { useApi } from '../../lib/useApi';
import { apiSend } from '../../lib/api';
import { estadoTicketTone } from '../erp/tones';
import type { EstadoTicket } from '../../lib/mockData';

interface ProyectoRow { id: string; nombre: string; cliente: string | null }
interface TicketRow { id: string; asunto: string; estado: EstadoTicket; prioridad: 'Alta' | 'Media' | 'Baja'; fecha: string | null; proyecto: string | null }

const prioridadTone = (p: string): 'danger' | 'warning' | 'neutral' =>
  p === 'Alta' ? 'danger' : p === 'Media' ? 'warning' : 'neutral';

export function PortalSoporte() {
  const { usuario } = useAuth();
  const empresa = usuario?.empresa ?? '';
  const { data: proy } = useApi<ProyectoRow[]>('proyectos');
  const { data: tick, loading, error, reload } = useApi<TicketRow[]>('tickets');
  const [open, setOpen] = React.useState(false);

  const misProyectos = (proy ?? []).filter((p) => p.cliente === empresa);
  const nombres = misProyectos.map((p) => p.nombre);
  const mios = (tick ?? []).filter((t) => t.proyecto && nombres.includes(t.proyecto));

  const fields: Field[] = [
    { name: 'proyectoId', label: 'Proyecto', type: 'select', required: true, options: misProyectos.map((p) => ({ value: p.id, label: p.nombre })) },
    { name: 'asunto', label: 'Asunto', required: true, full: true },
    { name: 'prioridad', label: 'Prioridad', type: 'select', options: ['Alta', 'Media', 'Baja'].map((p) => ({ value: p, label: p })) },
  ];

  const crear = async (v: Record<string, any>) => {
    await apiSend('tickets', 'POST', { ...v, estado: 'Abierto' });
    reload();
  };

  return (
    <div>
      <PageHeader
        title="Soporte"
        subtitle="Tus solicitudes y su estado"
        action={<Button className="gap-2" onClick={() => setOpen(true)}><Plus size={18} /> Nueva solicitud</Button>}
      />
      <AsyncState loading={loading} error={error}>
        <DataTable columns={['Asunto', 'Proyecto', 'Prioridad', 'Estado', 'Fecha']}>
          {mios.map((t) => (
            <Row key={t.id}>
              <Cell className="font-medium max-w-[280px] whitespace-normal">{t.asunto}</Cell>
              <Cell className="text-[var(--muted)] max-w-[200px] whitespace-normal">{t.proyecto}</Cell>
              <Cell><Badge tone={prioridadTone(t.prioridad)}>{t.prioridad}</Badge></Cell>
              <Cell><Badge tone={estadoTicketTone(t.estado)}>{t.estado}</Badge></Cell>
              <Cell className="text-[var(--muted)]">{t.fecha ?? '—'}</Cell>
            </Row>
          ))}
        </DataTable>
      </AsyncState>

      <FormModal
        title="Nueva solicitud"
        fields={fields}
        initial={{ prioridad: 'Media' }}
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={crear}
      />
    </div>
  );
}
