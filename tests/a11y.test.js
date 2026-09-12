// Getting around without a touchscreen. There is no DOM in here, so this checks the rules the source has to
// keep: every sheet takes the keyboard, focus is always visible, and nothing on the page flashes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hpLabel } from '../src/ui/a11y.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const css = read('src/styles.css');
const UI = ['src/ui/fight.js', 'src/ui/world.js', 'src/ui/sheet.js'];

test('every sheet on the page takes the keyboard with it', () => {
  for (const file of UI) {
    const src = read(file);
    const sheets = (src.match(/'aria-modal': 'true'/g) || []).length;
    if (!sheets) continue;
    assert.ok(src.includes("from './a11y.js'"), `${file} opens a dialog without the keyboard behaviour`);
    const traps = (src.match(/trapFocus\(/g) || []).length;
    assert.ok(traps >= sheets, `${file} opens ${sheets} dialogs but only traps ${traps}`);
  }
});

test('a dialog is announced as one and can be named', () => {
  for (const file of UI) {
    const src = read(file);
    for (const m of src.matchAll(/role: 'dialog'([^\n]*)/g)) {
      assert.ok(/aria-label/.test(m[1]), `a dialog in ${file} has no name: ${m[0].slice(0, 90)}`);
    }
  }
});

test('anything that answers a tap answers a key as well', () => {
  for (const file of UI) {
    const src = read(file);
    for (const m of src.matchAll(/role: 'button'/g)) {
      const around = src.slice(Math.max(0, m.index - 400), m.index + 400);
      assert.ok(/onkeydown|el\.onkeydown/.test(around), `a role=button in ${file} cannot be pressed by keyboard`);
      assert.ok(/tabindex/.test(around), `a role=button in ${file} cannot be reached by keyboard`);
    }
  }
});

test('the focus ring is there and nothing puts it out', () => {
  assert.match(css, /:focus-visible \{[^}]*outline:[^}]*\}/, 'there is a focus ring');
  const rule = /:focus-visible \{([^}]*)\}/.exec(css)[1];
  assert.ok(/3px|2px/.test(rule) && /solid/.test(rule), `the ring is drawn: ${rule.trim()}`);
  for (const m of css.matchAll(/([^{}]*):focus[^{}]*\{([^}]*)\}/g)) {
    if (/outline:\s*(none|0)/.test(m[2]) && !/outline:\s*\d/.test(m[2])) assert.fail(`${m[1].trim()} takes the focus ring away without putting one back`);
  }
});

test('nothing on the page flashes', () => {
  // three flashes a second is the line; the fastest thing here is a wing, and it is far below it
  for (const m of css.matchAll(/animation:\s*[\w-]+\s+([\d.]+)(m?s)[^;]*infinite/g)) {
    const ms = m[2] === 's' ? Number(m[1]) * 1000 : Number(m[1]);
    assert.ok(ms >= 700, `something repeats every ${ms}ms`);
  }
  assert.ok(css.includes('html[data-motion="reduced"] *'), 'the motion setting stops animation everywhere');
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/, 'and so does the system setting');
});

test('a bar reads out as words', () => {
  assert.equal(hpLabel('Ghastshell', 12, 48), 'Ghastshell: 12 of 48 health, 25 percent');
  assert.equal(hpLabel('Ghastshell', 0, 48), 'Ghastshell: 0 of 48 health, 0 percent');
  assert.equal(hpLabel('Ghastshell', 3, 0), 'Ghastshell: 3 of 0 health, 0 percent', 'a battler with no max does not divide by zero');
});
