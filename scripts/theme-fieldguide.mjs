// Theme study 1 of 3: Field Guide. Builds shots/theme-fieldguide.html — three phone screens on a board, drawn
// with the game's own creature renderer and its own species, stats, moves, items and prices, so what the board
// shows is what the theme would actually have to hold.
//
// The frame is the point of the study: every rule is an inked SVG path rather than a CSS border. Four edge tiles
// that repeat, one corner asset placed four times by transform, butt caps so the seams do not blot, and a
// registration mark at the centre of the top and bottom edges. Run: node scripts/theme-fieldguide.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SPECIES } from '../src/data/species.js';
import { speciesGenome, baseStats } from '../src/creature/genome.js';
import { renderCreatureSvg } from '../src/creature/render.js';
import { makeRng } from '../src/core/rng.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const art = (id, seed, size, facing = 'right', stage = 1) => {
  const s = SPECIES.find((x) => x.id === id);
  return renderCreatureSvg(speciesGenome(s, makeRng(seed)), { size, facing, stage, fit: true, animate: false, detail: 'full' });
};
const snapperGenome = speciesGenome(SPECIES.find((s) => s.id === 'phantomsnapper'), makeRng('guide:1'));
const base = baseStats(snapperGenome);

// --- the drawn parts ------------------------------------------------------------------------------
// Every rule in this theme is an inked path, not a CSS border: the line wanders by a third of a pixel
// so it reads as something laid down by hand rather than computed. The tiles start and end at the same
// y so they repeat seamlessly, and each carries both rules of the double frame at once.
const INK = '#2b251d';
const du = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}")`;

const ruleH = (w = 1) => du(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="9" viewBox="0 0 96 9">
  <g fill="none" stroke="${INK}" stroke-linecap="round">
    <path d="M0 1.5 C 9 1.18 15 1.79 24 1.44 S 41 1.19 48 1.56 S 65 1.83 72 1.38 S 88 1.23 96 1.5" stroke-width="${w}"/>
    <path d="M0 6.5 C 11 6.72 18 6.28 27 6.6 S 44 6.79 52 6.4 S 69 6.24 77 6.62 S 89 6.71 96 6.5" stroke-width=".5" opacity=".85"/>
  </g></svg>`);

const ruleV = (w = 1) => du(`<svg xmlns="http://www.w3.org/2000/svg" width="9" height="96" viewBox="0 0 9 96">
  <g fill="none" stroke="${INK}" stroke-linecap="round">
    <path d="M1.5 0 C 1.18 9 1.79 15 1.44 24 S 1.19 41 1.56 48 S 1.83 65 1.38 72 S 1.23 88 1.5 96" stroke-width="${w}"/>
    <path d="M6.5 0 C 6.72 11 6.28 18 6.6 27 S 6.79 44 6.4 52 S 6.24 69 6.62 77 S 6.71 89 6.5 96" stroke-width=".5" opacity=".85"/>
  </g></svg>`);

// The corner: the outer rule turns square with a hair of a radius, the inner rule is chamfered off at
// 45 degrees the way an engraved plate is, and a lozenge sits in the triangle the chamfer leaves behind.
const corner = (w = 1) => du(`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
  <g fill="none" stroke="${INK}" stroke-linecap="butt" stroke-linejoin="round">
    <path d="M22 1.5 H3.1 Q1.5 1.5 1.5 3.1 V22" stroke-width="${w}"/>
    <path d="M22 6.5 H12.1 L6.5 12.1 V22" stroke-width=".5" opacity=".85"/>
  </g>
  <path d="M4.6 3.05 L6.15 4.6 L4.6 6.15 L3.05 4.6 Z" fill="${INK}" opacity=".9"/>
</svg>`);

// A registration mark, as a printing plate carries at the middle of each edge.
const reg = du(`<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11">
  <g fill="none" stroke="${INK}" stroke-width=".55" stroke-linecap="round">
    <path d="M5.5 0 V11 M0 5.5 H11"/><circle cx="5.5" cy="5.5" r="2.4"/>
  </g></svg>`);

// A swelled rule: thick at the middle, tapering to nothing at both ends. One per screen, no more.
const swell = du(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="7" viewBox="0 0 300 7" preserveAspectRatio="none">
  <path d="M0 3.5 Q 78 2.35 150 2.3 Q 222 2.35 300 3.5 Q 222 4.65 150 4.7 Q 78 4.65 0 3.5 Z" fill="${INK}"/></svg>`);

