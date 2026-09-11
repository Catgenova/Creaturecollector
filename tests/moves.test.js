import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MOVES, STRUGGLE, getMove, PP_RULE, ppFor, moveEffects, accuracyText } from '../src/data/moves.js';

const plain = (power, extra = {}) => ({ id: 'x', cat: 'melee', power, acc: 100, prio: 0, crit: 0, fx: [], ...extra });

test('PP falls as power rises and again for each strong side effect', () => {
  const allowed = new Set(PP_RULE.bands.map(([, pp]) => pp).concat(Object.values(PP_RULE.status)));
  for (const mv of MOVES) assert.ok(allowed.has(mv.pp) && mv.pp === ppFor(mv), `${mv.id} ${mv.pp}`);
  assert.equal(STRUGGLE.pp, 1, 'Struggle keeps its token PP');
  let last = Infinity;
  for (const power of [10, 40, 41, 50, 60, 70, 80, 90, 100, 101, 130, 200]) { const pp = ppFor(plain(power)); assert.ok(pp <= last, `${power}: ${pp} > ${last}`); last = pp; }
  assert.equal(ppFor(plain(40)), 35); assert.equal(ppFor(plain(60)), 25); assert.equal(ppFor(plain(80)), 15); assert.equal(ppFor(plain(100)), 10); assert.equal(ppFor(plain(120)), 5);
  // one band per strong extra, floored at the last band
  assert.equal(ppFor(plain(40, { fx: [{ k: 'status', s: 'brn', p: 10 }] })), 35, 'a 10% status is not strong');
  assert.equal(ppFor(plain(40, { fx: [{ k: 'status', s: 'psn', p: 30 }] })), 30);
  assert.equal(ppFor(plain(40, { fx: [{ k: 'status', s: 'par', p: 100 }] })), 25, 'a guaranteed status costs two bands');
  assert.equal(ppFor(plain(40, { fx: [{ k: 'flinch', p: 30 }] })), 30);
  assert.equal(ppFor(plain(40, { fx: [{ k: 'flinch', p: 10 }] })), 35);
  assert.equal(ppFor(plain(40, { fx: [{ k: 'stat', who: 'foe', stats: { spe: -1 }, p: 100 }] })), 30);
  assert.equal(ppFor(plain(40, { fx: [{ k: 'stat', who: 'self', stats: { magic: -2 }, p: 100 }] })), 35, 'a self debuff is a drawback, not a strength');
  assert.equal(ppFor(plain(40, { fx: [{ k: 'drain', r: 0.5 }] })), 30);
  assert.equal(ppFor(plain(40, { fx: [{ k: 'recoil', r: 0.33 }] })), 35, 'recoil is a drawback');
  assert.equal(ppFor(plain(40, { prio: 1 })), 30); assert.equal(ppFor(plain(80, { prio: 2 })), 5);
  assert.equal(ppFor(plain(130, { fx: [{ k: 'status', s: 'brn', p: 30 }, { k: 'flinch', p: 30 }] })), 5, 'never below the last band');
  assert.equal(ppFor(plain(18, { fx: [{ k: 'multi', min: 2, max: 5 }] })), 25, 'multi-hit moves count three hits');
  assert.equal(ppFor(plain(0, { fx: [{ k: 'fixed', v: 'level' }] })), 25);
  // the table follows
  const pp = (id) => getMove(id).pp;
  assert.equal(pp('bump'), 35); assert.equal(pp('dash'), 30); assert.equal(pp('headbonk'), 15); assert.equal(pp('blur'), 5);
  assert.equal(pp('venom_stab'), 10); assert.equal(pp('geyser'), 5); assert.equal(pp('sap_drain'), 10); assert.equal(pp('static_net'), 20);
  for (const mv of MOVES) if (mv.cat !== 'status' && !mv.fx.length && !mv.prio) for (const o of MOVES) if (o.cat !== 'status' && o.power === mv.power) assert.ok(o.pp <= mv.pp, `${o.id} has more PP than plain ${mv.id}`);
});

