import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, schema, handleCrud, and, eq, isNull } from './_db.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return handleCrud(req, res, {
    table: schema.hitos,
    entidad: 'hitos',
    pick: (b) => ({ proyectoId: b.proyectoId, titulo: b.titulo, estado: b.estado, fecha: b.fecha }),
    list: async (tenantId) => getDb().select({
      id: schema.hitos.id, titulo: schema.hitos.titulo, estado: schema.hitos.estado,
      fecha: schema.hitos.fecha, proyectoId: schema.hitos.proyectoId, proyecto: schema.proyectos.nombre,
    }).from(schema.hitos)
      .leftJoin(schema.proyectos, eq(schema.hitos.proyectoId, schema.proyectos.id))
      .where(and(eq(schema.hitos.tenantId, tenantId), isNull(schema.hitos.deletedAt))),
  });
}
