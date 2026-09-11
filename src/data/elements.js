// Elementals. One wild creature in a thousand is born of an element: every part it has carries
// that element as an animated SVG filter (one filter per element), and it knows the element's
// core ability. Parts keep their element when they are passed down in fusion; the ability has a
// chance to follow. `aura` on a genome maps slot -> element id.
export const ELEMENTAL_CHANCE = 1 / 1000;

export const ELEMENTS = {
  fire:   { id: 'fire',   name: 'Fire',   ability: 'inferno_core', types: ['Fire'],             color: '#ff7a1a' },
  water:  { id: 'water',  name: 'Water',  ability: 'tide_core',    types: ['Water'],            color: '#4fd6ff' },
  storm:  { id: 'storm',  name: 'Storm',  ability: 'storm_core',   types: ['Electric'],         color: '#ffe14a' },
  frost:  { id: 'frost',  name: 'Frost',  ability: 'frost_core',   types: ['Ice'],              color: '#9fe8ff' },
  bloom:  { id: 'bloom',  name: 'Bloom',  ability: 'verdant_core', types: ['Grass'],            color: '#7ded6a' },
  shadow: { id: 'shadow', name: 'Shadow', ability: 'umbral_core',  types: ['Dark', 'Ghost'],    color: '#9d5cf0' },
  light:  { id: 'light',  name: 'Light',  ability: 'radiant_core', types: ['Fairy', 'Psychic'], color: '#fff1a8' },
  earth:  { id: 'earth',  name: 'Earth',  ability: 'quake_core',   types: ['Ground', 'Rock'],   color: '#c8913a' },
  rust:    { id: 'rust',    name: 'Rust',    ability: 'corrosion_core', types: ['Steel', 'Poison'],  color: '#d07a3a' },
  blood:   { id: 'blood',   name: 'Blood',   ability: 'vital_core',     types: ['Dark', 'Fighting'], color: '#e0304a' },
  void:    { id: 'void',    name: 'Void',    ability: 'void_core',      types: ['Ghost', 'Psychic'], color: '#6a3ab8' },
  moon:    { id: 'moon',    name: 'Moon',    ability: 'lunar_core',     types: ['Dark', 'Fairy'],    color: '#d6defc' },
  crystal: { id: 'crystal', name: 'Crystal', ability: 'resonant_core',  types: ['Rock', 'Psychic'],  color: '#8ef0ff' },
  mist:    { id: 'mist',    name: 'Mist',    ability: 'mist_core',      types: ['Water', 'Ghost'],   color: '#c4ecf4' },
};
export const ELEMENT_IDS = Object.keys(ELEMENTS);

/** core ability id -> element id */
export const CORE_ABILITIES = Object.fromEntries(ELEMENT_IDS.map((id) => [ELEMENTS[id].ability, id]));
export function isCoreAbility(ability) { return Boolean(CORE_ABILITIES[ability]); }
/** The move types a core ability empowers, or null for an ordinary ability. */
export function coreTypes(ability) { const e = CORE_ABILITIES[ability]; return e ? ELEMENTS[e].types : null; }
export function elementName(id) { return ELEMENTS[id] ? ELEMENTS[id].name : 'Unknown'; }

// ---- filters -------------------------------------------------------------------------------
// Each element is one SVG filter. The filter region is generous so glows and displacement are
// not clipped at the part's bounding box. `live` adds the SMIL animation; static renders (card
// lists, screenshots, reduced motion) get the same look frozen.

const anim = (live, attr, values, dur, extra = '') => (live ? `<animate attributeName="${attr}" values="${values}" dur="${dur}" repeatCount="indefinite"${extra}/>` : '');
const discrete = ' calcMode="discrete"';
const IDENT = '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0';
const BRIGHT = '1.3 0 0 0 0.04 0 1.3 0 0 0.04 0 0 1.3 0 0.02 0 0 0 1 0';
const WHITE = '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0';
const INVERT = '-0.7 0 0 0 0.8 0 -0.7 0 0 0.75 0 0 -0.7 0 0.95 0 0 0 1 0';

/** Soft coloured glow around the source alpha, as filter primitives producing `result`. */
const glow = (live, result, color, radius, blur, opacity, pulse, dur) =>
  `<feMorphology in="SourceAlpha" operator="dilate" radius="${radius}" result="${result}A"/>` +
  `<feGaussianBlur in="${result}A" stdDeviation="${blur}" result="${result}B"/>` +
  `<feFlood flood-color="${color}" flood-opacity="${opacity}" result="${result}C">${pulse ? anim(live, 'flood-opacity', pulse, dur) : ''}</feFlood>` +
  `<feComposite in="${result}C" in2="${result}B" operator="in" result="${result}"/>`;

