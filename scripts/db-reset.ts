// Vacía las tablas y deja la base lista para re-sembrar (npm run db:seed).
import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL no está en .env.local');
  const sql = neon(url);
  // TRUNCATE CASCADE sobre tenants limpia todo lo que referencia tenant_id.
  await sql`TRUNCATE TABLE tenants RESTART IDENTITY CASCADE`;
  console.log('✓ Tablas vaciadas. Ahora corré: npm run db:seed');
}

main().catch((e) => { console.error('✗', e.message); process.exit(1); });
