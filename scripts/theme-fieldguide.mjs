// Theme study 1 of 3: Field Guide, worked on a dark ground by default.
//
// A mezzotint is engraved the other way round from a line plate: the ground starts black and the engraver
// works up into the light. That is the whole logic of this theme's dark mode — light is not decoration, it
// is emphasis, and it replaces the accent colour the paper version had to spend on the same job. Rules,
// panels and measures all read as something lifted out of the ground rather than laid onto it.
//
// The board is drawn with the game's own creature renderer and its own species, stats, moves, items and
// prices, so what it shows is what the theme would actually have to hold.
//
//   node scripts/theme-fieldguide.mjs          -> shots/theme-fieldguide.html        (dark, the default)
//   node scripts/theme-fieldguide.mjs light    -> shots/theme-fieldguide-light.html  (the paper variant)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SPECIES } from '../src/data/species.js';
import { speciesGenome, baseStats, makeElemental } from '../src/creature/genome.js';
import { renderCreatureSvg } from '../src/creature/render.js';
import { makeRng } from '../src/core/rng.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIGHT = process.argv[2] === 'light';

// --- the two grounds ------------------------------------------------------------------------------------
// On a dark ground a light hairline blooms: the eye reads a light shape on dark as larger than the same
// shape reversed. So the rules are not made thinner in geometry, they are made quieter in value — the
// weights barely move, the opacity does.
//
// Every ink here clears WCAG AA against the ground it sits on, checked against the lit panel rather than
// the page because that is the tighter of the two: ink 13.4:1, ink2 5.8:1, ink3 4.9:1, ember 5.0:1,
// brass 7.6:1. The dim ink went up two steps from where it first looked right — it carries item
// descriptions and log history, which are body text however quiet they are meant to be.
const PALETTES = {
  dark: {
    name: 'dark ground', ground: '#16130e', lit: '#211d16', lit2: '#1e1a13', ink: '#ece5d5', ink2: '#a1977f',
    ink3: '#948a76', rule: '#57503f', ember: '#e2683c', brass: '#d8a83c', board: '#080705', boardInk: '#8d8471',
    ruleInk: '#e8e0cf', ruleOpacity: 0.5, ruleInner: 0.34, ruleW: 0.85, ruleWi: 0.45,
    grainBlend: 'screen', grainOpacity: 0.035, shadow: '0 14px 34px -16px #000, 0 0 0 1px rgba(232,224,207,.11)',
    types: { Ghost: 'hsl(255 42% 64%)', Rock: 'hsl(44 42% 62%)', Water: 'hsl(218 80% 66%)', Mist: 'hsl(196 40% 66%)' },
  },
  paper: {
    name: 'paper', ground: '#f4efe4', lit: '#eae3d3', lit2: '#efe8da', ink: '#2b251d', ink2: '#6d6455',
    ink3: '#9b917e', rule: '#b9ae98', ember: '#a8321e', brass: '#8a6a23', board: '#ddd4c2', boardInk: '#7a705f',
    ruleInk: '#2b251d', ruleOpacity: 1, ruleInner: 0.85, ruleW: 1, ruleWi: 0.5,
    grainBlend: 'multiply', grainOpacity: 0.07, shadow: '0 6px 18px -8px rgba(60,48,30,.45), 0 1px 2px rgba(60,48,30,.3)',
    types: { Ghost: 'hsl(258 34% 40%)', Rock: 'hsl(43 42% 32%)', Water: 'hsl(218 62% 38%)', Mist: 'hsl(196 40% 34%)' },
  },
};
const P = LIGHT ? PALETTES.paper : PALETTES.dark;

// --- the drawn parts ------------------------------------------------------------------------------------
// Every rule is an inked path, not a CSS border: the line wanders about a third of a pixel so it reads as
// something laid down rather than computed, and each tile starts and ends at the same y so it repeats
// seamlessly. One tile carries both rules of the double frame.
const du = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}")`;
const I = P.ruleInk;

