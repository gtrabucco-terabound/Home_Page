// Auth propia (server-side): hash de contraseña (scrypt) + JWT HS256 con Node crypto. Sin dependencias.
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import type { VercelRequest } from '@vercel/node';

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error('AUTH_SECRET no configurada (server-side).');
  return s;
}

/* ---------- Password (scrypt) ---------- */
export function hashPassword(pw: string): string {
  const salt = randomBytes(16);
  const dk = scryptSync(pw, salt, 64);
  return salt.toString('hex') + ':' + dk.toString('hex');
}

export function verifyPassword(pw: string, stored: string | null): boolean {
  if (!stored) return false;
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const dk = scryptSync(pw, Buffer.from(saltHex, 'hex'), 64);
  const expected = Buffer.from(hashHex, 'hex');
  return dk.length === expected.length && timingSafeEqual(dk, expected);
}

/* ---------- JWT HS256 ---------- */
export interface TokenPayload {
  sub: string;        // profile id
  email: string;
  rol: string;
  tenantId: string;
  empresaId?: string | null;
  iat?: number;
  exp?: number;
}

const b64 = (s: string | Buffer) => Buffer.from(s).toString('base64url');

export function signToken(payload: TokenPayload, expSeconds = 60 * 60 * 8): string {
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expSeconds };
  const head = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const data = head + '.' + b64(JSON.stringify(body));
  const sig = createHmac('sha256', secret()).update(data).digest('base64url');
  return data + '.' + sig;
}

export function verifyToken(token: string): TokenPayload {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Token inválido');
  const data = parts[0] + '.' + parts[1];
  const expected = createHmac('sha256', secret()).update(data).digest('base64url');
  const a = Buffer.from(parts[2]);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error('Firma inválida');
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as TokenPayload;
  if (payload.exp && payload.exp * 1000 < Date.now()) throw new Error('Token expirado');
  return payload;
}

// Lee el Bearer del request y valida. Devuelve null si no hay sesión válida.
export function getSession(req: VercelRequest): TokenPayload | null {
  const h = (req.headers.authorization || req.headers.Authorization) as string | undefined;
  if (!h || !h.startsWith('Bearer ')) return null;
  try {
    return verifyToken(h.slice(7));
  } catch {
    return null;
  }
}
