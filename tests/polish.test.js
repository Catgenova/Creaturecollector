import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES, SPECIES_BY_ID } from '../src/data/species.js';
import { PARTS } from '../src/data/parts/index.js';
import { pathPoints } from '../src/creature/geom.js';
import { speciesGenome, randomGenome } from '../src/creature/genome.js';
import { renderCreatureSvg, measureCreature, partBounds, mannequinGenome, isFinePrim, finePrimIndexes, LOD, FRAME } from '../src/creature/render.js';

const centroid = (pr) => {
  const pts = pr.t === 'path' || pr.t === 'line' ? pathPoints(pr.d) : [[pr.cx, pr.cy]];
  let x = 0, y = 0;
  for (const [px, py] of pts) { x += px; y += py; }
  return [x / pts.length, y / pts.length];
};

test('shading washes agree on one light: highlights sit upper-left, shades lower-right', () => {
  // Only the translucent path washes count (HL/SH); dots and eyespots drawn in the same roles are pattern, not lighting.
  const bad = [];
  for (const [, p] of PARTS) {
    if (p.none) continue;
    const b = partBounds(p);
    const cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2, w = b[2] - b[0] || 1, h = b[3] - b[1] || 1;
    p.prims.forEach((pr, i) => {
      if (pr.t !== 'path' || !pr.cl || !pr.ns || (pr.op == null ? 1 : pr.op) > 0.3) return;
      const [x, y] = centroid(pr);
      if (Math.hypot(x, y) < 12) return; // creases at the attachment point are occlusion, not direction
      const s = ((x - cx) / w + (y - cy) / h) / 2; // negative = toward the light
      if (pr.f === 'w' && s > 0.18) bad.push(`HL ${p.id}#${i} ${s.toFixed(2)}`);
      if (pr.f === 'k' && s < -0.18) bad.push(`SH ${p.id}#${i} ${s.toFixed(2)}`);
    });
  }
  assert.deepEqual(bad, [], bad.join('\n'));
});

test('fine detail is tagged consistently', () => {
  assert.ok(isFinePrim({ t: 'circle', cx: 0, cy: 0, r: 1.2, f: 'w' }));
  assert.ok(!isFinePrim({ t: 'circle', cx: 0, cy: 0, r: 3, f: 'w' }));
  assert.ok(isFinePrim({ t: 'line', d: 'M0,0 L10,0', f: 'k', w: 1 }));
  assert.ok(!isFinePrim({ t: 'line', d: 'M0,0 L10,0', f: 'k', w: 2 }));
  assert.ok(isFinePrim({ t: 'path', d: 'M0,0 L20,0 L20,20 Z', f: 'k', ns: true, cl: true, op: 0.1 }));
  assert.ok(!isFinePrim({ t: 'path', d: 'M0,0 L20,0 L20,20 Z', f: 'k', ns: true, cl: true, op: 0.3 }));
  assert.ok(isFinePrim({ t: 'path', d: 'M0,0 L3,0 L3,3 Z', f: 'a', ns: true }));
  assert.ok(!isFinePrim({ t: 'path', d: 'M0,0 L30,0 L30,30 Z', f: 'a', ns: true }));
  assert.ok(!isFinePrim({ t: 'path', d: 'M0,0 L3,0 L3,3 Z', f: 'a' }), 'outlined shapes always stay');
  let fine = 0, total = 0;
  for (const [, p] of PARTS) { if (p.none) continue; total += p.prims.length; fine += finePrimIndexes(p).size; }
  assert.ok(fine > total * 0.1 && fine < total * 0.5, `${fine}/${total} prims are fine detail`);
});

