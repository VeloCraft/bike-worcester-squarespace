#!/usr/bin/env node
'use strict';

// A static file server for one leg of the dev loop: no dependencies, no
// directory listing, no port improvisation.
//
// `serve` (the package the loop used to run with `pnpm dlx serve`) hands itself
// a random free port the moment the one it was given is taken -- and says
// nothing. The bundle URL written into the mirror then points at nothing, and
// the failure looks like "my CSS change does nothing" rather than "the server
// moved". `pnpm dlx` also meant the loop fetched and ran whatever version of
// `serve` was latest at the time. This binds the port it is given or exits.
//
// Usage: node scripts/serve.js <mirror|bundle|pristine> <directory>

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { ports } = require('./ports');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
};

function resolveFile(root, pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null; // malformed escape sequence
  }
  if (decoded.includes('\0')) return null;

  // Normalise, then require the result to stay under root: `..%2f` and friends
  // must not escape the directory being served.
  const target = path.normalize(path.join(root, decoded));
  if (target !== root && !target.startsWith(root + path.sep)) return null;
  return target;
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'content-type': 'text/plain; charset=utf-8',
    // The whole point of this leg is seeing the file as it was just written.
    'cache-control': 'no-store',
    ...headers,
  });
  res.end(body);
}

function handler(root) {
  return (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return send(res, 405, 'Method not allowed\n', { allow: 'GET, HEAD' });
    }

    const pathname = new URL(req.url, 'http://localhost').pathname;
    const target = resolveFile(root, pathname);
    if (target === null) return send(res, 400, 'Bad request\n');

    fs.stat(target, (statError, stats) => {
      const file = (() => {
        if (statError) return null;
        if (!stats.isDirectory()) return target;
        const index = path.join(target, 'index.html');
        return fs.existsSync(index) ? index : null;
      })();

      if (file === null) return send(res, 404, 'Not found\n');

      fs.readFile(file, (readError, body) => {
        if (readError) return send(res, 500, 'Read failed\n');
        res.writeHead(200, {
          'content-type':
            TYPES[path.extname(file).toLowerCase()] ||
            'application/octet-stream',
          'content-length': body.length,
          'cache-control': 'no-store',
        });
        res.end(req.method === 'HEAD' ? undefined : body);
      });
    });
  };
}

function main(argv) {
  const [leg, directory] = argv.slice(2);
  const resolved = ports();

  if (!(leg in { mirror: 1, bundle: 1, pristine: 1 }) || !directory) {
    process.stderr.write(
      'Usage: node scripts/serve.js <mirror|bundle|pristine> <directory>\n'
    );
    return 2;
  }

  const root = path.resolve(directory);
  if (!fs.existsSync(root)) {
    process.stderr.write(`No such directory: ${root}\n`);
    return 2;
  }

  const port = resolved[leg];
  const server = http.createServer(handler(root));

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      process.stderr.write(
        `Port ${port} (${leg}) is already in use. The dev loop does not move to ` +
          `another port: the mirror URL and the bundle URL would stop agreeing ` +
          `with what is running.\nPick a free base, e.g.\n` +
          `  DEV_PORT_BASE=${resolved.base + 10} pnpm run watch\n`
      );
    } else {
      process.stderr.write(`${error.message}\n`);
    }
    process.exit(1);
  });

  server.listen(port, () => {
    // All interfaces, like browser-sync: the loop is routinely used by someone
    // SSH'd in from another machine, whose browser is not on this host. Binding
    // loopback would serve the mirror but leave it loading no bundle there.
    process.stdout.write(
      `Serving ${path.relative(process.cwd(), root) || '.'} (${leg}) at http://localhost:${port}/ (and on this host's LAN address)\n`
    );
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => server.close(() => process.exit(0)));
  }
}

if (require.main === module) {
  process.exitCode = main(process.argv);
}

module.exports = { handler, resolveFile };
