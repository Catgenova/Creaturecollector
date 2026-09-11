// Geometry helpers shared by the renderer and the evolution pass: path sampling and
// coordinate transforms over the absolute-command paths the part DSL emits.

/** Sample points along an SVG path (absolute and relative commands; curves are flattened). */
export function pathPoints(d) {
  const pts = [];
  const tok = d.match(/[MLHVCSQTAZmlhvcsqtaz]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/gi) || [];
  let i = 0, cmd = 'M', cx = 0, cy = 0, sx = 0, sy = 0, pcx = 0, pcy = 0, prevCurve = '';
  const rd = () => Number(tok[i++]);
  const cubic = (x1, y1, x2, y2, x, y) => {
    for (let k = 1; k <= 8; k++) {
      const t = k / 8, u = 1 - t;
      pts.push([u * u * u * cx + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x, u * u * u * cy + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y]);
    }
    pcx = x2; pcy = y2; cx = x; cy = y; prevCurve = 'C';
  };
  const quad = (x1, y1, x, y) => {
    for (let k = 1; k <= 6; k++) {
      const t = k / 6, u = 1 - t;
      pts.push([u * u * cx + 2 * u * t * x1 + t * t * x, u * u * cy + 2 * u * t * y1 + t * t * y]);
    }
    pcx = x1; pcy = y1; cx = x; cy = y; prevCurve = 'Q';
  };
  while (i < tok.length) {
    if (/[a-z]/i.test(tok[i])) cmd = tok[i++];
    const rel = cmd === cmd.toLowerCase();
    const ox = rel ? cx : 0, oy = rel ? cy : 0;
    switch (cmd.toUpperCase()) {
      case 'M': { const x = rd() + ox, y = rd() + oy; cx = sx = x; cy = sy = y; pts.push([x, y]); cmd = rel ? 'l' : 'L'; prevCurve = ''; break; }
      case 'L': { const x = rd() + ox, y = rd() + oy; cx = x; cy = y; pts.push([x, y]); prevCurve = ''; break; }
      case 'H': { cx = rd() + ox; pts.push([cx, cy]); prevCurve = ''; break; }
      case 'V': { cy = rd() + oy; pts.push([cx, cy]); prevCurve = ''; break; }
      case 'C': { const x1 = rd() + ox, y1 = rd() + oy, x2 = rd() + ox, y2 = rd() + oy, x = rd() + ox, y = rd() + oy; cubic(x1, y1, x2, y2, x, y); break; }
      case 'S': { const x2 = rd() + ox, y2 = rd() + oy, x = rd() + ox, y = rd() + oy; const x1 = prevCurve === 'C' ? 2 * cx - pcx : cx, y1 = prevCurve === 'C' ? 2 * cy - pcy : cy; cubic(x1, y1, x2, y2, x, y); break; }
      case 'Q': { const x1 = rd() + ox, y1 = rd() + oy, x = rd() + ox, y = rd() + oy; quad(x1, y1, x, y); break; }
      case 'T': { const x = rd() + ox, y = rd() + oy; const x1 = prevCurve === 'Q' ? 2 * cx - pcx : cx, y1 = prevCurve === 'Q' ? 2 * cy - pcy : cy; quad(x1, y1, x, y); break; }
      case 'A': { const rx = rd(), ry = rd(); rd(); rd(); rd(); const x = rd() + ox, y = rd() + oy; const mx = (cx + x) / 2, my = (cy + y) / 2; pts.push([mx - rx, my - ry], [mx + rx, my + ry], [x, y]); cx = x; cy = y; prevCurve = ''; break; }
      case 'Z': { cx = sx; cy = sy; prevCurve = ''; break; }
      default: i++;
    }
  }
  return pts;
}


/**
 * Map every coordinate pair of an absolute path (M, L, C, Q, S, T, Z as the DSL emits) through fn(x, y).
 * Returns the new path string.
 */
export function transformPathD(d, fn) {
  const tok = d.match(/[MLCQSTZmlcqstz]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/gi) || [];
  let out = '', pending = null;
  const fmt = (v) => { const r = Math.round(v * 100) / 100; return (Object.is(r, -0) ? 0 : r).toString(); };
  for (const t of tok) {
    if (/[a-z]/i.test(t)) { out += t; pending = null; continue; }
    if (pending == null) { pending = Number(t); continue; }
    const [x, y] = fn(pending, Number(t));
    out += (out.endsWith('Z') || /[A-Za-z]$/.test(out) ? '' : ' ') + `${fmt(x)},${fmt(y)}`;
    pending = null;
  }
  return out;
}
