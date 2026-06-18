import type { VercelRequest, VercelResponse } from '@vercel/node';
import { desc, eq, and, isNull } from 'drizzle-orm';
import { getDb, schema, requireAuth, requireDb } from './_db.js';

// Notifica a todos los gerentes del tenant.
async function notifyGerentes(tenantId: string, texto: string, exceptId?: string) {
  const db = getDb();
  const gers = await db.select({ id: schema.profiles.id }).from(schema.profiles)
    .where(and(eq(schema.profiles.tenantId, tenantId), eq(schema.profiles.rol, 'gerente'), isNull(schema.profiles.deletedAt)));
  const rows = gers.filter((g) => g.id !== exceptId).map((g) => ({ tenantId, userId: g.id, texto, link: '/app/solicitudes' }));
  if (rows.length) await db.insert(schema.notificaciones).values(rows);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireDb(res)) return;
  const s = requireAuth(req, res);
  if (!s) return;
  if (s.rol === 'cliente') return res.status(403).json({ error: 'Sin permiso' });
  const db = getDb();
  try {
    if (req.method === 'GET') {
      const conds = [eq(schema.solicitudes.tenantId, s.tenantId), isNull(schema.solicitudes.deletedAt)];
      if (s.rol === 'desarrollador') conds.push(eq(schema.solicitudes.autorId, s.sub));
      const rows = await db.select({
        id: schema.solicitudes.id, tipo: schema.solicitudes.tipo, titulo: schema.solicitudes.titulo,
        detalle: schema.solicitudes.detalle, estado: schema.solicitudes.estado, respuesta: schema.solicitudes.respuesta,
        autorNombre: schema.solicitudes.autorNombre, createdAt: schema.solicitudes.createdAt,
        proyecto: schema.proyectos.nombre,
      }).from(schema.solicitudes)
        .leftJoin(schema.proyectos, eq(schema.solicitudes.proyectoId, schema.proyectos.id))
        .where(and(...conds)).orderBy(desc(schema.solicitudes.createdAt));
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const b = (req.body ?? {}) as any;
      const [prof] = await db.select({ nombre: schema.profiles.nombre }).from(schema.profiles)
        .where(eq(schema.profiles.id, s.sub)).limit(1);
      const ins = (await db.insert(schema.solicitudes).values({
        tenantId: s.tenantId, proyectoId: b.proyectoId || null, autorId: s.sub,
        autorNombre: prof?.nombre ?? s.email, tipo: b.tipo ?? 'Consulta',
        titulo: b.titulo, detalle: b.detalle, estado: 'Abierta',
      }).returning()) as any[];
      await notifyGerentes(s.tenantId, `Nueva ${(b.tipo ?? 'consulta').toLowerCase()}: ${b.titulo}`, s.sub);
      return res.status(201).json(ins[0]);
    }

    if (req.method === 'PUT') {
      if (s.rol !== 'gerente') return res.status(403).json({ error: 'Solo gerente puede responder' });
      const id = String(req.query.id ?? '');
      if (!id) return res.status(400).json({ error: 'Falta id' });
      const b = (req.body ?? {}) as any;
      const upd = (await db.update(schema.solicitudes)
        .set({ estado: b.estado, respuesta: b.respuesta, updatedAt: new Date() })
        .where(and(eq(schema.solicitudes.id, id), eq(schema.solicitudes.tenantId, s.tenantId))).returning()) as any[];
      const row = upd[0];
      if (row?.autorId) {
        await db.insert(schema.notificaciones).values({
          tenantId: s.tenantId, userId: row.autorId,
          texto: `Tu solicitud "${row.titulo}" fue ${String(b.estado).toLowerCase()}`, link: '/app/solicitudes',
        });
      }
      return res.status(200).json(row);
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message });
  }
}
