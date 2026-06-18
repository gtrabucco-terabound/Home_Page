import { PageHeader, Panel, Badge, Progress, AsyncState } from '../../components/admin/ui';
import { useAuth } from '../../lib/AuthContext';
import { useApi } from '../../lib/useApi';
import { estadoProyectoTone, estadoHitoTone } from '../erp/tones';
import type { EstadoProyecto, EstadoHito } from '../../lib/mockData';

interface ProyectoRow { id: string; nombre: string; estado: EstadoProyecto; avance: number; responsable: string | null; inicio: string | null; fin: string | null; cliente: string | null }
interface HitoRow { id: string; titulo: string; estado: EstadoHito; fecha: string | null; orden: number; proyecto: string | null }

const dotColor = (e: EstadoHito) =>
  e === 'Completado' ? 'bg-emerald-500'
    : e === 'En progreso' ? 'bg-blue-500'
    : e === 'Atrasado' ? 'bg-red-500'
    : 'bg-[var(--muted)]';

export function PortalProyectos() {
  const { usuario } = useAuth();
  const empresa = usuario?.empresa ?? '';
  const { data: proy, loading, error } = useApi<ProyectoRow[]>('proyectos');
  const { data: hit } = useApi<HitoRow[]>('hitos');

  const misProyectos = (proy ?? []).filter((p) => p.cliente === empresa);

  return (
    <div>
      <PageHeader title="Mis Proyectos" subtitle="Avance y línea de tiempo de cada proyecto" />
      <AsyncState loading={loading} error={error}>
        <div className="flex flex-col gap-6">
          {misProyectos.map((p) => {
            const sus = (hit ?? []).filter((h) => h.proyecto === p.nombre);
            return (
              <Panel key={p.id} className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                  <div>
                    <h3 className="text-xl font-bold">{p.nombre}</h3>
                    <p className="text-sm text-[var(--muted)] mt-1">Responsable: {p.responsable ?? '—'} · {p.inicio ?? '—'} → {p.fin ?? '—'}</p>
                  </div>
                  <Badge tone={estadoProyectoTone(p.estado)}>{p.estado}</Badge>
                </div>
                <Progress value={p.avance} />

                {sus.length > 0 && (
                  <div className="mt-6 border-t border-[var(--border)] pt-6">
                    <div className="text-xs uppercase tracking-widest text-[var(--muted)] mb-5">Línea de tiempo</div>
                    <ol className="relative border-l-2 border-[var(--border)] ml-1.5">
                      {sus.map((h) => (
                        <li key={h.id} className="relative ml-6 pb-6 last:pb-0">
                          <span className={`absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full ring-4 ring-[var(--card)] ${dotColor(h.estado)}`} />
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <span className="font-medium text-sm">{h.titulo}</span>
                            <span className="flex items-center gap-3 flex-shrink-0">
                              <span className="text-xs text-[var(--muted)]">{h.fecha ?? '—'}</span>
                              <Badge tone={estadoHitoTone(h.estado)}>{h.estado}</Badge>
                            </span>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </Panel>
            );
          })}
          {misProyectos.length === 0 && (
            <Panel className="p-8 text-center text-[var(--muted)]">Todavía no tenés proyectos asignados.</Panel>
          )}
        </div>
      </AsyncState>
    </div>
  );
}
