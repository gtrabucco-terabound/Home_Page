import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq, isNull } from 'drizzle-orm';
import { getDb, schema } from '../_lib/client.js';
import { getSession } from '../_lib/auth.js';

// GET /api/auth/me  (Bearer) → { user }
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'DB no configurada' });
  const sess = getSession(req);
  if (!sess) return res.status(401).json({ error: 'No autenticado' });
  try {
    const db = getDb();
    const [p] = await db.select().from(schema.profiles)
      .where(and(eq(schema.profiles.id, sess.sub), isNull(schema.profiles.deletedAt))).limit(1);
    if (!p || !p.activo) return res.status(401).json({ error: 'Sesión inválida' });

    let empresa: string | null = null;
    if (p.empresaId) {
      const [c] = await db.select({ empresa: schema.clientes.empresa }).from(schema.clientes)
        .where(eq(schema.clientes.id, p.empresaId)).limit(1);
      empresa = c?.empresa ?? null;
    }
    return res.status(200).json({ user: { nombre: p.nombre, email: p.email, rol: p.rol, empresa } });
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message });
  }
}