// A hairline with a lozenge on the left, for the smaller breaks.
const minor = du(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="7" viewBox="0 0 300 7" preserveAspectRatio="none">
  <path d="M8 3.5 H300" stroke="${INK}" stroke-width=".6" opacity=".55" fill="none"/>
  <path d="M3 1.6 L4.9 3.5 L3 5.4 L1.1 3.5 Z" fill="${INK}" opacity=".75"/></svg>`);

// Paper. Fine grain, multiplied in at six percent — enough to take the flatness off, not enough to notice.
const grain = du(`<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150">
  <filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="4" stitchTiles="stitch"/>
  <feColorMatrix type="saturate" values="0"/></filter><rect width="150" height="150" filter="url(#g)" opacity=".38"/></svg>`);

const PAPER_TYPE = { Ghost: 'hsl(258 34% 40%)', Rock: 'hsl(43 42% 32%)', Water: 'hsl(218 62% 38%)', Normal: 'hsl(45 25% 36%)' };

const STATS = [['Health', base.hp, 'hp'], ['Melee', base.melee], ['Ranged', base.ranged], ['Magic', base.magic], ['Melee def.', base.meleeDef], ['Ranged def.', base.rangedDef], ['Magic def.', base.magicDef], ['Speed', base.spe]];
const statRow = ([label, v]) => {
  const pct = Math.min(100, (v / 140) * 100);
  return `<div class="st"><span class="st-l">${label}</span>
    <span class="measure"><i class="tick" style="left:25%"></i><i class="tick" style="left:50%"></i><i class="tick" style="left:75%"></i><b style="width:${pct.toFixed(1)}%"></b></span>
    <span class="st-v">${v}</span></div>`;
};

const ITEMS = [['Potion', 'Restores 20 health.', '#7fe38a', '300'], ['Super Potion', 'Restores 60 health.', '#4fb7ff', '700'],
  ['Hyper Potion', 'Restores 150 health.', '#b98cff', '1,500'], ['Max Potion', 'Restores all health.', '#ffd166', '2,500'],
  ['Full Restore', 'Restores all health, and cures any affliction.', '#ff7ab6', '3,000']];
const itemRow = ([n, d, c, p], held) => `<div class="lrow">
  <span class="dot" style="--d:${c}"></span>
  <span class="lrow-t"><b>${n}</b>${held ? `<em class="held">in the bag, ${held}</em>` : ''}<i>${d}</i></span>
  <span class="price">${p}<u>g</u></span></div>`;

const MOVES = [['Cold Lick', 'Ghost', 'Melee', '30', '30/30'], ['Shroud Call', 'Ghost', 'Status', '—', '30/30'],
  ['Shade Step', 'Ghost', 'Melee', '40', '15/15'], ['Primal Surge', 'Rock', 'Magic', '60', '10/10']];
const moveCell = ([n, t, c, p, pp], on) => `<button class="mv${on ? ' on' : ''}">
  <span class="mv-n">${n}</span>
  <span class="mv-m"><i class="tm" style="--t:${PAPER_TYPE[t]}"></i>${t.toUpperCase()} · ${c.toUpperCase()}</span>
  <span class="mv-f">${p === '—' ? '' : `<b>${p}</b> pow · `}${pp} pp</span></button>`;

const cornerSm = (w = 0.9) => du(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <g fill="none" stroke="${INK}" stroke-linecap="butt" stroke-linejoin="round">
    <path d="M16 1.4 H2.9 Q1.4 1.4 1.4 2.9 V16" stroke-width="${w}"/>
    <path d="M16 5.4 H9.4 L5.4 9.4 V16" stroke-width=".45" opacity=".8"/>
  </g>
  <path d="M4 2.7 L5.3 4 L4 5.3 L2.7 4 Z" fill="${INK}" opacity=".85"/></svg>`);

