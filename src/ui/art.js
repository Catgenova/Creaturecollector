// Art tab: bring AI-drawn part images in, set their anchors, and see them
// assembled live. Uploads live in this browser (downscaled, in localStorage)
// until their records are pasted into src/data/parts/raster.js.
import { h, clear, toast, copyText, appendChildren } from './dom.js';
import { creatureEl, section } from './common.js';
import { CLADES, CLADE_IDS, cladeName } from '../data/clades.js';
import { PARTS_BY_SLOT, registerPart, SLOT_NAMES } from '../data/parts/index.js';
import { rasterPart, rasterDefaults, RASTER_ANCHORS, RASTER_RECORDS } from '../data/parts/raster.js';

const ART_KEY = 'creaturecollector.art.v1';
const RASTER_SLOTS = ['body', 'head', 'crown', 'legs', 'arms', 'wings', 'tail', 'back'];
const art = { records: null, sel: null, anchor: 'origin', hue: 24, sat: 70, light: 55, preview: {}, clade: 'mammal', slot: 'body', images: {} };

function loadRecords() {
  if (art.records) return art.records;
  let local = [];
  try { local = JSON.parse(localStorage.getItem(ART_KEY) || '[]'); } catch { local = []; }
  art.records = local.filter((r) => r && r.id && r.img && r.img.src);
  for (const r of art.records) applyRecord(r);
  return art.records;
}

function saveRecords() {
  try { localStorage.setItem(ART_KEY, JSON.stringify(art.records)); return true; }
  catch { toast('Browser storage is full. Copy the entries you have and delete some images.'); return false; }
}

function applyRecord(rec) {
  const part = rasterPart(rec);
  registerPart(part);
  art.images[part.id] = rec.img.src;
  return part;
}

const slug = (s) => s.toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'part';

function downscale(file, max = 640) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, max / Math.max(im.width, im.height));
      const c = document.createElement('canvas');
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve({ src: c.toDataURL('image/png'), w: c.width, h: c.height });
    };
    im.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that image.')); };
    im.src = url;
  });
}

async function addFiles(files, clade, slot, rerender) {
  for (const f of files) {
    try {
      const img = await downscale(f);
      const base = `r.${clade}.${slot}.${slug(f.name)}`;
      let id = base, n = 2;
      while (art.records.some((r) => r.id === id)) id = `${base}-${n++}`;
      const rec = { id, clade, slot, name: slug(f.name), img, ...rasterDefaults(slot, img.w, img.h), sockets: {} };
      art.records.push(rec);
      applyRecord(rec);
      art.sel = rec.id; art.anchor = 'origin';
      art.preview[`${clade}.${slot}`] = rec.id;
    } catch (e) { toast(e.message); }
  }
  saveRecords();
  rerender();
}

function allRasterRecords() {
  // committed records first (from raster.js), then local uploads
  const committed = RASTER_RECORDS.map((r) => ({ ...r, committed: true }));
  return [...committed, ...art.records];
}

function recordById(id) { return allRasterRecords().find((r) => r.id === id) || null; }

/** Test genome from the chosen preview parts of one class. */
function previewGenome(clade) {
  const pick = (slot) => art.preview[`${clade}.${slot}`] || (PARTS_BY_SLOT[slot].find((p) => p.img && p.clade === clade) || {}).id || `${slot}.none`;
  const body = pick('body');
  if (!body || body === 'body.none') return null;
  const parts = { body: [body, body], eyes: ['eye.round', 'eye.round'], mouth: ['mouth.none', 'mouth.none'], pattern: ['pattern.none', 'pattern.none'] };
  for (const slot of RASTER_SLOTS) if (slot !== 'body') parts[slot] = [pick(slot), pick(slot)];
  return {
    v: 1, seed: 'art', species: null, clade, name: 'Test', gen: 0, shiny: false, types: ['Normal', null], parts, paint: {},
    palette: { c1: [art.hue, art.sat, art.light], c2: [(art.hue + 40) % 360, art.sat, art.light + 10], c3: [(art.hue + 180) % 360, 70, 55], eye: [40, 90, 50] },
    traits: { size: 0.7, bulk: 0.5, headScale: 0.5, limbScale: 0.5, tailScale: 0.5, wingScale: 0.5, eyeScale: 0.5 }, stats: {}, vigor: {}, bst: 400, lineage: [],
  };
}

