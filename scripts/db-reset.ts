// Vacía las tablas y deja la base lista para re-sembrar (npm run db:seed).
import { config } from 'dotenv';
config({ path: '.env.local' });

import postgres from 'postgres';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL no está en .env.local');
  const sql = postgres(url, { prepare: false });
  // TRUNCATE CASCADE sobre tenants limpia todo lo que referencia tenant_id.
  await sql`TRUNCATE TABLE tenants RESTART IDENTITY CASCADE`;
  console.log('✓ Tablas vaciadas. Ahora corré: npm run db:seed');
}

main().then(() => process.exit(0)).catch((e) => { console.error('✗', e.message); process.exit(1); });
