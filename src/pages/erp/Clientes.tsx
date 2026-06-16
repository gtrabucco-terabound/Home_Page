import React from 'react';
import { Plus, Mail, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, DataTable, Row, Cell, Badge, AsyncState } from '../../components/admin/ui';
import { Button } from '../../components/Button';
import { FormModal, Field } from '../../components/admin/FormModal';
import { useApi } from '../../lib/useApi';
import { apiSend } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';

interface ClienteRow {
  id: string;
  empresa: string;
  contacto: string | null;
  email: string | null;
  industria: string | null;
  desde: string | null;
  proyectosActivos: number;
}

const fields: Field[] = [
  { name: 'empresa', label: 'Empresa', required: true },
  { name: 'contacto', label: 'Contacto' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'industria', label: 'Industria' },
  { name: 'desde', label: 'Cliente desde', placeholder: 'Ej. 2024' },
];

export function Clientes() {
  const { usuario } = useAuth();
  const { data, loading, error, reload } = useApi<ClienteRow[]>('clientes');
  const clientes = data ?? [];
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ClienteRow | null>(null);

  const nuevo = () => { setEditing(null); setOpen(true); };
  const editar = (c: ClienteRow) => { setEditing(c); setOpen(true); };

  const guardar = async (v: Record<string, any>) => {
    if (editing) await apiSend(`clientes?id=${editing.id}`, 'PUT', v);
    else await apiSend('clientes', 'POST', v);
    reload();
  };

  const borrar = async (c: ClienteRow) => {
    if (!confirm(`¿Dar de baja a ${c.empresa}?`)) return;
    await apiSend(`clientes?id=${c.id}`, 'DELETE');
    reload();
  };

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle={loading ? 'Cargando…' : `${clientes.length} cuentas activas`}
        action={<Button className="gap-2" onClick={nuevo}><Plus size={18} /> Nuevo cliente</Button>}
      />
      <AsyncState loading={loading} error={error}>
        <DataTable columns={['Empresa', 'Contacto', 'Industria', 'Desde', 'Proyectos', '']}>
          {clientes.map((c) => (
            <Row key={c.id}>
              <Cell className="font-medium">{c.empresa}</Cell>
              <Cell>
                <div>{c.contacto}</div>
                {c.email && (
                  <a href={`mailto:${c.email}`} className="text-xs text-[var(--primary)] hover:underline inline-flex items-center gap-1">
                    <Mail size={11} /> {c.email}
                  </a>
                )}
              </Cell>
              <Cell>{c.industria ? <Badge tone="info">{c.industria}</Badge> : '—'}</Cell>
              <Cell className="text-[var(--muted)]">{c.desde ?? '—'}</Cell>
              <Cell className="font-medium">{c.proyectosActivos}</Cell>
              <Cell>
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={() => editar(c)} aria-label="Editar" className="p-2 rounded-lg hover:bg-[var(--card)] text-[var(--muted)] hover:text-[var(--primary)]"><Pencil size={15} /></button>
                  {usuario?.rol === 'gerente' && (
                    <button onClick={() => borrar(c)} aria-label="Eliminar" className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--muted)] hover:text-red-500"><Trash2 size={15} /></button>
                  )}
                </div>
              </Cell>
            </Row>
          ))}
        </DataTable>
      </AsyncState>

      <FormModal
        title={editing ? 'Editar cliente' : 'Nuevo cliente'}
        fields={fields}
        initial={editing ?? {}}
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={guardar}
      />
    </div>
  );
}
