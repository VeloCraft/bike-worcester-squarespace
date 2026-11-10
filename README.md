# Bike Worcester Squarespace

A repository of scripts and styles for the Bike Worcester Squarespace website.

## Installation

Install httrack using `brew install httrack` or `sudo apt install httrack`.
Run `pnpm install` to install the dependencies the builds and the watch loop use.

## Development

Work happens against a local copy of the live site — the **mirror** — while the styles and
scripts we own, the **override bundle**, are built here. `docs/dev-loop.md` is the full
fix-and-ship loop; `GLOSSARY.md` has the vocabulary (mirror, override bundle, dev preview,
gate), and it is worth reading before the first change.

### Refresh the mirror

```sh
pnpm run sync            # whole site
pnpm run sync pathname   # one path and its subpages
```

Both run `scripts/sync.sh`, which uses `httrack` to write a copy of
<https://www.bikeworcester.org.uk> into `html/` (git-ignored, never committed). The
`pathname` form scopes the crawl — `pnpm run sync events` fetches `/events` and its
subpages only — so refreshing a single page is quick instead of a whole-site crawl.

The mirror is only as fresh as the last sync. Its markup is Squarespace's, and it moves on
without us, so re-sync rather than hand-patching a stale snapshot.

### Run the watch loop

```sh
pnpm run watch
```

That runs four jobs under `concurrently -k`, so stopping one stops them all:

| job          | what it does                                                          | where                   |
| ------------ | --------------------------------------------------------------------- | ----------------------- |
| `watch-src`  | nodemon watches `src/` and rebuilds the bundle (webpack, dev mode)    | writes `dist/index.js`  |
| `serve-src`  | serves that build                                                     | the working-bundle port |
| `watch-html` | browser-sync serves the mirror and reloads it when the bundle changes | the mirror port         |
| `serve-html` | serves the snapshot's raw files with no rewriting                     | the pristine-copy port  |

Browse the mirror. The loop prints its URL when it starts, and it is fixed rather than
chosen at startup: the ports are one reservation stated in
[`docs/dev-loop.md`](docs/dev-loop.md#ports), and `pnpm run ports` prints it. The loop is on
a deliberately uncommon base port because `3000` is the first thing anything else on the
machine grabs, and it stops rather than moving if a port is busy. Running a second loop
means a different base (`DEV_PORT_BASE=4750 pnpm run watch`), never a different port.

The snapshot's injection point loads the _production_ bundle from Vercel, and
`bs-config.js` rewrites every remote bundle reference in the served markup to the working
build — the one `serve-src` is serving. That rewrite is how an edit reaches the mirror at
all. To point the mirror at another bundle origin instead, set `BUNDLE_URL`, e.g.
`BUNDLE_URL=https://<bundle origin>/index.js pnpm run watch`; the local build stays the
default and nothing tracked has to change. The dev preview is not protected
([ADR 0002](docs/adr/0002-preview-deployment-protection.md)), so the mirror can be pointed
straight at it — that is the gate, and it is still a human looking at a page.

So the loop is: edit `src/index.css` or `src/index.js`, the rebuild writes `dist/index.js`,
browser-sync reloads the page, and the change is there after the reload. No push, no deploy.

The bundle is built by webpack from `src/index.js` and `src/index.css`, with assets
(images, css) inlined as base64 strings in the output js file. `src/recycling.css` is a
separate webpack build — `pnpm run build-css` — and is not part of the watch loop.

### Branch topology

- **`dev` is the integration branch.** Work is committed to an agent branch and merged into
  `dev`; that merge deploys a **dev preview**, a real but unlisted deployment built from
  `dev`. The preview is the gate: load it and check the change at desktop and mobile widths
  before it is allowed near production. Deployment Protection is off, so it loads without a
  login ([ADR 0002](docs/adr/0002-preview-deployment-protection.md)).
- **Merging `dev` into `main` deploys production automatically.** There is no separate
  release step and no manual promotion, so nothing goes to `main` before it has been looked
  at on the preview.

The gate is a human looking at the page — there is no automated test suite to stand in that
position ([ADR 0001](docs/adr/0001-preview-gated-delivery-human-gate.md)). Local verification
against the mirror is real verification of layout and injected DOM, and of nothing else.

## Deployment

The live site has one injection point and it loads the **production bundle** only — never
a preview, never a local build. The `dev` preview is a separate, unlisted deployment: it
is not injected into the site, and it is loaded by its own alias as the pre-merge gate (see
`docs/dev-loop.md` and
[ADR 0002](docs/adr/0002-preview-deployment-protection.md)).

In the Squarespace sidebar, choose `Website > Pages > Website Tools > Code Injection` and paste the following code into the `Header` section:

```html
<script
  type="text/javascript"
  src="https://bike-worcester-squarespace.vercel.app/index.js"
></script>
```
