import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq, isNull } from 'drizzle-orm';
import { getDb, schema, requireAuth, requireDb } from './_db.js';
import { hashPassword } from './_lib/auth.js';

const ROLES = ['gerente', 'desarrollador', 'cliente'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireDb(res)) return;
  const s = requireAuth(req, res);
  if (!s) return;
  const db = getDb();

  try {
    // Cambio de contraseña propia: cualquier usuario autenticado.
    if (req.method === 'PUT' && req.query.me) {
      const b = (req.body ?? {}) as any;
      if (!b.password || String(b.password).length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      await db.update(schema.profiles).set({ passwordHash: hashPassword(b.password), updatedAt: new Date() })
        .where(eq(schema.profiles.id, s.sub));
      return res.status(200).json({ ok: true });
    }

    // El resto: solo gerente.
    if (s.rol !== 'gerente') return res.status(403).json({ error: 'Sin permiso' });

    if (req.method === 'GET') {
      const rows = await db.select({
        id: schema.profiles.id, nombre: schema.profiles.nombre, email: schema.profiles.email,
        rol: schema.profiles.rol, empresaId: schema.profiles.empresaId, activo: schema.profiles.activo,
        empresa: schema.clientes.empresa,
      }).from(schema.profiles)
        .leftJoin(schema.clientes, eq(schema.profiles.empresaId, schema.clientes.id))
        .where(and(eq(schema.profiles.tenantId, s.tenantId), isNull(schema.profiles.deletedAt)));
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const b = (req.body ?? {}) as any;
      const email = String(b.email ?? '').trim().toLowerCase();
      if (!b.nombre || !email || !b.password) return res.status(400).json({ error: 'Nombre, email y contraseña requeridos' });
      if (!ROLES.includes(b.rol)) return res.status(400).json({ error: 'Rol inválido' });
      const [dup] = await db.select({ id: schema.profiles.id }).from(schema.profiles).where(eq(schema.profiles.email, email)).limit(1);
      if (dup) return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
      const ins = (await db.insert(schema.profiles).values({
        tenantId: s.tenantId, nombre: b.nombre, email, passwordHash: hashPassword(b.password),
        rol: b.rol, empresaId: b.rol === 'cliente' ? (b.empresaId || null) : null, activo: true,
      }).returning()) as any[];
      const u = ins[0];
      return res.status(201).json({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol });
    }

    if (req.method === 'PUT') {
      const id = String(req.query.id ?? '');
      if (!id) return res.status(400).json({ error: 'Falta id' });
      const b = (req.body ?? {}) as any;
      const set: any = { updatedAt: new Date() };
      if (b.nombre != null) set.nombre = b.nombre;
      if (b.rol != null) { if (!ROLES.includes(b.rol)) return res.status(400).json({ error: 'Rol inválido' }); set.rol = b.rol; set.empresaId = b.rol === 'cliente' ? (b.empresaId || null) : null; }
      if (b.activo != null) set.activo = b.activo === true || b.activo === 'true' || b.activo === 'Sí';
      if (b.password) set.passwordHash = hashPassword(b.password);
      await db.update(schema.profiles).set(set).where(and(eq(schema.profiles.id, id), eq(schema.profiles.tenantId, s.tenantId)));
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const id = String(req.query.id ?? '');
      if (!id) return res.status(400).json({ error: 'Falta id' });
      if (id === s.sub) return res.status(400).json({ error: 'No podés eliminar tu propia cuenta' });
      await db.update(schema.profiles).set({ deletedAt: new Date(), activo: false })
        .where(and(eq(schema.profiles.id, id), eq(schema.profiles.tenantId, s.tenantId)));
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message });
  }
}
