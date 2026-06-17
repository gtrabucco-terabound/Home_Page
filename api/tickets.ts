import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, schema, handleCrud, and, eq, isNull } from './_db.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return handleCrud(req, res, {
    table: schema.tickets,
    entidad: 'tickets',
    pick: (b) => ({ proyectoId: b.proyectoId, asunto: b.asunto, estado: b.estado, prioridad: b.prioridad, fecha: b.fecha }),
    list: async (tenantId) => getDb().select({
      id: schema.tickets.id, asunto: schema.tickets.asunto, estado: schema.tickets.estado,
      prioridad: schema.tickets.prioridad, fecha: schema.tickets.fecha,
      proyectoId: schema.tickets.proyectoId, proyecto: schema.proyectos.nombre,
    }).from(schema.tickets)
      .leftJoin(schema.proyectos, eq(schema.tickets.proyectoId, schema.proyectos.id))
      .where(and(eq(schema.tickets.tenantId, tenantId), isNull(schema.tickets.deletedAt))),
  });
}
