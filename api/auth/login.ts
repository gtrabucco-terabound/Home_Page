import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq, isNull } from 'drizzle-orm';
import { getDb, schema } from '../_lib/client.js';
import { verifyPassword, signToken } from '../_lib/auth.js';

// POST /api/auth/login { email, password } → { token, user }
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'DB no configurada' });
  try {
    const { email, password } = (req.body ?? {}) as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });

    const db = getDb();
    const [p] = await db.select().from(schema.profiles)
      .where(and(eq(schema.profiles.email, String(email).trim().toLowerCase()), isNull(schema.profiles.deletedAt)))
      .limit(1);

    if (!p || !p.activo || !verifyPassword(password, p.passwordHash)) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    let empresa: string | null = null;
    if (p.empresaId) {
      const [c] = await db.select({ empresa: schema.clientes.empresa }).from(schema.clientes)
        .where(eq(schema.clientes.id, p.empresaId)).limit(1);
      empresa = c?.empresa ?? null;
    }

    const token = signToken({ sub: p.id, email: p.email, rol: p.rol, tenantId: p.tenantId, empresaId: p.empresaId });
    return res.status(200).json({ token, user: { id: p.id, nombre: p.nombre, email: p.email, rol: p.rol, empresa } });
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message });
  }
}
