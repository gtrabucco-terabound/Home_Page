import React from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, StatCard, DataTable, Row, Cell, Badge, AsyncState } from '../../components/admin/ui';
import { Button } from '../../components/Button';
import { FormModal, Field } from '../../components/admin/FormModal';
import { moneda } from '../../lib/mockData';
import { useApi } from '../../lib/useApi';
import { apiSend } from '../../lib/api';
import type { CategoriaGasto } from '../../lib/mockData';

interface GastoRow {
  id: string;
  concepto: string;
  categoria: CategoriaGasto;
  tipo: 'Directo' | 'Indirecto';
  monto: string | null;
  fecha: string | null;
  proyecto: string | null;
  proyectoId: string | null;
}
interface ProyectoOpt { id: string; nombre: string }

const categorias: CategoriaGasto[] = ['Infraestructura', 'Licencias', 'Personal', 'Servicios', 'Otros'];

export function Gastos() {
  const { data, loading, error, reload } = useApi<GastoRow[]>('gastos');
  const { data: proyectos } = useApi<ProyectoOpt[]>('proyectos');
  const gastos = data ?? [];
  const total = gastos.reduce((s, g) => s + Number(g.monto ?? 0), 0);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<GastoRow | null>(null);

  const fields: Field[] = [
    { name: 'concepto', label: 'Concepto', required: true, full: true },
    { name: 'categoria', label: 'Categoría', type: 'select', options: categorias.map((c) => ({ value: c, label: c })) },
    { name: 'tipo', label: 'Tipo', type: 'select', options: [{ value: 'Indirecto', label: 'Indirecto' }, { value: 'Directo', label: 'Directo' }] },
    { name: 'proyectoId', label: 'Proyecto (opcional)', type: 'select', options: (proyectos ?? []).map((p) => ({ value: p.id, label: p.nombre })) },
    { name: 'monto', label: 'Monto (USD)', type: 'number', required: true },
    { name: 'fecha', label: 'Fecha', type: 'date' },
  ];

  const guardar = async (v: Record<string, any>) => {
    if (editing) await apiSend(`gastos?id=${editing.id}`, 'PUT', v);
    else await apiSend('gastos', 'POST', v);
    reload();
  };
  const borrar = async (g: GastoRow) => {
    if (!confirm(`¿Dar de baja el gasto "${g.concepto}"?`)) return;
    await apiSend(`gastos?id=${g.id}`, 'DELETE');
    reload();
  };

  return (
    <div>
      <PageHeader
        title="Gastos"
        subtitle="Egresos registrados"
        action={<Button className="gap-2" onClick={() => { setEditing(null); setOpen(true); }}><Plus size={18} /> Registrar gasto</Button>}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total registrado" value={loading ? '…' : moneda(total)} accent />
        <StatCard label="Movimientos" value={loading ? '…' : String(gastos.length)} />
      </div>
      <AsyncState loading={loading} error={error}>
        <DataTable columns={['Concepto', 'Categoría', 'Tipo', 'Proyecto', 'Fecha', 'Monto', '']}>
          {gastos.map((g) => (
            <Row key={g.id}>
              <Cell className="font-medium">{g.concepto}</Cell>
              <Cell><Badge tone="info">{g.categoria}</Badge></Cell>
              <Cell className="text-[var(--muted)]">{g.tipo}</Cell>
              <Cell className="text-[var(--muted)]">{g.proyecto ?? '—'}</Cell>
              <Cell className="text-[var(--muted)]">{g.fecha ?? '—'}</Cell>
              <Cell className="font-medium">{moneda(Number(g.monto ?? 0))}</Cell>
              <Cell>
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={() => { setEditing(g); setOpen(true); }} aria-label="Editar" className="p-2 rounded-lg hover:bg-[var(--card)] text-[var(--muted)] hover:text-[var(--primary)]"><Pencil size={15} /></button>
                  <button onClick={() => borrar(g)} aria-label="Eliminar" className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--muted)] hover:text-red-500"><Trash2 size={15} /></button>
                </div>
              </Cell>
            </Row>
          ))}
        </DataTable>
      </AsyncState>

      <FormModal
        title={editing ? 'Editar gasto' : 'Registrar gasto'}
        fields={fields}
        initial={editing ? { ...editing } : { categoria: 'Otros', tipo: 'Indirecto' }}
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={guardar}
      />
    </div>
  );
}
