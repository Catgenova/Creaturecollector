// Prepare an AI-generated part image: report transparency, strip a baked
// background (flood fill from the borders through background-coloured pixels,
// then through the glow ring up to the outline), drop light semi-transparent
// halo pixels, trim margins, downscale, and write a PNG.
// Usage: node scripts/prep-art.mjs <in.png> <out.png> [--max 640] [--grid grid.png]
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const [inFile, outFile] = process.argv.slice(2);
const maxDim = Number((process.argv.find((a) => a.startsWith('--max=')) || '--max=640').split('=')[1]);
const gridArg = process.argv.find((a) => a.startsWith('--grid='));
if (!inFile || !outFile) { console.error('usage: prep-art.mjs in.png out.png [--max=640] [--grid=grid.png]'); process.exit(1); }

const browser = await chromium.launch();
const page = await browser.newPage();
const dataUrl = `data:image/png;base64,${fs.readFileSync(inFile).toString('base64')}`;
const result = await page.evaluate(async ({ dataUrl, maxDim, wantGrid }) => {
  const im = new Image();
  await new Promise((res, rej) => { im.onload = res; im.onerror = rej; im.src = dataUrl; });
  const W = im.width, H = im.height;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(im, 0, 0);
  const img = ctx.getImageData(0, 0, W, H); const d = img.data;
  let transparent = 0, partial = 0;
  for (let i = 3; i < d.length; i += 4) { if (d[i] === 0) transparent++; else if (d[i] < 255) partial++; }
  const N = W * H;
  const stats = { W, H, transparentFrac: transparent / N, partialFrac: partial / N, corner: [d[0], d[1], d[2], d[3]] };
  const lum = (i) => 0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2];

  if (stats.transparentFrac < 0.02) {
    // baked background: decide if it is dark or light from the corners
    const corners = [0, W - 1, (H - 1) * W, H * W - 1].map(lum);
    const dark = corners.reduce((a, b) => a + b, 0) / 4 < 128;
    const isBg = dark ? (i) => lum(i) < 60 : (i) => lum(i) > 232;
    const isLight = (i) => lum(i) >= 60;
    const visited = new Uint8Array(N);
    const stack = [];
    const push = (i) => { if (!visited[i]) { visited[i] = 1; stack.push(i); } };
    for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
    for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
    const bg = new Uint8Array(N);
    // phase 1: background-coloured pixels connected to the border
    const flood = (accept, seeds) => {
      const st = seeds.slice();
      while (st.length) {
        const i = st.pop();
        if (!accept(i)) continue;
        bg[i] = 1;
        const x = i % W, y = (i / W) | 0;
        const nb = [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1];
        for (const j of nb) if (j >= 0 && !visited[j]) { visited[j] = 1; st.push(j); }
      }
    };
    flood(isBg, stack);
    if (dark) {
      // phase 2: the glow ring, light pixels touching the background, up to the dark outline
      const seeds = [];
      for (let i = 0; i < N; i++) if (bg[i]) { const x = i % W, y = (i / W) | 0; for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1]) if (j >= 0 && !bg[j] && isLight(j)) seeds.push(j); }
      for (const s of seeds) visited[s] = 0;
      const vis2 = new Uint8Array(N);
      const st = seeds.slice();
      while (st.length) {
        const i = st.pop();
        if (vis2[i] || bg[i]) continue; vis2[i] = 1;
        if (!isLight(i)) continue;
        bg[i] = 1;
        const x = i % W, y = (i / W) | 0;
        for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1]) if (j >= 0 && !vis2[j] && !bg[j]) st.push(j);
      }
    }
    let removed = 0;
    for (let i = 0; i < N; i++) if (bg[i]) { d[i * 4 + 3] = 0; removed++; }
    stats.removedFrac = removed / N;
    stats.bakedBackground = dark ? 'dark' : 'light';
  } else {
    // real alpha: drop light halo pixels that are semi-transparent
    let halo = 0;
    for (let i = 0; i < N; i++) { const a = d[i * 4 + 3]; if (a > 0 && a < 250 && lum(i) > 190) { d[i * 4 + 3] = 0; halo++; } }
    stats.haloFrac = halo / N;
  }
  // trim to opaque bounds with padding
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const pad = 6;
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(W - 1, x1 + pad); y1 = Math.min(H - 1, y1 + pad);
  ctx.putImageData(img, 0, 0);
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
  const k = Math.min(1, maxDim / Math.max(cw, ch));
  const out = document.createElement('canvas'); out.width = Math.round(cw * k); out.height = Math.round(ch * k);
  const octx = out.getContext('2d'); octx.imageSmoothingQuality = 'high';
  octx.drawImage(c, x0, y0, cw, ch, 0, 0, out.width, out.height);
  stats.out = { w: out.width, h: out.height, crop: [x0, y0, cw, ch], scale: k };
  const png = out.toDataURL('image/png');
  let grid = null;
  if (wantGrid) {
    const gcv = document.createElement('canvas'); gcv.width = out.width; gcv.height = out.height;
    const g = gcv.getContext('2d');
    g.fillStyle = '#2a2d3a'; g.fillRect(0, 0, gcv.width, gcv.height);
    g.drawImage(out, 0, 0);
    g.strokeStyle = 'rgba(255,80,80,0.6)'; g.fillStyle = '#ff9'; g.font = '12px sans-serif'; g.lineWidth = 1;
    for (let x = 0; x < gcv.width; x += 50) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, gcv.height); g.stroke(); g.fillText(String(x), x + 2, 12); }
    for (let y = 0; y < gcv.height; y += 50) { g.beginPath(); g.moveTo(0, y); g.lineTo(gcv.width, y); g.stroke(); g.fillText(String(y), 2, y - 2); }
    grid = gcv.toDataURL('image/png');
  }
  return { stats, png, grid };
}, { dataUrl, maxDim, wantGrid: Boolean(gridArg) });
await browser.close();
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, Buffer.from(result.png.split(',')[1], 'base64'));
if (gridArg) fs.writeFileSync(gridArg.split('=')[1], Buffer.from(result.grid.split(',')[1], 'base64'));
console.log(path.basename(inFile), JSON.stringify(result.stats));