const ruleH = du(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="9" viewBox="0 0 96 9">
  <g fill="none" stroke="${I}" stroke-linecap="butt">
    <path d="M0 1.5 C 9 1.18 15 1.79 24 1.44 S 41 1.19 48 1.56 S 65 1.83 72 1.38 S 88 1.23 96 1.5" stroke-width="${P.ruleW}" opacity="${P.ruleOpacity}"/>
    <path d="M0 6.5 C 11 6.72 18 6.28 27 6.6 S 44 6.79 52 6.4 S 69 6.24 77 6.62 S 89 6.71 96 6.5" stroke-width="${P.ruleWi}" opacity="${P.ruleInner}"/>
  </g></svg>`);
const ruleV = du(`<svg xmlns="http://www.w3.org/2000/svg" width="9" height="96" viewBox="0 0 9 96">
  <g fill="none" stroke="${I}" stroke-linecap="butt">
    <path d="M1.5 0 C 1.18 9 1.79 15 1.44 24 S 1.19 41 1.56 48 S 1.83 65 1.38 72 S 1.23 88 1.5 96" stroke-width="${P.ruleW}" opacity="${P.ruleOpacity}"/>
    <path d="M6.5 0 C 6.72 11 6.28 18 6.6 27 S 6.79 44 6.4 52 S 6.24 69 6.62 77 S 6.71 89 6.5 96" stroke-width="${P.ruleWi}" opacity="${P.ruleInner}"/>
  </g></svg>`);

// The corner: the outer rule turns square with a hair of a radius, the inner rule is chamfered off at 45
// degrees the way an engraved plate is, and a lozenge sits in the triangle the chamfer leaves behind. Butt
// caps throughout, because a round cap stacking on the edge tile blots the seam at any magnification.
const corner = du(`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
  <g fill="none" stroke="${I}" stroke-linecap="butt" stroke-linejoin="round">
    <path d="M22 1.5 H3.1 Q1.5 1.5 1.5 3.1 V22" stroke-width="${P.ruleW}" opacity="${P.ruleOpacity}"/>
    <path d="M22 6.5 H12.1 L6.5 12.1 V22" stroke-width="${P.ruleWi}" opacity="${P.ruleInner}"/>
  </g>
  <path d="M4.6 3.05 L6.15 4.6 L4.6 6.15 L3.05 4.6 Z" fill="${I}" opacity="${P.ruleOpacity * 0.9}"/></svg>`);
const cornerSm = du(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <g fill="none" stroke="${I}" stroke-linecap="butt" stroke-linejoin="round">
    <path d="M16 1.4 H2.9 Q1.4 1.4 1.4 2.9 V16" stroke-width="${P.ruleW * 0.9}" opacity="${P.ruleOpacity}"/>
    <path d="M16 5.4 H9.4 L5.4 9.4 V16" stroke-width="${P.ruleWi * 0.9}" opacity="${P.ruleInner}"/>
  </g>
  <path d="M4 2.7 L5.3 4 L4 5.3 L2.7 4 Z" fill="${I}" opacity="${P.ruleOpacity * 0.85}"/></svg>`);

const reg = du(`<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11">
  <g fill="none" stroke="${I}" stroke-width="${P.ruleWi}" stroke-linecap="butt" opacity="${P.ruleOpacity}">
    <path d="M5.5 0 V11 M0 5.5 H11"/><circle cx="5.5" cy="5.5" r="2.4"/></g></svg>`);

// A swelled rule: thick at the middle, tapering to nothing at both ends. One per screen, no more.
const swell = du(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="7" viewBox="0 0 300 7" preserveAspectRatio="none">
  <path d="M0 3.5 Q 78 2.35 150 2.3 Q 222 2.35 300 3.5 Q 222 4.65 150 4.7 Q 78 4.65 0 3.5 Z" fill="${I}" opacity="${P.ruleOpacity}"/></svg>`);
const minor = du(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="7" viewBox="0 0 300 7" preserveAspectRatio="none">
  <path d="M8 3.5 H300" stroke="${I}" stroke-width="${P.ruleWi}" opacity="${P.ruleOpacity * 0.6}" fill="none"/>
  <path d="M3 1.6 L4.9 3.5 L3 5.4 L1.1 3.5 Z" fill="${I}" opacity="${P.ruleOpacity * 0.8}"/></svg>`);