const frame = (cls, body) => `<div class="frame ${cls}"><i class="e top"></i><i class="e bot"></i><i class="e lft"></i><i class="e rgt"></i>
  <i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i>
  <i class="r rt"></i><i class="r rb"></i>${body}</div>`;

const note = (top, left, w, text, dir) => `<div class="note" style="top:${top}px;left:${left}px;width:${w}px"><span class="lead ${dir}"></span>${text}</div>`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Field Guide</title><style>
:root{
  --ink:#2b251d; --ink2:#6d6455; --ink3:#9b917e; --paper:#f4efe4; --paper2:#efe8da; --board:#ddd4c2;
  --rule:#b9ae98; --red:#a8321e; --ochre:#8a6a23;
  --serif:'Iowan Old Style',Charter,'Bitstream Charter','Palatino Linotype',Palatino,'Book Antiqua',Georgia,serif;
  --sans:-apple-system,'Helvetica Neue','Liberation Sans',system-ui,sans-serif;
  --rule-h:${ruleH()}; --rule-v:${ruleV()}; --corner:${corner()}; --corner-sm:${cornerSm()};
  --reg:${reg}; --swell:${swell}; --minor:${minor};
}
*{box-sizing:border-box} html,body{margin:0}
body{background:var(--board);font-family:var(--serif);color:var(--ink);-webkit-font-smoothing:antialiased}
body::after{content:'';position:fixed;inset:0;background-image:${grain};opacity:.07;mix-blend-mode:multiply;pointer-events:none}

/* --- the frame: four inked edges, four drawn corners, two registration marks ------------------- */
.frame{position:relative}
.frame>.e{position:absolute;background-repeat:repeat}
.frame>.e.top,.frame>.e.bot{left:21.5px;right:21.5px;height:9px;background-image:var(--rule-h);background-repeat:repeat-x}
.frame>.e.top{top:0} .frame>.e.bot{bottom:0;transform:scaleY(-1)}
.frame>.e.lft,.frame>.e.rgt{top:21.5px;bottom:21.5px;width:9px;background-image:var(--rule-v);background-repeat:repeat-y}
.frame>.e.lft{left:0} .frame>.e.rgt{right:0;transform:scaleX(-1)}
.frame>.c{position:absolute;width:22px;height:22px;background-image:var(--corner);background-size:22px 22px}
.frame>.c.tl{top:0;left:0} .frame>.c.tr{top:0;right:0;transform:scaleX(-1)}
.frame>.c.bl{bottom:0;left:0;transform:scaleY(-1)} .frame>.c.br{bottom:0;right:0;transform:scale(-1)}
.frame>.r{position:absolute;left:50%;width:11px;height:11px;margin-left:-5.5px;background-image:var(--reg);opacity:.5}
.frame>.r.rt{top:-4px} .frame>.r.rb{bottom:-4px}

/* the ornament scales with the box: a 140px plate does not get a 22px corner */
.frame.sm>.c{width:16px;height:16px;background-image:var(--corner-sm);background-size:16px 16px}
.frame.sm>.e.top,.frame.sm>.e.bot{left:15.5px;right:15.5px}
.frame.sm>.e.lft,.frame.sm>.e.rgt{top:15.5px;bottom:15.5px}
.frame.sm>.r{display:none}

/* --- the page ---------------------------------------------------------------------------------- */
.screen{width:390px;height:844px;background:var(--paper);position:relative;overflow:hidden;
  box-shadow:0 1px 0 rgba(255,255,255,.5) inset, 0 6px 18px -8px rgba(60,48,30,.45), 0 1px 2px rgba(60,48,30,.3)}
