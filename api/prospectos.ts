import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, schema, handleCrud, and, eq, isNull } from './_db.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return handleCrud(req, res, {
    table: schema.prospectos,
    entidad: 'prospectos',
    roles: ['gerente'],
    pick: (b) => ({
      empresa: b.empresa, contacto: b.contacto, email: b.email, estado: b.estado,
      valorEstimado: b.valorEstimado != null ? String(b.valorEstimado) : '0', ultimoContacto: b.ultimoContacto,
    }),
    list: async (s) => getDb().select().from(schema.prospectos)
      .where(and(eq(schema.prospectos.tenantId, s.tenantId), isNull(schema.prospectos.deletedAt))),
  });
}
