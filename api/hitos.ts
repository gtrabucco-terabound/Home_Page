import type { VercelRequest, VercelResponse } from '@vercel/node';
import { asc } from 'drizzle-orm';
import { getDb, schema, handleCrud, and, eq, isNull } from './_db.js';

const NONE = '00000000-0000-0000-0000-000000000000';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return handleCrud(req, res, {
    table: schema.hitos,
    entidad: 'hitos',
    roles: ['gerente', 'desarrollador', 'cliente'],
    writeRoles: ['gerente', 'desarrollador'],
    pick: (b) => ({
      proyectoId: b.proyectoId, titulo: b.titulo, estado: b.estado, fecha: b.fecha,
      orden: b.orden != null ? Number(b.orden) : 0,
      peso: b.peso != null ? Number(b.peso) : 1,
    }),
    list: async (s) => {
      const conds = [eq(schema.hitos.tenantId, s.tenantId), isNull(schema.hitos.deletedAt)];
      if (s.rol === 'cliente') conds.push(eq(schema.proyectos.clienteId, s.empresaId ?? NONE));
      return getDb().select({
        id: schema.hitos.id, titulo: schema.hitos.titulo, estado: schema.hitos.estado,
        fecha: schema.hitos.fecha, orden: schema.hitos.orden, peso: schema.hitos.peso,
        proyectoId: schema.hitos.proyectoId, proyecto: schema.proyectos.nombre,
      }).from(schema.hitos)
        .leftJoin(schema.proyectos, eq(schema.hitos.proyectoId, schema.proyectos.id))
        .where(and(...conds))
        .orderBy(asc(schema.hitos.orden), asc(schema.hitos.fecha));
    },
  });
}
