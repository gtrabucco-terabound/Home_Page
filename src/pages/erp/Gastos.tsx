import { Plus } from 'lucide-react';
import { PageHeader, StatCard, DataTable, Row, Cell, Badge, AsyncState } from '../../components/admin/ui';
import { Button } from '../../components/Button';
import { moneda } from '../../lib/mockData';
import { useApi } from '../../lib/useApi';
import type { CategoriaGasto } from '../../lib/mockData';

interface GastoRow {
  id: string;
  concepto: string;
  categoria: CategoriaGasto;
  tipo: 'Directo' | 'Indirecto';
  monto: string | null;
  fecha: string | null;
  proyecto: string | null;
}

export function Gastos() {
  const { data, loading, error } = useApi<GastoRow[]>('gastos');
  const gastos = data ?? [];
  const total = gastos.reduce((s, g) => s + Number(g.monto ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="Gastos"
        subtitle="Egresos registrados"
        action={<Button className="gap-2"><Plus size={18} /> Registrar gasto</Button>}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total registrado" value={loading ? '…' : moneda(total)} accent />
        <StatCard label="Movimientos" value={loading ? '…' : String(gastos.length)} />
      </div>
      <AsyncState loading={loading} error={error}>
        <DataTable columns={['Concepto', 'Categoría', 'Tipo', 'Proyecto', 'Fecha', 'Monto']}>
          {gastos.map((g) => (
            <Row key={g.id}>
              <Cell className="font-medium">{g.concepto}</Cell>
              <Cell><Badge tone="info">{g.categoria}</Badge></Cell>
              <Cell className="text-[var(--muted)]">{g.tipo}</Cell>
              <Cell className="text-[var(--muted)]">{g.proyecto ?? '—'}</Cell>
              <Cell className="text-[var(--muted)]">{g.fecha ?? '—'}</Cell>
              <Cell className="font-medium">{moneda(Number(g.monto ?? 0))}</Cell>
            </Row>
          ))}
        </DataTable>
      </AsyncState>
    </div>
  );
}
