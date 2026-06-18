import React from 'react';
import { Plus, MessageSquareReply } from 'lucide-react';
import { PageHeader, DataTable, Row, Cell, Badge, AsyncState } from '../../components/admin/ui';
import { Button } from '../../components/Button';
import { FormModal, Field } from '../../components/admin/FormModal';
import { useApi } from '../../lib/useApi';
import { apiSend } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';

interface SolicitudRow {
  id: string; tipo: string; titulo: string; detalle: string | null;
  estado: string; respuesta: string | null; autorNombre: string | null;
  proyecto: string | null; createdAt: string;
}
interface ProyectoOpt { id: string; nombre: string }

const estadoTone = (e: string): 'warning' | 'success' | 'danger' | 'info' =>
  e === 'Aprobada' ? 'success' : e === 'Rechazada' ? 'danger' : e === 'Resuelta' ? 'info' : 'warning';

export function Solicitudes() {
  const { usuario } = useAuth();
  const esGerente = usuario?.rol === 'gerente';
  const { data, loading, error, reload } = useApi<SolicitudRow[]>('solicitudes');
  const { data: proyectos } = useApi<ProyectoOpt[]>('proyectos');
  const solicitudes = data ?? [];
  const [crear, setCrear] = React.useState(false);
  const [responder, setResponder] = React.useState<SolicitudRow | null>(null);

  const camposCrear: Field[] = [
    { name: 'proyectoId', label: 'Proyecto', type: 'select', options: (proyectos ?? []).map((p) => ({ value: p.id, label: p.nombre })) },
    { name: 'tipo', label: 'Tipo', type: 'select', options: [{ value: 'Consulta', label: 'Consulta' }, { value: 'Aprobación', label: 'Aprobación' }] },
    { name: 'titulo', label: 'Asunto', required: true, full: true },
    { name: 'detalle', label: 'Detalle', type: 'textarea', full: true },
  ];
  const camposResponder: Field[] = [
    { name: 'estado', label: 'Resolución', type: 'select', required: true, options: ['Aprobada', 'Rechazada', 'Resuelta'].map((e) => ({ value: e, label: e })) },
    { name: 'respuesta', label: 'Respuesta', type: 'textarea', full: true },
  ];

  const guardarNueva = async (v: Record<string, any>) => { await apiSend('solicitudes', 'POST', v); reload(); };
  const guardarRespuesta = async (v: Record<string, any>) => {
    if (responder) await apiSend(`solicitudes?id=${responder.id}`, 'PUT', v);
    reload();
  };

  return (
    <div>
      <PageHeader
        title="Solicitudes"
        subtitle={esGerente ? 'Consultas y aprobaciones del equipo' : 'Tus consultas y aprobaciones'}
        action={<Button className="gap-2" onClick={() => setCrear(true)}><Plus size={18} /> Nueva solicitud</Button>}
      />
      <AsyncState loading={loading} error={error}>
        <DataTable columns={['Tipo', 'Asunto', 'Proyecto', ...(esGerente ? ['Autor'] : []), 'Estado', 'Fecha', '']}>
          {solicitudes.map((sol) => (
            <Row key={sol.id}>
              <Cell><Badge tone="info">{sol.tipo}</Badge></Cell>
              <Cell className="font-medium max-w-[260px] whitespace-normal">
                {sol.titulo}
                {sol.respuesta && <div className="text-xs text-[var(--muted)] mt-1">↳ {sol.respuesta}</div>}
              </Cell>
              <Cell className="text-[var(--muted)]">{sol.proyecto ?? '—'}</Cell>
              {esGerente && <Cell className="text-[var(--muted)]">{sol.autorNombre ?? '—'}</Cell>}
              <Cell><Badge tone={estadoTone(sol.estado)}>{sol.estado}</Badge></Cell>
              <Cell className="text-[var(--muted)] whitespace-nowrap">{new Date(sol.createdAt).toLocaleDateString('es-AR')}</Cell>
              <Cell>
                {esGerente && sol.estado === 'Abierta' && (
                  <button onClick={() => setResponder(sol)} aria-label="Responder" title="Responder"
                    className="p-2 rounded-lg hover:bg-[var(--card)] text-[var(--muted)] hover:text-[var(--primary)]">
                    <MessageSquareReply size={15} />
                  </button>
                )}
              </Cell>
            </Row>
          ))}
        </DataTable>
      </AsyncState>

      <FormModal title="Nueva solicitud" fields={camposCrear} initial={{ tipo: 'Consulta' }}
        open={crear} onClose={() => setCrear(false)} onSubmit={guardarNueva} />
      <FormModal title={`Responder: ${responder?.titulo ?? ''}`} fields={camposResponder} initial={{ estado: 'Aprobada' }}
        open={!!responder} onClose={() => setResponder(null)} onSubmit={guardarRespuesta} />
    </div>
  );
}
