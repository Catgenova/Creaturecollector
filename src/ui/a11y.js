// Getting around without a touchscreen.
//
// Every bottom sheet in the game is the same shape — a backdrop and a panel over the page — so the
// keyboard behaviour a dialog owes its reader lives here once: focus moves into the sheet when it
// opens, Tab cannot walk out of it, Escape closes it, and focus goes back to whatever opened it.
// Behind the sheet the page is marked inert so a screen reader reads the dialog and nothing else.
//
// Nothing here draws anything; a sheet passes its own two nodes in and gets a release function back.

/** Everything in a subtree the keyboard can reach, in the order Tab visits it. */
export function focusablesIn(root) {
  if (!root) return [];
  const sel = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return [...root.querySelectorAll(sel)].filter((el) => !el.hidden && el.getAttribute('aria-hidden') !== 'true' && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));
}

/** The one thing to put the cursor on when a sheet opens: what it asks for, else the first thing that is not the close button. */
export function firstFocus(root) {
  const wanted = root && root.querySelector('[data-autofocus]');
  if (wanted) return wanted;
  const all = focusablesIn(root);
  return all.find((el) => !el.classList.contains('close')) || all[0] || null;
}

/** What a control is called, for finding it again after the screen behind a sheet has been redrawn. */
function nameOf(el) { return el && ((el.getAttribute && el.getAttribute('aria-label')) || (el.textContent || '').trim()).slice(0, 60); }

/**
 * Put the focus back where it was. Closing a sheet often redraws the screen underneath, so the button that
 * opened it is usually a different node by then with the same name on it: find that one rather than dropping
 * the reader back at the top of the page.
 */
function restoreFocus(el, tag, name) {
  if (el && el.isConnected && el.focus) { el.focus({ preventScroll: true }); return true; }
  if (!name) return false;
  const again = focusablesIn(document.body).find((c) => c.tagName === tag && nameOf(c) === name);
  if (again) { again.focus({ preventScroll: true }); return true; }
  return false;
}

/**
 * The parts of the page a dialog covers up. Walking down from <body>, anything that is neither the dialog nor
 * on the way to it is marked; the branches that lead to it are stepped into instead. That way it works for a
 * sheet appended to the body and for a dialog drawn inside the map alike.
 */
function coveredBy(nodes) {
  const keep = new Set();
  for (const n of nodes) for (let el = n; el && el !== document.body; el = el.parentElement) keep.add(el);
  const out = [];
  const walk = (parent) => {
    for (const el of parent.children) {
      if (el.tagName === 'SCRIPT') continue;
      if (nodes.includes(el)) continue;
      if (keep.has(el)) walk(el); else out.push(el);
    }
  };
  walk(document.body);
  return out;
}

/**
 * Sheets stack — the creature sheet opens over the party sheet — so which parts of the page are covered is a
 * property of every open dialog at once, not of any one of them. Each trap remembering what it found and
 * putting it back on the way out gets this wrong the moment two are closed out of order: the second trap
 * recorded the page as already inert, so restoring it last leaves the whole page inert and nothing on it
 * answers a tap. So the marks live here instead. Elements remember their pre-dialog state once, the covered
 * set is worked out afresh from whichever trap is on top, and everything is put back only when the last
 * trap goes.
 */
const openTraps = [];
const marked = new Map(); // element -> what it was before any dialog covered it

function applyCover() {
  const top = openTraps[openTraps.length - 1];
  const cover = new Set(top ? coveredBy(top) : []);
  for (const el of cover) {
    if (!marked.has(el)) marked.set(el, { inert: el.inert, aria: el.getAttribute('aria-hidden') });
    el.inert = true;
    el.setAttribute('aria-hidden', 'true');
  }
  for (const [el, was] of [...marked]) {
    if (cover.has(el)) continue;
    el.inert = was.inert;
    if (was.aria == null) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', was.aria);
    marked.delete(el);
  }
}

/**
 * Give a sheet its keyboard behaviour. `nodes` are the elements that make it up (panel first, backdrop
 * and any others after); `opts.onEscape` is called when Escape is pressed, and when it is left out
 * Escape does nothing — a sheet that must be answered stays put. Returns a function that undoes all of
 * it: call it from the sheet's own close.
 */
export function trapFocus(nodes, opts = {}) {
  const list = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
  const panel = list[0];
  if (!panel) return () => {};
  const wasFocused = document.activeElement;
  const wasTag = wasFocused && wasFocused.tagName, wasName = nameOf(wasFocused);
  openTraps.push(list);
  applyCover();
  const onKey = (e) => {
    if (e.key === 'Escape' && opts.onEscape) { e.preventDefault(); e.stopPropagation(); opts.onEscape(); return; }
    if (e.key !== 'Tab') return;
    const items = focusablesIn(panel);
    if (!items.length) { e.preventDefault(); panel.focus(); return; }
    const first = items[0], last = items[items.length - 1];
    const here = document.activeElement;
    if (!panel.contains(here)) { e.preventDefault(); (e.shiftKey ? last : first).focus(); return; }
    if (e.shiftKey && here === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && here === last) { e.preventDefault(); first.focus(); }
  };
  document.addEventListener('keydown', onKey, true);
  if (!panel.hasAttribute('tabindex')) panel.setAttribute('tabindex', '-1');
  const target = opts.focus === false ? null : firstFocus(panel) || panel;
  if (target) requestAnimationFrame(() => { if (target.isConnected) target.focus({ preventScroll: true }); });
  let released = false;
  return () => {
    if (released) return; // a sheet whose close runs twice must not pop somebody else's trap
    released = true;
    document.removeEventListener('keydown', onKey, true);
    const at = openTraps.indexOf(list);
    if (at >= 0) openTraps.splice(at, 1);
    applyCover();
    // a frame late on purpose: closing a sheet usually redraws the screen behind it, and the button to go back
    // to only exists once that redraw has run
    if (opts.restore !== false && wasFocused && wasFocused !== document.body) requestAnimationFrame(() => restoreFocus(wasFocused, wasTag, wasName));
  };
}

/** A whole number as words a screen reader can read out, for bars and counters that only show a shape. */
export function hpLabel(name, hp, maxHp) {
  const pct = maxHp > 0 ? Math.round((hp / maxHp) * 100) : 0;
  return `${name}: ${hp} of ${maxHp} health, ${pct} percent`;
}
