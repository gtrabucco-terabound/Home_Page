// Helpers compartidos por las funciones /api (los archivos con guión bajo no son rutas).
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq, isNull } from 'drizzle-orm';
import { getDb, schema } from './_lib/client.js';

export { getDb, schema };

let cachedTenant: string | null = null;

// Resuelve el tenant base ('terabound'). Cuando entre Neon Auth, vendrá de la sesión.
export async function resolveTenantId(): Promise<string> {
  if (cachedTenant) return cachedTenant;
  const db = getDb();
  const [t] = await db.select().from(schema.tenants).where(eq(schema.tenants.slug, 'terabound')).limit(1);
  if (!t) throw new Error('Tenant base no encontrado (¿corriste el seed?).');
  cachedTenant = t.id;
  return cachedTenant;
}

export function requireDb(res: VercelResponse): boolean {
  if (!process.env.DATABASE_URL) {
    res.status(503).json({ error: 'DATABASE_URL no configurada (cargar en Vercel env / .env.local).' });
    return false;
  }
  return true;
}

async function writeAudit(tenantId: string, accion: 'INSERT' | 'UPDATE' | 'DELETE', entidad: string, entidadId: string | null, datos: unknown) {
  try {
    await getDb().insert(schema.auditLog).values({ tenantId, accion, entidad, entidadId, datos: datos as object });
  } catch { /* el audit no debe romper la operación principal */ }
}

interface CrudOptions {
  table: any;          // tabla drizzle (debe tener id, tenantId, updatedAt, deletedAt)
  entidad: string;
  list: (tenantId: string) => Promise<unknown[]>;   // GET (con joins si hace falta)
  pick: (body: any) => Record<string, unknown>;     // campos permitidos para alta/edición
}

// Despacha GET (lista) / POST (alta) / PUT (edición ?id=) / DELETE (baja lógica ?id=).
export async function handleCrud(req: VercelRequest, res: VercelResponse, opts: CrudOptions) {
  if (!requireDb(res)) return;
  try {
    const tenantId = await resolveTenantId();
    const db = getDb();
    const t = opts.table;

    if (req.method === 'GET') {
      return res.status(200).json(await opts.list(tenantId));
    }

    if (req.method === 'POST') {
      const ins = (await db.insert(t).values({ ...opts.pick(req.body ?? {}), tenantId }).returning()) as any[];
      const row = ins[0];
      await writeAudit(tenantId, 'INSERT', opts.entidad, row.id, row);
      return res.status(201).json(row);
    }

    if (req.method === 'PUT') {
      const id = String(req.query.id ?? '');
      if (!id) return res.status(400).json({ error: 'Falta id' });
      const upd = (await db.update(t)
        .set({ ...opts.pick(req.body ?? {}), updatedAt: new Date() })
        .where(and(eq(t.id, id), eq(t.tenantId, tenantId))).returning()) as any[];
      const row = upd[0];
      await writeAudit(tenantId, 'UPDATE', opts.entidad, id, row);
      return res.status(200).json(row);
    }

    if (req.method === 'DELETE') {
      const id = String(req.query.id ?? '');
      if (!id) return res.status(400).json({ error: 'Falta id' });
      await db.update(t).set({ deletedAt: new Date() }).where(and(eq(t.id, id), eq(t.tenantId, tenantId)));
      await writeAudit(tenantId, 'DELETE', opts.entidad, id, null);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message });
  }
}

// Helpers de lista reutilizables
export { and, eq, isNull };