test('small renders drop fine detail but keep the eyes; detail can be forced either way', () => {
  const count = (svg) => (svg.match(/<(path|circle|ellipse)\b/g) || []).length;
  let thinner = 0;
  for (const s of SPECIES) {
    const g = speciesGenome(s, makeRng('lod'));
    const big = renderCreatureSvg(g, { id: 't', size: 200, animate: false });
    const small = renderCreatureSvg(g, { id: 't', size: 64, animate: false });
    const forcedFull = renderCreatureSvg(g, { id: 't', size: 64, detail: 'full' });
    const forcedLow = renderCreatureSvg(g, { id: 't', size: 200, detail: 'low' });
    assert.ok(count(small) <= count(big), s.id);
    assert.equal(count(forcedFull), count(big), `${s.id} full detail at 64px matches 200px`);
    assert.equal(count(forcedLow), count(small), `${s.id} low detail at 200px matches 64px`);
    if (count(small) < count(big)) thinner++;
    assert.ok(!/NaN|undefined/.test(small));
  }
  assert.ok(thinner > SPECIES.length * 0.8, `${thinner}/${SPECIES.length} species get thinner`);
  // the eye highlight (a small white dot) survives at low detail
  const eyes = [...PARTS.values()].filter((p) => p.slot === 'eyes' && !p.none && p.prims.some((pr) => pr.t === 'circle' && pr.f === 'w' && pr.r < LOD.dot));
  assert.ok(eyes.length > 5, 'eye parts with fine highlights exist');
  for (const p of eyes) {
    const pr = p.prims.find((q) => q.t === 'circle' && q.f === 'w' && q.r < LOD.dot);
    const svg = renderCreatureSvg(mannequinGenome(p), { id: 't', size: 48, animate: false });
    assert.ok(svg.includes(`<circle cx="${pr.cx}" cy="${pr.cy}" r="${pr.r}"`), `${p.id} keeps its eye highlight`);
  }
});

test('shadows are sized to the body, lighter under hovering creatures, with contact shadows under standing feet', () => {
  const shadow = (svg) => { const m = svg.match(/<ellipse class="cr-shadow" cx="([\d.-]+)" cy="(\d+)" rx="([\d.]+)" ry="([\d.]+)" fill="[^"]+" opacity="([\d.]+)"/); assert.ok(m, 'shadow present'); return { cx: +m[1], cy: +m[2], rx: +m[3], ry: +m[4], op: +m[5] }; };
  const contacts = (svg) => { const m = svg.match(/<g class="cr-contact">(.*?)<\/g>/); return m ? (m[1].match(/<ellipse/g) || []).length : 0; };
  const same = { size: 0.5, bulk: 0.5, headScale: 0.5, limbScale: 0.5, tailScale: 0.5, wingScale: 0.5, eyeScale: 0.5 };
  const mouse = { ...speciesGenome(SPECIES_BY_ID.voltmite, makeRng('s')), traits: same };
  const bear = { ...speciesGenome(SPECIES_BY_ID.bruxor, makeRng('s')), traits: same };
  const fish = { ...speciesGenome(SPECIES_BY_ID.koiwish, makeRng('s')), traits: same };
  const sm = shadow(renderCreatureSvg(mouse, { id: 't', animate: false }));
  const sb = shadow(renderCreatureSvg(bear, { id: 't', animate: false }));
  const sf = shadow(renderCreatureSvg(fish, { id: 't', animate: false }));
  assert.ok(sb.rx > sm.rx, `bear shadow ${sb.rx} wider than mouse ${sm.rx}`);
  assert.ok(sf.op < sm.op && sf.rx < sb.rx, 'hovering fish gets a lighter, smaller shadow');
  for (const s of [sm, sb, sf]) { assert.equal(s.cy, FRAME.ground); assert.ok(s.rx >= 9 && s.rx <= 60 && s.ry > 0 && s.ry < s.rx); assert.ok(s.cx > 60 && s.cx < 140, `shadow centred ${s.cx}`); }
  assert.ok(contacts(renderCreatureSvg(mouse, { id: 't', animate: false })) >= 1, 'a quadruped has contact shadows');
  assert.equal(contacts(renderCreatureSvg(fish, { id: 't', animate: false })), 0, 'a hovering fish has none');
  assert.equal(contacts(renderCreatureSvg(mouse, { id: 't', size: 48, animate: false })), 0, 'small renders skip them');
  // the shadow falls to the right (light from the upper left), for either facing
  const right = shadow(renderCreatureSvg(bear, { id: 't', facing: 'right', animate: false })), left = shadow(renderCreatureSvg(bear, { id: 't', facing: 'left', animate: false }));
  assert.ok(right.cx > FRAME.w / 2 - 2 && left.cx > FRAME.w / 2 - 2, `${right.cx} ${left.cx}`);
  // measured box covers the shadow
  for (let i = 0; i < 40; i++) {
    const g = randomGenome(makeRng(`sh${i}`));
    const svg = renderCreatureSvg(g, { id: 't', animate: false });
    const s = shadow(svg), box = measureCreature(g);
    assert.ok(box[0] <= s.cx - s.rx + 0.01 && box[2] >= s.cx + s.rx - 0.01 && box[3] >= s.cy + s.ry - 0.01, `measure covers shadow ${i}`);
    assert.ok(contacts(svg) <= 6);
  }
});