const FILTERS = {
  fire: (live) =>
    `<feTurbulence type="fractalNoise" baseFrequency="0.03 0.09" numOctaves="2" seed="3" result="n">${anim(live, 'baseFrequency', '0.03 0.09;0.045 0.12;0.03 0.09', '1.4s')}</feTurbulence>` +
    `<feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/>` +
    glow(live, 'glow', '#ff7a1a', 2, 3, 0.8, '0.55;0.95;0.6;0.9;0.55', '0.9s') +
    `<feMerge><feMergeNode in="glow"/><feMergeNode in="d"/></feMerge>`,

  water: (live) =>
    `<feTurbulence type="turbulence" baseFrequency="0.02 0.06" numOctaves="2" seed="7" result="n">${anim(live, 'baseFrequency', '0.02 0.06;0.03 0.05;0.02 0.06', '3.2s')}</feTurbulence>` +
    `<feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="B" result="d"/>` +
    glow(live, 'glow', '#4fd6ff', 1.5, 3, 0.7, '0.45;0.85;0.45', '2.4s') +
    `<feMerge><feMergeNode in="glow"/><feMergeNode in="d"/></feMerge>`,

  storm: (live) =>
    `<feColorMatrix in="SourceGraphic" type="matrix" values="${IDENT}" result="b">${anim(live, 'values', `${IDENT};${BRIGHT};${IDENT};${IDENT};${BRIGHT};${IDENT};${IDENT}`, '0.7s', discrete)}</feColorMatrix>` +
    `<feOffset in="b" dx="0" dy="0" result="j">${anim(live, 'dx', '0;1.5;-1.5;0;0;0;0;0', '0.6s', discrete)}</feOffset>` +
    glow(live, 'glow', '#ffe14a', 2, 2.5, 0.8, '0.3;0.95;0.4;0.3;0.9;0.3', '0.7s') +
    `<feMerge><feMergeNode in="glow"/><feMergeNode in="j"/></feMerge>`,

  frost: (live) =>
    glow(live, 'glow', '#7fd8ff', 3, 3, 0.6, '0.35;0.7;0.35', '3s') +
    `<feMorphology in="SourceAlpha" operator="dilate" radius="1.2" result="r"/>` +
    `<feFlood flood-color="#e8fbff" flood-opacity="0.9" result="rc"/><feComposite in="rc" in2="r" operator="in" result="rim"/>` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" seed="1" result="n">${anim(live, 'seed', '1;2;3;4;5;6', '1.2s', discrete)}</feTurbulence>` +
    `<feComponentTransfer in="n" result="t"><feFuncA type="linear" slope="7" intercept="-5"/></feComponentTransfer>` +
    `<feColorMatrix in="t" type="matrix" values="${WHITE}" result="w"/>` +
    `<feComposite in="w" in2="SourceAlpha" operator="in" result="spk"/>` +
    `<feMerge><feMergeNode in="glow"/><feMergeNode in="rim"/><feMergeNode in="SourceGraphic"/><feMergeNode in="spk"/></feMerge>`,

  bloom: (live) =>
    `<feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="1" seed="5" result="n">${anim(live, 'baseFrequency', '0.012 0.03;0.016 0.036;0.012 0.03', '3.6s')}</feTurbulence>` +
    `<feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G" result="d"/>` +
    glow(live, 'glow', '#7ded6a', 2, 3.5, 0.6, '0.35;0.75;0.35', '2.6s') +
    `<feTurbulence type="fractalNoise" baseFrequency="0.3" numOctaves="1" seed="9" result="sn"/>` +
    `<feComponentTransfer in="sn" result="st"><feFuncA type="linear" slope="8" intercept="-6.2"/></feComponentTransfer>` +
    `<feColorMatrix in="st" type="matrix" values="0 0 0 0 0.9 0 0 0 0 1 0 0 0 0 0.5 0 0 0 1 0" result="sc"/>` +
    `<feOffset in="sc" dx="0" dy="0" result="so">${anim(live, 'dy', '10;-10', '4s')}</feOffset>` +
    `<feComposite in="so" in2="glowA" operator="in" result="spores"/>` +
    `<feMerge><feMergeNode in="glow"/><feMergeNode in="d"/><feMergeNode in="spores"/></feMerge>`,

  shadow: (live) =>
    `<feColorMatrix in="SourceGraphic" type="matrix" values="0.55 0.2 0.15 0 -0.03 0.12 0.6 0.15 0 -0.03 0.16 0.2 0.7 0 0 0 0 0 1 0" result="dk"/>` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="1" seed="4" result="n">${anim(live, 'baseFrequency', '0.012 0.03;0.018 0.04;0.012 0.03', '3s')}</feTurbulence>` +
    `<feDisplacementMap in="dk" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G" result="d"/>` +
    `<feMorphology in="SourceAlpha" operator="dilate" radius="3" result="a"/>` +
    `<feGaussianBlur in="a" stdDeviation="4" result="ab">${anim(live, 'stdDeviation', '3;6;3', '2.8s')}</feGaussianBlur>` +
    `<feOffset in="ab" dx="0" dy="-2" result="ao">${anim(live, 'dy', '0;-4;0', '2.8s')}</feOffset>` +
    `<feFlood flood-color="#5a2d8a" flood-opacity="0.85" result="c"/><feComposite in="c" in2="ao" operator="in" result="smoke"/>` +
    `<feMerge><feMergeNode in="smoke"/><feMergeNode in="d"/></feMerge>`,

  light: (live) =>
    `<feColorMatrix in="SourceGraphic" type="hueRotate" values="0" result="h">${anim(live, 'values', '0;12;0;-12;0', '5s')}</feColorMatrix>` +
    `<feComponentTransfer in="h" result="br"><feFuncR type="linear" slope="1.08"/><feFuncG type="linear" slope="1.08"/><feFuncB type="linear" slope="1.06"/></feComponentTransfer>` +
    glow(live, 'halo', '#fff1a8', 2.5, 5, 0.8, '0.45;0.95;0.45', '1.8s') +
    `<feMerge><feMergeNode in="halo"/><feMergeNode in="br"/></feMerge>`,

  earth: (live) =>
    `<feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="11" result="n"/>` +
    `<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.25 0 0 0 0 0.18 0 0 0 0 0.1 0 0 0 0.5 0" result="grit"/>` +
    `<feComposite in="grit" in2="SourceAlpha" operator="in" result="g2"/>` +
    `<feBlend in="g2" in2="SourceGraphic" mode="multiply" result="tex"/>` +
    `<feOffset in="tex" dx="0" dy="0" result="rum">${anim(live, 'dx', '0;0;1.2;-1.2;0.8;-0.8;0;0', '3s', `${discrete} keyTimes="0;0.7;0.74;0.78;0.82;0.86;0.9;1"`)}</feOffset>` +
    glow(live, 'glow', '#c8913a', 1.5, 2, 0.55, null, null) +
    `<feMerge><feMergeNode in="glow"/><feMergeNode in="rum"/></feMerge>`,

  rust: (live) =>
    `<feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="13" result="n"/>` +
    `<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.55 0 0 0 0 0.28 0 0 0 0 0.08 0 0 0 0.75 0" result="ore"/>` +
    `<feComposite in="ore" in2="SourceAlpha" operator="in" result="ore2"/>` +
    `<feBlend in="ore2" in2="SourceGraphic" mode="multiply" result="tex"/>` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="1" seed="2" result="fn">${anim(live, 'seed', '2;3;4;5;6;7', '1.6s', discrete)}</feTurbulence>` +
    `<feComponentTransfer in="fn" result="ft"><feFuncA type="linear" slope="9" intercept="-7.2"/></feComponentTransfer>` +
    `<feColorMatrix in="ft" type="matrix" values="0 0 0 0 0.85 0 0 0 0 0.45 0 0 0 0 0.15 0 0 0 1 0" result="fc"/>` +
    `<feOffset in="fc" dx="0" dy="0" result="fo">${anim(live, 'dy', '-6;8', '2.2s')}</feOffset>` +
    `<feMorphology in="SourceAlpha" operator="dilate" radius="3" result="fa"/>` +
    `<feComposite in="fo" in2="fa" operator="in" result="flakes"/>` +
    glow(live, 'glow', '#d07a3a', 1.5, 2.5, 0.5, null, null) +
    `<feMerge><feMergeNode in="glow"/><feMergeNode in="tex"/><feMergeNode in="flakes"/></feMerge>`,

  blood: (live) =>
    `<feColorMatrix in="SourceGraphic" type="matrix" values="1.05 0.05 0.05 0 0 0.02 0.9 0.02 0 0 0.02 0.02 0.9 0 0 0 0 0 1 0" result="tint"/>` +
    `<feMorphology in="SourceAlpha" operator="dilate" radius="0.5" result="sw">${anim(live, 'radius', '0.2;1.4;0.4;1.2;0.3;0.2;0.2', '1.1s')}</feMorphology>` +
    `<feFlood flood-color="#7a0f20" flood-opacity="0.9" result="swc"/><feComposite in="swc" in2="sw" operator="in" result="swell"/>` +
    glow(live, 'glow', '#e0304a', 2, 3, 0.7, '0.25;0.9;0.35;0.85;0.3;0.25;0.25', '1.1s') +
    `<feMerge><feMergeNode in="glow"/><feMergeNode in="swell"/><feMergeNode in="tint"/></feMerge>`,

  void: (live) =>
    `<feColorMatrix in="SourceGraphic" type="matrix" values="0.5 0.1 0.2 0 -0.02 0.1 0.4 0.25 0 -0.02 0.2 0.15 0.75 0 0.02 0 0 0 1 0" result="dk"/>` +
    `<feTurbulence type="turbulence" baseFrequency="0.02 0.02" numOctaves="1" seed="21" result="n">${anim(live, 'baseFrequency', '0.02 0.02;0.03 0.025;0.02 0.02', '4s')}</feTurbulence>` +
    `<feDisplacementMap in="dk" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/>` +
    `<feColorMatrix in="d" type="matrix" values="${IDENT}" result="inv">${anim(live, 'values', `${IDENT};${IDENT};${INVERT};${IDENT};${IDENT};${IDENT}`, '3.4s', discrete)}</feColorMatrix>` +
    glow(live, 'glow', '#6a3ab8', 3, 4, 0.75, '0.4;0.8;0.4', '3.4s') +
    `<feMerge><feMergeNode in="glow"/><feMergeNode in="inv"/></feMerge>`,

  moon: (live) =>
    `<feColorMatrix in="SourceGraphic" type="matrix" values="0.92 0.03 0.08 0 0.02 0.03 0.95 0.08 0 0.03 0.05 0.06 1.1 0 0.06 0 0 0 1 0" result="cool"/>` +
    `<feMorphology in="SourceAlpha" operator="dilate" radius="2.5" result="ma"/>` +
    `<feGaussianBlur in="ma" stdDeviation="3" result="mb"/>` +
    `<feOffset in="mb" dx="5" dy="0" result="mo">${anim(live, 'dx', '5;0;-5;0;5', '5s')}${anim(live, 'dy', '0;-5;0;5;0', '5s')}</feOffset>` +
    `<feFlood flood-color="#d6defc" flood-opacity="0.85" result="mc"/><feComposite in="mc" in2="mo" operator="in" result="crescent"/>` +
    glow(live, 'halo', '#9fb4ff', 1.5, 4, 0.45, null, null) +
    `<feMerge><feMergeNode in="halo"/><feMergeNode in="crescent"/><feMergeNode in="cool"/></feMerge>`,

  crystal: (live) =>
    `<feComponentTransfer in="SourceGraphic" result="facet"><feFuncR type="discrete" tableValues="0.12 0.35 0.58 0.8 1"/><feFuncG type="discrete" tableValues="0.12 0.35 0.58 0.8 1"/><feFuncB type="discrete" tableValues="0.16 0.4 0.62 0.84 1"/></feComponentTransfer>` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="3" result="gn">${anim(live, 'seed', '3;8;13;18;23', '1.5s', discrete)}</feTurbulence>` +
    `<feComponentTransfer in="gn" result="gt"><feFuncA type="linear" slope="10" intercept="-8.4"/></feComponentTransfer>` +
    `<feColorMatrix in="gt" type="matrix" values="0 0 0 0 0.85 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" result="gc"/>` +
    `<feMorphology in="gc" operator="dilate" radius="1" result="gd"/>` +
    `<feComposite in="gd" in2="SourceAlpha" operator="in" result="glints"/>` +
    glow(live, 'glow', '#8ef0ff', 2, 3, 0.65, '0.4;0.8;0.4', '2.2s') +
    `<feMerge><feMergeNode in="glow"/><feMergeNode in="facet"/><feMergeNode in="glints"/></feMerge>`,

  mist: (live) =>
    `<feMorphology in="SourceGraphic" operator="erode" radius="0.4" result="er">${anim(live, 'radius', '0.2;1.2;0.4;1.5;0.2', '3.6s')}</feMorphology>` +
    `<feGaussianBlur in="er" stdDeviation="0.6" result="soft"/>` +
    `<feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0.05 0 1 0 0 0.06 0 0 1 0 0.08 0 0 0 0.35 0" result="ghost"/>` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.02 0.04" numOctaves="1" seed="17" result="n">${anim(live, 'baseFrequency', '0.02 0.04;0.026 0.05;0.02 0.04', '4.4s')}</feTurbulence>` +
    `<feDisplacementMap in="ghost" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G" result="drift"/>` +
    glow(live, 'glow', '#c4ecf4', 3, 5, 0.5, '0.3;0.6;0.3', '4.4s') +
    `<feMerge><feMergeNode in="glow"/><feMergeNode in="drift"/><feMergeNode in="soft"/></feMerge>`,
};

/** The <filter> element for an element, with the given id attribute. */
export function elementFilterSvg(elem, fid, live = true) {
  const body = FILTERS[elem];
  if (!body) return '';
  return `<filter id="${fid}" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">${body(live)}</filter>`;
}