const grain = du(`<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150">
  <filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="4" stitchTiles="stitch"/>
  <feColorMatrix type="saturate" values="0"/></filter><rect width="150" height="150" filter="url(#g)" opacity=".38"/></svg>`);

// --- the game's own creatures --------------------------------------------------------------------------
const art = (id, seed, size, facing = 'right', stage = 1, element = null) => {
  const s = SPECIES.find((x) => x.id === id);
  let g = speciesGenome(s, makeRng(seed));
  if (element) g = makeElemental(JSON.parse(JSON.stringify(g)), element);
  return renderCreatureSvg(g, { size, facing, stage, fit: true, animate: false, detail: 'full' });
};
const base = baseStats(speciesGenome(SPECIES.find((s) => s.id === 'phantomsnapper'), makeRng('guide:1')));

const STATS = [['Health', base.hp], ['Melee', base.melee], ['Ranged', base.ranged], ['Magic', base.magic],
  ['Melee def.', base.meleeDef], ['Ranged def.', base.rangedDef], ['Magic def.', base.magicDef], ['Speed', base.spe]];
const statRow = ([label, v], peak) => `<div class="st${peak ? ' peak' : ''}"><span class="st-l">${label}</span>
  <span class="measure"><i class="tick" style="left:25%"></i><i class="tick" style="left:50%"></i><i class="tick" style="left:75%"></i><b style="width:${Math.min(100, (v / 140) * 100).toFixed(1)}%"></b></span>
  <span class="st-v">${v}</span></div>`;

const ITEMS = [['Potion', 'Restores 20 health.', '#7fe38a', '300', 'in the bag, two'], ['Super Potion', 'Restores 60 health.', '#4fb7ff', '700'],
  ['Hyper Potion', 'Restores 150 health.', '#b98cff', '1,500'], ['Max Potion', 'Restores all health.', '#ffd166', '2,500'],
  ['Full Restore', 'Restores all health, and cures any affliction.', '#ff7ab6', '3,000']];
const itemRow = ([n, d, c, p, held]) => `<div class="lrow"><span class="dot" style="--d:${c}"></span>
  <span class="lrow-t"><b>${n}</b>${held ? `<em class="held">${held}</em>` : ''}<i>${d}</i></span>
  <span class="price">${p}<u>g</u></span></div>`;

const MOVES = [['Cold Lick', 'Ghost', 'Melee', '30', '30/30'], ['Shroud Call', 'Ghost', 'Status', '', '30/30'],
  ['Shade Step', 'Ghost', 'Melee', '40', '15/15'], ['Primal Surge', 'Rock', 'Magic', '60', '10/10']];
const moveCell = ([n, t, c, p, pp], on) => `<button class="mv${on ? ' on' : ''}"><span class="mv-n">${n}</span>
  <span class="mv-m"><i class="tm" style="--t:${P.types[t]}"></i>${t.toUpperCase()} · ${c.toUpperCase()}</span>
  <span class="mv-f">${p ? `<b>${p}</b> pow · ` : ''}${pp} pp</span></button>`;

const frame = (cls, body) => `<div class="frame ${cls}"><i class="e top"></i><i class="e bot"></i><i class="e lft"></i><i class="e rgt"></i>
  <i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i><i class="r rt"></i><i class="r rb"></i>${body}</div>`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Field Guide — ${P.name}</title><style>
:root{
  --ground:${P.ground}; --lit:${P.lit}; --lit2:${P.lit2}; --ink:${P.ink}; --ink2:${P.ink2}; --ink3:${P.ink3};
  --rule:${P.rule}; --ember:${P.ember}; --brass:${P.brass};
  --serif:'Iowan Old Style',Charter,'Bitstream Charter','Palatino Linotype',Palatino,'Book Antiqua',Georgia,serif;
  --sans:-apple-system,'Helvetica Neue','Liberation Sans',system-ui,sans-serif;
  --rule-h:${ruleH}; --rule-v:${ruleV}; --corner:${corner}; --corner-sm:${cornerSm};
  --reg:${reg}; --swell:${swell}; --minor:${minor};
}
*{box-sizing:border-box} html,body{margin:0}
body{background:${P.board};font-family:var(--serif);color:var(--ink);-webkit-font-smoothing:antialiased}
body::after{content:'';position:fixed;inset:0;background-image:${grain};opacity:${P.grainOpacity};
  mix-blend-mode:${P.grainBlend};pointer-events:none}

