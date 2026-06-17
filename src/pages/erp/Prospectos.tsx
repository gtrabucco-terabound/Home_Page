import React from 'react';
import { Plus, Pencil, Trash2, UserPlus } from 'lucide-react';
import { PageHeader, DataTable, Row, Cell, Badge, AsyncState } from '../../components/admin/ui';
import { Button } from '../../components/Button';
import { FormModal, Field } from '../../components/admin/FormModal';
import { moneda } from '../../lib/mockData';
import { useApi } from '../../lib/useApi';
import { apiSend } from '../../lib/api';
import { estadoProspectoTone } from './tones';
import type { EstadoProspecto } from '../../lib/mockData';

interface ProspectoRow {
  id: string;
  empresa: string;
  contacto: string | null;
  email: string | null;
  estado: EstadoProspecto;
  valorEstimado: string | null;
  ultimoContacto: string | null;
}

const estados: EstadoProspecto[] = ['Lead', 'Consulta', 'Reunión', 'Propuesta'];

const fields: Field[] = [
  { name: 'empresa', label: 'Empresa', required: true },
  { name: 'contacto', label: 'Contacto' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'estado', label: 'Estado', type: 'select', options: estados.map((e) => ({ value: e, label: e })) },
  { name: 'valorEstimado', label: 'Valor estimado (USD)', type: 'number' },
  { name: 'ultimoContacto', label: 'Último contacto', type: 'date' },
];

export function Prospectos() {
  const { data, loading, error, reload } = useApi<ProspectoRow[]>('prospectos');
  const prospectos = data ?? [];
  const total = prospectos.reduce((s, p) => s + Number(p.valorEstimado ?? 0), 0);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ProspectoRow | null>(null);

  const guardar = async (v: Record<string, any>) => {
    if (editing) await apiSend(`prospectos?id=${editing.id}`, 'PUT', v);
    else await apiSend('prospectos', 'POST', v);
    reload();
  };
  const borrar = async (p: ProspectoRow) => {
    if (!confirm(`¿Dar de baja el prospecto "${p.empresa}"?`)) return;
    await apiSend(`prospectos?id=${p.id}`, 'DELETE');
    reload();
  };
  const convertir = async (p: ProspectoRow) => {
    if (!confirm(`¿Convertir "${p.empresa}" en cliente? El prospecto se archiva.`)) return;
    await apiSend('clientes', 'POST', { empresa: p.empresa, contacto: p.contacto, email: p.email });
    await apiSend(`prospectos?id=${p.id}`, 'DELETE');
    reload();
  };

  return (
    <div>
      <PageHeader
        title="Prospectos"
        subtitle={loading ? 'Cargando…' : `${prospectos.length} oportunidades · pipeline ${moneda(total)}`}
        action={<Button className="gap-2" onClick={() => { setEditing(null); setOpen(true); }}><Plus size={18} /> Nuevo prospecto</Button>}
      />
      <AsyncState loading={loading} error={error}>
        <DataTable columns={['Empresa', 'Contacto', 'Estado', 'Valor estimado', 'Último contacto', '']}>
          {prospectos.map((p) => (
            <Row key={p.id}>
              <Cell className="font-medium">{p.empresa}</Cell>
              <Cell>
                <div>{p.contacto}</div>
                <div className="text-xs text-[var(--muted)]">{p.email}</div>
              </Cell>
              <Cell><Badge tone={estadoProspectoTone(p.estado)}>{p.estado}</Badge></Cell>
              <Cell className="font-medium">{moneda(Number(p.valorEstimado ?? 0))}</Cell>
              <Cell className="text-[var(--muted)]">{p.ultimoContacto ?? '—'}</Cell>
              <Cell>
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={() => convertir(p)} aria-label="Convertir en cliente" title="Convertir en cliente" className="p-2 rounded-lg hover:bg-[var(--accent)]/10 text-[var(--muted)] hover:text-[var(--accent)]"><UserPlus size={15} /></button>
                  <button onClick={() => { setEditing(p); setOpen(true); }} aria-label="Editar" className="p-2 rounded-lg hover:bg-[var(--card)] text-[var(--muted)] hover:text-[var(--primary)]"><Pencil size={15} /></button>
                  <button onClick={() => borrar(p)} aria-label="Eliminar" className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--muted)] hover:text-red-500"><Trash2 size={15} /></button>
                </div>
              </Cell>
            </Row>
          ))}
        </DataTable>
      </AsyncState>

      <FormModal
        title={editing ? 'Editar prospecto' : 'Nuevo prospecto'}
        fields={fields}
        initial={editing ? { ...editing } : { estado: 'Lead' }}
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={guardar}
      />
    </div>
  );
}
