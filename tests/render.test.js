import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES } from '../src/data/species.js';
import { PARTS } from '../src/data/parts/index.js';
import { speciesGenome, randomGenome } from '../src/creature/genome.js';
import { renderCreatureSvg, mannequinGenome } from '../src/creature/render.js';

function checkSvg(svg, label) {
  assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'), `${label} svg wrapper`);
  assert.ok(!/NaN|undefined|null|\[object/.test(svg), `${label} has bad tokens`);
  const open = (svg.match(/<g[\s>]/g) || []).length, close = (svg.match(/<\/g>/g) || []).length;
  assert.equal(open, close, `${label} unbalanced <g>`);
  assert.ok(svg.includes('clipPath'), `${label} clip`);
}

test('every species renders on several seeds, both facings', () => {
  for (const s of SPECIES) {
    for (let i = 0; i < 5; i++) {
      const g = speciesGenome(s, makeRng(`r${i}`));
      checkSvg(renderCreatureSvg(g, { id: 't' }), `${s.id}/${i}`);
      checkSvg(renderCreatureSvg(g, { id: 't', facing: 'left', animate: false }), `${s.id}/${i}/left`);
    }
  }
});

test('random creatures render', () => {
  for (let i = 0; i < 200; i++) checkSvg(renderCreatureSvg(randomGenome(makeRng(`x${i}`)), { id: 't' }), `wild ${i}`);
});

test('every part renders on the mannequin', () => {
  for (const [id, p] of PARTS) {
    if (p.none) continue;
    const svg = renderCreatureSvg(mannequinGenome(p), { id: 't', animate: false });
    checkSvg(svg, id);
  }
});

test('render is deterministic given an id', () => {
  const g = randomGenome(makeRng('det'));
  assert.equal(renderCreatureSvg(g, { id: 'a' }), renderCreatureSvg(g, { id: 'a' }));
});

test('left-facing creatures mirror only the x axis', () => {
  const g = randomGenome(makeRng('flip'));
  const left = renderCreatureSvg(g, { id: 't', facing: 'left', animate: false });
  const m = left.match(/scale\((-?[\d.]+) ([\d.]+)\)/);
  assert.ok(m, 'two-value scale present');
  assert.ok(Number(m[1]) < 0 && Number(m[2]) > 0, `scale ${m[1]} ${m[2]}`);
  assert.ok(!/scale\(-[\d.]+\)/.test(left), 'no single negative scale');
});

test('every render style draws every species cleanly', async () => {
  const { RENDER_STYLES } = await import('../src/creature/render.js');
  for (const style of RENDER_STYLES) {
    for (const s of SPECIES) {
      const g = speciesGenome(s, makeRng('style'));
      const svg = renderCreatureSvg(g, { id: 't', style, animate: false });
      checkSvg(svg, `${style}/${s.id}`);
      const clipOpen = (svg.match(/<clipPath/g) || []).length, clipClose = (svg.match(/<\/clipPath>/g) || []).length;
      assert.equal(clipOpen, clipClose, `${style}/${s.id} clipPaths`);
    }
  }
});

test('raster parts render as tinted images and never mix with vector parts', async () => {
  const { registerPart, partFits, getPart } = await import('../src/data/parts/index.js');
  const { rasterPart } = await import('../src/data/parts/raster.js');
  const png = 'data:image/png;base64,iVBORw0KGgo=';
  const body = registerPart(rasterPart({ id: 'r.mammal.body.test', clade: 'mammal', slot: 'body', name: 'test', img: { src: png, w: 400, h: 300 }, origin: [200, 160], scale: 0.25, sockets: { head: { x: 320, y: 60 }, legFront: { x: 300, y: 240 }, legBack: { x: 100, y: 240 }, tail: { x: 20, y: 120 } } }));
  const head = registerPart(rasterPart({ id: 'r.mammal.head.test', clade: 'mammal', slot: 'head', name: 'test', img: { src: png, w: 200, h: 200 }, origin: [100, 190], scale: 0.25, sockets: { crown: { x: 100, y: 10 } } }));
  const legs = registerPart(rasterPart({ id: 'r.mammal.legs.test', clade: 'mammal', slot: 'legs', name: 'test', img: { src: png, w: 100, h: 300 }, origin: [50, 20], scale: 0.15 }));
  assert.equal(body.kind, 'r-mammal');
  assert.ok(body.sockets.legs.length === 2 && body.sockets.head && body.sockets.tail);
  assert.ok(Math.abs(body.sockets.head.x - 30) < 0.01, 'pixel sockets convert to creature units');
  assert.ok(legs.len > 0);
  assert.equal(partFits(getPart('eye.round'), 'r-mammal'), false, 'vector parts do not fit raster bodies');
  assert.equal(partFits(head, 'quad'), false, 'raster parts do not fit vector bodies');
  assert.equal(partFits(head, 'r-mammal'), true);
  assert.equal(partFits(getPart('crown.none'), 'r-mammal'), true);
  const g = {
    v: 1, seed: 'r', species: null, clade: 'mammal', name: 'Test', gen: 0, shiny: false, types: ['Normal', null],
    parts: { body: [body.id, body.id], head: [head.id, head.id], eyes: ['eye.round', 'eye.round'], mouth: ['mouth.none', 'mouth.none'], crown: ['crown.none', 'crown.none'], legs: [legs.id, legs.id], arms: ['arms.none', 'arms.none'], wings: ['wings.none', 'wings.none'], tail: ['tail.none', 'tail.none'], back: ['back.none', 'back.none'], pattern: ['pattern.none', 'pattern.none'] },
    paint: {}, palette: { c1: [24, 70, 55], c2: [60, 60, 60], c3: [200, 60, 55], eye: [40, 90, 50] },
    traits: { size: 0.5, bulk: 0.5, headScale: 0.5, limbScale: 0.5, tailScale: 0.5, wingScale: 0.5, eyeScale: 0.5 }, stats: {}, vigor: {}, bst: 400, lineage: [],
  };
  for (const style of ['classic', 'studio']) {
    const svg = renderCreatureSvg(g, { id: 't', style, animate: false });
    checkSvg(svg, `raster ${style}`);
    assert.equal((svg.match(/<image /g) || []).length, 6, 'body, head, four legs');
    assert.ok(svg.includes('feComponentTransfer') && svg.includes('luminanceToAlpha'), 'tint filter present');
    assert.ok(!svg.includes('eye.round') && !/<circle/.test(svg), 'no vector eyes on a raster head');
  }
  const over = renderCreatureSvg(g, { id: 't', animate: false, images: { [body.id]: 'data:image/png;base64,QUJD' } });
  assert.ok(over.includes('base64,QUJD'), 'image overrides apply');
});
