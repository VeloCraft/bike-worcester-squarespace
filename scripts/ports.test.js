'use strict';

const assert = require('node:assert/strict');
const net = require('node:net');
const path = require('node:path');
const test = require('node:test');

const { DEFAULT_BASE, ports, readBase, isFree, check } = require('./ports');

test('the loop derives all three legs from one base port', () => {
  assert.deepEqual(ports({}), {
    base: DEFAULT_BASE,
    mirror: DEFAULT_BASE,
    bundle: DEFAULT_BASE + 1,
    pristine: DEFAULT_BASE + 2,
  });
});

test('the default base is outside the crowded dev ranges', () => {
  // 3000-3999 is the grab-anything range; 5000/7000 are macOS AirPlay.
  assert.ok(DEFAULT_BASE < 3000 || DEFAULT_BASE > 3999);
  assert.ok(![5000, 5173, 5432, 7000, 8000, 8080].includes(DEFAULT_BASE));
});

test('DEV_PORT_BASE moves the whole reservation', () => {
  assert.deepEqual(ports({ DEV_PORT_BASE: '4800' }), {
    base: 4800,
    mirror: 4800,
    bundle: 4801,
    pristine: 4802,
  });
});

test('an unusable DEV_PORT_BASE is rejected, not silently ignored', () => {
  for (const value of ['abc', '4800.5', '300', '0', '-1', '65534', '99999']) {
    assert.throws(
      () => readBase({ DEV_PORT_BASE: value }),
      /DEV_PORT_BASE/,
      `expected ${value} to be rejected`
    );
  }
  assert.equal(readBase({}), DEFAULT_BASE);
});

test('isFree reports a bound port as taken', async () => {
  const server = net.createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  try {
    assert.equal(await isFree(port), false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  assert.equal(await isFree(port), true);
});

test('check names the legs that are busy', async () => {
  const server = net.createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  try {
    const { busy } = await check({ DEV_PORT_BASE: String(port) });
    assert.ok(
      busy.some((entry) => entry.leg === 'mirror' && entry.port === port),
      'the mirror leg should be reported as busy'
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

// Runs one response through browser-sync's rewrite middleware and returns the
// body it actually served.
function rewrite(config, html, headers = { 'content-type': 'text/html' }) {
  const served = {};
  const res = {
    getHeader: (name) => headers[name],
    setHeader: (name, value) => {
      headers[name] = value;
    },
    write: () => true,
    end: (chunk) => {
      served.body = chunk ? chunk.toString('utf8') : '';
    },
  };

  const [middleware] = config.middleware;
  // The middleware only wraps `write`/`end`; it always hands on to the static
  // server, which is what actually writes the bytes.
  middleware({ method: 'GET', url: '/' }, res, () => {});
  res.write(Buffer.from(html));
  res.end();
  return served.body;
}

// The documented mirror URL and the port the mirror actually binds are the same
// number, which is the whole point of the ticket: they used to be two.
test('bs-config serves the mirror on the documented port', () => {
  const config = require('../bs-config');
  const expected = ports();

  assert.equal(config.port, expected.mirror);
  // A one-port range is the strictness: browser-sync stops rather than incrementing.
  assert.deepEqual(config.ports, {
    min: expected.mirror,
    max: expected.mirror,
  });
});

test('the mirror loads the working bundle from the bundle leg', () => {
  const config = require('../bs-config');
  const expected = ports();
  const html =
    '<script src="https://bike-worcester-squarespace.vercel.app/index.js"></script>';

  const body = rewrite(config, html);
  assert.ok(
    body.includes(`http://localhost:${expected.bundle}/index.js`),
    `the bundle URL should be derived from the base port, got: ${body}`
  );
});

test('BUNDLE_URL overrides the bundle origin without touching tracked files', () => {
  process.env.BUNDLE_URL = 'https://example.test/index.js';
  delete require.cache[require.resolve('../bs-config')];

  try {
    const config = require('../bs-config');
    const body = rewrite(
      config,
      '<script src="https://bike-worcester-squarespace.vercel.app/index.js"></script>'
    );
    assert.ok(body.includes('"https://example.test/index.js"'));
  } finally {
    delete process.env.BUNDLE_URL;
    delete require.cache[require.resolve('../bs-config')];
  }
});

test('a plain-http local bundle URL is not upgraded to https', () => {
  const config = require('../bs-config');
  const body = rewrite(
    config,
    '<script src="http://bike-worcester-squarespace.vercel.app/index.js"></script>'
  );
  assert.ok(body.includes('http://localhost:'));
  assert.ok(!body.includes('https://localhost:'));
});

test('serve.js refuses to serve outside its directory', () => {
  const { resolveFile } = require('./serve');
  const root = path.resolve('/tmp/root');

  assert.equal(resolveFile(root, '/index.html'), path.join(root, 'index.html'));
  assert.equal(resolveFile(root, '/../etc/passwd'), null);
  assert.equal(resolveFile(root, '/%2e%2e/etc/passwd'), null);
  assert.equal(resolveFile(root, '/%00'), null);
  assert.equal(resolveFile(root, '/%zz'), null);
});
