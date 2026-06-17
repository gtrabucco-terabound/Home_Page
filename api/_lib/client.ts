// Cliente DB server-side (Vercel Functions). NUNCA importar desde código de cliente.
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema.js';

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL no está configurada (cargar en .env.local / Vercel env).');
  }
  if (!_db) {
    const sql = neon(url);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

export { schema };