/* --- the frame: four inked edges, four drawn corners, two registration marks ------------------------- */
.frame{position:relative}
.frame>.e{position:absolute}
.frame>.e.top,.frame>.e.bot{left:21.5px;right:21.5px;height:9px;background-image:var(--rule-h);background-repeat:repeat-x}
.frame>.e.top{top:0} .frame>.e.bot{bottom:0;transform:scaleY(-1)}
.frame>.e.lft,.frame>.e.rgt{top:21.5px;bottom:21.5px;width:9px;background-image:var(--rule-v);background-repeat:repeat-y}
.frame>.e.lft{left:0} .frame>.e.rgt{right:0;transform:scaleX(-1)}
.frame>.c{position:absolute;width:22px;height:22px;background-image:var(--corner);background-size:22px 22px}
.frame>.c.tl{top:0;left:0} .frame>.c.tr{top:0;right:0;transform:scaleX(-1)}
.frame>.c.bl{bottom:0;left:0;transform:scaleY(-1)} .frame>.c.br{bottom:0;right:0;transform:scale(-1)}
.frame>.r{position:absolute;left:50%;width:11px;height:11px;margin-left:-5.5px;background-image:var(--reg);opacity:.55}
.frame>.r.rt{top:-4px} .frame>.r.rb{bottom:-4px}
.frame.sm>.c{width:16px;height:16px;background-image:var(--corner-sm);background-size:16px 16px}
.frame.sm>.e.top,.frame.sm>.e.bot{left:15.5px;right:15.5px}
.frame.sm>.e.lft,.frame.sm>.e.rgt{top:15.5px;bottom:15.5px}
.frame.sm>.r{display:none}

/* --- the page --------------------------------------------------------------------------------------- */
.screen{width:390px;height:844px;background:var(--ground);position:relative;overflow:hidden;box-shadow:${P.shadow}}
.pad{padding:0 22px}
.runhead{display:flex;align-items:baseline;gap:8px;padding:14px 22px 0;font-family:var(--sans);
  font-size:8.5px;letter-spacing:.19em;text-transform:uppercase;color:var(--ink3)}
.runhead .folio{margin-left:auto;font-variant-numeric:tabular-nums;color:var(--ink2)}
.swell{height:7px;margin:7px 22px 0;background-image:var(--swell);background-size:100% 7px;background-repeat:no-repeat}
.minor{height:7px;margin:11px 0 7px;background-image:var(--minor);background-size:100% 7px;background-repeat:no-repeat}
.eyebrow{font-family:var(--sans);font-size:8.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink3);margin:0 0 6px}

/* lit, not boxed: a raised surface is a few per cent lighter than the ground and carries no border */
.plate{margin:14px 22px 0;padding:13px 14px 9px;background:var(--lit)}
.plate .art{display:flex;justify-content:center;align-items:center;min-height:166px}
.plate .art svg{height:162px;width:auto}
.plate .caption{font-size:10.5px;font-style:italic;color:var(--ink3);text-align:center;margin:8px 6px 0;line-height:1.35}

.name{font-size:31px;line-height:1.03;margin:14px 0 0;letter-spacing:-.01em}
.binom{font-style:italic;font-size:13.5px;color:var(--ink2);margin:3px 0 0}
.catline{font-family:var(--sans);font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink3);
  margin:8px 0 0;font-variant-numeric:tabular-nums}
.marks{display:flex;gap:16px;margin:9px 0 0;font-family:var(--sans);font-size:9.5px;letter-spacing:.15em;
  text-transform:uppercase;color:var(--ink2)}
.marks span{display:inline-flex;align-items:center;gap:6px}
.tm{width:8px;height:8px;background:var(--t);display:inline-block;flex:0 0 auto}
.field-note{font-size:14px;font-style:italic;line-height:1.5;margin:12px 0 0}

