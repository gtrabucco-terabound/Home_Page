import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq, isNull } from 'drizzle-orm';
import { getDb, schema, requireAuth, requireDb } from './_db.js';

// Resumen para el dashboard del ERP. Requiere sesión; el dinero solo para gerente.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireDb(res)) return;
  const session = requireAuth(req, res);
  if (!session) return;
  if (session.rol !== 'gerente' && session.rol !== 'desarrollador') {
    return res.status(403).json({ error: 'Sin permiso' });
  }
  try {
    const tenantId = session.tenantId;
    const db = getDb();
    const tFilter = (col: any, del: any) => and(eq(col, tenantId), isNull(del));

    const [pros, clis, proy, gas, hit] = await Promise.all([
      db.select().from(schema.prospectos).where(tFilter(schema.prospectos.tenantId, schema.prospectos.deletedAt)),
      db.select().from(schema.clientes).where(tFilter(schema.clientes.tenantId, schema.clientes.deletedAt)),
      db.select({ id: schema.proyectos.id, nombre: schema.proyectos.nombre, estado: schema.proyectos.estado, avance: schema.proyectos.avance, cliente: schema.clientes.empresa })
        .from(schema.proyectos).leftJoin(schema.clientes, eq(schema.proyectos.clienteId, schema.clientes.id))
        .where(tFilter(schema.proyectos.tenantId, schema.proyectos.deletedAt)),
      db.select().from(schema.gastos).where(tFilter(schema.gastos.tenantId, schema.gastos.deletedAt)),
      db.select({ id: schema.hitos.id, titulo: schema.hitos.titulo, estado: schema.hitos.estado, fecha: schema.hitos.fecha, proyecto: schema.proyectos.nombre })
        .from(schema.hitos).leftJoin(schema.proyectos, eq(schema.hitos.proyectoId, schema.proyectos.id))
        .where(tFilter(schema.hitos.tenantId, schema.hitos.deletedAt)),
    ]);

    const esGerente = session.rol === 'gerente';
    res.status(200).json({
      pipeline: esGerente ? pros.reduce((s, p) => s + Number(p.valorEstimado ?? 0), 0) : null,
      prospectosCount: pros.length,
      clientesCount: clis.length,
      proyectosActivos: proy.filter((p) => p.estado === 'En curso' || p.estado === 'En riesgo').length,
      gastoMes: esGerente ? gas.reduce((s, g) => s + Number(g.monto ?? 0), 0) : null,
      proyectos: proy.slice(0, 5),
      hitos: hit.slice(0, 5),
    });
  } catch (e) { res.status(500).json({ error: (e as Error).message }); }
}
