import { defineConfig } from 'drizzle-kit';

// La migración se genera desde el esquema; aplicar requiere DATABASE_URL (B4.2).
export default defineConfig({
  schema: './api/_lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  verbose: true,
  strict: true,
});
