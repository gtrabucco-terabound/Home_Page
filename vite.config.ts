import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { config as loadDotenv } from 'dotenv';
import type { ViteDevServer } from 'vite';

// Plugin de desarrollo: sirve las funciones /api (estilo Vercel) durante `npm run dev`,
// así no hace falta `vercel dev` para probar en local. En producción las corre Vercel.
function localApiPlugin() {
  return {
    name: 'local-api',
    configureServer(server: ViteDevServer) {
      loadDotenv({ path: '.env.local' });
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url || !req.url.startsWith('/api/')) return next();
        const url = new URL(req.url, 'http://localhost');
        const name = url.pathname.replace(/^\/api\//, '').replace(/\/+$/, '');
        try {
          const mod = await server.ssrLoadModule(`/api/${name}.ts`);
          const handler = mod.default;
          if (typeof handler !== 'function') {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: `Ruta /api/${name} no encontrada` }));
            return;
          }
          req.query = Object.fromEntries(url.searchParams);
          if (req.method === 'POST' || req.method === 'PUT') {
            const chunks: Buffer[] = [];
            for await (const c of req) chunks.push(c as Buffer);
            const raw = Buffer.concat(chunks).toString('utf8');
            req.body = raw ? JSON.parse(raw) : undefined;
          }
          res.status = (code: number) => { res.statusCode = code; return res; };
          res.json = (obj: unknown) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(obj));
            return res;
          };
          await handler(req, res);
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: (e as Error).message }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), localApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
