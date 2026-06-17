import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, schema, handleCrud, and, eq, isNull } from './_db.js';

const NONE = '00000000-0000-0000-0000-000000000000';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return handleCrud(req, res, {
    table: schema.tickets,
    entidad: 'tickets',
    roles: ['gerente', 'desarrollador', 'cliente'],
    writeRoles: ['gerente', 'desarrollador', 'cliente'],
    pick: (b) => ({ proyectoId: b.proyectoId, asunto: b.asunto, estado: b.estado, prioridad: b.prioridad, fecha: b.fecha }),
    list: async (s) => {
      const conds = [eq(schema.tickets.tenantId, s.tenantId), isNull(schema.tickets.deletedAt)];
      if (s.rol === 'cliente') conds.push(eq(schema.proyectos.clienteId, s.empresaId ?? NONE));
      return getDb().select({
        id: schema.tickets.id, asunto: schema.tickets.asunto, estado: schema.tickets.estado,
        prioridad: schema.tickets.prioridad, fecha: schema.tickets.fecha,
        proyectoId: schema.tickets.proyectoId, proyecto: schema.proyectos.nombre,
      }).from(schema.tickets)
        .leftJoin(schema.proyectos, eq(schema.tickets.proyectoId, schema.proyectos.id))
        .where(and(...conds));
    },
  });
}
