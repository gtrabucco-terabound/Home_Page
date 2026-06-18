import React from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, DataTable, Row, Cell, Badge, AsyncState } from '../../components/admin/ui';
import { Button } from '../../components/Button';
import { FormModal, Field } from '../../components/admin/FormModal';
import { useApi } from '../../lib/useApi';
import { apiSend } from '../../lib/api';

interface UsuarioRow {
  id: string; nombre: string; email: string; rol: string;
  empresaId: string | null; empresa: string | null; activo: boolean;
}
interface ClienteOpt { id: string; empresa: string }

const rolTone = (r: string): 'success' | 'info' | 'neutral' =>
  r === 'gerente' ? 'success' : r === 'desarrollador' ? 'info' : 'neutral';

export function Usuarios() {
  const { data, loading, error, reload } = useApi<UsuarioRow[]>('usuarios');
  const { data: clientes } = useApi<ClienteOpt[]>('clientes');
  const usuarios = data ?? [];
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<UsuarioRow | null>(null);

  const roles = [
    { value: 'gerente', label: 'Gerente' },
    { value: 'desarrollador', label: 'Desarrollador' },
    { value: 'cliente', label: 'Cliente' },
  ];
  const empresas = (clientes ?? []).map((c) => ({ value: c.id, label: c.empresa }));

  const fields: Field[] = editing
    ? [
        { name: 'nombre', label: 'Nombre', required: true },
        { name: 'rol', label: 'Rol', type: 'select', options: roles },
        { name: 'empresaId', label: 'Empresa (solo rol cliente)', type: 'select', options: empresas },
        { name: 'activo', label: 'Activo', type: 'select', options: [{ value: 'Sí', label: 'Sí' }, { value: 'No', label: 'No' }] },
        { name: 'password', label: 'Nueva contraseña (vacío = sin cambio)', type: 'password' },
      ]
    : [
        { name: 'nombre', label: 'Nombre', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'rol', label: 'Rol', type: 'select', options: roles },
        { name: 'empresaId', label: 'Empresa (solo rol cliente)', type: 'select', options: empresas },
        { name: 'password', label: 'Contraseña inicial', type: 'password', required: true },
      ];

  const guardar = async (v: Record<string, any>) => {
    if (editing) await apiSend(`usuarios?id=${editing.id}`, 'PUT', v);
    else await apiSend('usuarios', 'POST', v);
    reload();
  };
  const borrar = async (u: UsuarioRow) => {
    if (!confirm(`¿Dar de baja al usuario ${u.email}?`)) return;
    await apiSend(`usuarios?id=${u.id}`, 'DELETE');
    reload();
  };

  return (
    <div>
      <PageHeader
        title="Usuarios"
        subtitle={loading ? 'Cargando…' : `${usuarios.length} cuentas`}
        action={<Button className="gap-2" onClick={() => { setEditing(null); setOpen(true); }}><Plus size={18} /> Nuevo usuario</Button>}
      />
      <AsyncState loading={loading} error={error}>
        <DataTable columns={['Nombre', 'Email', 'Rol', 'Empresa', 'Estado', '']}>
          {usuarios.map((u) => (
            <Row key={u.id}>
              <Cell className="font-medium">{u.nombre}</Cell>
              <Cell className="text-[var(--muted)]">{u.email}</Cell>
              <Cell><Badge tone={rolTone(u.rol)}>{u.rol}</Badge></Cell>
              <Cell className="text-[var(--muted)]">{u.empresa ?? '—'}</Cell>
              <Cell>{u.activo ? <Badge tone="success">Activo</Badge> : <Badge tone="danger">Inactivo</Badge>}</Cell>
              <Cell>
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={() => { setEditing(u); setOpen(true); }} aria-label="Editar" className="p-2 rounded-lg hover:bg-[var(--card)] text-[var(--muted)] hover:text-[var(--primary)]"><Pencil size={15} /></button>
                  <button onClick={() => borrar(u)} aria-label="Eliminar" className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--muted)] hover:text-red-500"><Trash2 size={15} /></button>
                </div>
              </Cell>
            </Row>
          ))}
        </DataTable>
      </AsyncState>

      <FormModal
        title={editing ? 'Editar usuario' : 'Nuevo usuario'}
        fields={fields}
        initial={editing ? { nombre: editing.nombre, rol: editing.rol, empresaId: editing.empresaId ?? '', activo: editing.activo ? 'Sí' : 'No' } : { rol: 'desarrollador' }}
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={guardar}
      />
    </div>
  );
}
