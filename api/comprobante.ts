// Comprobantes de gasto en Supabase Storage (bucket privado 'comprobantes').
// Flujo: sign-upload (URL firmada) → el navegador sube directo a Storage → confirm (guarda el path).
// GET devuelve una URL firmada temporal para ver/descargar.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, schema, getSession, and, eq } from './_db.js';

// La lectura con IA (descarga + visión) puede pasar los 10s por defecto de Vercel.
export const maxDuration = 60;

const BUCKET = 'comprobantes';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://oezmycxouzlqdczcpqyd.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

function mediaType(path: string): string {
  const ext = path.toLowerCase().split('.').pop() || '';
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg';
}

// Lee el comprobante con Claude (visión) y devuelve los campos estructurados del gasto.
async function extraerConIA(path: string): Promise<any> {
  const dl = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    headers: { Authorization: `Bearer ${SERVICE_KEY}` },
  });
  if (!dl.ok) throw new Error(`No se pudo leer el comprobante (${dl.status})`);
  const buf = Buffer.from(await dl.arrayBuffer());
  const b64 = buf.toString('base64');
  const mt = mediaType(path);
  const fileBlock = mt === 'application/pdf'
    ? { type: 'document', source: { type: 'base64', media_type: mt, data: b64 } }
    : { type: 'image', source: { type: 'base64', media_type: mt, data: b64 } };

  const prompt = 'Extraé los datos de este comprobante/factura y devolvé SOLO un objeto JSON (sin texto alrededor) con estas claves exactas: '
    + '"proveedor" (razón social de quien emite), "cuit" (CUIT/identificación fiscal del proveedor, solo dígitos o con guiones), '
    + '"concepto" (breve descripción del gasto), "monto" (número del TOTAL, sin símbolos ni separadores de miles, punto decimal), '
    + '"moneda" ("USD" o "ARS"), "fecha" (formato YYYY-MM-DD), "iva" (número del IVA si figura, o null). '
    + 'Si un dato no aparece, poné null. No inventes datos.';

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': ANTHROPIC_KEY as string, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: [fileBlock, { type: 'text', text: prompt }] }],
    }),
  });
  if (!r.ok) throw new Error(`Error de la IA (${r.status}): ${(await r.text()).slice(0, 200)}`);
  const j: any = await r.json();
  const texto = (j.content ?? []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('').trim();
  const match = texto.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('La IA no devolvió datos legibles');
  return JSON.parse(match[0]);
}

function safeName(n: string): string {
  return (n || 'archivo').normalize('NFKD').replace(/[^\w.\-]+/g, '_').slice(-80);
}

async function gastoDelTenant(id: string, tenantId: string) {
  const [g] = await getDb().select({ id: schema.gastos.id, comprobantePath: schema.gastos.comprobantePath })
    .from(schema.gastos).where(and(eq(schema.gastos.id, id), eq(schema.gastos.tenantId, tenantId))).limit(1);
  return g ?? null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const session = getSession(req);
    if (!session) return res.status(401).json({ error: 'No autenticado' });
    if (!SERVICE_KEY) return res.status(503).json({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY en el entorno.' });

    const id = String(req.query.id ?? '');
    if (!id) return res.status(400).json({ error: 'Falta id de gasto' });
    const gasto = await gastoDelTenant(id, session.tenantId);
    if (!gasto) return res.status(404).json({ error: 'Gasto no encontrado' });
    // El desarrollador solo opera sobre sus propios gastos (scoping ya aplicado en gastos).

    const storageHeaders = { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' };

    // Ver / descargar: URL firmada temporal.
    if (req.method === 'GET') {
      if (!gasto.comprobantePath) return res.status(404).json({ error: 'El gasto no tiene comprobante' });
      const r = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${BUCKET}/${gasto.comprobantePath}`, {
        method: 'POST', headers: storageHeaders, body: JSON.stringify({ expiresIn: 3600 }),
      });
      if (!r.ok) throw new Error(`No se pudo firmar la URL (${r.status})`);
      const j: any = await r.json();
      return res.status(200).json({ url: `${SUPABASE_URL}/storage/v1${j.signedURL}` });
    }

    if (req.method === 'POST') {
      const action = String(req.query.action ?? '');
      const body = (req.body ?? {}) as { filename?: string; type?: string; path?: string };

      // 1) Firmar subida directa desde el navegador.
      if (action === 'sign-upload') {
        const path = `${session.tenantId}/${id}/${safeName(body.filename ?? 'comprobante')}`;
        const r = await fetch(`${SUPABASE_URL}/storage/v1/object/upload/sign/${BUCKET}/${path}`, {
          method: 'POST', headers: storageHeaders, body: JSON.stringify({}),
        });
        if (!r.ok) throw new Error(`No se pudo firmar la subida (${r.status})`);
        const j: any = await r.json(); // { url: '/object/upload/sign/comprobantes/<path>?token=...' }
        return res.status(200).json({ path, uploadUrl: `${SUPABASE_URL}/storage/v1${j.url}` });
      }

      // 1.5) OCR/IA: leer el comprobante ya subido y devolver los datos extraídos (sin guardar).
      if (action === 'ocr') {
        if (!ANTHROPIC_KEY) return res.status(503).json({ error: 'Falta ANTHROPIC_API_KEY en el entorno.' });
        if (!gasto.comprobantePath) return res.status(400).json({ error: 'El gasto no tiene comprobante para leer' });
        const datos = await extraerConIA(gasto.comprobantePath);
        return res.status(200).json({ datos });
      }

      // 2) Confirmar: guardar el path en el gasto (tras subir OK).
      if (action === 'confirm') {
        const path = String(body.path ?? '');
        if (!path.startsWith(`${session.tenantId}/${id}/`)) return res.status(400).json({ error: 'Path inválido' });
        await getDb().update(schema.gastos).set({ comprobantePath: path, updatedAt: new Date() })
          .where(and(eq(schema.gastos.id, id), eq(schema.gastos.tenantId, session.tenantId)));
        return res.status(200).json({ ok: true, path });
      }

      return res.status(400).json({ error: 'Acción inválida' });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    return res.status(502).json({ error: (e as Error).message });
  }
}
