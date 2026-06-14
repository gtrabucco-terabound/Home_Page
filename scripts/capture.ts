/**
 * Playwright capture script for AegisWell module walkthroughs.
 *
 * Usage:
 *   npm run capture            # capture all modules
 *   npm run capture anomalias  # capture single module
 *
 * Output: public/screenshots/{moduleId}-{step}.png
 *         public/video/{moduleId}.webm (optional, with --video flag)
 *
 * Requires .env.local with AEGISWELL_URL / AEGISWELL_USER / AEGISWELL_PASS.
 */
import { chromium, Page } from 'playwright';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const URL = process.env.AEGISWELL_URL!;
const USER = process.env.AEGISWELL_USER!;
const PASS = process.env.AEGISWELL_PASS!;
const W = Number(process.env.VIEWPORT_W ?? 1440);
const H = Number(process.env.VIEWPORT_H ?? 900);

// Raw captures contain real production data — kept out of git via .gitignore.
// Anonymized versions are exported manually to public/screenshots/.
const SCREENSHOTS_DIR = path.join(process.cwd(), 'public', 'screenshots', '_raw');
const VIDEO_DIR = path.join(process.cwd(), 'public', 'video', '_raw');
// Persistent Chromium profile — keeps your login session between runs.
// Gitignored. First run: log in manually; subsequent runs skip login entirely.
const PROFILE_DIR = path.join(process.cwd(), '.playwright-profile');

if (!URL || !USER || !PASS) {
  console.error('Falta configurar .env.local con AEGISWELL_URL / AEGISWELL_USER / AEGISWELL_PASS');
  process.exit(1);
}

fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
fs.mkdirSync(VIDEO_DIR, { recursive: true });