test('status moves: sleep and freeze 10, other statuses 15, heals 10, sharp stat changes 20, others 30', () => {
  const st = (fx) => ppFor({ id: 's', cat: 'status', power: 0, acc: 100, prio: 0, crit: 0, fx });
  assert.equal(st([{ k: 'status', s: 'slp', p: 100 }]), 10); assert.equal(st([{ k: 'status', s: 'frz', p: 100 }]), 10);
  assert.equal(st([{ k: 'status', s: 'par', p: 100 }]), 15); assert.equal(st([{ k: 'status', s: 'psn', p: 100 }]), 15); assert.equal(st([{ k: 'status', s: 'brn', p: 100 }]), 15);
  assert.equal(st([{ k: 'heal', r: 0.5 }]), 10);
  assert.equal(st([{ k: 'stat', who: 'self', stats: { melee: 2 }, p: 100 }]), 20);
  assert.equal(st([{ k: 'stat', who: 'self', stats: { melee: 1, ranged: 1, spe: 1 }, p: 100 }]), 20, 'three stats at once is sharp');
  assert.equal(st([{ k: 'stat', who: 'foe', stats: { acc: -1 }, p: 100 }]), 20, 'accuracy drops are sharp');
  assert.equal(st([{ k: 'stat', who: 'foe', stats: { melee: -1, ranged: -1 }, p: 100 }]), 30);
  assert.equal(st([]), 30);
  const pp = (id) => getMove(id).pp;
  assert.equal(pp('lull'), 10); assert.equal(pp('toxin_dust'), 15); assert.equal(pp('mend'), 10); assert.equal(pp('web_shot'), 20); assert.equal(pp('yowl'), 30); assert.equal(pp('brace'), 30);
});

test('accuracy and side effects read as short plain words with their odds', () => {
  const fx = (id) => moveEffects(getMove(id));
  assert.equal(accuracyText(getMove('bump')), '100% acc');
  assert.equal(accuracyText(getMove('brace')), 'never misses');
  assert.equal(accuracyText(getMove('ram')), '85% acc');
  assert.deepEqual(fx('bump'), []);
  assert.deepEqual(fx('headbonk'), ['30% flinch']);
  assert.deepEqual(fx('belly_flop'), ['30% paralysis']);
  assert.deepEqual(fx('cinder'), ['10% burn']);
  assert.deepEqual(fx('ghostflame'), ['burns']);
  assert.deepEqual(fx('drowse_dust'), ['puts to sleep']);
  assert.deepEqual(fx('kindle_rush'), ['+1 own Speed']);
  assert.deepEqual(fx('acid_spit'), ['−2 foe Magic Def']);
  assert.deepEqual(fx('ripple'), ['20% −1 foe Magic Def']);
  assert.deepEqual(fx('whetting'), ['+2 own Melee Atk, Ranged Atk']);
  assert.deepEqual(fx('primal_surge'), ['10% +1 own all stats']);
  assert.deepEqual(fx('all_out_brawl'), ['−1 own all defences']);
  assert.deepEqual(fx('sap_drain'), ['drains 50%']);
  assert.deepEqual(fx('ram'), ['25% recoil']);
  assert.deepEqual(fx('mend'), ['heals 50% HP']);
  assert.deepEqual(fx('flurry'), ['hits 2–5×']);
  assert.deepEqual(fx('wraith_touch'), ['damage = level']);
  assert.deepEqual(fx('curse_bolt'), ['×2 vs status']);
  assert.deepEqual(fx('dash'), ['priority +1']);
  assert.deepEqual(fx('snowslide'), ['priority −4']);
  assert.deepEqual(fx('rake'), ['high crit']);
  assert.deepEqual(fx('ember_bite'), ['10% burn', '10% flinch']);
  assert.deepEqual(fx('blaze_tackle'), ['33% recoil', '10% burn']);
  for (const mv of MOVES) for (const t of fx(mv.id)) assert.ok(t.length > 0 && t.length <= 60, `${mv.id}: ${t}`);
});
