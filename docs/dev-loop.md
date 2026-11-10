# Dev loop: fix and ship

The single source for taking a style or script change from "do this" to "it is live".
Needs `httrack` and `pnpm install` (see README).

## 1. Refresh the mirror

The mirror is a static copy of the live site in `html/`, served locally while we work.

```sh
pnpm run sync            # whole site
pnpm run sync pathname   # one page and its subpages
```

Re-sync when the page has moved on: the snapshot is only as fresh as the last sync.

## 2. Run the watch loop

```sh
pnpm run watch
```

Rebuilds `dist/index.js` on every change under `src/`, serves the mirror at
<http://localhost:3000>, and reloads the page when the rebuilt bundle changes. Leave it
running for the whole task.

How the bundle reaches the mirror, since the snapshot's injection point still names the
production bundle:

- `watch-src` rebuilds `dist/index.js`.
- `serve-src` serves that build at <http://localhost:3001/index.js> (`serve -p 3001 dist`).
- `watch-html` runs browser-sync on <http://localhost:3000>, serving
  `html/www.bikeworcester.org.uk`, and rewrites every remote bundle reference in the served
  markup to the `BUNDLE_URL` origin (`bs-config.js`). It defaults to
  <http://localhost:3001/index.js>, so no tunnel or proxy is needed: browser-sync serves the
  page, `serve-src` serves the bundle.
- `serve-html` is a plain, unrewritten copy of the snapshot on <http://localhost:3002> for
  comparison; it is deliberately on a different port from browser-sync.

## 3. Verify in the mirror

Open <http://localhost:3000>, edit `src/index.css` or `src/index.js`, save, and the page
reloads with your change. No push, no deploy, no waiting.

**Verification bar: layout and injected DOM only.** Local verification tells you the
stylesheet and script do what you meant against the current Squarespace markup.
Squarespace API behaviour, forms, members and search are **out of scope** — they cannot
be exercised in the mirror, so do not claim to have verified them.

## 4. Discover selectors against the live page

The mirror is a snapshot, so a selector you need may be missing or out of date. Read the
live DOM at <https://www.bikeworcester.org.uk> (devtools) to confirm the real structure
and class names — never guess them, and re-sync (step 1) rather than hand-patching the
snapshot.

## 5. Deploy deliberately

- Commit on your agent branch and open a PR into `dev`.
- Merging to `dev` deploys a **dev preview**. Nothing is public yet; the preview is the
  gate.
- Do not merge `dev` into `main` until the gate in step 6 has been run.

Never commit straight to `main`.

## 6. Gate before merging to `main`

The gate is a human looking at the **dev preview**; nothing automated stands in that
position (ADR [0001](adr/0001-preview-gated-delivery-human-gate.md),
[0002](adr/0002-preview-deployment-protection.md)). Run it the same way every time:

1. **Open the `dev` preview alias in a logged-in browser.** Deployment Protection stays on,
   so the preview is non-public and cannot be fetched anonymously (ADR 0002). Log in to the
   Vercel project, then open the `dev` alias.
2. **Check the changed page(s) at desktop and mobile widths.** Confirm the override bundle
   is actually loaded and that layout and injected DOM look right against the real
   Squarespace markup. The verification bar matches the mirror's — layout and injected DOM
   only; forms, members and search are out of scope.
3. **Then merge `dev` into `main`**, which deploys production automatically.

The mirror is for fast iteration, not for the protected preview: it loads the locally built
bundle by default, and `BUNDLE_URL` (see `bs-config.js`) points it at another bundle origin
without editing tracked files, e.g.
`BUNDLE_URL=https://<unprotected bundle origin>/index.js pnpm run watch`. The dev preview
is protected (ADR 0002), so the mirror cannot fetch its bundle anonymously — opening the
alias itself in a logged-in browser is what the gate does.

## 7. Eyeball the live page

After the production deploy, load <https://www.bikeworcester.org.uk> and confirm the
override bundle is actually live. If it is not, check that the Squarespace Code
Injection header still loads the **production bundle and only the production bundle**
(README → Deployment). The dev preview is never injected into the site.
