import type { VercelRequest, VercelResponse } from '@vercel/node';
import { asc } from 'drizzle-orm';
import { getDb, schema, handleCrud, and, eq, isNull } from './_db.js';

const NONE = '00000000-0000-0000-0000-000000000000';

// Avance ponderado por hitos.
async function avancePorProyecto(tenantId: string): Promise<Record<string, number>> {
  const hs = await getDb().select({ proyectoId: schema.hitos.proyectoId, peso: schema.hitos.peso, estado: schema.hitos.estado })
    .from(schema.hitos).where(and(eq(schema.hitos.tenantId, tenantId), isNull(schema.hitos.deletedAt)));
  const agg: Record<string, { tot: number; done: number }> = {};
  for (const h of hs) { const a = agg[h.proyectoId] ?? (agg[h.proyectoId] = { tot: 0, done: 0 }); a.tot += h.peso; if (h.estado === 'Completado') a.done += h.peso; }
  const out: Record<string, number> = {};
  for (const id in agg) if (agg[id].tot > 0) out[id] = Math.round((agg[id].done / agg[id].tot) * 100);
  return out;
}

// Configuración por recurso (consolida los CRUD en una sola función).
const configs: Record<string, any> = {
  clientes: {
    table: schema.clientes, entidad: 'clientes', roles: ['gerente'],
    pick: (b: any) => ({ empresa: b.empresa, contacto: b.contacto, email: b.email, industria: b.industria, desde: b.desde }),
    list: async (s: any) => {
      const db = getDb();
      const cli = await db.select().from(schema.clientes).where(and(eq(schema.clientes.tenantId, s.tenantId), isNull(schema.clientes.deletedAt)));
      const proy = await db.select({ clienteId: schema.proyectos.clienteId }).from(schema.proyectos).where(and(eq(schema.proyectos.tenantId, s.tenantId), isNull(schema.proyectos.deletedAt)));
      const counts: Record<string, number> = {};
      for (const p of proy) counts[p.clienteId] = (counts[p.clienteId] ?? 0) + 1;
      return cli.map((c) => ({ ...c, proyectosActivos: counts[c.id] ?? 0 }));
    },
  },
  prospectos: {
    table: schema.prospectos, entidad: 'prospectos', roles: ['gerente'],
    pick: (b: any) => ({ empresa: b.empresa, contacto: b.contacto, email: b.email, estado: b.estado, valorEstimado: b.valorEstimado != null ? String(b.valorEstimado) : '0', ultimoContacto: b.ultimoContacto }),
    list: async (s: any) => getDb().select().from(schema.prospectos).where(and(eq(schema.prospectos.tenantId, s.tenantId), isNull(schema.prospectos.deletedAt))),
  },
  gastos: {
    table: schema.gastos, entidad: 'gastos', roles: ['gerente', 'desarrollador'], writeRoles: ['gerente', 'desarrollador'],
    pick: (b: any) => ({ proyectoId: b.proyectoId || null, personaId: b.personaId || null, tipo: b.tipo, concepto: b.concepto, categoria: b.categoria, monto: b.monto != null ? String(b.monto) : '0', fecha: b.fecha }),
    // El desarrollador solo puede atribuirse gastos a sí mismo.
    injectOnWrite: (s: any) => (s.rol === 'desarrollador' ? { personaId: s.sub } : {}),
    list: async (s: any) => {
      const conds = [eq(schema.gastos.tenantId, s.tenantId), isNull(schema.gastos.deletedAt)];
      if (s.rol === 'desarrollador') conds.push(eq(schema.gastos.personaId, s.sub)); // el dev solo ve los suyos
      return getDb().select({
        id: schema.gastos.id, concepto: schema.gastos.concepto, categoria: schema.gastos.categoria, tipo: schema.gastos.tipo,
        monto: schema.gastos.monto, fecha: schema.gastos.fecha, proyectoId: schema.gastos.proyectoId, proyecto: schema.proyectos.nombre,
        personaId: schema.gastos.personaId, persona: schema.profiles.nombre,
      }).from(schema.gastos)
        .leftJoin(schema.proyectos, eq(schema.gastos.proyectoId, schema.proyectos.id))
        .leftJoin(schema.profiles, eq(schema.gastos.personaId, schema.profiles.id))
        .where(and(...conds));
    },
  },
  proyectos: {
    table: schema.proyectos, entidad: 'proyectos', roles: ['gerente', 'desarrollador', 'cliente'], writeRoles: ['gerente'],
    pick: (b: any) => ({ clienteId: b.clienteId, nombre: b.nombre, estado: b.estado, avance: b.avance != null ? Number(b.avance) : 0, responsable: b.responsable, inicio: b.inicio, fin: b.fin }),
    list: async (s: any) => {
      const conds = [eq(schema.proyectos.tenantId, s.tenantId), isNull(schema.proyectos.deletedAt)];
      if (s.rol === 'cliente') conds.push(eq(schema.proyectos.clienteId, s.empresaId ?? NONE));
      const rows = await getDb().select({
        id: schema.proyectos.id, nombre: schema.proyectos.nombre, estado: schema.proyectos.estado, avance: schema.proyectos.avance,
        responsable: schema.proyectos.responsable, inicio: schema.proyectos.inicio, fin: schema.proyectos.fin,
        clienteId: schema.proyectos.clienteId, cliente: schema.clientes.empresa,
      }).from(schema.proyectos).leftJoin(schema.clientes, eq(schema.proyectos.clienteId, schema.clientes.id)).where(and(...conds));
      const calc = await avancePorProyecto(s.tenantId);
      return rows.map((r) => (r.id in calc ? { ...r, avance: calc[r.id] } : r));
    },
  },
  hitos: {
    table: schema.hitos, entidad: 'hitos', roles: ['gerente', 'desarrollador', 'cliente'], writeRoles: ['gerente', 'desarrollador'],
    pick: (b: any) => ({ proyectoId: b.proyectoId, titulo: b.titulo, estado: b.estado, fecha: b.fecha, orden: b.orden != null ? Number(b.orden) : 0, peso: b.peso != null ? Number(b.peso) : 1 }),
    list: async (s: any) => {
      const conds = [eq(schema.hitos.tenantId, s.tenantId), isNull(schema.hitos.deletedAt)];
      if (s.rol === 'cliente') conds.push(eq(schema.proyectos.clienteId, s.empresaId ?? NONE));
      return getDb().select({
        id: schema.hitos.id, titulo: schema.hitos.titulo, estado: schema.hitos.estado, fecha: schema.hitos.fecha,
        orden: schema.hitos.orden, peso: schema.hitos.peso, proyectoId: schema.hitos.proyectoId, proyecto: schema.proyectos.nombre,
      }).from(schema.hitos).leftJoin(schema.proyectos, eq(schema.hitos.proyectoId, schema.proyectos.id))
        .where(and(...conds)).orderBy(asc(schema.hitos.orden), asc(schema.hitos.fecha));
    },
  },
  documentos: {
    table: schema.documentos, entidad: 'documentos', roles: ['gerente', 'desarrollador', 'cliente'], writeRoles: ['gerente'],
    pick: (b: any) => ({ proyectoId: b.proyectoId, nombre: b.nombre, tipo: b.tipo, tamano: b.tamano, url: b.url }),
    list: async (s: any) => {
      const conds = [eq(schema.documentos.tenantId, s.tenantId), isNull(schema.documentos.deletedAt)];
      if (s.rol === 'cliente') conds.push(eq(schema.proyectos.clienteId, s.empresaId ?? NONE));
      return getDb().select({
        id: schema.documentos.id, nombre: schema.documentos.nombre, tipo: schema.documentos.tipo, tamano: schema.documentos.tamano,
        url: schema.documentos.url, proyectoId: schema.documentos.proyectoId, proyecto: schema.proyectos.nombre,
      }).from(schema.documentos).leftJoin(schema.proyectos, eq(schema.documentos.proyectoId, schema.proyectos.id)).where(and(...conds));
    },
  },
  tickets: {
    table: schema.tickets, entidad: 'tickets', roles: ['gerente', 'desarrollador', 'cliente'], writeRoles: ['gerente', 'desarrollador', 'cliente'],
    pick: (b: any) => ({ proyectoId: b.proyectoId, asunto: b.asunto, estado: b.estado, prioridad: b.prioridad, fecha: b.fecha }),
    list: async (s: any) => {
      const conds = [eq(schema.tickets.tenantId, s.tenantId), isNull(schema.tickets.deletedAt)];
      if (s.rol === 'cliente') conds.push(eq(schema.proyectos.clienteId, s.empresaId ?? NONE));
      return getDb().select({
        id: schema.tickets.id, asunto: schema.tickets.asunto, estado: schema.tickets.estado, prioridad: schema.tickets.prioridad,
        fecha: schema.tickets.fecha, proyectoId: schema.tickets.proyectoId, proyecto: schema.proyectos.nombre,
      }).from(schema.tickets).leftJoin(schema.proyectos, eq(schema.tickets.proyectoId, schema.proyectos.id)).where(and(...conds));
    },
  },
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  const resource = String(req.query.resource ?? '');
  const cfg = configs[resource];
  if (!cfg) return res.status(404).json({ error: `Recurso no encontrado: ${resource}` });
  return handleCrud(req, res, cfg);
}
