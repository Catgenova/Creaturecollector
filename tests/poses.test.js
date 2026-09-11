import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/core/rng.js';
import { SPECIES } from '../src/data/species.js';
import { RIGS, slotsFor } from '../src/data/rigs.js';
import { PARTS } from '../src/data/parts/index.js';
import { POSES, POSE_NAMES, IDLE_BY_STYLE, poseTable, idlePoseFor, resolvePose } from '../src/data/poses.js';
import { speciesGenome, randomGenome, combatStyleOf } from '../src/creature/genome.js';
import { fuse } from '../src/creature/fusion.js';
import { renderCreatureSvg, measureCreature, mannequinGenome, FRAME } from '../src/creature/render.js';

test('every rig has every pose, naming only its own slots with bounded deltas', () => {
  for (const rig of Object.keys(RIGS)) {
    assert.ok(POSES[rig], `${rig} has poses`);
    for (const name of POSE_NAMES) {
      const table = poseTable(rig, name);
      assert.ok(table, `${rig}/${name}`);
      if (name === 'stand') assert.deepEqual(table, {});
      else assert.ok(Object.keys(table).length >= 3, `${rig}/${name} moves a few slots`);
      for (const [slot, d] of Object.entries(table)) {
        assert.ok(slotsFor(rig).includes(slot), `${rig}/${name} names unknown slot ${slot}`);
        const check = (dd, tag) => {
          for (const k of Object.keys(dd)) assert.ok(['dx', 'dy', 'da', 'ds', 'far'].includes(k), `${tag} key ${k}`);
          assert.ok(Math.abs(dd.da || 0) <= 35 && Math.abs(dd.dx || 0) <= 12 && Math.abs(dd.dy || 0) <= 12, `${tag} delta size`);
          if (dd.ds != null) assert.ok(dd.ds >= 0.7 && dd.ds <= 1.3, `${tag} scale`);
        };
        check(d, `${rig}/${name}/${slot}`);
        if (d.far) check(d.far, `${rig}/${name}/${slot}/far`);
      }
    }
  }
  assert.deepEqual(poseTable('mammal', 'nope'), {});
});

test('idle pose follows temperament; explicit poses win; mannequins stand', () => {
  const seen = new Set();
  for (const s of SPECIES) {
    const g = speciesGenome(s, makeRng('pose'));
    const idle = idlePoseFor(g);
    assert.equal(idle, IDLE_BY_STYLE[combatStyleOf(g)], s.id);
    seen.add(idle);
    assert.equal(resolvePose(g, undefined), idle);
    assert.equal(resolvePose(g, 'attack'), 'attack');
    assert.equal(resolvePose(g, 'bogus'), idle);
  }
  assert.equal(seen.size, 3, 'all three idle poses occur across the species');
  const m = mannequinGenome([...PARTS.values()].find((p) => p.slot === 'head' && !p.none));
  assert.equal(resolvePose(m, undefined), 'stand');
});

test('every species renders in every pose, differently from standing, and stays on the ground', () => {
  for (const s of SPECIES) {
    const g = speciesGenome(s, makeRng('p'));
    const stand = renderCreatureSvg(g, { id: 't', animate: false, pose: 'stand' });
    for (const name of POSE_NAMES) {
      const svg = renderCreatureSvg(g, { id: 't', animate: false, pose: name });
      assert.ok(!/NaN|undefined/.test(svg), `${s.id}/${name}`);
      const open = (svg.match(/<g[\s>]/g) || []).length, close = (svg.match(/<\/g>/g) || []).length;
      assert.equal(open, close, `${s.id}/${name} balanced`);
      if (name !== 'stand') assert.notEqual(svg, stand, `${s.id}/${name} changes the drawing`);
      const box = measureCreature(g, 'right', 1, name);
      assert.ok(box[3] >= FRAME.ground - 0.01 && box[3] <= FRAME.h + 8, `${s.id}/${name} grounded (${box[3]})`);
      assert.ok(box[1] > 0 && box[0] > -60 && box[2] < FRAME.w + 60, `${s.id}/${name} in frame ${box}`);
    }
    const idle = renderCreatureSvg(g, { id: 't', animate: false });
    assert.equal(idle, renderCreatureSvg(g, { id: 't', animate: false, pose: idlePoseFor(g) }), `${s.id} default is the idle pose`);
  }
  for (let i = 0; i < 30; i++) {
    const a = randomGenome(makeRng(`pa${i}`)), b = randomGenome(makeRng(`pb${i}`), { clade: a.clade });
    const { child } = fuse(a, b, makeRng(`pf${i}`));
    for (const name of ['attack', 'hurt']) assert.ok(!/NaN|undefined/.test(renderCreatureSvg(child, { id: 't', pose: name, animate: false })));
  }
});
