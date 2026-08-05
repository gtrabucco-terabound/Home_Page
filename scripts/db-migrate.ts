// Aplica las migraciones de ./drizzle a Neon. Lee DATABASE_URL de .env.local.
import { config } from 'dotenv';
config({ path: '.env.local' });

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL no está en .env.local');
  const db = drizzle(postgres(url, { prepare: false }));
  console.log('Aplicando migraciones…');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('✓ Migración aplicada correctamente.');
}

main().then(() => process.exit(0)).catch((e) => {
  console.error('✗ Error en la migración:', e);
  process.exit(1);
});
