/**
 * Renders studio product photography for every fragrance in the seed catalogue
 * from the procedural 3D bottle, and writes WebP files to server/uploads/products.
 *
 *   1. npm run dev            (in client/)
 *   2. node scripts/render-bottles.mjs [slug ...]
 *
 * Requires Playwright (npx playwright / a global install) with Chromium.
 */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { execFileSync } from 'child_process';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { chromium } = require('playwright');
const { products } = require('../../server/seed/catalogue.js');

const BASE = process.env.STUDIO_URL || 'http://localhost:5173';
const OUT = path.join(__dirname, '..', '..', 'server', 'uploads', 'products');
const only = process.argv.slice(2);

// 1: front, 2: three-quarter, 3: close-up of the label
const ANGLES = [
  { suffix: 1, yaw: 0, zoom: 1, cy: 0 },
  { suffix: 2, yaw: -0.62, zoom: 1, cy: 0 },
  { suffix: 3, yaw: 0.28, zoom: 1.75, cy: 0.1 },
];

const run = async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const context = await browser.newContext({ viewport: { width: 900, height: 1125 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  // Behind an HTTPS-only proxy Chromium cannot reach Google Fonts directly, so
  // fetch the label fonts with curl (which honours HTTPS_PROXY) instead.
  if (process.env.HTTPS_PROXY) {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, async (route) => {
      const url = route.request().url();
      const body = execFileSync('curl', ['-sS', '-A', 'Mozilla/5.0 (X11; Linux x86_64) Chrome/140 Safari/537.36', url], { maxBuffer: 20 * 1024 * 1024 });
      const type = url.includes('googleapis') ? 'text/css' : 'font/woff2';
      await route.fulfill({ status: 200, body, headers: { 'content-type': type, 'access-control-allow-origin': '*' } });
    });
  }
  page.on('pageerror', (e) => console.error('page error:', e.message));

  const list = only.length ? products.filter((p) => only.includes(p.slug)) : products;
  for (const p of list) {
    for (const a of ANGLES) {
      const q = new URLSearchParams({
        shape: p.bottle.shape,
        liquid: p.bottle.liquid,
        cap: p.bottle.cap,
        glass: p.bottle.glass,
        name: p.name,
        yaw: String(a.yaw),
        zoom: String(a.zoom),
        cy: String(a.cy),
        quality: 'high',
      });
      await page.goto(`${BASE}/__studio?${q}`, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => window.__studioReady === true, null, { timeout: 60000 });
      const dataUrl = await page.evaluate(() => document.querySelector('canvas').toDataURL('image/webp', 0.9));
      const file = path.join(OUT, `${p.slug}-${a.suffix}.webp`);
      fs.writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'));
      console.log(`rendered ${path.basename(file)} (${Math.round(fs.statSync(file).size / 1024)} KB)`);
    }
  }
  await browser.close();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