/* stats: an instrument scale. Light is the emphasis, so the best stat is simply the brightest measure. */
.st{display:grid;grid-template-columns:74px 1fr 30px;align-items:center;gap:0 11px;padding:3.4px 0;font-size:12.5px}
.st-l{color:var(--ink2)}
.st-v{text-align:right;font-family:var(--sans);font-size:11.5px;font-variant-numeric:tabular-nums lining-nums;color:var(--ink2)}
.measure{position:relative;height:9px;border-bottom:.5px solid var(--rule)}
.measure .tick{position:absolute;bottom:0;width:.5px;height:3.5px;background:var(--rule)}
.measure b{position:absolute;bottom:0;left:0;height:5px;background:var(--ink);opacity:.5}
.st.peak b{opacity:1} .st.peak .st-l,.st.peak .st-v{color:var(--ink)}

/* the ability: a lit panel rather than a hanging mark — on a dark ground light does the emphasising */
.skill{margin:11px 22px 0;padding:10px 12px;background:var(--lit2)}
.skill b{font-weight:600} .skill p{margin:0;font-size:12.5px;line-height:1.45}
.skill .lab{display:block;font-family:var(--sans);font-size:8px;letter-spacing:.2em;text-transform:uppercase;
  color:var(--ink3);margin-bottom:4px}

.learn{display:grid;grid-template-columns:38px 1fr auto;gap:0 10px;align-items:baseline;padding:4px 0;font-size:12.5px}
.learn .lv{font-family:var(--sans);font-size:9px;letter-spacing:.11em;text-transform:uppercase;color:var(--ink3);font-variant-numeric:tabular-nums}
.learn .nm{font-size:13.5px;color:var(--ink2)}
.learn .tp{font-family:var(--sans);font-size:8.5px;letter-spacing:.13em;text-transform:uppercase;color:var(--ink3);display:inline-flex;align-items:center;gap:5px}
.learn.known .nm{color:var(--ink)} .learn.now .nm{color:var(--ink);font-weight:600} .learn.now .lv{color:var(--ember)}

/* the ledger: no rule between rows. On a dark ground the contrast already separates them, so the rules go
   and the rows get shorter — which is the density cost the paper version had to pay back. */
.lrow{display:grid;grid-template-columns:16px 1fr auto;gap:0 11px;align-items:baseline;padding:6px 0}
.lrow .dot{width:9px;height:9px;border-radius:50%;background:var(--d);align-self:center;opacity:.9}
.lrow-t b{font-weight:600;font-size:14.5px}
.lrow-t i{display:block;font-size:12px;color:var(--ink3);line-height:1.4;margin-top:1px}
.lrow-t .held{display:inline;font-style:normal;font-family:var(--sans);font-size:8.5px;letter-spacing:.13em;
  text-transform:uppercase;color:var(--ember);margin-left:7px}
.price{font-family:var(--sans);font-size:12.5px;font-variant-numeric:tabular-nums;color:var(--brass)}
.price u{text-decoration:none;font-size:8.5px;letter-spacing:.1em;margin-left:1.5px;opacity:.75}

/* the field */
.fieldline{display:flex;align-items:center;gap:7px;font-family:var(--sans);font-size:9px;letter-spacing:.16em;
  text-transform:uppercase;color:var(--ink2);padding-bottom:9px;border-bottom:.5px solid var(--rule)}
.fieldline span{margin-left:auto;font-variant-numeric:tabular-nums;color:var(--ink)}
.combat{display:flex;gap:12px;align-items:center;margin:0 22px}
.combat .who{flex:1;min-width:0}
.tag{font-family:var(--sans);font-size:8.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink3)}
.tag .el{color:var(--t);margin-left:5px}
.cname{font-size:18px;margin:2px 0 0;font-weight:400} .cname i{font-style:normal;font-size:11px;color:var(--ink3);margin-left:6px}
.hp{display:grid;grid-template-columns:1fr auto;gap:9px;align-items:center;margin-top:6px}
.hp .measure{height:9px} .hp .measure b{opacity:.92}
.hp .n{font-family:var(--sans);font-size:11px;font-variant-numeric:tabular-nums;color:var(--ink)}
.who.right .tag,.who.right .cname{text-align:right} .who.right .hp{grid-template-columns:auto 1fr}
.mini{width:150px;height:128px;display:flex;align-items:center;justify-content:center;background:var(--lit)}
.mini svg{height:100px;width:auto}
.log{margin:13px 22px 0;padding:11px 13px;background:var(--lit2)}
.log p{margin:0 0 4px;font-size:13px;font-style:italic;line-height:1.45;color:var(--ink3)}
.log p:last-child{margin:0;color:var(--ink);font-style:normal}
.moves{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:13px 22px 0}
.mv{display:block;text-align:left;background:none;border:.5px solid var(--rule);padding:9px 10px 8px;cursor:pointer;
  font-family:var(--serif);color:var(--ink2)}
