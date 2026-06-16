import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, schema, handleCrud, and, eq, isNull } from './_db';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return handleCrud(req, res, {
    table: schema.documentos,
    entidad: 'documentos',
    pick: (b) => ({ proyectoId: b.proyectoId, nombre: b.nombre, tipo: b.tipo, tamano: b.tamano, url: b.url }),
    list: async (tenantId) => getDb().select({
      id: schema.documentos.id, nombre: schema.documentos.nombre, tipo: schema.documentos.tipo,
      tamano: schema.documentos.tamano, url: schema.documentos.url,
      proyectoId: schema.documentos.proyectoId, proyecto: schema.proyectos.nombre,
    }).from(schema.documentos)
      .leftJoin(schema.proyectos, eq(schema.documentos.proyectoId, schema.proyectos.id))
      .where(and(eq(schema.documentos.tenantId, tenantId), isNull(schema.documentos.deletedAt))),
  });
}
