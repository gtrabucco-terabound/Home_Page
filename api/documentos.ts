import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, schema, handleCrud, and, eq, isNull } from './_db.js';

const NONE = '00000000-0000-0000-0000-000000000000';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return handleCrud(req, res, {
    table: schema.documentos,
    entidad: 'documentos',
    roles: ['gerente', 'desarrollador', 'cliente'],
    writeRoles: ['gerente'],
    pick: (b) => ({ proyectoId: b.proyectoId, nombre: b.nombre, tipo: b.tipo, tamano: b.tamano, url: b.url }),
    list: async (s) => {
      const conds = [eq(schema.documentos.tenantId, s.tenantId), isNull(schema.documentos.deletedAt)];
      if (s.rol === 'cliente') conds.push(eq(schema.proyectos.clienteId, s.empresaId ?? NONE));
      return getDb().select({
        id: schema.documentos.id, nombre: schema.documentos.nombre, tipo: schema.documentos.tipo,
        tamano: schema.documentos.tamano, url: schema.documentos.url,
        proyectoId: schema.documentos.proyectoId, proyecto: schema.proyectos.nombre,
      }).from(schema.documentos)
        .leftJoin(schema.proyectos, eq(schema.documentos.proyectoId, schema.proyectos.id))
        .where(and(...conds));
    },
  });
}