function entryJson(rec) {
  const { committed, img, ...rest } = rec;
  return JSON.stringify({ ...rest, img: { src: `assets/parts/${rec.clade}/${rec.slot}/${rec.name}.png`, w: img.w, h: img.h } }, null, 2);
}

export function renderArtScreen(root) {
  loadRecords();
  clear(root);
  const rerender = () => renderArtScreen(root);
  const records = allRasterRecords();

  // ---- upload row ----
  const cladeSel = h('select', { 'aria-label': 'Class' }, CLADE_IDS.map((c) => h('option', { value: c, selected: art.clade === c }, CLADES[c].name)));
  const slotSel = h('select', { 'aria-label': 'Slot' }, RASTER_SLOTS.map((s) => h('option', { value: s, selected: art.slot === s }, SLOT_NAMES[s])));
  cladeSel.addEventListener('change', () => { art.clade = cladeSel.value; rerender(); });
  slotSel.addEventListener('change', () => { art.slot = slotSel.value; });
  const file = h('input', { type: 'file', accept: 'image/png,image/webp,image/jpeg', multiple: true, style: { display: 'none' } });
  file.addEventListener('change', () => addFiles([...file.files], cladeSel.value, slotSel.value, rerender));
  appendChildren(root, [
    h('p', { class: 'hint' }, 'Bring in AI-drawn parts, set where they attach, and see them assembled. Images stay in this browser until their entries are pasted into the repo.'),
    h('div', { class: 'toolbar' }, cladeSel, slotSel, h('button', { class: 'btn primary', type: 'button', onclick: () => file.click() }, 'Add images'), file),
  ]);

  // ---- part list for the current class ----
  const mine = records.filter((r) => r.clade === art.clade);
  const list = h('div', { class: 'chips-row' });
  for (const r of mine) list.append(h('button', { class: `btn small${art.sel === r.id ? ' on' : ''}`, type: 'button', onclick: () => { art.sel = r.id; art.anchor = 'origin'; art.preview[`${r.clade}.${r.slot}`] = r.id; rerender(); } }, `${SLOT_NAMES[r.slot]}: ${r.name}${r.committed ? ' ✓' : ''}`));
  appendChildren(root, section(`${cladeName(art.clade)} parts · ${mine.length}`, mine.length ? list : h('p', { class: 'hint' }, 'No images yet for this class. Add the style-test images above.')));

  // ---- preview ----
  const g = previewGenome(art.clade);
  const hue = h('input', { type: 'range', min: 0, max: 359, value: art.hue, 'aria-label': 'Hue' });
  const sat = h('input', { type: 'range', min: 0, max: 100, value: art.sat, 'aria-label': 'Saturation' });
  const light = h('input', { type: 'range', min: 20, max: 85, value: art.light, 'aria-label': 'Lightness' });
  const previewBox = h('div', { class: 'hero art-preview' });
  const drawPreview = () => { clear(previewBox); const gg = previewGenome(art.clade); if (gg) previewBox.append(creatureEl(gg, { size: 280, fit: true, animate: true, images: art.images })); else previewBox.append(h('p', { class: 'hint' }, 'Add a body image to start the preview.')); };
  for (const [el, key] of [[hue, 'hue'], [sat, 'sat'], [light, 'light']]) el.addEventListener('input', () => { art[key] = Number(el.value); drawPreview(); });
  drawPreview();
  const slotPickers = h('div', { class: 'chips-row' });
  for (const slot of RASTER_SLOTS) {
    const options = mine.filter((r) => r.slot === slot);
    if (!options.length) continue;
    const sel = h('select', { 'aria-label': `${SLOT_NAMES[slot]} part` }, slot === 'body' ? [] : [h('option', { value: `${slot}.none` }, `${SLOT_NAMES[slot]}: none`)], options.map((r) => h('option', { value: r.id, selected: art.preview[`${art.clade}.${slot}`] === r.id }, `${SLOT_NAMES[slot]}: ${r.name}`)));
    sel.addEventListener('change', () => { art.preview[`${art.clade}.${slot}`] = sel.value; drawPreview(); });
    slotPickers.append(sel);
  }
  appendChildren(root, section('Assembled preview', previewBox, h('div', { class: 'sliders' }, h('label', {}, 'Hue', hue), h('label', {}, 'Saturation', sat), h('label', {}, 'Lightness', light)), slotPickers));

  // ---- anchor editor ----
  const rec = art.sel ? recordById(art.sel) : null;
  if (rec) {
    const anchors = RASTER_ANCHORS[rec.slot] || ['origin'];
    const pos = (name) => (name === 'origin' ? { x: rec.origin[0], y: rec.origin[1] } : rec.sockets && rec.sockets[name]) || null;
    const W = rec.img.w, H = rec.img.h;
    const marks = anchors.map((a) => { const p = pos(a); return p ? `<g class="mark${a === art.anchor ? ' active' : ''}"><circle cx="${p.x}" cy="${p.y}" r="${W * 0.018}"/><text x="${p.x + W * 0.025}" y="${p.y - W * 0.02}" font-size="${W * 0.035}">${a}</text></g>` : ''; }).join('');
    const stage = h('div', { class: 'art-stage', html: `<svg viewBox="0 0 ${W} ${H}" class="art-svg"><image href="${rec.img.src}" width="${W}" height="${H}"/>${marks}</svg>` });
    const svg = stage.firstElementChild;
    svg.addEventListener('pointerdown', (e) => {
      if (rec.committed) { toast('This part is committed. Edit its record in raster.js.'); return; }
      const r = svg.getBoundingClientRect();
      const x = Math.round(((e.clientX - r.left) / r.width) * W), y = Math.round(((e.clientY - r.top) / r.height) * H);
      if (art.anchor === 'origin') rec.origin = [x, y];
      else { rec.sockets = rec.sockets || {}; rec.sockets[art.anchor] = { x, y }; }
      applyRecord(rec); saveRecords(); rerender();
    });
    const anchorRow = h('div', { class: 'chips-row' }, anchors.map((a) => h('button', { class: `btn small${art.anchor === a ? ' on' : ''}${pos(a) ? '' : ' missing'}`, type: 'button', onclick: () => { art.anchor = a; rerender(); } }, a)));
    const size = h('input', { type: 'range', min: 10, max: 160, value: Math.round(rec.scale * rec.img.w), 'aria-label': 'Size in creature units' });
    size.addEventListener('input', () => { if (rec.committed) return; rec.scale = Number(size.value) / rec.img.w; applyRecord(rec); drawPreview(); });
    size.addEventListener('change', () => { saveRecords(); rerender(); });
    appendChildren(root, section(`Anchors · ${rec.name}`,
      h('p', { class: 'hint' }, 'Pick an anchor, then tap the image where it belongs. Origin is the point that sits on the parent socket: the neck cut on a head, the hip cut on a leg, the centre of a body.'),
      anchorRow, stage,
      h('div', { class: 'sliders' }, h('label', {}, `Width ${Math.round(rec.scale * rec.img.w)}`, size)),
      h('div', { class: 'row wrap' },
        h('button', { class: 'btn', type: 'button', onclick: async () => toast((await copyText(entryJson(rec))) ? 'Entry copied. Paste it to me or into raster.js.' : 'Copy failed') }, 'Copy entry'),
        rec.committed ? null : h('button', { class: 'btn danger', type: 'button', onclick: () => { art.records = art.records.filter((r) => r !== rec); art.sel = null; saveRecords(); rerender(); } }, 'Delete image'))));
  }
}
