import React from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, StatCard, DataTable, Row, Cell, Badge, AsyncState } from '../../components/admin/ui';
import { Button } from '../../components/Button';
import { FormModal, Field } from '../../components/admin/FormModal';
import { moneda } from '../../lib/mockData';
import { useApi } from '../../lib/useApi';
import { apiSend } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import type { CategoriaGasto } from '../../lib/mockData';

interface GastoRow {
  id: string; concepto: string; categoria: CategoriaGasto; tipo: 'Directo' | 'Indirecto';
  monto: string | null; fecha: string | null; proyecto: string | null;
  proyectoId: string | null; personaId: string | null; persona: string | null;
}
interface ProyectoOpt { id: string; nombre: string }
interface UsuarioOpt { id: string; nombre: string }

const categorias: CategoriaGasto[] = ['Infraestructura', 'Licencias', 'Personal', 'Servicios', 'Otros'];

export function Gastos() {
  const { usuario } = useAuth();
  const esGerente = usuario?.rol === 'gerente';
  const { data, loading, error, reload } = useApi<GastoRow[]>('gastos');
  const { data: proyectos } = useApi<ProyectoOpt[]>('proyectos');
  const { data: usuarios } = useApi<UsuarioOpt[]>(esGerente ? 'usuarios' : 'proyectos'); // dev no consulta usuarios
  const gastos = data ?? [];
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<GastoRow | null>(null);
  const [filtro, setFiltro] = React.useState('todos'); // todos | empresa | mias | <personaId>

  // Filtro (solo gerente; el dev ya ve solo los suyos)
  const visibles = !esGerente ? gastos : gastos.filter((g) =>
    filtro === 'todos' ? true
      : filtro === 'empresa' ? !g.personaId
      : filtro === 'mias' ? g.personaId === usuario?.id
      : g.personaId === filtro);

  const total = visibles.reduce((s, g) => s + Number(g.monto ?? 0), 0);

  const fields: Field[] = [
    { name: 'concepto', label: 'Concepto', required: true, full: true },
    { name: 'categoria', label: 'Categoría', type: 'select', options: categorias.map((c) => ({ value: c, label: c })) },
    { name: 'tipo', label: 'Tipo', type: 'select', options: [{ value: 'Indirecto', label: 'Indirecto' }, { value: 'Directo', label: 'Directo' }] },
    { name: 'proyectoId', label: 'Proyecto (opcional)', type: 'select', options: (proyectos ?? []).map((p) => ({ value: p.id, label: p.nombre })) },
    ...(esGerente ? [{ name: 'atribucion', label: 'Atribución', type: 'select' as const, options: [{ value: 'empresa', label: 'Empresa (general)' }, ...(usuarios ?? []).map((u) => ({ value: u.id, label: u.nombre }))] }] : []),
    { name: 'monto', label: 'Monto (USD)', type: 'number', required: true },
    { name: 'fecha', label: 'Fecha', type: 'date' },
  ];

  const guardar = async (v: Record<string, any>) => {
    const payload: any = { ...v };
    if (esGerente) { payload.personaId = (!v.atribucion || v.atribucion === 'empresa') ? null : v.atribucion; delete payload.atribucion; }
    if (editing) await apiSend(`gastos?id=${editing.id}`, 'PUT', payload);
    else await apiSend('gastos', 'POST', payload);
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
        subtitle={esGerente ? 'Egresos de empresa y por integrante' : 'Mis gastos'}
        action={<Button className="gap-2" onClick={() => { setEditing(null); setOpen(true); }}><Plus size={18} /> Registrar gasto</Button>}
      />

      {esGerente && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-sm text-[var(--muted)]">Ver:</span>
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)}
            className="rounded-xl bg-[var(--card)] border border-[var(--border)] px-3 py-1.5 text-sm outline-none focus:border-[var(--primary)]">
            <option value="todos">Todos</option>
            <option value="empresa">De empresa</option>
            <option value="mias">Míos</option>
            {(usuarios ?? []).map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total (filtro)" value={loading ? '…' : moneda(total)} accent />
        <StatCard label="Movimientos" value={loading ? '…' : String(visibles.length)} />
      </div>
      <AsyncState loading={loading} error={error}>
        <DataTable columns={['Concepto', 'Categoría', 'Tipo', 'Atribuido a', 'Proyecto', 'Fecha', 'Monto', '']}>
          {visibles.map((g) => (
            <Row key={g.id}>
              <Cell className="font-medium">{g.concepto}</Cell>
              <Cell><Badge tone="info">{g.categoria}</Badge></Cell>
              <Cell className="text-[var(--muted)]">{g.tipo}</Cell>
              <Cell>{g.persona ? <span className="text-[var(--foreground)]">{g.persona}</span> : <span className="text-[var(--muted)]">Empresa</span>}</Cell>
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
        initial={editing ? { ...editing, atribucion: editing.personaId ?? 'empresa' } : { categoria: 'Otros', tipo: 'Indirecto', atribucion: 'empresa' }}
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={guardar}
      />
    </div>
  );
}