.pad{padding:0 22px}
.runhead{display:flex;align-items:baseline;gap:8px;padding:14px 22px 0;font-family:var(--sans);
  font-size:8.5px;letter-spacing:.19em;text-transform:uppercase;color:var(--ink2)}
.runhead .folio{margin-left:auto;font-variant-numeric:tabular-nums;color:var(--ink)}
.swell{height:7px;margin:7px 22px 0;background-image:var(--swell);background-size:100% 7px;background-repeat:no-repeat;opacity:.9}
.minor{height:7px;margin:11px 0 7px;background-image:var(--minor);background-size:100% 7px;background-repeat:no-repeat}
.eyebrow{font-family:var(--sans);font-size:8.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink2);margin:0 0 5px}

/* the plate */
.plate{margin:14px 22px 0;padding:13px 14px 9px;background:var(--paper2)}
.plate .art{display:flex;justify-content:center;align-items:center;min-height:166px}
.plate .art svg{height:162px;width:auto}
.plate .caption{font-size:10.5px;font-style:italic;color:var(--ink2);text-align:center;margin:8px 6px 0;line-height:1.35}

/* the specimen head */
.name{font-size:31px;line-height:1.03;margin:14px 0 0;letter-spacing:-.01em}
.binom{font-style:italic;font-size:13.5px;color:var(--ink2);margin:3px 0 0}
.catline{font-family:var(--sans);font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink2);
  margin:8px 0 0;font-variant-numeric:tabular-nums}
.marks{display:flex;gap:16px;margin:9px 0 0;font-family:var(--sans);font-size:9.5px;letter-spacing:.15em;text-transform:uppercase}
.marks span{display:inline-flex;align-items:center;gap:6px}
.tm{width:8px;height:8px;background:var(--t);display:inline-block;box-shadow:0 0 0 .5px rgba(43,37,29,.55)}
.field-note{font-size:14px;font-style:italic;line-height:1.5;margin:12px 0 0;color:var(--ink)}
.field-note::first-letter{font-style:normal;font-size:15px}

/* stats: an instrument scale, not a progress bar */
.st{display:grid;grid-template-columns:74px 1fr 30px;align-items:center;gap:0 11px;padding:3.4px 0;font-size:12.5px}
.st-l{color:var(--ink2)} 
.st-v{text-align:right;font-family:var(--sans);font-size:11.5px;font-variant-numeric:tabular-nums lining-nums}
.measure{position:relative;height:9px;border-bottom:.5px solid var(--rule)}
.measure .tick{position:absolute;bottom:0;width:.5px;height:3.5px;background:var(--rule)}
.measure b{position:absolute;bottom:0;left:0;height:5px;background:var(--ink);opacity:.82}
.st.peak b{background:var(--red)}

/* a note in the margin */
.margin-note{display:grid;grid-template-columns:14px 1fr;gap:8px;margin:10px 0 0}
.carried-line{margin:0;font-size:12.5px;font-style:italic;color:var(--ink2);line-height:1.45}
.carried-line b{font-style:normal;font-weight:600;color:var(--ink)}
.carried-line .mk-p{color:var(--ochre);font-style:normal}
.margin-note .mk-p{color:var(--red);font-size:13px;line-height:1.35}
.margin-note b{font-weight:600} .margin-note p{margin:0;font-size:12.5px;line-height:1.45;color:var(--ink)}

