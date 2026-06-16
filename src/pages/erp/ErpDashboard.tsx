import { Link } from 'react-router-dom';
import { Wallet, Building2, FolderKanban, TrendingUp, ArrowRight } from 'lucide-react';
import { PageHeader, StatCard, DataTable, Row, Cell, Badge, Progress, AsyncState } from '../../components/admin/ui';
import { moneda } from '../../lib/mockData';
import { useApi } from '../../lib/useApi';
import { useAuth } from '../../lib/AuthContext';
import { estadoProyectoTone, estadoHitoTone } from './tones';
import type { EstadoProyecto, EstadoHito } from '../../lib/mockData';

interface DashboardData {
  pipeline: number;
  prospectosCount: number;
  clientesCount: number;
  proyectosActivos: number;
  gastoMes: number;
  proyectos: { id: string; nombre: string; estado: EstadoProyecto; avance: number; cliente: string | null }[];
  hitos: { id: string; titulo: string; estado: EstadoHito; fecha: string | null; proyecto: string | null }[];
}

export function ErpDashboard() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'gerente';
  const { data, loading, error } = useApi<DashboardData>('dashboard');

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Resumen operativo de Terabound" />
      <AsyncState loading={loading} error={error}>
        {data && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {esAdmin && <StatCard label="Pipeline" value={moneda(data.pipeline)} hint={`${data.prospectosCount} prospectos`} icon={TrendingUp} />}
              <StatCard label="Clientes" value={String(data.clientesCount)} hint="activos" icon={Building2} />
              <StatCard label="Proyectos" value={String(data.proyectosActivos)} hint="en ejecución" icon={FolderKanban} />
              {esAdmin && <StatCard label="Gastos del mes" value={moneda(data.gastoMes)} hint="acumulado" icon={Wallet} accent />}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Proyectos recientes</h2>
                  <Link to="/app/proyectos" className="text-sm font-medium text-[var(--primary)] hover:underline flex items-center gap-1">
                    Ver todos <ArrowRight size={14} />
                  </Link>
                </div>
                <DataTable columns={['Proyecto', 'Cliente', 'Estado', 'Avance']}>
                  {data.proyectos.map((p) => (
                    <Row key={p.id}>
                      <Cell className="font-medium">{p.nombre}</Cell>
                      <Cell className="text-[var(--muted)]">{p.cliente ?? '—'}</Cell>
                      <Cell><Badge tone={estadoProyectoTone(p.estado)}>{p.estado}</Badge></Cell>
                      <Cell><Progress value={p.avance} /></Cell>
                    </Row>
                  ))}
                </DataTable>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Próximos hitos</h2>
                  <Link to="/app/hitos" className="text-sm font-medium text-[var(--primary)] hover:underline flex items-center gap-1">
                    Ver todos <ArrowRight size={14} />
                  </Link>
                </div>
                <div className="flex flex-col gap-3">
                  {data.hitos.map((h) => (
                    <div key={h.id} className="p-4 rounded-2xl bg-[var(--card)]/80 backdrop-blur-md border border-[var(--border)]">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-medium text-sm">{h.titulo}</span>
                        <Badge tone={estadoHitoTone(h.estado)}>{h.estado}</Badge>
                      </div>
                      <div className="text-xs text-[var(--muted)]">{h.proyecto} · {h.fecha}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </AsyncState>
    </div>
  );
}
