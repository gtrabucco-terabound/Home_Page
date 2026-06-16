import type { VercelRequest, VercelResponse } from '@vercel/node';

// Health check: confirma que la función corre y si la DB está configurada.
export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    ok: true,
    service: 'terabound-web-os',
    dbConfigured: Boolean(process.env.DATABASE_URL),
    ts: new Date().toISOString(),
  });
}
