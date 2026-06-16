import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, schema, handleCrud, and, eq, isNull } from './_db';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return handleCrud(req, res, {
    table: schema.proyectos,
    entidad: 'proyectos',
    pick: (b) => ({
      clienteId: b.clienteId, nombre: b.nombre, estado: b.estado,
      avance: b.avance != null ? Number(b.avance) : 0, responsable: b.responsable, inicio: b.inicio, fin: b.fin,
    }),
    list: async (tenantId) => getDb().select({
      id: schema.proyectos.id, nombre: schema.proyectos.nombre, estado: schema.proyectos.estado,
      avance: schema.proyectos.avance, responsable: schema.proyectos.responsable,
      inicio: schema.proyectos.inicio, fin: schema.proyectos.fin,
      clienteId: schema.proyectos.clienteId, cliente: schema.clientes.empresa,
    }).from(schema.proyectos)
      .leftJoin(schema.clientes, eq(schema.proyectos.clienteId, schema.clientes.id))
      .where(and(eq(schema.proyectos.tenantId, tenantId), isNull(schema.proyectos.deletedAt))),
  });
}
