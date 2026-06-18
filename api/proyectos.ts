import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, schema, handleCrud, and, eq, isNull } from './_db.js';

const NONE = '00000000-0000-0000-0000-000000000000';

// Avance ponderado por hitos: % = peso de hitos completados / peso total.
async function avancePorProyecto(tenantId: string): Promise<Record<string, number>> {
  const hs = await getDb().select({
    proyectoId: schema.hitos.proyectoId, peso: schema.hitos.peso, estado: schema.hitos.estado,
  }).from(schema.hitos).where(and(eq(schema.hitos.tenantId, tenantId), isNull(schema.hitos.deletedAt)));
  const agg: Record<string, { tot: number; done: number }> = {};
  for (const h of hs) {
    const a = agg[h.proyectoId] ?? (agg[h.proyectoId] = { tot: 0, done: 0 });
    a.tot += h.peso;
    if (h.estado === 'Completado') a.done += h.peso;
  }
  const out: Record<string, number> = {};
  for (const id in agg) if (agg[id].tot > 0) out[id] = Math.round((agg[id].done / agg[id].tot) * 100);
  return out;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  return handleCrud(req, res, {
    table: schema.proyectos,
    entidad: 'proyectos',
    roles: ['gerente', 'desarrollador', 'cliente'],
    writeRoles: ['gerente'],
    pick: (b) => ({
      clienteId: b.clienteId, nombre: b.nombre, estado: b.estado,
      avance: b.avance != null ? Number(b.avance) : 0, responsable: b.responsable, inicio: b.inicio, fin: b.fin,
    }),
    list: async (s) => {
      const conds = [eq(schema.proyectos.tenantId, s.tenantId), isNull(schema.proyectos.deletedAt)];
      if (s.rol === 'cliente') conds.push(eq(schema.proyectos.clienteId, s.empresaId ?? NONE));
      const rows = await getDb().select({
        id: schema.proyectos.id, nombre: schema.proyectos.nombre, estado: schema.proyectos.estado,
        avance: schema.proyectos.avance, responsable: schema.proyectos.responsable,
        inicio: schema.proyectos.inicio, fin: schema.proyectos.fin,
        clienteId: schema.proyectos.clienteId, cliente: schema.clientes.empresa,
      }).from(schema.proyectos)
        .leftJoin(schema.clientes, eq(schema.proyectos.clienteId, schema.clientes.id))
        .where(and(...conds));
      // Si el proyecto tiene hitos con peso, el avance se calcula; si no, queda el manual.
      const calc = await avancePorProyecto(s.tenantId);
      return rows.map((r) => (r.id in calc ? { ...r, avance: calc[r.id] } : r));
    },
  });
}
