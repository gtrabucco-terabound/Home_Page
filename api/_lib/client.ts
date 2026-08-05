// Cliente DB server-side (Vercel Functions). NUNCA importar desde código de cliente.
// Postgres estándar (Supabase) vía postgres.js. prepare:false para compatibilidad con el pooler.
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL no está configurada (cargar en .env.local / Vercel env).');
  }
  if (!_db) {
    _client = postgres(url, { prepare: false });
    _db = drizzle(_client, { schema });
  }
  return _db;
}

export { schema };
