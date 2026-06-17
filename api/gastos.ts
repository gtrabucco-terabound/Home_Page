import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, schema, handleCrud, and, eq, isNull } from './_db.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return handleCrud(req, res, {
    table: schema.gastos,
    entidad: 'gastos',
    pick: (b) => ({
      proyectoId: b.proyectoId || null, tipo: b.tipo, concepto: b.concepto,
      categoria: b.categoria, monto: b.monto != null ? String(b.monto) : '0', fecha: b.fecha,
    }),
    list: async (tenantId) => getDb().select({
      id: schema.gastos.id, concepto: schema.gastos.concepto, categoria: schema.gastos.categoria,
      tipo: schema.gastos.tipo, monto: schema.gastos.monto, fecha: schema.gastos.fecha,
      proyectoId: schema.gastos.proyectoId, proyecto: schema.proyectos.nombre,
    }).from(schema.gastos)
      .leftJoin(schema.proyectos, eq(schema.gastos.proyectoId, schema.proyectos.id))
      .where(and(eq(schema.gastos.tenantId, tenantId), isNull(schema.gastos.deletedAt))),
  });
}
