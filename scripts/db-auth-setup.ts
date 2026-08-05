// Recrea la tabla profiles (vacía) con la forma de auth propia y siembra usuarios demo.
import { config } from 'dotenv';
config({ path: '.env.local' });

import postgres from 'postgres';
import { hashPassword } from '../api/_lib/auth';

const DEMO_PW = 'Terabound.2026'; // contraseña demo — cambiar luego

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

  // profiles está vacía: la recreamos con la forma nueva (password_hash, rol text, unique email).
  await sql`DROP TABLE IF EXISTS profiles CASCADE`;
  await sql`DROP TYPE IF EXISTS rol`;
  await sql`
    CREATE TABLE profiles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id uuid NOT NULL REFERENCES tenants(id),
      nombre text NOT NULL,
      email text NOT NULL,
      password_hash text,
      rol text NOT NULL DEFAULT 'desarrollador',
      empresa_id uuid REFERENCES clientes(id),
      activo boolean NOT NULL DEFAULT true,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      deleted_at timestamptz
    )`;
  await sql`CREATE UNIQUE INDEX profiles_email_idx ON profiles(email)`;

  const [tenant] = await sql`SELECT id FROM tenants WHERE slug = 'terabound' LIMIT 1`;
  if (!tenant) throw new Error('Falta el tenant terabound (corré db:seed).');
  const tenantId = tenant.id as string;

  const [cuenca] = await sql`SELECT id FROM clientes WHERE empresa = 'Cuenca Sur Petróleo' LIMIT 1`;
  const cuencaId = cuenca?.id as string | undefined;

  const ph = hashPassword(DEMO_PW);
  const usuarios: [string, string, string, string | null][] = [
    ['Germán A. Trabucco', 'german@terabound.com', 'gerente', null],
    ['Equipo Terabound', 'dev@terabound.com', 'desarrollador', null],
    ['A. Molina', 'amolina@cuencasur.example', 'cliente', cuencaId ?? null],
  ];

  for (const [nombre, email, rol, empresaId] of usuarios) {
    await sql`INSERT INTO profiles (tenant_id, nombre, email, password_hash, rol, empresa_id)
              VALUES (${tenantId}, ${nombre}, ${email}, ${ph}, ${rol}, ${empresaId})`;
  }

  console.log('✓ profiles recreada y usuarios sembrados.');
  console.log('  Contraseña demo (todos):', DEMO_PW);
  usuarios.forEach((u) => console.log('   -', u[1], '→', u[2]));
}

main().then(() => process.exit(0)).catch((e) => { console.error('✗', e.message); process.exit(1); });
