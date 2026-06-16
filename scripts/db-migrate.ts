// Aplica las migraciones de ./drizzle a Neon. Lee DATABASE_URL de .env.local.
import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL no está en .env.local');
  const db = drizzle(neon(url));
  console.log('Aplicando migraciones…');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('✓ Migración aplicada correctamente.');
}

main().catch((e) => {
  console.error('✗ Error en la migración:', e);
  process.exit(1);
});
