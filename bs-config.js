/*
 |--------------------------------------------------------------------------
 | Browser-sync config file
 |--------------------------------------------------------------------------
 |
 | For up-to-date information about the options:
 |   http://www.browsersync.io/docs/options/
 |
 | There are more options than you see here, these are just the ones that are
 | set internally. See the website for more info.
 |
 |
 */
const { ports } = require('./scripts/ports');

// One reservation for the whole loop; see `scripts/ports.js`. The mirror is the
// base port, the working build base + 1, the pristine copy base + 2. Every port
// here is derived, never typed twice, and browser-sync is made strict below: a
// busy port stops the loop instead of moving it.
const { mirror, bundle } = ports();

// The working build, served by `serve-src` (`node scripts/serve.js bundle dist`)
// while `pnpm run watch` runs. The mirror's injection point is rewritten to this
// URL so edits under `src/` show up in the mirror after a reload, with no push and
// no deploy.
//
// The origin is taken from the request, not from this machine: the bundle is
// fetched by whoever's browser loaded the mirror, so `localhost` only works when
// that browser is on this machine. Anyone reaching the mirror over the LAN (a
// developer SSH'd in from another box, a phone on the same network) gets the
// bundle URL on the same host they used, and it resolves for them rather than for
// the server. BUNDLE_URL overrides it with an absolute URL — another bundle origin
// such as the dev preview, which needs no host rewriting at all.
const BUNDLE_URL = process.env.BUNDLE_URL || null;

function bundleUrlFor(req) {
  if (BUNDLE_URL) return BUNDLE_URL;

  const host = req.headers.host || `localhost:${mirror}`;
  let hostname;
  try {
    // `URL` keeps the brackets on an IPv6 literal, which a bare `split(':')`
    // would mangle.
    hostname = new URL(`http://${host}`).hostname;
  } catch {
    hostname = 'localhost';
  }
  return `http://${hostname}:${bundle}/index.js`;
}

// Every *remote* copy of the override bundle the mirrored markup can reference:
// the production bundle on Vercel (and any preview alias of the same project), the
// older generamics.co.uk deployments (secondhome, home — both dead, which is why
// they are matched by domain rather than by hostname), and a stale plain-http copy
// of any of them. `https?` because the http-normalising rule below may already have
// upgraded one, and a snapshot can carry either scheme. All of them resolve to the
// locally served working build, so no mirrored page can load a bundle the dev loop
// does not serve.
const REMOTE_BUNDLE =
  /"https?:\/\/(?:bike-worcester-squarespace(?:-[a-z0-9-]+)*\.vercel\.app|(?:[a-z0-9-]+\.)*generamics\.co\.uk)\/index\.js"/g;

// The mirror serves files (`server`), not a proxied site, and browser-sync's own
// `rewriteRules` option only ever applies to proxied responses — configured here it
// silently did nothing, so the mirrored page kept loading the remote bundle and no
// local edit could ever reach it. The rules run over html responses in a middleware
// instead (see `serveWorkingBundle` below). Order is part of the contract:
//   1. normalise the snapshot's plain-http asset links to https, skipping localhost —
//      this must run BEFORE the bundle rule, or it would upgrade the plain-http local
//      bundle URL to https://localhost:<bundle port>, which the local static server
//      (no TLS) cannot answer, and the mirror would load no bundle at all;
//   2. point every remote bundle reference at the working build.
const HTTP_URL = /"http:\/\/(?!localhost[:/])/g;

function rewriteBundleUrls(html, bundleUrl) {
  return html
    .replace(HTTP_URL, '"https://')
    .replace(REMOTE_BUNDLE, () => `"${bundleUrl}"`);
}

// Rewrites html responses as they are served; every other content type passes
// straight through, untouched.
function serveWorkingBundle(req, res, next) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();

  const chunks = [];
  const write = res.write.bind(res);
  const end = res.end.bind(res);
  // Decided on the first write, by which point the static server has set the
  // response's content type.
  let buffering = null;

  const isHtml = () =>
    String(res.getHeader('content-type') || '').includes('text/html');
  const toBuffer = (chunk, encoding) =>
    Buffer.isBuffer(chunk)
      ? chunk
      : Buffer.from(chunk, typeof encoding === 'string' ? encoding : 'utf8');

  res.write = function (chunk, encoding, callback) {
    if (buffering === null) buffering = isHtml();
    if (!buffering) return write(chunk, encoding, callback);
    if (chunk) chunks.push(toBuffer(chunk, encoding));
    const done = typeof encoding === 'function' ? encoding : callback;
    if (typeof done === 'function') process.nextTick(done);
    return true;
  };

  res.end = function (chunk, encoding, callback) {
    if (buffering === null) buffering = isHtml();
    if (!buffering) return end(chunk, encoding, callback);
    if (chunk && typeof chunk !== 'function')
      chunks.push(toBuffer(chunk, encoding));

    const body = Buffer.from(
      rewriteBundleUrls(
        Buffer.concat(chunks).toString('utf8'),
        bundleUrlFor(req)
      ),
      'utf8'
    );
    // The rewrite changes the byte count, so the static server's content-length
    // would truncate the page at the old length.
    if (res.getHeader('content-length') !== undefined) {
      res.setHeader('content-length', body.length);
    }
    const done = typeof chunk === 'function' ? chunk : callback;
    return end(body, done);
  };

  next();
}

module.exports = {
  ui: false,
  files: 'dist/index.js',
  watchEvents: ['change'],
  watch: true,
  ignore: [],
  single: false,
  watchOptions: {
    ignoreInitial: true,
  },
  server: 'html/www.bikeworcester.org.uk',
  proxy: false,
  port: mirror,
  // A one-port range. `getEmptyPort` scans from `min` up to `max` and grabs the
  // first free port it finds, so browser-sync's default of "increment until
  // something answers" is what put the mirror on an undocumented port before. If
  // the mirror port is taken, browser-sync stops instead of drifting.
  ports: { min: mirror, max: mirror },
  middleware: [serveWorkingBundle],
  serveStatic: [],
  ghostMode: false,
  logLevel: 'info',
  logPrefix: 'Browsersync',
  logConnections: false,
  logFileChanges: true,
  logSnippet: true,
  open: false,
  browser: 'default',
  cors: false,
  hostnameSuffix: false,
  reloadOnRestart: false,
  notify: true,
  scrollProportionally: true,
  scrollThrottle: 0,
  scrollRestoreTechnique: 'window.name',
  scrollElements: [],
  scrollElementMapping: [],
  reloadDelay: 0,
  reloadDebounce: 500,
  reloadThrottle: 0,
  plugins: [],
  injectChanges: true,
  startPath: null,
  minify: true,
  host: null,
  localOnly: false,
  codeSync: true,
  timestamps: true,
  clientEvents: [
    'scroll',
    'scroll:element',
    'input:text',
    'input:toggles',
    'form:submit',
    'form:reset',
    'click',
  ],
  socket: {
    socketIoOptions: {
      log: false,
    },
    socketIoClientConfig: {
      reconnectionAttempts: 50,
    },
    path: '/browser-sync/socket.io',
    clientPath: '/browser-sync',
    namespace: '/browser-sync',
    clients: {
      heartbeatTimeout: 5000,
    },
  },
  tagNames: {
    less: 'link',
    scss: 'link',
    css: 'link',
    jpg: 'img',
    jpeg: 'img',
    png: 'img',
    svg: 'img',
    gif: 'img',
    js: 'script',
  },
  injectNotification: false,
};
