import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bundle, topLevelNames, squeeze } from '../build.js';

test('bundle produces a self-contained page', () => {
  const { html, modules } = bundle();
  assert.ok(modules.length > 10);
  assert.ok(html.includes('<title>Creature Collector</title>'));
  assert.ok(!/^\s*import\s/m.test(html), 'import left in bundle');
  assert.ok(!/^\s*export\s/m.test(html), 'export left in bundle');
  assert.ok(!html.includes('<!--STYLES-->') && !html.includes('<!--SCRIPT-->'));
  assert.ok(html.includes('viewport'));
});

test('the name check sees every declarator, so a clash cannot reach the browser as a syntax error', () => {
  assert.deepEqual(topLevelNames('let a = 1, b = 2;'), ['a', 'b']);
  assert.deepEqual(topLevelNames('const x = 1;\nfunction y() {}\nclass Z {}'), ['x', 'y', 'Z']);
  assert.deepEqual(topLevelNames("const s = 'a, b', t = 2;"), ['s', 't'], 'a comma inside a string is not a declarator');
  assert.deepEqual(topLevelNames('const f = (a, b) => a + b;'), ['f'], 'nor one inside an argument list');
  assert.deepEqual(topLevelNames('let one = 1; // and, two'), ['one'], 'nor one in a comment');
});

test('the squeeze drops comments and indentation and leaves the code alone', () => {
  const src = [
    '// a whole line',
    'const a = 1; // trailing',
    '  const b = "// not a comment";',
    'const re = /a\\/b/.test("x");',
    'const t = `keep',
    '  these spaces`;',
    '',
    'function f() {',
    '  return a;',
    '}',
  ].join('\n');
  const out = squeeze(src);
  assert.ok(!out.includes('a whole line') && !out.includes('trailing'), 'comments are gone');
  assert.ok(out.includes('"// not a comment"'), 'a comment inside a string stays');
  assert.ok(out.includes('`keep\n  these spaces`'), 'a template keeps its own whitespace');
  assert.ok(/^const re = \/a\\\/b\/\.test/m.test(out), 'a regex survives');
  assert.ok(!/^ /m.test(out.split('`keep')[0]), 'indentation is gone');
  assert.equal(out.split('\n').filter((l) => !l.trim()).length, 0, 'no blank lines');
});