/* the ledger */
.learn{display:grid;grid-template-columns:34px 1fr auto;gap:0 10px;align-items:baseline;padding:4px 0;border-bottom:.5px solid var(--rule);font-size:12.5px}
.learn .lv{font-family:var(--sans);font-size:9px;letter-spacing:.11em;text-transform:uppercase;color:var(--ink2);font-variant-numeric:tabular-nums}
.learn .nm{font-size:13.5px}
.learn .tp{font-family:var(--sans);font-size:8.5px;letter-spacing:.13em;text-transform:uppercase;color:var(--ink2);display:inline-flex;align-items:center;gap:5px}
.learn.now .nm{font-weight:600} .learn.now .lv{color:var(--red)}
.party{display:grid;grid-template-columns:repeat(3,1fr);gap:10px 14px;margin:0 22px}
.pslot{display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:center}
.pslot .pm{width:9px;height:9px;border-radius:50%;background:var(--ink);opacity:.8}
.pslot.out .pm{background:none;box-shadow:inset 0 0 0 .5px var(--ink);opacity:.45}
.pslot .pn{font-size:11.5px;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pslot .measure{height:6px;grid-column:2}
.lrow{display:grid;grid-template-columns:16px 1fr auto;gap:0 11px;align-items:baseline;padding:9px 0;border-bottom:.5px solid var(--rule)}
.lrow .dot{width:9px;height:9px;border-radius:50%;background:var(--d);align-self:center;
  box-shadow:0 0 0 .5px rgba(43,37,29,.5), 0 0 0 3px var(--paper), 0 0 0 3.5px rgba(43,37,29,.28)}
.lrow-t b{font-weight:600;font-size:14.5px} .lrow-t i{display:block;font-size:12px;color:var(--ink2);line-height:1.4;margin-top:1px}
.lrow-t .held{display:inline;font-style:normal;font-family:var(--sans);font-size:8.5px;letter-spacing:.13em;
  text-transform:uppercase;color:var(--red);margin-left:7px}
.price{font-family:var(--sans);font-size:12.5px;font-variant-numeric:tabular-nums;color:var(--ochre);letter-spacing:.02em}
.price u{text-decoration:none;font-size:8.5px;letter-spacing:.1em;margin-left:1.5px}

/* the fight */
.combat{display:flex;gap:10px;align-items:flex-end;margin:0 22px}
.combat .who{flex:1}
.tag{font-family:var(--sans);font-size:8.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink2)}
.cname{font-size:17px;margin:1px 0 0} .cname i{font-style:normal;font-size:11px;color:var(--ink2);margin-left:5px}
.hp{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;margin-top:5px}
.hp .measure{height:8px}
.hp .n{font-family:var(--sans);font-size:11px;font-variant-numeric:tabular-nums;color:var(--ink)}
.mini{width:148px;height:126px;display:flex;align-items:center;justify-content:center}
.mini svg{height:96px;width:auto}
.combat .frame{flex:0 0 auto}
.hp .measure{flex:1}
.who .hp{grid-template-columns:1fr auto} .who.right .hp{grid-template-columns:auto 1fr}
.who.right .tag,.who.right .cname{text-align:right}
.fieldline{display:flex;align-items:center;gap:7px;font-family:var(--sans);font-size:9px;letter-spacing:.16em;
  text-transform:uppercase;color:var(--ink2);padding-bottom:8px;border-bottom:.5px solid var(--rule)}
.fieldline span{margin-left:auto;font-variant-numeric:tabular-nums;color:var(--ink)}
.log{margin:12px 22px 0;padding:11px 13px;background:var(--paper2)}
.log p{margin:0 0 4px;font-size:13px;font-style:italic;line-height:1.45;color:var(--ink2)}
.log p:last-child{margin:0;color:var(--ink);font-style:normal}
.moves{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:12px 22px 0}
.mv{display:block;text-align:left;background:none;border:.5px solid var(--rule);padding:9px 10px 8px;cursor:pointer;font-family:var(--serif);color:var(--ink)}
.mv.on{border-color:var(--red);box-shadow:inset 0 0 0 .5px var(--red)}
.mv-n{display:block;font-size:14.5px;line-height:1.15}
.mv-m{display:flex;align-items:center;gap:5px;font-family:var(--sans);font-size:8px;letter-spacing:.14em;color:var(--ink2);margin-top:5px}
.mv-f{display:block;font-family:var(--sans);font-size:10px;color:var(--ink2);margin-top:4px;font-variant-numeric:tabular-nums}
.mv-f b{color:var(--ink);font-weight:600}
.acts{display:flex;gap:9px;margin:11px 22px 0}
.act{flex:1;text-align:center;font-family:var(--sans);font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;
  padding:11px 0;border:.5px solid var(--rule);background:none;color:var(--ink2);cursor:pointer}