.mv.on{border-color:var(--ember);background:var(--lit2);color:var(--ink)}
.mv-n{display:block;font-size:14.5px;line-height:1.15}
.mv-m{display:flex;align-items:center;gap:5px;font-family:var(--sans);font-size:8px;letter-spacing:.14em;color:var(--ink3);margin-top:5px}
.mv-f{display:block;font-family:var(--sans);font-size:10px;color:var(--ink3);margin-top:4px;font-variant-numeric:tabular-nums}
.mv.on .mv-f b{color:var(--ink);font-weight:600}
.acts{display:flex;gap:9px;margin:11px 22px 0}
.act{flex:1;text-align:center;font-family:var(--sans);font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;
  padding:11px 0;border:.5px solid var(--rule);background:none;color:var(--ink3);cursor:pointer}
.act.primary{border-color:var(--ember);color:var(--ember)}
.party{display:grid;grid-template-columns:repeat(3,1fr);gap:10px 14px;margin:0 22px 12px}
.pslot{display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:center}
.pslot .pm{width:9px;height:9px;border-radius:50%;background:var(--ink);opacity:.75}
.pslot.out .pm{background:none;box-shadow:inset 0 0 0 .5px var(--ink3);opacity:.55}
.pslot .pn{font-size:11.5px;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink2)}
.pslot .measure{height:6px;grid-column:2}
.carried-line{margin:0;font-size:12.5px;font-style:italic;color:var(--ink3);line-height:1.45}
.carried-line b{font-style:normal;font-weight:600;color:var(--ink2)}
.carried-line .mk-p{color:var(--brass);font-style:normal}

/* the board */
.board{padding:0 60px 64px;display:flex;gap:56px;align-items:flex-start;width:max-content}
.col{margin:0;width:390px;position:relative}
.screen-wrap{position:relative}
.title{padding:34px 60px 26px}
.title h1{font-size:20px;margin:0;letter-spacing:.01em;color:${P.ink}}
.title p{margin:4px 0 0;font-size:12.5px;font-style:italic;color:${P.boardInk};max-width:880px;line-height:1.5}
.cap{font-family:var(--sans);font-size:9px;letter-spacing:.19em;text-transform:uppercase;color:${P.boardInk};margin:0 0 11px}
.mk{position:absolute;z-index:3;left:-9px;width:17px;height:17px;border-radius:50%;background:var(--ember);
  color:${P.board};font-family:var(--sans);font-size:9.5px;font-weight:600;display:flex;align-items:center;
  justify-content:center;box-shadow:0 0 0 2.5px ${P.board}}
.notes{list-style:none;margin:20px 0 0;padding:0;display:grid;gap:11px}
.notes li{display:grid;grid-template-columns:17px 1fr;gap:9px;font-family:var(--sans);font-size:10.5px;line-height:1.5;color:${P.boardInk}}
.notes li>b{width:17px;height:17px;border-radius:50%;background:var(--ember);color:${P.board};font-size:9.5px;
  display:flex;align-items:center;justify-content:center;font-weight:600}
.notes li>span>b{display:block;color:var(--ember);letter-spacing:.13em;text-transform:uppercase;font-size:9px;font-weight:600;margin-bottom:2px}
</style></head><body>
<div class="title"><h1>Creature Collector — theme study 1: <i>Field Guide</i>, ${P.name}</h1>
<p>A mezzotint is engraved the other way round from a line plate: the ground starts black and the engraver works
up into the light. That is the logic here — light is emphasis, not decoration, and it does the job the paper
version had to spend an accent colour on. Drawn with the game’s own renderer and its own species, stats, moves
and prices.</p></div>
<div class="board">

