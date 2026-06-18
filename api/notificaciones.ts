import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq, desc } from 'drizzle-orm';
import { getDb, schema, requireAuth, requireDb } from './_db.js';

// GET  /api/notificaciones        → mis notificaciones { items, unread }
// PUT  /api/notificaciones?id=..   → marca una leída
// PUT  /api/notificaciones?all=1   → marca todas leídas
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireDb(res)) return;
  const s = requireAuth(req, res);
  if (!s) return;
  const db = getDb();
  try {
    if (req.method === 'GET') {
      const items = await db.select().from(schema.notificaciones)
        .where(eq(schema.notificaciones.userId, s.sub))
        .orderBy(desc(schema.notificaciones.createdAt)).limit(30);
      const unread = items.filter((n) => !n.leida).length;
      return res.status(200).json({ items, unread });
    }
    if (req.method === 'PUT') {
      if (req.query.all) {
        await db.update(schema.notificaciones).set({ leida: true }).where(eq(schema.notificaciones.userId, s.sub));
        return res.status(200).json({ ok: true });
      }
      const id = String(req.query.id ?? '');
      if (!id) return res.status(400).json({ error: 'Falta id' });
      await db.update(schema.notificaciones).set({ leida: true })
        .where(and(eq(schema.notificaciones.id, id), eq(schema.notificaciones.userId, s.sub)));
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message });
  }
}