.act.primary{border-color:var(--red);color:var(--red)}

/* the board */
.board{padding:0 60px 64px;display:flex;gap:56px;align-items:flex-start;width:max-content}
.col{margin:0;width:390px;position:relative}
.screen-wrap{position:relative}
.title{padding:34px 60px 26px}
.title h1{font-size:20px;margin:0;letter-spacing:.01em}
.title p{margin:4px 0 0;font-size:12.5px;font-style:italic;color:#6d6455;max-width:860px;line-height:1.5}
.cap{font-family:var(--sans);font-size:9px;letter-spacing:.19em;text-transform:uppercase;color:#7a705f;margin:0 0 11px}
/* markers on the screen, the note under it: a spec sheet, not a floating label */
.mk{position:absolute;z-index:3;left:-9px;width:17px;height:17px;border-radius:50%;background:var(--red);color:var(--paper);
  font-family:var(--sans);font-size:9.5px;font-weight:600;display:flex;align-items:center;justify-content:center;
  box-shadow:0 0 0 2.5px var(--paper)}
.notes{list-style:none;margin:20px 0 0;padding:0;display:grid;gap:11px}
.notes li{display:grid;grid-template-columns:17px 1fr;gap:9px;font-family:var(--sans);font-size:10.5px;line-height:1.5;color:#5f5647}
.notes li>b{width:17px;height:17px;border-radius:50%;background:var(--red);color:var(--paper);font-size:9.5px;
  display:flex;align-items:center;justify-content:center;font-weight:600}
.notes li>span>b{display:block;color:var(--red);letter-spacing:.13em;text-transform:uppercase;font-size:9px;font-weight:600;margin-bottom:2px}
</style></head><body>
<div class="title"><h1>Creature Collector — theme study 1 of 3: <i>Field Guide</i></h1>
<p>A naturalist’s plate book. Warm paper, a book serif, rules drawn as inked SVG rather than CSS borders, and the
eighteen type colours moved off filled pills onto swatches so they survive a light ground. Real art, real stats,
real prices — nothing here is filler.</p></div>
<div class="board">

<figure class="col">
  <p class="cap">i · the plate — a creature’s page</p>
  <div class="screen-wrap">
    <b class="mk" style="top:150px">1</b><b class="mk" style="top:512px">2</b><b class="mk" style="top:616px">3</b>
    <div class="screen">
    <div class="runhead"><span>Creature Collector</span><span>·</span><span>Reptilia</span><span class="folio">551</span></div>
    <div class="swell"></div>
    ${frame('plate', `<div class="art">${art('phantomsnapper', 'guide:1', 250, 'right', 3)}</div>
      <p class="caption">Drawn from the specimen taken at Heather Downs, at the third stage of its growth.</p>`)}
    <div class="pad">
      <h2 class="name">Phantomsnapper</h2>
      <p class="binom">Chelys revenata — the ferryman’s turtle</p>
      <p class="catline">Plate DLI · No. 551 of 895 · Common · Reptile</p>
      <div class="marks">
        <span><i class="tm" style="--t:${PAPER_TYPE.Ghost}"></i>Ghost</span>
        <span><i class="tm" style="--t:${PAPER_TYPE.Rock}"></i>Rock</span>
        <span style="color:var(--ink2)">Magic</span>
      </div>
      <p class="field-note">The turtle that bit the ferryman a hundred years ago. Still hungry.</p>
      <div class="minor"></div>
      <p class="eyebrow">Measurements at birth</p>
      ${STATS.map((st) => statRow(st).replace('class="st"', st[0] === 'Magic' ? 'class="st peak"' : 'class="st"')).join('')}
      <div class="minor"></div>
      <div class="margin-note"><span class="mk-p">¶</span>
        <p><b>Mist Walker.</b> Melee and ranged defence rise by three tenths while a misty field lies over the ground.</p></div>
      <div class="minor"></div>
      <p class="eyebrow">Learns, by level</p>
      ${[[1, 'Cold Lick', 'Ghost', 1], [6, 'Shade Step', 'Ghost', 2], [11, 'Sepulchre Form', 'Ghost', 0], [16, 'Primal Surge', 'Rock', 0]]
        .map(([lv, nm, tp, st]) => `<div class="learn${st === 2 ? ' now' : ''}"><span class="lv">${st ? (st === 2 ? 'next' : 'known') : `lv ${lv}`}</span>
          <span class="nm">${nm}</span><span class="tp"><i class="tm" style="--t:${PAPER_TYPE[tp]}"></i>${tp}</span></div>`).join('')}
    </div>
  </div></div>
  <ol class="notes">
    <li><b>1</b><span><b>The frame is drawn, not bordered</b>Four inked edge tiles that repeat, and four corner pieces from a single asset placed by transform. The line wanders about a third of a pixel, so it reads as ink rather than as a 1px border. Registration marks sit at the centre of the top and bottom edges, as a printing plate carries.</span></li>
    <li><b>2</b><span><b>Type colour survives the paper</b>All eighteen type colours are tuned for a dark ground and die on a light one. They move to an 8px swatch beside tracked caps: the ink carries the word, the colour carries the meaning, and no colour has to pass a text-contrast bar.</span></li>
    <li><b>3</b><span><b>Stats as an instrument, not a progress bar</b>A hairline track with quarter ticks and a solid ink measure. The creature’s best stat takes the annotation red — the only red on the page that is not an action.</span></li>
  </ol>
</figure>

<figure class="col">
  <p class="cap">ii · the ledger — how a long list behaves</p>
  <div class="screen-wrap">
    <b class="mk" style="top:300px">4</b><b class="mk" style="top:344px;left:auto;right:-9px">5</b>
    <div class="screen">
    <div class="runhead"><span>Crossroads</span><span>·</span><span>Market</span><span class="folio">5,000 g</span></div>
    <div class="swell"></div>
    <div class="pad">
      <h2 class="name" style="font-size:27px">The Market</h2>
      <p class="binom">Everything goes to your bag. Trainers pay gold when beaten.</p>
      <div class="minor"></div>
      <p class="eyebrow">Draughts and restoratives</p>
      ${ITEMS.map((it, i) => itemRow(it, i === 0 ? 'two' : null)).join('')}
      <div class="minor"></div>
      <p class="eyebrow">Scrolls · Ghost</p>
      ${[['Cold Lick', 'Melee 30. Three in ten leave the target numbed.', '#6d5aa6', '420'],
         ['Shade Step', 'Melee 40. Strikes before slower creatures.', '#6d5aa6', '640'],
         ['Vigil Call', 'Raises its own guard by one step.', '#6d5aa6', '900']].map((r) => itemRow(r)).join('')}
      <div class="minor"></div>
      <p class="eyebrow">The broker</p>
      <div class="lrow"><span class="dot" style="--d:#b09a5c"></span>
        <span class="lrow-t"><b>A word of something unseen</b><i>Lives in the Echo Chasm. Dark and Fire.</i></span>
        <span class="price">2,000<u>g</u></span></div>
      <div class="minor"></div>
      <p class="eyebrow">Charms</p>
      <div class="lrow"><span class="dot" style="--d:#6d5aa6"></span>
        <span class="lrow-t"><b>Ghost Charm</b><i>Lifts the holder’s Ghost moves by a fifth.</i></span>
        <span class="price">3,200<u>g</u></span></div>
    </div>
  </div></div>
  <ol class="notes">
    <li><b>4</b><span><b>No cards</b>A row is a hanging indent on a hairline, so two hundred and sixty-six of them stay readable — the current theme boxes every one of them and the page turns to grey bricks. The item’s colour survives as a dot in a hairline ring.</span></li>
    <li><b>5</b><span><b>Gold means gold again</b>Prices in ochre, tracked, tabular. Today one yellow marks prices, locks, evolution stages and primary buttons alike, so the eye cannot tell money from importance. Here the accent red is reserved for the action you are about to take, and nothing else competes.</span></li>
  </ol>
</figure>

<figure class="col">
  <p class="cap">iii · the field — the theme under pressure</p>
  <div class="screen-wrap">
    <b class="mk" style="top:436px">6</b><b class="mk" style="top:600px">7</b>
    <div class="screen">
    <div class="runhead"><span>Heather Downs</span><span>·</span><span>Wild</span><span class="folio">Turn 3</span></div>
    <div class="swell"></div>
    <div class="pad" style="margin-top:14px"><div class="fieldline"><i class="tm" style="--t:hsl(200 40% 34%)"></i>Misty field<span>3 turns</span></div></div>
    <div class="combat">
      <div class="who">
        <div class="tag">Wild</div>
        <h3 class="cname">Ghastshell <i>lv 3</i></h3>
        <div class="hp"><span class="measure"><i class="tick" style="left:25%"></i><i class="tick" style="left:50%"></i><i class="tick" style="left:75%"></i><b style="width:62%"></b></span><span class="n">62%</span></div>
      </div>
      ${frame('sm', `<div class="mini">${art('ghastshell', 'guide:2', 150, 'left')}</div>`)}
    </div>
    <div class="combat" style="margin-top:16px">
      ${frame('sm', `<div class="mini">${art('phantomsnapper', 'guide:1', 150, 'right', 3)}</div>`)}
      <div class="who right">
        <div class="tag">Yours</div>
        <h3 class="cname">Phantomsnapper <i>lv 5</i></h3>
        <div class="hp"><span class="n">23 / 23</span><span class="measure"><i class="tick" style="left:25%"></i><i class="tick" style="left:50%"></i><i class="tick" style="left:75%"></i><b style="width:100%"></b></span></div>
      </div>
    </div>
    <div class="log">
      <p>A wild Ghastshell appeared.</p>
      <p>Phantomsnapper used Cold Lick.</p>
      <p>It told badly against the Ghastshell.</p>
    </div>
    <div class="moves">${MOVES.map((m, i) => moveCell(m, i === 0)).join('')}</div>
    <div class="acts"><button class="act">Bag</button><button class="act">Party</button>
      <button class="act primary">Capture</button><button class="act">Flee</button></div>
    <div class="pad"><div class="minor" style="margin-top:16px"></div><p class="eyebrow">Your party</p></div>
    <div class="party" style="margin-bottom:12px">
      ${[['Phantomsnapper', 100], ['Gloamfinch', 74], ['Tidedrake', 41], ['Slatebass', 96], ['Cinderwasp', 0], ['Kirinth', 12]]
        .map(([nm, hp]) => `<div class="pslot${hp ? '' : ' out'}"><span class="pm"></span><span class="pn">${nm}</span>
          <span class="measure"><i class="tick" style="left:50%"></i><b style="width:${hp}%"></b></span></div>`).join('')}
    </div>
    <div class="pad"><p class="carried-line"><span class="mk-p">◈</span> Phantomsnapper carries a <b>Greater Scholar’s Charm</b>.</p></div>
  </div></div>
  <ol class="notes">
    <li><b>6</b><span><b>It survives the fight</b>The screen with the most numbers on it hands them to the sans with tabular figures, and keeps the serif for names and the log. Speed of reading wins over consistency of typeface wherever the two disagree.</span></li>
    <li><b>7</b><span><b>Four moves, four ruled cells</b>Hairline cells rather than filled buttons; the chosen one takes the red. Power and PP are tabular so the four line up down the column, which the current pill layout cannot do.</span></li>
  </ol>
</figure>
</div>
</body></html>`;

const out = path.join(root, 'shots', 'theme-fieldguide.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log('wrote shots/theme-fieldguide.html', (html.length / 1024).toFixed(1), 'KB');