<figure class="col">
  <p class="cap">i · the plate — a creature’s page</p>
  <div class="screen-wrap">
    <b class="mk" style="top:150px">1</b><b class="mk" style="top:500px">2</b><b class="mk" style="top:566px">3</b>
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
        <span><i class="tm" style="--t:${P.types.Ghost}"></i>Ghost</span>
        <span><i class="tm" style="--t:${P.types.Rock}"></i>Rock</span>
        <span style="color:var(--ink3)">Magic</span>
      </div>
      <p class="field-note">The turtle that bit the ferryman a hundred years ago. Still hungry.</p>
      <div class="minor"></div>
      <p class="eyebrow">Measurements at birth</p>
      ${STATS.map((st) => statRow(st, st[0] === 'Magic')).join('')}
    </div>
    <div class="skill"><span class="lab">Passive skill</span>
      <p><b>Mist Walker.</b> Melee and ranged defence rise by three tenths while a misty field lies over the ground.</p></div>
    <div class="pad"><div class="minor"></div><p class="eyebrow">Learns, by level</p>
      ${[['known', 'Cold Lick', 'Ghost', 'known'], ['next', 'Shade Step', 'Ghost', 'now'], ['lv 11', 'Sepulchre Form', 'Ghost', '']]
        .map(([lv, nm, tp, cls]) => `<div class="learn ${cls}"><span class="lv">${lv}</span><span class="nm">${nm}</span>
          <span class="tp"><i class="tm" style="--t:${P.types[tp]}"></i>${tp}</span></div>`).join('')}
    </div>
    </div>
  </div>
  <ol class="notes">
    <li><b>1</b><span><b>The frame is drawn, not bordered</b>Four inked edge tiles that repeat, four corner pieces from one asset placed by transform, butt caps so the seams do not blot. On a dark ground a light hairline blooms — the eye reads it as heavier than the same line reversed — so the weights barely move and the opacity does the work instead.</span></li>
    <li><b>2</b><span><b>The type colours need no migration</b>The eighteen in the game are already tuned for a dark ground; on paper every one of them had to be darkened to survive. Here they are lifted a little for the swatch and that is all — the dark theme costs nothing to adopt where the light one costs an audit.</span></li>
    <li><b>3</b><span><b>Light is the emphasis</b>The best stat is simply the brightest measure. The paper version spent its accent red on this; on a dark ground brightness says it better and gives the red back to the one thing that should own it.</span></li>
  </ol>
</figure>

<figure class="col">
  <p class="cap">ii · the ledger — how a long list behaves</p>
  <div class="screen-wrap">
    <b class="mk" style="top:286px">4</b><b class="mk" style="top:330px;left:auto;right:-9px">5</b>
    <div class="screen">
    <div class="runhead"><span>Crossroads</span><span>·</span><span>Market</span><span class="folio">5,000 g</span></div>
    <div class="swell"></div>
    <div class="pad">
      <h2 class="name" style="font-size:27px">The Market</h2>
      <p class="binom">Everything goes to your bag. Trainers pay gold when beaten.</p>
      <div class="minor"></div>
      <p class="eyebrow">Draughts and restoratives</p>
      ${ITEMS.map(itemRow).join('')}
      <div class="minor"></div>
      <p class="eyebrow">Scrolls · Ghost</p>
      ${[['Cold Lick', 'Melee 30. Three in ten leave the target numbed.', '#8b76c4', '420'],
         ['Shade Step', 'Melee 40. Strikes before slower creatures.', '#8b76c4', '640'],
         ['Vigil Call', 'Raises its own guard by one step.', '#8b76c4', '900']].map(itemRow).join('')}
      <div class="minor"></div>
      <p class="eyebrow">The broker</p>
      ${[['A word of something unseen', 'Lives in the Echo Chasm. Dark and Fire.', '#c0aa6a', '2,000'],
         ['A word of something unseen', 'Lives in the Windward Crags. Bug and Flying.', '#6ea3f8', '2,000']].map(itemRow).join('')}
      <div class="minor"></div>
      <p class="eyebrow">Charms</p>
      ${[['Ghost Charm', 'Lifts the holder’s Ghost moves by a fifth.', '#8b76c4', '3,200'],
         ['Lure Charm', 'Wild creatures come out more often on the road.', '#e0a05a', '2,400']].map(itemRow).join('')}
    </div>
    </div>
  </div>
  <ol class="notes">
    <li><b>4</b><span><b>The rules between rows are gone</b>On a dark ground the contrast already separates one row from the next, so the hairlines go and only the section breaks keep theirs. Rows come in shorter than the paper version and shorter than the cards they replace — the density the light theme had to pay for, this one gets back.</span></li>
    <li><b>5</b><span><b>Three roles, three signals</b>Brass is money, ember is the action in hand, brightness is emphasis. Nothing carries two jobs. Today one yellow marks prices, locks, evolution stages and primary buttons alike, and the eye cannot tell money from importance.</span></li>
  </ol>
