import React from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, DataTable, Row, Cell, Badge, Progress, AsyncState } from '../../components/admin/ui';
import { Button } from '../../components/Button';
import { FormModal, Field } from '../../components/admin/FormModal';
import { useApi } from '../../lib/useApi';
import { apiSend } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { estadoProyectoTone } from './tones';
import type { EstadoProyecto } from '../../lib/mockData';

interface ProyectoRow {
  id: string; nombre: string; estado: EstadoProyecto; avance: number;
  responsable: string | null; inicio: string | null; fin: string | null;
  clienteId: string | null; cliente: string | null;
}
interface ClienteOpt { id: string; empresa: string }

const estados: EstadoProyecto[] = ['En curso', 'En riesgo', 'Pausado', 'Cerrado'];

export function Proyectos() {
  const { usuario } = useAuth();
  const { data, loading, error, reload } = useApi<ProyectoRow[]>('proyectos');
  const { data: clientes } = useApi<ClienteOpt[]>('clientes');
  const proyectos = data ?? [];
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ProyectoRow | null>(null);

  const fields: Field[] = [
    { name: 'nombre', label: 'Nombre del proyecto', required: true },
    { name: 'clienteId', label: 'Cliente', type: 'select', required: true, options: (clientes ?? []).map((c) => ({ value: c.id, label: c.empresa })) },
    { name: 'estado', label: 'Estado', type: 'select', options: estados.map((e) => ({ value: e, label: e })) },
    { name: 'avance', label: 'Avance (%)', type: 'number' },
    { name: 'responsable', label: 'Responsable' },
    { name: 'inicio', label: 'Inicio', type: 'date' },
    { name: 'fin', label: 'Entrega', type: 'date' },
  ];

  const guardar = async (v: Record<string, any>) => {
    if (editing) await apiSend(`proyectos?id=${editing.id}`, 'PUT', v);
    else await apiSend('proyectos', 'POST', v);
    reload();
  };
  const borrar = async (p: ProyectoRow) => {
    if (!confirm(`¿Dar de baja el proyecto "${p.nombre}"?`)) return;
    await apiSend(`proyectos?id=${p.id}`, 'DELETE');
    reload();
  };

  return (
    <div>
      <PageHeader
        title="Proyectos"
        subtitle={loading ? 'Cargando…' : `${proyectos.length} proyectos en cartera`}
        action={<Button className="gap-2" onClick={() => { setEditing(null); setOpen(true); }}><Plus size={18} /> Nuevo proyecto</Button>}
      />
      <AsyncState loading={loading} error={error}>
        <DataTable columns={['Proyecto', 'Cliente', 'Responsable', 'Estado', 'Avance', 'Entrega', '']}>
          {proyectos.map((p) => (
            <Row key={p.id}>
              <Cell className="font-medium max-w-[240px] whitespace-normal">{p.nombre}</Cell>
              <Cell className="text-[var(--muted)]">{p.cliente ?? '—'}</Cell>
              <Cell className="text-[var(--muted)]">{p.responsable ?? '—'}</Cell>
              <Cell><Badge tone={estadoProyectoTone(p.estado)}>{p.estado}</Badge></Cell>
              <Cell><Progress value={p.avance} /></Cell>
              <Cell className="text-[var(--muted)]">{p.fin ?? '—'}</Cell>
              <Cell>
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={() => { setEditing(p); setOpen(true); }} aria-label="Editar" className="p-2 rounded-lg hover:bg-[var(--card)] text-[var(--muted)] hover:text-[var(--primary)]"><Pencil size={15} /></button>
                  {usuario?.rol === 'gerente' && (
                    <button onClick={() => borrar(p)} aria-label="Eliminar" className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--muted)] hover:text-red-500"><Trash2 size={15} /></button>
                  )}
                </div>
              </Cell>
            </Row>
          ))}
        </DataTable>
      </AsyncState>

      <FormModal
        title={editing ? 'Editar proyecto' : 'Nuevo proyecto'}
        fields={fields}
        initial={editing ? { ...editing } : { estado: 'En curso', avance: 0 }}
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={guardar}
      />
    </div>
  );
}
