// Verificación rápida: cuenta filas en las tablas principales.
import { config } from 'dotenv';
config({ path: '.env.local' });

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import * as schema from '../api/_lib/schema';

async function main() {
  const db = drizzle(postgres(process.env.DATABASE_URL!, { prepare: false }), { schema });
  const tablas = ['tenants', 'clientes', 'prospectos', 'proyectos', 'hitos', 'gastos', 'documentos', 'tickets', 'personas', 'site_config'];
  for (const t of tablas) {
    const r = (await db.execute(sql.raw(`select count(*)::int as n from ${t}`))) as unknown as { n: number }[];
    console.log(`${t.padEnd(14)} → ${r[0]?.n}`);
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
