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


test('mismatched heads are pulled toward the body proportion, species and mannequins are not', async () => {
  const { headFitScale, HEAD_FIT } = await import('../src/creature/render.js');
  const { resolveParts, speciesGenome } = await import('../src/creature/genome.js');
  const { SPECIES_BY_ID } = await import('../src/data/species.js');
  const { fuse } = await import('../src/creature/fusion.js');
  for (const s of SPECIES) {
    const g = speciesGenome(s, makeRng('fit'));
    if (!g.parts.head) continue;
    const base = resolveParts(g);
    const recipeHead = [].concat(s.recipe.head)[0];
    if (base.head && base.head.id === recipeHead) assert.equal(headFitScale(g, base), 1, s.id);
  }
  // a rabbit body wearing the wide wolf head shrinks it; a raptor body wearing the small turtle head grows it
  const rabbit = speciesGenome(SPECIES_BY_ID.bramblit, makeRng('m'));
  rabbit.species = null; rabbit.gen = 1; rabbit.parts.head = ['m.head.wolf', 'm.head.wolf'];
  const big = headFitScale(rabbit, resolveParts(rabbit));
  assert.ok(big < 0.97 && big >= HEAD_FIT.min ** HEAD_FIT.ease, `wolf head on a rabbit ${big}`);
  const raptor = speciesGenome(SPECIES_BY_ID.raptrix, makeRng('d'));
  raptor.species = null; raptor.gen = 1; raptor.parts.head = ['r.head.turtle', 'r.head.turtle'];
  const small = headFitScale(raptor, resolveParts(raptor));
  assert.ok(small > 1.05 && small <= HEAD_FIT.max ** HEAD_FIT.ease, `turtle head on a raptor ${small}`);
  const mouse = rabbit;
  const svgBig = renderCreatureSvg(mouse, { id: 't', animate: false }), svgPlain = renderCreatureSvg({ ...mouse, mannequin: true }, { id: 't', animate: false });
  assert.notEqual(svgBig, svgPlain, 'the head scale shows up in the markup');
  for (const p of PARTS.values()) if (p.slot === 'head' && !p.none) { const mg = mannequinGenome(p); assert.equal(headFitScale(mg, resolveParts(mg)), 1, p.id); }
  // fusions across the classes stay within the clamp
  for (let i = 0; i < 60; i++) {
    const a = randomGenome(makeRng(`ha${i}`)), b = randomGenome(makeRng(`hb${i}`), { clade: a.clade });
    const { child } = fuse(a, b, makeRng(`hf${i}`));
    const f = headFitScale(child, resolveParts(child));
    assert.ok(f >= HEAD_FIT.min ** HEAD_FIT.ease - 1e-9 && f <= HEAD_FIT.max ** HEAD_FIT.ease + 1e-9, `fusion ${i} fit ${f}`);
  }
});
