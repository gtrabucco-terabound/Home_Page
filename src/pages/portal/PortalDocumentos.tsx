import { FileText, Download } from 'lucide-react';
import { PageHeader, DataTable, Row, Cell, Badge, AsyncState } from '../../components/admin/ui';
import { useAuth } from '../../lib/AuthContext';
import { useApi } from '../../lib/useApi';

interface ProyectoRow { nombre: string; cliente: string | null }
interface DocRow { id: string; nombre: string; tipo: string | null; tamano: string | null; proyecto: string | null }

export function PortalDocumentos() {
  const { usuario } = useAuth();
  const empresa = usuario?.empresa ?? '';
  const { data: proy } = useApi<ProyectoRow[]>('proyectos');
  const { data: docs, loading, error } = useApi<DocRow[]>('documentos');

  const nombres = (proy ?? []).filter((p) => p.cliente === empresa).map((p) => p.nombre);
  const mios = (docs ?? []).filter((d) => d.proyecto && nombres.includes(d.proyecto));

  return (
    <div>
      <PageHeader title="Documentos" subtitle="Propuestas, actas y reportes de tus proyectos" />
      <AsyncState loading={loading} error={error}>
        <DataTable columns={['Documento', 'Tipo', 'Proyecto', 'Tamaño', '']}>
          {mios.map((d) => (
            <Row key={d.id}>
              <Cell className="font-medium">
                <span className="flex items-center gap-2"><FileText size={16} className="text-[var(--primary)]" /> {d.nombre}</span>
              </Cell>
              <Cell>{d.tipo ? <Badge tone="info">{d.tipo}</Badge> : '—'}</Cell>
              <Cell className="text-[var(--muted)] max-w-[220px] whitespace-normal">{d.proyecto}</Cell>
              <Cell className="text-[var(--muted)]">{d.tamano ?? '—'}</Cell>
              <Cell>
                <button className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:underline">
                  <Download size={15} /> Descargar
                </button>
              </Cell>
            </Row>
          ))}
        </DataTable>
      </AsyncState>
    </div>
  );
}
