import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, schema, handleCrud, and, eq, isNull } from './_db.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return handleCrud(req, res, {
    table: schema.clientes,
    entidad: 'clientes',
    roles: ['gerente'],
    pick: (b) => ({ empresa: b.empresa, contacto: b.contacto, email: b.email, industria: b.industria, desde: b.desde }),
    list: async (s) => {
      const db = getDb();
      const cli = await db.select().from(schema.clientes)
        .where(and(eq(schema.clientes.tenantId, s.tenantId), isNull(schema.clientes.deletedAt)));
      const proy = await db.select({ clienteId: schema.proyectos.clienteId }).from(schema.proyectos)
        .where(and(eq(schema.proyectos.tenantId, s.tenantId), isNull(schema.proyectos.deletedAt)));
      const counts: Record<string, number> = {};
      for (const p of proy) counts[p.clienteId] = (counts[p.clienteId] ?? 0) + 1;
      return cli.map((c) => ({ ...c, proyectosActivos: counts[c.id] ?? 0 }));
    },
  });
}
