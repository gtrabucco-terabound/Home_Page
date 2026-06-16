// Verificación rápida: cuenta filas en las tablas principales.
import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import * as schema from '../src/db/schema';

async function main() {
  const db = drizzle(neon(process.env.DATABASE_URL!), { schema });
  const tablas = ['tenants', 'clientes', 'prospectos', 'proyectos', 'hitos', 'gastos', 'documentos', 'tickets', 'personas', 'site_config'];
  for (const t of tablas) {
    const r = await db.execute(sql.raw(`select count(*)::int as n from ${t}`));
    const n = (r.rows?.[0] as { n: number } | undefined)?.n ?? (r as unknown as { n: number }[])[0]?.n;
    console.log(`${t.padEnd(14)} → ${n}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
