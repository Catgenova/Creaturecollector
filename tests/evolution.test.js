import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES, SPECIES_BY_ID } from '../src/data/species.js';
import { PARTS, getPart } from '../src/data/parts/index.js';
import { stageOf, STAGE_LEVELS, growthFor } from '../src/data/evolution.js';
import { evolvedPart } from '../src/creature/evolve.js';
import { transformPathD, pathPoints } from '../src/creature/geom.js';
import { speciesGenome } from '../src/creature/genome.js';
import { renderCreatureSvg, partBounds, measureCreature } from '../src/creature/render.js';
import { partBuilders } from '../src/data/parts/_builders.js';
import { C, L } from '../src/data/parts/_dsl.js';

function checkSvg(svg, label) {
  assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'), `${label} svg wrapper`);
  assert.ok(!/NaN|undefined|null|\[object/.test(svg), `${label} has bad tokens`);
  const open = (svg.match(/<g[\s>]/g) || []).length, close = (svg.match(/<\/g>/g) || []).length;
  assert.equal(open, close, `${label} unbalanced <g>`);
}

test('stages follow the level thresholds', () => {
  assert.deepEqual(STAGE_LEVELS, [1, 33, 66]);
  assert.equal(stageOf(1), 1); assert.equal(stageOf(32), 1); assert.equal(stageOf(33), 2); assert.equal(stageOf(65), 2); assert.equal(stageOf(66), 3); assert.equal(stageOf(100), 3);
  assert.equal(stageOf(undefined), 1);
});

test('path transforms keep the command structure', () => {
  const d = 'M0,0 L10,0 C10,5 5,10 0,10 Q-5,5 0,0Z';
  const t = transformPathD(d, (x, y) => [x * 2, y * 3]);
  assert.ok(t.startsWith('M0,0') && t.includes('L20,0') && t.endsWith('Z'), t);
  const a = pathPoints(d), b = pathPoints(t);
  assert.equal(a.length, b.length);
  assert.ok(Math.abs(b[1][0] - 20) < 1e-9);
});

test('every part evolves into a larger stage 2 and stage 3 with its sockets intact', () => {
  let grown = 0, total = 0;
  for (const [, part] of PARTS) {
    if (part.none) continue;
    total++;
    const base = partBounds(part);
    for (const stage of [2, 3]) {
      const v = evolvedPart(part, stage);
      assert.ok(v !== part && v.stage === stage && v.id === part.id, `${part.id} stage ${stage}`);
      assert.equal(evolvedPart(part, stage), v, 'cached');
      assert.ok(Array.isArray(v.prims) && v.prims.length >= part.prims.length, `${part.id} prims`);
      for (const pr of v.prims) {
        const nums = pr.t === 'path' || pr.t === 'line' ? pathPoints(pr.d).flat() : [pr.cx, pr.cy, pr.r ?? pr.rx, pr.ry ?? 0];
        assert.ok(nums.every(Number.isFinite), `${part.id} stage ${stage} has a bad number`);
      }
      if (part.sockets) assert.deepEqual(Object.keys(v.sockets), Object.keys(part.sockets), `${part.id} sockets`);
      const vb = partBounds(v);
      const area = (b) => Math.max(0.01, (b[2] - b[0]) * (b[3] - b[1]));
      const g = growthFor(part.slot)[stage];
      if (g[0] * g[1] > 1) { assert.ok(area(vb) >= area(base) * 0.98, `${part.id} stage ${stage} did not grow: ${area(vb)} vs ${area(base)}`); if (stage === 3) grown++; }
    }
    assert.equal(evolvedPart(part, 1), part);
  }
  assert.ok(grown > total * 0.7, `${grown} of ${total} parts grew at stage 3`);
});

test('hand-authored stage variants compile and take precedence', () => {
  const withStages = [...PARTS.values()].filter((p) => p.stages);
  assert.ok(withStages.length >= 4, 'some parts carry hand-authored stages');
  for (const p of withStages) for (const st of Object.keys(p.stages).map(Number)) {
    const v = evolvedPart(p, st), hand = p.stages[st];
    if (!hand.grow && !hand.spikes) assert.equal(v.prims, hand.prims, `${p.id} stage ${st} uses its hand-authored art`);
    else assert.ok(v.prims.length >= hand.prims.length, `${p.id} stage ${st} keeps its hand-authored art`);
    assert.ok(v.prims.length && (v.clip == null || Array.isArray(v.clip)), `${p.id} stage ${st} art`);
  }
});

test('stage delta keys compile: grow, add, addShapes, addBehind, reset and spikes', () => {
  const { part } = partBuilders('t.');
  const p = part({
    id: 'probe', slot: 'tail', name: 'Probe', shapes: [[[0, 0], [-20, -10], [-40, 0], [-20, 10]]], extra: [L('M0,0 L-20,0', 'k', 1)],
    sockets: { tip: { x: -40, y: 0 } },
    stages: {
      2: { grow: [1.5, 1], add: [C(-10, 0, 2, 'a')], addShapes: [[[-40, -4], [-56, 0], [-40, 4]]] },
      3: { grow: [1.2, 1.2], addBehind: [[[-30, -20], [-50, -30], [-40, -10]]], spikes: true },
    },
  });
  assert.equal(p.prims.length, 2);
  const s2 = p.stages[2], s3 = p.stages[3];
  assert.deepEqual(s2.grow, [1.5, 1]);
  assert.equal(s2.prims.length, 4, 'stage 2: two shapes + line + circle');
  assert.equal(s2.clip.length, 2);
  assert.ok(Math.abs(s3.grow[0] - 1.8) < 1e-9 && Math.abs(s3.grow[1] - 1.2) < 1e-9, 'grow compounds');
  assert.equal(s3.prims.length, 5, 'stage 3 inherits stage 2 and adds a shape behind');
  assert.equal(s3.clip.length, 3);
  assert.ok(s3.spikes);
  const v2 = evolvedPart(p, 2), v3 = evolvedPart(p, 3);
  assert.ok(Math.abs(v2.sockets.tip.x + 60) < 1e-9, 'sockets scale with grow');
  assert.ok(Math.abs(v3.sockets.tip.x + 72) < 1e-9);
  assert.ok(v3.prims.length > s3.prims.length, 'spikes were added');
  const b1 = partBounds(p), b2 = partBounds(v2), b3 = partBounds(v3);
  assert.ok(b2[0] < b1[0] && b3[0] < b2[0], 'each stage reaches further');
  const q = part({ id: 'probe2', slot: 'tail', name: 'Probe 2', shapes: [[[0, 0], [-20, -10], [-40, 0]]], stages: { 2: { grow: [2, 2] }, 3: { reset: true, grow: [1.1, 1.1] } } });
  assert.deepEqual(q.stages[3].grow, [1.1, 1.1], 'reset drops stage 2 deltas');
});

test('every species renders at every stage, larger each time', () => {
  for (const s of SPECIES) {
    const g = speciesGenome(s, makeRng(`evo-${s.id}`));
    let last = 0;
    for (const stage of [1, 2, 3]) {
      checkSvg(renderCreatureSvg(g, { id: 't', stage }), `${s.id} stage ${stage}`);
      const b = measureCreature(g, 'right', stage);
      const h = b[3] - b[1];
      assert.ok(h > last, `${s.id} stage ${stage} is not taller (${h} vs ${last})`);
      last = h;
    }
    checkSvg(renderCreatureSvg(g, { id: 't', level: 70, facing: 'left', animate: false }), `${s.id} by level`);
  }
  const g = speciesGenome(SPECIES_BY_ID.emberox, makeRng('lvl'));
  assert.equal(renderCreatureSvg(g, { id: 't', level: 40 }), renderCreatureSvg(g, { id: 't', stage: 2 }));
  assert.notEqual(renderCreatureSvg(g, { id: 't', level: 40 }), renderCreatureSvg(g, { id: 't', level: 10 }));
});
