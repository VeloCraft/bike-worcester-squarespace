#!/usr/bin/env node
'use strict';

// The dev loop's ports live here and nowhere else.
//
// Every leg of `pnpm run watch` used to name its own port in `package.json` or
// `bs-config.js`, and every leg had its own way of giving up when that port was
// taken: browser-sync and `serve` quietly moved to the next free port, so the
// documented URL and the bundle URL in the served markup kept pointing at a port
// nothing was listening on. On a machine running several agents, :3000 is the
// first thing anyone grabs, which makes that drift routine rather than rare.
//
// So the loop gets one uncommon base port and derives all three legs from it,
// strictly: if a port is busy the loop stops and says so instead of moving.
// Point a second agent at a different base rather than sharing these:
//
//   DEV_PORT_BASE=4750 pnpm run watch
//
// The base is the mirror. The two static legs follow it (base + 1 for the
// working bundle, base + 2 for the pristine copy), so one number is the whole
// reservation.

// Deliberately outside the crowded ranges: 3000-3999 (Next, CRA, the common
// defaults), 4200 (Angular), 4321 (Astro), 5000/7000 (macOS AirPlay Receiver),
// 5173 (Vite), 8000/8080 (everything), 5432 (Postgres).
const DEFAULT_BASE = 4747;

const LEGS = ['mirror', 'bundle', 'pristine'];

function readBase(env = process.env) {
  const raw = env.DEV_PORT_BASE;
  if (raw === undefined || raw === '') return DEFAULT_BASE;

  const base = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isInteger(base)) {
    throw new Error(`DEV_PORT_BASE must be a whole number, got "${raw}"`);
  }
  if (base < 1024) {
    throw new Error(
      `DEV_PORT_BASE must be 1024 or higher (privileged ports need root), got ${base}`
    );
  }
  // base + 2 is the highest port the loop uses.
  if (base + 2 > 65535) {
    throw new Error(`DEV_PORT_BASE must be 65533 or lower, got ${base}`);
  }
  return base;
}

// The three ports the loop uses, derived from the base. Exported as plain
// numbers so `bs-config.js` and `scripts/serve.js` cannot disagree about them.
function ports(env = process.env) {
  const base = readBase(env);
  return {
    base,
    mirror: base,
    bundle: base + 1,
    pristine: base + 2,
  };
}

const net = require('node:net');
const { execFileSync } = require('node:child_process');

// True if a server could serve this port right now.
//
// Neither test is sufficient alone on macOS. A wildcard IPv6 listener (`::`,
// which is what browser-sync and most dev servers bind) answers connections on
// `127.0.0.1` but does not stop another process binding `127.0.0.1:<port>` — so a
// bind alone says "free" for a port that is in fact answered. A half-closed
// listener, in turn, refuses connections while still holding the port, so a
// connect alone says "free" too. Busy means either test says busy.
const HOSTS = ['127.0.0.1', '::1'];
const PROBE_TIMEOUT = 500;

function freeOn(port, host) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.once('error', (error) => {
      // EADDRINUSE is the answer we are looking for; anything else (a host with
      // no IPv6, say) is not evidence that the port is taken.
      resolve(error.code !== 'EADDRINUSE');
    });
    server.listen(port, host, () => server.close(() => resolve(true)));
  });
}

function answersOn(port, host) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    const done = (busy) => {
      socket.destroy();
      resolve(busy);
    };
    socket.setTimeout(PROBE_TIMEOUT, () => done(false));
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
  });
}

async function isFree(port) {
  for (const host of HOSTS) {
    if (await answersOn(port, host)) return false;
    if (!(await freeOn(port, host))) return false;
  }
  return true;
}

// Who holds the port, if the platform can say. Best effort only: this is for the
// error message, never for the decision.
function holder(port) {
  try {
    const out = execFileSync(
      'lsof',
      ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-Fcn'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    );
    const command = /^c(.*)$/m.exec(out);
    const pid = /^p(\d+)$/m.exec(out);
    if (!command) return null;
    return pid ? `${command[1]} (pid ${pid[1]})` : command[1];
  } catch {
    return null;
  }
}

async function check(env = process.env) {
  const resolved = ports(env);
  const busy = [];
  for (const leg of LEGS) {
    const port = resolved[leg];
    if (!(await isFree(port))) busy.push({ leg, port, holder: holder(port) });
  }
  return { ports: resolved, busy };
}

const LABELS = {
  mirror: 'mirror (browser-sync)',
  bundle: 'working bundle',
  pristine: 'pristine copy',
};

function describe(resolved) {
  return LEGS.map(
    (leg) => `  ${LABELS[leg].padEnd(20)} http://localhost:${resolved[leg]}/`
  ).join('\n');
}

async function main(argv) {
  const args = argv.slice(2);
  const resolved = ports();

  if (args.includes('--json')) {
    process.stdout.write(JSON.stringify(resolved) + '\n');
    return 0;
  }

  const leg = args.find((arg) => LEGS.includes(arg));
  if (leg) {
    process.stdout.write(resolved[leg] + '\n');
    return 0;
  }

  if (!args.includes('--check')) {
    process.stdout.write(
      `DEV_PORT_BASE=${resolved.base}\n${describe(resolved)}\n`
    );
    return 0;
  }

  const { busy } = await check();
  if (!busy.length) return 0;

  const lines = [
    `Cannot start the dev loop: the port${busy.length > 1 ? 's' : ''} it needs ${
      busy.length > 1 ? 'are' : 'is'
    } already in use.`,
    '',
    ...busy.map(
      ({ leg, port, holder }) =>
        `  ${LABELS[leg].padEnd(20)} ${port}${
          holder ? ` held by ${holder}` : ''
        }`
    ),
    '',
    `The loop is on base ${resolved.base} (DEV_PORT_BASE). Nothing was started:`,
    `a leg that cannot have its port must not quietly take another one, or the`,
    `mirror URL and the bundle URL stop agreeing with what is running.`,
    '',
    `Pick a free base and try again, e.g.`,
    `  DEV_PORT_BASE=${resolved.base + 10} pnpm run watch`,
  ];
  process.stderr.write(lines.join('\n') + '\n');
  return 1;
}

if (require.main === module) {
  main(process.argv).then(
    (code) => process.exit(code),
    (error) => {
      process.stderr.write(`${error.message}\n`);
      process.exit(1);
    }
  );
}

module.exports = { DEFAULT_BASE, LEGS, ports, readBase, check, isFree };
