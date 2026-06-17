import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { getDb, schema, resolveTenantId, requireDb } from './_db.js';

// GET  /api/site-config       → config de contacto del tenant
// PUT  /api/site-config       → actualiza (upsert) la config
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireDb(res)) return;
  try {
    const tenantId = await resolveTenantId();
    const db = getDb();

    if (req.method === 'GET') {
      const [cfg] = await db.select().from(schema.siteConfig)
        .where(eq(schema.siteConfig.tenantId, tenantId)).limit(1);
      return res.status(200).json(cfg ?? null);
    }

    if (req.method === 'PUT') {
      const b = (req.body ?? {}) as Partial<typeof schema.siteConfig.$inferInsert>;
      const campos = {
        email: b.email, telefono: b.telefono, direccion: b.direccion,
        ciudad: b.ciudad, horario: b.horario, linkedin: b.linkedin,
      };
      const [existing] = await db.select().from(schema.siteConfig)
        .where(eq(schema.siteConfig.tenantId, tenantId)).limit(1);
      let saved;
      if (existing) {
        [saved] = await db.update(schema.siteConfig).set(campos)
          .where(eq(schema.siteConfig.tenantId, tenantId)).returning();
      } else {
        [saved] = await db.insert(schema.siteConfig)
          .values({ tenantId, email: b.email ?? 'info@terabound.com', ...campos }).returning();
      }
      return res.status(200).json(saved);
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message });
  }
}