interface Flow {
  id: string;
  steps: Array<{ name: string; do: (page: Page) => Promise<void> }>;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function ensureLoggedIn(page: Page) {
  await page.goto(URL, { waitUntil: 'networkidle' });
  await wait(1500);

  // If we're already past login (URL is /dashboard, /anomalies, etc.), nothing to do.
  const onLogin = /login|signin|iniciar/i.test(page.url()) ||
                  (await page.locator('input[type="password"]').isVisible({ timeout: 1500 }).catch(() => false));

  if (!onLogin) {
    console.error('  ✓ already logged in (persistent session)');
    return;
  }

  console.error('\n  ! Sesión no encontrada — login manual requerido.');
  console.error('  → Te abrí una ventana de Chromium. Logueate con demo@terabound.com,');
  console.error('    seleccioná el tenant correcto, y dejá la app en /dashboard.');
  console.error('  → Cuando hayas terminado, volvé a esta terminal y presioná ENTER.\n');

  await new Promise<void>((resolve) => {
    process.stdin.once('data', () => resolve());
  });

  // DON'T re-goto root — that may reset tenant scope. Just snapshot where the user is.
  await capture(page, '_debug', '02-resume-state');
  console.error(`  → resumiendo en ${page.url()}`);
}

async function capture(page: Page, moduleId: string, stepName: string) {
  const file = path.join(SCREENSHOTS_DIR, `${moduleId}-${stepName}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.error(`  ✓ ${path.relative(process.cwd(), file)}`);
}

async function tryDetectDetail(page: Page, startUrl: string): Promise<'modal' | 'navigated' | null> {
  const verDetalle = page.getByRole('button', { name: /ver detalle/i }).first();
  const dialog = page.locator('[role="dialog"], .modal, [class*="modal" i], [class*="dialog" i]').first();
  try {
    await Promise.race([
      verDetalle.waitFor({ state: 'visible', timeout: 3000 }),
      dialog.waitFor({ state: 'visible', timeout: 3000 }),
      page.waitForURL((url) => url.toString() !== startUrl, { timeout: 3000 }),
    ]);
  } catch { /* no signal */ }
  if (await verDetalle.isVisible().catch(() => false)) return 'modal';
  if (page.url() !== startUrl) return 'navigated';
  return null;
}

async function clickRowAndOpenDetail(page: Page) {
  const startUrl = page.url();
  const firstRow = page.locator('table tbody tr').first();
  await firstRow.scrollIntoViewIfNeeded();

  // Wait for React hydration: ensure handlers are attached before clicking
  await wait(1500);

  // Diagnostic: check if React onClick is bound on the row
  const handlerInfo = await firstRow.evaluate((el) => {
    const keys = Object.keys(el).filter((k) => k.startsWith('__reactProps$') || k.startsWith('__reactEventHandlers$'));
    return keys.map((k) => ({ key: k.slice(0, 25), hasOnClick: !!(el as any)[k]?.onClick }));
  }).catch(() => []);
  console.error('    [React handlers]:', JSON.stringify(handlerInfo));

  // Strategy 1: real mouse coordinates with pointer sequence (most realistic)
  console.error('    [strat 1: mouse coords + down/up]');
  const box = await firstRow.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await wait(80);
    await page.mouse.down();
    await wait(50);
    await page.mouse.up();
  }
  let r = await tryDetectDetail(page, startUrl);
  if (r) return r;

  // Strategy 2: invoke React onClick directly via reactProps
  console.error('    [strat 2: React onClick direct]');
  const reactClicked = await firstRow.evaluate((el) => {
    const propsKey = Object.keys(el).find((k) => k.startsWith('__reactProps$'));
    if (!propsKey) return 'no-react-props';
    const props = (el as any)[propsKey];
    if (typeof props.onClick !== 'function') return 'no-onclick';
    props.onClick({
      preventDefault: () => {},
      stopPropagation: () => {},
      currentTarget: el,
      target: el,
      nativeEvent: {},
    });
    return 'invoked';
  }).catch((e) => `error: ${e.message}`);
  console.error(`      → ${reactClicked}`);
  r = await tryDetectDetail(page, startUrl);
  if (r) return r;

  // Strategy 3: focus + Enter (keyboard activation)
  console.error('    [strat 3: focus + Enter]');
  await firstRow.evaluate((el) => (el as HTMLElement).focus()).catch(() => {});
  await page.keyboard.press('Enter');
  r = await tryDetectDetail(page, startUrl);
  if (r) return r;

  return 'nothing';
}

const flows: Flow[] = [
  {
    id: 'anomalias',
    steps: [
      {
        name: '1-lista',
        do: async (page) => {
          // Direct URL navigation — avoids any tenant-resetting redirects from sidebar clicks
          await page.goto(`${URL.replace(/\/$/, '')}/anomalies`, { waitUntil: 'networkidle' });
          // Wait until either rows or empty-state is rendered (data loaded)
          await Promise.race([
            page.locator('table tbody tr').first().waitFor({ timeout: 10000 }).catch(() => {}),
            page.getByText(/sin anomal/i).waitFor({ timeout: 10000 }).catch(() => {}),
          ]);
          await wait(800);
          const rowCount = await page.locator('table tbody tr').count();
          console.error(`    [filas detectadas: ${rowCount}]`);
        },
      },
      {
        name: '2-preview',
        do: async (page) => {
          const result = await clickRowAndOpenDetail(page);
          console.error(`    [row click → ${result}, url=${page.url()}]`);
          await wait(500);
        },
      },
      {
        name: '3-detalle',
        do: async (page) => {
          // If preview modal is open, click "Ver detalle completo"
          const verDetalle = page.getByRole('button', { name: /ver detalle/i }).first();
          if (await verDetalle.isVisible({ timeout: 1500 }).catch(() => false)) {
            await verDetalle.click();
            await page.waitForLoadState('networkidle');
            await wait(800);
          }
          // Otherwise we're already on detail (or no detail available for VIEWER)
        },
      },
    ],
  },
  // TODO: barreras, scada, fmeca, compliance, ai-audit
];

(async () => {
  const target = process.argv[2];
  const recordVideo = process.argv.includes('--video');

  // Persistent context = real Chromium profile saved on disk between runs.
  fs.mkdirSync(PROFILE_DIR, { recursive: true });
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false, // Always visible — first run requires manual login
    channel: 'chrome',
    viewport: { width: W, height: H },
    deviceScaleFactor: 2,
    recordVideo: recordVideo ? { dir: VIDEO_DIR, size: { width: W, height: H } } : undefined,
  });
  // Polyfill __name in page context — tsx/esbuild injects this in transformed code
  // and it must exist or page.evaluate() throws ReferenceError.
  await context.addInitScript(() => {
    if (typeof (globalThis as any).__name === 'undefined') {
      (globalThis as any).__name = (fn: any, _name?: string) => fn;
    }
  });

  const page = context.pages()[0] ?? (await context.newPage());

  console.error(`→ Abriendo ${URL}`);
  await ensureLoggedIn(page);

  const toRun = target ? flows.filter((f) => f.id === target) : flows;
  if (!toRun.length) {
    console.error(`No flow matches "${target}". Available: ${flows.map((f) => f.id).join(', ')}`);
    process.exit(1);
  }

  for (const flow of toRun) {
    console.error(`\n→ Capturando ${flow.id}`);
    for (const step of flow.steps) {
      try {
        await step.do(page);
        await capture(page, flow.id, step.name);
      } catch (e: any) {
        console.error(`  ✗ ${step.name} falló: ${e.message}`);
      }
    }
    // Reset for next flow
    await page.goto(URL, { waitUntil: 'networkidle' }).catch(() => {});
  }

  await context.close();
  console.error('\n✓ Listo. Revisá public/screenshots/');
})();
