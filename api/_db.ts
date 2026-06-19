// Helpers compartidos por las funciones /api (los archivos con guión bajo no son rutas).
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq, isNull } from 'drizzle-orm';
import { getDb, schema } from './_lib/client.js';
import { getSession, type TokenPayload } from './_lib/auth.js';

export { getDb, schema, getSession };
export type { TokenPayload };

// Exige sesión válida; si no, responde 401 y devuelve null.
export function requireAuth(req: VercelRequest, res: VercelResponse): TokenPayload | null {
  const s = getSession(req);
  if (!s) { res.status(401).json({ error: 'No autenticado' }); return null; }
  return s;
}

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
  roles?: string[];    // roles permitidos (si se define). Si falta → cualquier usuario autenticado.
  writeRoles?: string[]; // roles que pueden POST/PUT/DELETE (si falta → igual que roles)
  list: (session: TokenPayload) => Promise<unknown[]>;  // GET (con joins / scoping si hace falta)
  pick: (body: any) => Record<string, unknown>;         // campos permitidos para alta/edición
  injectOnWrite?: (session: TokenPayload) => Record<string, unknown>; // fuerza campos según sesión
}

// Despacha GET (lista) / POST (alta) / PUT (edición ?id=) / DELETE (baja lógica ?id=).
// Exige token; el tenant SIEMPRE sale de la sesión (multitenant real).
export async function handleCrud(req: VercelRequest, res: VercelResponse, opts: CrudOptions) {
  if (!requireDb(res)) return;
  const session = requireAuth(req, res);
  if (!session) return;
  if (opts.roles && !opts.roles.includes(session.rol)) {
    return res.status(403).json({ error: 'Sin permiso' });
  }
  const esEscritura = req.method !== 'GET';
  const writeRoles = opts.writeRoles ?? opts.roles;
  if (esEscritura && writeRoles && !writeRoles.includes(session.rol)) {
    return res.status(403).json({ error: 'Sin permiso de escritura' });
  }
  try {
    const tenantId = session.tenantId;
    const db = getDb();
    const t = opts.table;

    if (req.method === 'GET') {
      return res.status(200).json(await opts.list(session));
    }

    const inject = opts.injectOnWrite ? opts.injectOnWrite(session) : {};

    if (req.method === 'POST') {
      const ins = (await db.insert(t).values({ ...opts.pick(req.body ?? {}), ...inject, tenantId }).returning()) as any[];
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
