import { Link } from 'react-router-dom';
import { FolderKanban, Flag, LifeBuoy, ArrowRight } from 'lucide-react';
import { PageHeader, StatCard, Badge, Progress, Panel, AsyncState } from '../../components/admin/ui';
import { useAuth } from '../../lib/AuthContext';
import { useApi } from '../../lib/useApi';
import { estadoProyectoTone, estadoHitoTone } from '../erp/tones';
import type { EstadoProyecto, EstadoHito } from '../../lib/mockData';

interface ProyectoRow { id: string; nombre: string; estado: EstadoProyecto; avance: number; responsable: string | null; fin: string | null; cliente: string | null }
interface HitoRow { id: string; titulo: string; estado: EstadoHito; fecha: string | null; proyecto: string | null }
interface TicketRow { id: string; asunto: string; estado: string; proyecto: string | null }

export function PortalDashboard() {
  const { usuario } = useAuth();
  const empresa = usuario?.empresa ?? '';
  const { data: proy, loading, error } = useApi<ProyectoRow[]>('proyectos');
  const { data: hit } = useApi<HitoRow[]>('hitos');
  const { data: tick } = useApi<TicketRow[]>('tickets');

  const misProyectos = (proy ?? []).filter((p) => p.cliente === empresa);
  const nombres = misProyectos.map((p) => p.nombre);
  const misHitos = (hit ?? []).filter((h) => h.proyecto && nombres.includes(h.proyecto));
  const misTickets = (tick ?? []).filter((t) => t.proyecto && nombres.includes(t.proyecto) && t.estado !== 'Resuelto');

  return (
    <div>
      <PageHeader title={`Hola, ${usuario?.nombre?.split(' ')[0] ?? ''}`} subtitle={`Estado de los proyectos de ${empresa}`} />
      <AsyncState loading={loading} error={error}>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard label="Proyectos activos" value={String(misProyectos.length)} icon={FolderKanban} />
          <StatCard label="Hitos en curso" value={String(misHitos.filter((h) => h.estado !== 'Completado').length)} icon={Flag} />
          <StatCard label="Tickets abiertos" value={String(misTickets.length)} icon={LifeBuoy} accent />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Tus proyectos</h2>
          <Link to="/portal/proyectos" className="text-sm font-medium text-[var(--primary)] hover:underline flex items-center gap-1">
            Ver detalle <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {misProyectos.map((p) => (
            <Panel key={p.id} className="p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <h3 className="font-bold">{p.nombre}</h3>
                <Badge tone={estadoProyectoTone(p.estado)}>{p.estado}</Badge>
              </div>
              <Progress value={p.avance} />
              <div className="text-xs text-[var(--muted)] mt-3">Responsable: {p.responsable ?? '—'} · Entrega {p.fin ?? '—'}</div>
            </Panel>
          ))}
        </div>

        <h2 className="text-lg font-bold mb-4">Próximos hitos</h2>
        <div className="flex flex-col gap-3">
          {misHitos.map((h) => (
            <div key={h.id} className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--card)]/80 backdrop-blur-md border border-[var(--border)]">
              <div>
                <div className="font-medium text-sm">{h.titulo}</div>
                <div className="text-xs text-[var(--muted)]">{h.proyecto} · {h.fecha}</div>
              </div>
              <Badge tone={estadoHitoTone(h.estado)}>{h.estado}</Badge>
            </div>
          ))}
        </div>
      </AsyncState>
    </div>
  );
}
