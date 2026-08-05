// Siembra datos de ejemplo (los mocks actuales) en Neon. Idempotente por tenant 'terabound'.
import { config } from 'dotenv';
config({ path: '.env.local' });

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../api/_lib/schema';
import { clientes as mClientes, prospectos as mProspectos, proyectos as mProyectos, hitos as mHitos, gastos as mGastos, documentos as mDocs, tickets as mTickets } from '../src/lib/mockData';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL no está en .env.local');
  const db = drizzle(postgres(url, { prepare: false }), { schema });

  const existing = await db.select().from(schema.tenants).where(eq(schema.tenants.slug, 'terabound')).limit(1);
  if (existing.length) {
    console.log('El tenant "terabound" ya existe — seed omitido (idempotente).');
    return;
  }

  const [tenant] = await db.insert(schema.tenants).values({ nombre: 'Terabound', slug: 'terabound' }).returning();
  const tenantId = tenant.id;
  console.log('Tenant creado:', tenantId);

  await db.insert(schema.siteConfig).values({
    tenantId, email: 'info@terabound.com', telefono: '+54 11 0000-0000',
    direccion: 'Av. del Libertador 1000', ciudad: 'CABA, Buenos Aires, Argentina',
    horario: 'Lun a Vie · 9:00 a 18:00 (GMT-3)', linkedin: 'https://www.linkedin.com/company/terabound',
  });

  // Clientes (mapeo mockId -> uuid)
  const clienteMap: Record<string, string> = {};
  for (const c of mClientes) {
    const [row] = await db.insert(schema.clientes).values({
      tenantId, empresa: c.empresa, contacto: c.contacto, email: c.email, industria: c.industria, desde: c.desde,
    }).returning();
    clienteMap[c.id] = row.id;
  }

  await db.insert(schema.prospectos).values(mProspectos.map((p) => ({
    tenantId, empresa: p.empresa, contacto: p.contacto, email: p.email,
    estado: p.estado, valorEstimado: String(p.valorEstimado), ultimoContacto: p.ultimoContacto,
  })));

  // Proyectos (mapeo por id y por nombre)
  const proyByMockId: Record<string, string> = {};
  const proyByNombre: Record<string, string> = {};
  for (const p of mProyectos) {
    const [row] = await db.insert(schema.proyectos).values({
      tenantId, clienteId: clienteMap[p.clienteId], nombre: p.nombre, estado: p.estado,
      avance: p.avance, responsable: p.responsable, inicio: p.inicio, fin: p.fin,
    }).returning();
    proyByMockId[p.id] = row.id;
    proyByNombre[p.nombre] = row.id;
  }

  await db.insert(schema.hitos).values(mHitos.map((h) => ({
    tenantId, proyectoId: proyByMockId[h.proyectoId], titulo: h.titulo, estado: h.estado, fecha: h.fecha,
  })));

  await db.insert(schema.gastos).values(mGastos.map((g) => ({
    tenantId, proyectoId: g.proyecto ? proyByNombre[g.proyecto] ?? null : null,
    tipo: (g.proyecto ? 'Directo' : 'Indirecto') as 'Directo' | 'Indirecto',
    concepto: g.concepto, categoria: g.categoria, monto: String(g.monto), fecha: g.fecha,
  })));

  await db.insert(schema.documentos).values(mDocs.map((d) => ({
    tenantId, proyectoId: proyByNombre[d.proyecto], nombre: d.nombre, tipo: d.tipo, tamano: d.tamano,
  })));

  await db.insert(schema.tickets).values(mTickets.map((t) => ({
    tenantId, proyectoId: proyByNombre[t.proyecto], asunto: t.asunto, estado: t.estado, prioridad: t.prioridad, fecha: t.fecha,
  })));

  // Catálogo base de conceptos de gasto (cada uno atado a su categoría)
  const conceptosBase: [string, 'Infraestructura' | 'Licencias' | 'Personal' | 'Servicios' | 'Otros'][] = [
    ['Servidores / Hosting', 'Infraestructura'], ['Base de datos', 'Infraestructura'],
    ['Dominios / DNS', 'Infraestructura'], ['Almacenamiento / CDN', 'Infraestructura'],
    ['Software SaaS', 'Licencias'], ['IA / APIs', 'Licencias'],
    ['Herramientas de diseño', 'Licencias'], ['Repositorios / CI-CD', 'Licencias'],
    ['Sueldos', 'Personal'], ['Honorarios / Freelance', 'Personal'], ['Cargas sociales', 'Personal'], ['Capacitación', 'Personal'],
    ['Contador / Legal', 'Servicios'], ['Comisiones bancarias', 'Servicios'], ['Marketing / Publicidad', 'Servicios'],
    ['Internet / Telefonía', 'Servicios'], ['Viáticos / Movilidad', 'Servicios'],
    ['Impuestos', 'Otros'], ['Varios', 'Otros'],
  ];
  await db.insert(schema.conceptoGasto).values(conceptosBase.map(([nombre, categoria]) => ({ tenantId, nombre, categoria })));

  // Personas de ejemplo (con sueldo → base para costo/hora promedio)
  await db.insert(schema.personas).values([
    { tenantId, nombre: 'Dev Senior', rol: 'Desarrollo', sueldoMensual: '4000', horasMensuales: 160 },
    { tenantId, nombre: 'Project Manager', rol: 'PM', sueldoMensual: '4500', horasMensuales: 160 },
    { tenantId, nombre: 'Domain Expert O&G', rol: 'Domain Expert', sueldoMensual: '5000', horasMensuales: 160 },
  ]);

  console.log('✓ Seed completado.');
}

main().then(() => process.exit(0)).catch((e) => {
  console.error('✗ Error en el seed:', e);
  process.exit(1);
});
