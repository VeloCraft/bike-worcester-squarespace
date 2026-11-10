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
const BUNDLE_URL = process.env.BUNDLE_URL || 'http://localhost:3001/index.js';

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
  port: 3000,
  middleware: false,
  serveStatic: [],
  ghostMode: false,
  logLevel: 'info',
  logPrefix: 'Browsersync',
  logConnections: false,
  logFileChanges: true,
  logSnippet: true,
  rewriteRules: [
    {
      // The snapshot's injection point points at the production bundle host.
      // Rewrite it to BUNDLE_URL so the mirror loads whichever bundle is under
      // test: the local build by default, or a dev preview alias when set.
      match:
        /"https:\/\/(?:bike-worcester-squarespace(?:-[a-z0-9-]+)*\.vercel\.app|secondhome\.generamics\.co\.uk)\/index\.js"/g,
      fn: () => `"${BUNDLE_URL}"`,
    },
    {
      // Leave http origins alone (e.g. the local bundle served on :3001);
      // only the mirrored absolute asset links need upgrading to https.
      match: /\"http:\/\/(?!localhost[:/])/g,
      fn: () => '"https://',
    },
  ],
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
