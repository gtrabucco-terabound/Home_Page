// Cotización del dólar oficial (fuente: dolarapi.com). Devuelve el valor de venta.
// Se usa para convertir gastos cargados en ARS a USD canónico.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from './_lib/auth.js';

let cache: { rate: number; venta: number; compra: number; fecha: string | null; at: number } | null = null;
const TTL_MS = 10 * 60 * 1000; // 10 min

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!getSession(req)) return res.status(401).json({ error: 'No autenticado' });
  try {
    if (!cache || Date.now() - cache.at > TTL_MS) {
      const r = await fetch('https://dolarapi.com/v1/dolares/oficial');
      if (!r.ok) throw new Error('No se pudo obtener la cotización oficial');
      const d: any = await r.json();
      cache = { rate: Number(d.venta), venta: Number(d.venta), compra: Number(d.compra), fecha: d.fechaActualizacion ?? null, at: Date.now() };
    }
    return res.status(200).json({ rate: cache.rate, venta: cache.venta, compra: cache.compra, fecha: cache.fecha, fuente: 'dolarapi/oficial' });
  } catch (e) {
    return res.status(502).json({ error: (e as Error).message });
  }
}
