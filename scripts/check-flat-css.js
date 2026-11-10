#!/usr/bin/env node
/*
 * Does the built bundle still carry nested CSS?
 *
 * The override bundle is injected as one stylesheet string, so any `&`-relative
 * rule that survives the build is silently ignored by browsers without native
 * CSS nesting (Chrome < 112, Safari < 16.5, Firefox < 117) — which is the bug
 * issue #19 fixes. postcss-preset-env flattens it at build time; this checks the
 * artifact rather than the config, so a loader-order regression cannot pass.
 *
 *   pnpm run build && pnpm run check:css
 *
 * Prints nothing and exits 0 when the bundle is flat.
 */

'use strict';

const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const BUNDLE = join(__dirname, '..', 'dist', 'index.js');

// In the bundle the CSS is one JS string with `\n` escapes, and every `&` in the
// surrounding JavaScript is either `&&` or a bitwise `&` followed by an
// identifier, `(`, `!` or a digit. A nesting marker is `&` followed by
// whitespace and then a selector token or an opening brace: `& .x`, `&:hover`,
// `& > a`, `& {`.
const NESTING = /&[ \t]*[.[#:>+~*{]/g;

let source;
try {
  source = readFileSync(BUNDLE, 'utf8');
} catch {
  console.error(`${BUNDLE} not found — run \`pnpm run build\` first.`);
  process.exit(1);
}

const hits = [];
for (const match of source.matchAll(NESTING)) {
  const from = Math.max(0, match.index - 60);
  const context = source.slice(from, match.index + 40);
  hits.push(context.replace(/\\n/g, '\n'));
}

if (hits.length) {
  console.error(
    `Nested CSS found in dist/index.js (${hits.length} rule(s)). Browsers without ` +
      `native nesting will drop every one of them — check that postcss-loader is ` +
      `still wired into webpack.config.js.`
  );
  for (const hit of hits.slice(0, 5)) console.error(`\n  …${hit}…`);
  process.exit(1);
}

console.log('dist/index.js carries no nested CSS.');
