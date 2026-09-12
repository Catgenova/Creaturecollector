#!/usr/bin/env node
// Zero-dependency bundler: inlines src/ ES modules + CSS into a single index.html.
//
// Conventions the source must follow (enforced below where possible):
//   - named exports only (no `export default`)
//   - one-line or brace-block imports of relative paths only
//   - every top-level declaration name is unique across ALL modules,
//     because the bundle shares one script scope
//
// The bundle is squeezed on the way out: comments and indentation go, the code itself is untouched
// (no renaming, no joining of lines, so behaviour and stack lines stay as they are). Pass --pretty to
// keep the source as written when you want to read the built file.
//
// Usage: node build.js            -> writes ./index.html
//        node build.js --check    -> builds to memory only, exits non-zero on problems
//        node build.js --pretty   -> skip the squeeze
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
const pretty = process.argv.includes('--pretty');

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

/**
 * Drop comments and indentation without touching the code. A scanner rather than a regex, because a
 * `//` inside a string, a `/` that starts a regex and a template literal that spans lines all have to
 * be told apart. Lines are never joined: automatic semicolon insertion then behaves exactly as before.
 */
export function squeeze(src) {
  const out = [];
  const n = src.length;
  let i = 0, atLineStart = true, prevSig = '', tail = '';
  const push = (ch) => {
    out.push(ch);
    tail = (tail + ch).slice(-24);
    if (!/\s/.test(ch)) prevSig = ch;
    atLineStart = ch === '\n';
  };
  const KEYWORD_BEFORE_REGEX = /(?:^|[^\w$.])(?:return|typeof|instanceof|in|of|new|delete|void|throw|case|do|else|yield|await)$/;
  while (i < n) {
    const c = src[i];
    if (atLineStart && (c === ' ' || c === '\t')) { i++; continue; }
    if (c === '\n') {
      if (!out.length || out[out.length - 1] === '\n') { i++; continue; } // no blank lines
      push('\n'); i++; continue;
    }
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') {
      let lines = 0;
      i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') lines++; i++; }
      i += 2;
      if (lines) { for (let k = 0; k < lines; k++) if (out.length && out[out.length - 1] !== '\n') push('\n'); }
      else if (out.length && !/[\s({[,;]/.test(out[out.length - 1])) push(' ');
      continue;
    }
    if (c === '"' || c === "'") {
      push(c); i++;
      while (i < n) { const d = src[i]; push(d); i++; if (d === '\\') { push(src[i]); i++; continue; } if (d === c) break; }
      continue;
    }
    if (c === '`') { // a template keeps every character it has, newlines and indentation included
      push(c); i++;
      let depth = 0;
      while (i < n) {
        const d = src[i];
        if (d === '\\') { out.push(d); out.push(src[i + 1]); i += 2; continue; }
        if (d === '$' && src[i + 1] === '{') { depth++; out.push('$'); out.push('{'); i += 2; continue; }
        if (d === '}' && depth) { depth--; out.push('}'); i++; continue; }
        if (d === '`' && !depth) { push('`'); i++; break; }
        out.push(d); i++;
      }
      atLineStart = false; prevSig = '`';
      continue;
    }
    if (c === '/') { // a slash here is either a regex or a division
      if (!prevSig || /[(,=:[!&|?{};+\-*%~^<>]/.test(prevSig) || KEYWORD_BEFORE_REGEX.test(tail)) {
        push(c); i++;
        let inClass = false;
        while (i < n) {
          const d = src[i];
          push(d); i++;
          if (d === '\\') { push(src[i]); i++; continue; }
          if (d === '[') inClass = true;
          else if (d === ']') inClass = false;
          else if (d === '/' && !inClass) break;
        }
        while (i < n && /[a-z]/.test(src[i])) { push(src[i]); i++; }
        continue;
      }
    }
    push(c); i++;
  }
  return out.join('');
}

function transform(code, file) {
  let out = code.replace(IMPORT_RE, '');
  if (/^\s*export\s+default\b/m.test(out)) throw new Error(`${rel(file)}: export default is not supported`);
  out = out.replace(/^[ \t]*export\s*\{[^}]*\}\s*;?[ \t]*$/gm, '');
  out = out.replace(/^([ \t]*)export\s+(?=(?:async\s+)?function\b|const\b|let\b|var\b|class\b)/gm, '$1');
  if (/^\s*import\b/m.test(out)) throw new Error(`${rel(file)}: unsupported import form left after transform`);
  // the bundle shares one scope, so an aliased import would leave the new name undefined at runtime
  for (const m of code.matchAll(/^\s*import\s*\{([^}]*)\}/gm)) {
    const alias = m[1].split(',').find((part) => /\bas\b/.test(part));
    if (alias) throw new Error(`${rel(file)}: aliased import (${alias.trim()}) cannot be bundled; import the name as it is`);
  }
  if (/^\s*export\b/m.test(out)) throw new Error(`${rel(file)}: unsupported export form left after transform`);
  return out;
}

export function topLevelNames(code) {
  const names = [];
  const re = /^(?:async\s+)?(function\*?|const|let|var|class)\s+([A-Za-z_$][\w$]*)([^\n]*)/gm;
  for (const m of code.matchAll(re)) {
    names.push(m[2]);
    // `let a = 1, b = 2` declares both: missing the second is how a clash slips through to a syntax error
    if (m[1] === 'const' || m[1] === 'let' || m[1] === 'var') {
      const rest = m[3];
      let depth = 0, quote = null;
      for (let i = 0; i < rest.length; i++) {
        const c = rest[i];
        if (quote) { if (c === '\\') i++; else if (c === quote) quote = null; continue; }
        if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
        if (c === '/' && rest[i + 1] === '/') break;
        if ('([{'.includes(c)) depth++;
        else if (')]}'.includes(c)) depth--;
        else if (c === ',' && depth === 0) {
          const next = /^\s*([A-Za-z_$][\w$]*)/.exec(rest.slice(i + 1));
          if (next) names.push(next[1]);
        }
      }
    }
  }
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
  const body = pretty ? chunks.join('\n') : squeeze(chunks.join('\n'));
  // a syntax error in the squeezed body would only show up in a browser, so compile it here and now
  if (!pretty) { try { new Function(body); } catch (e) { throw new Error(`the squeezed bundle does not parse: ${e.message}`); } }
  const script = `<script>\n"use strict";\n(() => {\n${body}\n})();\n</script>`;
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
