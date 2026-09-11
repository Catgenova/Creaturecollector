import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bundle } from '../build.js';

test('bundle produces a self-contained page', () => {
  const { html, modules } = bundle();
  assert.ok(modules.length > 10);
  assert.ok(html.includes('<title>Creature Collector</title>'));
  assert.ok(!/^\s*import\s/m.test(html), 'import left in bundle');
  assert.ok(!/^\s*export\s/m.test(html), 'export left in bundle');
  assert.ok(!html.includes('<!--STYLES-->') && !html.includes('<!--SCRIPT-->'));
  assert.ok(html.includes('viewport'));
});
