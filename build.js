#!/usr/bin/env node
// Zero-dependency bundler: inlines src/ ES modules + CSS into a single index.html.
//
// Conventions the source must follow (enforced below where possible):
//   - named exports only (no `export default`)
//   - one-line or brace-block imports of relative paths only
//   - every top-level declaration name is unique across ALL modules,
//     because the bundle shares one script scope
//
// Usage: node build.js            -> writes ./index.html
//        node build.js --check    -> builds to memory only, exits non-zero on problems
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, 'src');
const ENTRY = path.join(SRC, 'ui', 'main.js');
const TEMPLATE = path.join(SRC, 'app.html');
const CSS = path.join(SRC, 'styles.css');
const OUT = path.join(ROOT, 'index.html');
const checkOnly = process.argv.includes('--check');

const IMPORT_RE = /^[ \t]*import\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)?\s*(?:from\s*)?['"]([^'"]+)['"]\s*;?[ \t]*$/gm;

function readModule(file, seen, order) {
  file = path.resolve(file);
  if (seen.has(file)) return;
  seen.set(file, 'visiting');
  const code = fs.readFileSync(file, 'utf8');
  const deps = [];
  for (const m of code.matchAll(IMPORT_RE)) {
    const spec = m[1];
    if (!spec.startsWith('.')) throw new Error(`${rel(file)}: only relative imports are supported (got ${spec})`);
    deps.push(path.resolve(path.dirname(file), spec));
  }
  for (const d of deps) {
    if (seen.get(d) === 'visiting') throw new Error(`circular import between ${rel(file)} and ${rel(d)}`);
    readModule(d, seen, order);
  }
  seen.set(file, 'done');
  order.push({ file, code });
}

function rel(f) { return path.relative(ROOT, f).split(path.sep).join('/'); }

function transform(code, file) {
  let out = code.replace(IMPORT_RE, '');
  if (/^\s*export\s+default\b/m.test(out)) throw new Error(`${rel(file)}: export default is not supported`);
  out = out.replace(/^[ \t]*export\s*\{[^}]*\}\s*;?[ \t]*$/gm, '');
  out = out.replace(/^([ \t]*)export\s+(?=(?:async\s+)?function\b|const\b|let\b|var\b|class\b)/gm, '$1');
  if (/^\s*import\b/m.test(out)) throw new Error(`${rel(file)}: unsupported import form left after transform`);
  if (/^\s*export\b/m.test(out)) throw new Error(`${rel(file)}: unsupported export form left after transform`);
  return out;
}

function topLevelNames(code) {
  const names = [];
  const re = /^(?:async\s+)?(?:function\*?|const|let|var|class)\s+([A-Za-z_$][\w$]*)/gm;
  for (const m of code.matchAll(re)) names.push(m[1]);
  return names;
}

export function bundle() {
  const seen = new Map();
  const order = [];
  readModule(ENTRY, seen, order);

  const owners = new Map();
  const chunks = [];
  for (const { file, code } of order) {
    const js = transform(code, file);
    for (const n of topLevelNames(js)) {
      if (owners.has(n)) throw new Error(`duplicate top-level name "${n}" in ${rel(file)} and ${owners.get(n)}`);
      owners.set(n, rel(file));
    }
    chunks.push(`// ---- ${rel(file)} ----\n${js.trim()}\n`);
  }

  const css = fs.readFileSync(CSS, 'utf8');
  const template = fs.readFileSync(TEMPLATE, 'utf8');
  const banner = `<!-- GENERATED FILE. Edit files in src/ and run: node build.js -->\n`;
  const script = `<script>\n"use strict";\n(() => {\n${chunks.join('\n')}\n})();\n</script>`;
  const html = banner + template
    .replace('<!--STYLES-->', () => `<style>\n${css.trim()}\n</style>`)
    .replace('<!--SCRIPT-->', () => script);
  if (html.includes('<!--STYLES-->') || html.includes('<!--SCRIPT-->')) throw new Error('template markers not replaced');
  return { html, modules: order.map(o => rel(o.file)) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { html, modules } = bundle();
    if (!checkOnly) fs.writeFileSync(OUT, html);
    const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
    console.log(`${checkOnly ? 'checked' : 'wrote'} index.html (${kb} KB, ${modules.length} modules)`);
  } catch (e) {
    console.error('build failed:', e.message);
    process.exit(1);
  }
}
