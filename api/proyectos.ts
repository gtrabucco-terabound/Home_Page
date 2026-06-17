import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, schema, handleCrud, and, eq, isNull } from './_db.js';

const NONE = '00000000-0000-0000-0000-000000000000';

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
      return getDb().select({
        id: schema.proyectos.id, nombre: schema.proyectos.nombre, estado: schema.proyectos.estado,
        avance: schema.proyectos.avance, responsable: schema.proyectos.responsable,
        inicio: schema.proyectos.inicio, fin: schema.proyectos.fin,
        clienteId: schema.proyectos.clienteId, cliente: schema.clientes.empresa,
      }).from(schema.proyectos)
        .leftJoin(schema.clientes, eq(schema.proyectos.clienteId, schema.clientes.id))
        .where(and(...conds));
    },
  });
}
