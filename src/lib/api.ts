// Cliente HTTP mínimo hacia las funciones /api.
export async function apiGet<T>(path: string): Promise<T> {
  const r = await fetch(`/api/${path}`);
  if (!r.ok) {
    const body = (await r.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Error ${r.status}`);
  }
  return r.json() as Promise<T>;
}

export async function apiSend<T>(path: string, method: 'POST' | 'PUT' | 'DELETE', body?: unknown): Promise<T> {
  const r = await fetch(`/api/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) {
    const b = (await r.json().catch(() => ({}))) as { error?: string };
    throw new Error(b.error ?? `Error ${r.status}`);
  }
  return r.json() as Promise<T>;
}
