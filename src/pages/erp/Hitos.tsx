import React from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, DataTable, Row, Cell, Badge, AsyncState } from '../../components/admin/ui';
import { Button } from '../../components/Button';
import { FormModal, Field } from '../../components/admin/FormModal';
import { useApi } from '../../lib/useApi';
import { apiSend } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { estadoHitoTone } from './tones';
import type { EstadoHito } from '../../lib/mockData';

interface HitoRow {
  id: string; titulo: string; estado: EstadoHito; fecha: string | null;
  proyectoId: string | null; proyecto: string | null;
}
interface ProyectoOpt { id: string; nombre: string }

const estados: EstadoHito[] = ['Pendiente', 'En progreso', 'Completado', 'Atrasado'];

export function Hitos() {
  const { usuario } = useAuth();
  const { data, loading, error, reload } = useApi<HitoRow[]>('hitos');
  const { data: proyectos } = useApi<ProyectoOpt[]>('proyectos');
  const hitos = data ?? [];
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<HitoRow | null>(null);

  const fields: Field[] = [
    { name: 'proyectoId', label: 'Proyecto', type: 'select', required: true, options: (proyectos ?? []).map((p) => ({ value: p.id, label: p.nombre })) },
    { name: 'titulo', label: 'Título del hito', required: true, full: true },
    { name: 'estado', label: 'Estado', type: 'select', options: estados.map((e) => ({ value: e, label: e })) },
    { name: 'fecha', label: 'Fecha objetivo', type: 'date' },
  ];

  const guardar = async (v: Record<string, any>) => {
    if (editing) await apiSend(`hitos?id=${editing.id}`, 'PUT', v);
    else await apiSend('hitos', 'POST', v);
    reload();
  };
  const borrar = async (h: HitoRow) => {
    if (!confirm(`¿Dar de baja el hito "${h.titulo}"?`)) return;
    await apiSend(`hitos?id=${h.id}`, 'DELETE');
    reload();
  };

  return (
    <div>
      <PageHeader
        title="Hitos"
        subtitle={loading ? 'Cargando…' : `${hitos.length} hitos en seguimiento`}
        action={<Button className="gap-2" onClick={() => { setEditing(null); setOpen(true); }}><Plus size={18} /> Nuevo hito</Button>}
      />
      <AsyncState loading={loading} error={error}>
        <DataTable columns={['Hito', 'Proyecto', 'Estado', 'Fecha objetivo', '']}>
          {hitos.map((h) => (
            <Row key={h.id}>
              <Cell className="font-medium max-w-[260px] whitespace-normal">{h.titulo}</Cell>
              <Cell className="text-[var(--muted)]">{h.proyecto ?? '—'}</Cell>
              <Cell><Badge tone={estadoHitoTone(h.estado)}>{h.estado}</Badge></Cell>
              <Cell className="text-[var(--muted)]">{h.fecha ?? '—'}</Cell>
              <Cell>
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={() => { setEditing(h); setOpen(true); }} aria-label="Editar" className="p-2 rounded-lg hover:bg-[var(--card)] text-[var(--muted)] hover:text-[var(--primary)]"><Pencil size={15} /></button>
                  {usuario?.rol === 'gerente' && (
                    <button onClick={() => borrar(h)} aria-label="Eliminar" className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--muted)] hover:text-red-500"><Trash2 size={15} /></button>
                  )}
                </div>
              </Cell>
            </Row>
          ))}
        </DataTable>
      </AsyncState>

      <FormModal
        title={editing ? 'Editar hito' : 'Nuevo hito'}
        fields={fields}
        initial={editing ? { ...editing } : { estado: 'Pendiente' }}
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={guardar}
      />
    </div>
  );
}