</figure>

<figure class="col">
  <p class="cap">iii · the field — the theme under pressure</p>
  <div class="screen-wrap">
    <b class="mk" style="top:152px">6</b><b class="mk" style="top:590px">7</b>
    <div class="screen">
    <div class="runhead"><span>Heather Downs</span><span>·</span><span>Wild</span><span class="folio">Turn 3</span></div>
    <div class="swell"></div>
    <div class="pad" style="margin-top:14px"><div class="fieldline"><i class="tm" style="--t:${P.types.Mist}"></i>Misty field<span>3 turns</span></div></div>
    <div class="combat" style="margin-top:14px">
      <div class="who">
        <div class="tag">Wild<span class="el" style="--t:${P.types.Mist}">· Mist Elemental</span></div>
        <h3 class="cname">Ghastshell <i>lv 3</i></h3>
        <div class="hp"><span class="measure"><i class="tick" style="left:25%"></i><i class="tick" style="left:50%"></i><i class="tick" style="left:75%"></i><b style="width:62%"></b></span><span class="n">62%</span></div>
      </div>
      ${frame('sm', `<div class="mini">${art('ghastshell', 'guide:2', 150, 'left', 1, 'mist')}</div>`)}
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
      <p>A wild Ghastshell appeared, and it is a Mist Elemental.</p>
      <p>Phantomsnapper used Cold Lick.</p>
      <p>It told badly against the Ghastshell.</p>
    </div>
    <div class="moves">${MOVES.map((m, i) => moveCell(m, i === 0)).join('')}</div>
    <div class="acts"><button class="act">Bag</button><button class="act">Party</button>
      <button class="act primary">Capture</button><button class="act">Flee</button></div>
    <div class="pad"><div class="minor" style="margin-top:16px"></div><p class="eyebrow">Your party</p></div>
    <div class="party">
      ${[['Phantomsnapper', 100], ['Gloamfinch', 74], ['Tidedrake', 41], ['Slatebass', 96], ['Cinderwasp', 0], ['Kirinth', 12]]
        .map(([nm, hp]) => `<div class="pslot${hp ? '' : ' out'}"><span class="pm"></span><span class="pn">${nm}</span>
          <span class="measure"><i class="tick" style="left:50%"></i><b style="width:${hp}%"></b></span></div>`).join('')}
    </div>
    <div class="pad"><p class="carried-line"><span class="mk-p">◈</span> Phantomsnapper carries a <b>Greater Scholar’s Charm</b>.</p></div>
    </div>
  </div>
  <ol class="notes">
    <li><b>6</b><span><b>The art was always drawn for this</b>The creature renderer assumes a dark ground: on paper its contact shadows read as grey smudges and an Elemental’s aura filter all but vanishes. Here the wild Ghastshell is a Mist Elemental — one wild creature in a thousand — and you can see it. The dark theme is the one the art already wanted.</span></li>
    <li><b>7</b><span><b>The fight rearranged around two lit plates</b>Each combatant sits on a raised surface rather than in a box, which is the same device as the specimen plate and needs no border to say it. Names and measures sit beside the plate and mirror across the two rows, so the eye finds the same thing in the same place on each side.</span></li>
  </ol>
</figure>
</div>
</body></html>`;

const out = path.join(root, 'shots', `theme-fieldguide${LIGHT ? '-light' : ''}.html`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`wrote ${path.relative(root, out)} (${P.name}) ${(html.length / 1024).toFixed(1)} KB`);
