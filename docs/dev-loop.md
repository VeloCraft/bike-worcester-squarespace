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
<http://localhost:4747>, and reloads the page when the rebuilt bundle changes. Leave it
running for the whole task.

How the bundle reaches the mirror, since the snapshot's injection point still names the
production bundle:

- `watch-src` rebuilds `dist/index.js`.
- `serve-src` serves that build at <http://localhost:4748/index.js>.
- `watch-html` runs browser-sync on <http://localhost:4747>, serving
  `html/www.bikeworcester.org.uk`, and rewrites every remote bundle reference in the served
  markup to the `BUNDLE_URL` origin (`bs-config.js`). It defaults to
  <http://localhost:4748/index.js>, so no tunnel or proxy is needed: browser-sync serves
  the page, `serve-src` serves the bundle.
- `serve-html` is a plain, unrewritten copy of the snapshot on <http://localhost:4749> for
  comparison; it is deliberately on a different port from browser-sync.

### Ports

The three ports are one reservation, decided in `scripts/ports.js` and stated here — and
nowhere else in the repository:

| leg            | port | why                                             |
| -------------- | ---- | ----------------------------------------------- |
| mirror         | 4747 | browser-sync; this is the URL you browse        |
| working bundle | 4748 | served by `serve-src`, loaded by the mirror     |
| pristine copy  | 4749 | served by `serve-html`, for side-by-side checks |

4747 rather than 3000 on purpose. `3000` is what every other project on a machine takes
first, and this machine runs several agents at once: a dev loop that expects `3000` free is
a dev loop that is broken whenever something else is running.

**The loop never moves to another port.** Before anything starts, `node scripts/ports.js
--check` tests all three and, if one is taken, stops the whole loop and names the port and
the process holding it. Both static servers refuse to bind elsewhere, and browser-sync is
given a one-port range so it cannot fall forward to the next free port the way it used to.
A busy port is a stopped loop with a message, never a mirror on an undocumented URL.

To run a second loop — another agent, another worktree — give it a different base, not a
different port:

```sh
DEV_PORT_BASE=4750 pnpm run watch   # mirror 4750, bundle 4751, pristine 4752
```

`pnpm run ports` prints the reservation you would get.

### Reaching the loop from another machine

All three legs bind every interface, not loopback, so the loop is usable from a browser
that is not on this host — SSH'd in from a laptop, a phone on the same network. Use this
machine's LAN address instead of `localhost`: browser-sync prints it as **External** when
the loop starts, and it is the address the other machine needs for the mirror.

The bundle URL written into the mirror follows the host you loaded the page on — load
`http://<lan-ip>:4747/events7401.html` and the markup asks for
`http://<lan-ip>:4748/index.js`, not `localhost:4748`. `localhost` would be _your_
machine, not the one running the loop, and the mirror would render with no bundle at all.

## 3. Verify in the mirror

Open <http://localhost:4747>, edit `src/index.css` or `src/index.js`, save, and the page
reloads with your change. No push, no deploy, no waiting.

**Verification bar: layout and injected DOM only.** Local verification tells you the
stylesheet and script do what you meant against the current Squarespace markup.
Squarespace API behaviour, forms, members and search are **out of scope** — they cannot
be exercised in the mirror, so do not claim to have verified them.

### CSS nesting is flattened at build time

`src/index.css` is written with native CSS nesting (`&` rules). Visitors on
Chrome < 112, Safari < 16.5 or Firefox < 117 do not support it, and a browser drops
the **whole** nested rule it does not understand — those visitors would see none of
the fixes this bundle exists for. So the build runs the stylesheet through
`postcss-preset-env` (`webpack.config.js`, `'nesting-rules'`) and ships plain
selectors.

Do not take the config on trust — check the artifact:

```sh
pnpm run build && pnpm run check:css   # "dist/index.js carries no nested CSS."
```

To prove it in a browser, use one without nesting and confirm that first — paste
`CSS.supports('selector(&)')` into the devtools console; `false` means the browser
will drop nested rules. Chromium 103 is a known-good candidate:

```sh
pnpm dlx @puppeteer/browsers install chromium@1001000 --path /tmp/pptr
# puppeteer prints the executable path; version 103, i.e. M103 before nesting
```

Load the mirror in that browser and confirm the author card, the event meta badges
and the events listing still pick up the bundle's treatment (padding on the badges,
the card's background and radius, the listing's side-by-side layout at desktop
width). If they look like untouched Squarespace defaults, nesting survived the build.

## 4. Discover selectors against the live page

The mirror is a snapshot, so a selector you need may be missing or out of date. Read the
live DOM at <https://www.bikeworcester.org.uk> (devtools) to confirm the real structure
and class names — never guess them, and re-sync (step 1) rather than hand-patching the
snapshot.

## 5. Deploy deliberately

- Commit on your agent branch and open a PR into `dev`.
- Merging to `dev` deploys a **dev preview**. Nothing reaches the live site yet; the
  preview is the gate.
- Do not merge `dev` into `main` until the gate in step 6 has been run.

Never commit straight to `main`.

## 6. Gate before merging to `main`

The gate is a human looking at the **dev preview**; nothing automated stands in that
position (ADR [0001](adr/0001-preview-gated-delivery-human-gate.md),
[0002](adr/0002-preview-deployment-protection.md)). Run it the same way every time:

1. **Open the `dev` preview alias.** Deployment Protection is off, so the alias loads in any
   browser with no login (ADR 0002). It is public but unlisted, so nothing secret belongs in
   the bundle. Anything else that can fetch a URL — `curl`, the mirror — can fetch it too.
2. **Check the changed page(s) at desktop and mobile widths.** Confirm the override bundle
   is actually loaded and that layout and injected DOM look right against the real
   Squarespace markup. The verification bar matches the mirror's — layout and injected DOM
   only; forms, members and search are out of scope. If the change touched CSS nesting or
   `webpack.config.js`, run `pnpm run build && pnpm run check:css` before the merge as well
   (step 3).
3. **Then merge `dev` into `main`**, which deploys production automatically.

The mirror loads the locally built bundle by default, and `BUNDLE_URL` (see `bs-config.js`)
points it at another bundle origin without editing tracked files. Because the preview is
not protected (ADR 0002), the mirror can be pointed straight at the artifact that will
ship:

```sh
BUNDLE_URL=https://bike-worcester-squarespace-git-dev-velocraft.vercel.app/index.js pnpm run watch
```

That is the strongest form of the gate — the exact deployed bundle rendered against real
markup — and it is still a human looking at a page, not a check that can pass on its own.

## 7. Eyeball the live page

After the production deploy, load <https://www.bikeworcester.org.uk> and confirm the
override bundle is actually live. If it is not, check that the Squarespace Code
Injection header still loads the **production bundle and only the production bundle**
(README → Deployment). The dev preview is never injected into the site.
