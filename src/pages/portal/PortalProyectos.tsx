import { PageHeader, Panel, Badge, Progress, AsyncState } from '../../components/admin/ui';
import { useAuth } from '../../lib/AuthContext';
import { useApi } from '../../lib/useApi';
import { estadoProyectoTone, estadoHitoTone } from '../erp/tones';
import type { EstadoProyecto, EstadoHito } from '../../lib/mockData';

interface ProyectoRow { id: string; nombre: string; estado: EstadoProyecto; avance: number; responsable: string | null; inicio: string | null; fin: string | null; cliente: string | null }
interface HitoRow { id: string; titulo: string; estado: EstadoHito; fecha: string | null; proyecto: string | null }

export function PortalProyectos() {
  const { usuario } = useAuth();
  const empresa = usuario?.empresa ?? '';
  const { data: proy, loading, error } = useApi<ProyectoRow[]>('proyectos');
  const { data: hit } = useApi<HitoRow[]>('hitos');

  const misProyectos = (proy ?? []).filter((p) => p.cliente === empresa);

  return (
    <div>
      <PageHeader title="Mis Proyectos" subtitle="Avance y entregables de cada proyecto" />
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
                  <div className="mt-6 border-t border-[var(--border)] pt-5">
                    <div className="text-xs uppercase tracking-widest text-[var(--muted)] mb-3">Hitos</div>
                    <div className="flex flex-col gap-2">
                      {sus.map((h) => (
                        <div key={h.id} className="flex items-center justify-between gap-3 text-sm">
                          <span>{h.titulo}</span>
                          <span className="flex items-center gap-3">
                            <span className="text-xs text-[var(--muted)]">{h.fecha}</span>
                            <Badge tone={estadoHitoTone(h.estado)}>{h.estado}</Badge>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Panel>
            );
          })}
        </div>
      </AsyncState>
    </div>
  );
}
