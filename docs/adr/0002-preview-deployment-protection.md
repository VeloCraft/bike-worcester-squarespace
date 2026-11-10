# 0002. Preview Deployment Protection stays on; the gate is a logged-in browser

- **Status:** Accepted
- **Date:** 2026-11-10

## Context

[ADR 0001](0001-preview-gated-delivery-human-gate.md) makes the **dev preview** the
pre-merge gate: a change is looked at on a real, non-public deployment of the override
bundle before `dev` is merged into `main`. That preview is a Vercel deployment, and Vercel
can put its Deployment Protection (its own authentication wall) in front of preview URLs.
That setting decides two things at once, and both kept being re-derived rather than looked
up:

- **Who can open the preview.** With protection on, only a logged-in member of the Vercel
  project can load it. With protection off, the preview is public — unlisted, but anyone
  holding the URL can load it.
- **What can fetch the preview.** Protection on means nothing but a logged-in browser can
  load it: no script, no command, no automation. Protection off means any client could
  fetch the artifact that is about to ship.

The second point is why the question gets asked: the local **mirror** is where fast
iteration happens (ADR 0001), and it would be attractive to point the mirror at the
preview's bundle so the gate grades the exact artifact that will ship against real
Squarespace markup. Whether that is possible is decided by this setting, not by the mirror.

## Decision

- **Deployment Protection stays on. The dev preview remains non-public.** No Vercel
  dashboard or provider-side change is made by this decision, and none is required.
- **The gate is a maintainer opening the `dev` preview alias in a logged-in browser and
  eyeballing the changed pages** — at desktop and mobile widths — against the real
  Squarespace markup. That is the whole gate. It is a judgement, not proof (ADR 0001).
- **The gate is written down and repeatable**: see
  [the dev loop, step 6](../dev-loop.md#6-gate-before-merging-to-main). Anyone can run the
  same steps without reconstructing them from memory or from a chat thread.
- **Nothing automated fetches the preview today.** No bypass secret is provisioned and no
  CI step loads the alias. If a machine-readable check of the shipping artifact is ever
  wanted, this decision is the thing to re-open (see the open question below).
- **The mirror can still be pointed at another bundle origin without editing tracked
  config.** `bs-config.js` takes its rewritten bundle origin from the `BUNDLE_URL`
  environment variable, defaulting to the locally built bundle on `localhost:3001`. This
  keeps a one-off look cheap — but with protection on, the canonical way to see a protected
  preview is to open its alias directly in the logged-in browser.

## The trade-off: a wall instead of "unlisted"

- **What it buys:** the preview is a real deployment of everything we ship, so making it
  public makes it a second, semi-public copy of the override bundle that nobody is
  responsible for. "Unlisted" is not access control: preview and deployment URLs get
  pasted into issues and chat, and a public deployment is reachable by anything that
  follows those links. Protection also keeps the gate honest — the only thing that looks
  at the preview is a human who is accountable for the merge.
- **What it costs:** no automation can load the shipping artifact, so the gate cannot be
  recorded, screenshot-diffed or replayed by a machine, and a reviewer must be logged in to
  a Vercel account. The mirror cannot anonymously fetch a protected alias, so "the mirror
  renders the exact artifact that will ship" is not available as a repeatable step — the
  reviewer opens the alias itself. That is a manual step, which ADR 0001 already accepts as
  the price of having no automated test suite.
- **What would change the decision:** the gate needing to be automated or recorded (a
  screenshot-diffing or artifact check in CI), or reviewers without Vercel accounts needing
  to see the preview. At that point the options below become live again, and this record is
  superseded rather than quietly contradicted.

### Open question (recommendation, not a change)

If the preview ever needs to be loadable by something other than a logged-in browser, there
are two provider-side routes, both deliberately **not** taken now:

1. **Deployment Protection off (public but unlisted).** Simplest, and it makes the preview
   fetchable by the mirror and by automation. It also publishes the artifact and gives up
   the access control above, which is why it is not the default.
2. **A protection bypass secret for automation** (Vercel's automation-bypass token, passed
   as a query parameter or header). It keeps the preview protected for people while letting
   one named client fetch it. It is a new secret to hold and rotate, and there is no
   machine check to feed yet, so it is the cheapest route _if_ such a check is built.

Neither is needed for the gate as it stands, and neither should be added speculatively.

## Alternatives considered

- **Protection off: public but unlisted.** Rejected for now: it makes a real deployment of
  the override bundle publicly loadable for no gain while the gate is a human opening a
  browser, and it converts "non-public" — a word this repository uses deliberately (see
  `GLOSSARY.md`) — into "not linked from anywhere". Reconsider only if something other than
  a human needs to fetch the preview.
- **Mirror pointed at the preview alias via a committed config value.** Rejected: it makes a
  tracked file carry a per-review URL, so every look would either be hand-edited or leave a
  stale address behind. The environment variable keeps the mirror configurable without
  committed churn, and the default stays the local build.
- **A third-party proxy or auth-free staging host in front of the preview.** Rejected: it
  adds a component to keep in sync and a way for the preview to leak, to solve a problem
  the logged-in browser already solves. Same reasoning as the rejected trial-site staging
  in ADR 0001.
- **Skipping the preview and relying on the mirror alone.** Rejected: the mirror is a
  frozen snapshot of markup we do not control (see freshness in `GLOSSARY.md`), so it
  cannot stand in for a deployment of the bundle. The preview is the gate; the mirror is
  where iteration happens.

## Consequences

- Anyone can read this file and know whether the preview is public (it is not) and how the
  gate is run (a logged-in browser, desktop and mobile widths, then the merge) — no need to
  ask, and no provider-side change to reverse.
- The gate is repeatable because it is written in
  [the dev loop](../dev-loop.md#6-gate-before-merging-to-main), not because it is enforced
  by tooling. Nothing stops a merge that skipped it; that remains ADR 0001's accepted cost.
- The mirror stays usable for a quick look at another bundle origin
  (`BUNDLE_URL=<url> pnpm run watch`) without editing committed config, but it is not the
  gate for a protected preview.
- Machine verification of the shipping artifact is unavailable by design. If it becomes
  necessary, one of the two routes in the open question above is the change to make, and
  this ADR is superseded.
- The live site's single injection point — the Squarespace Code Injection header described
  in the README under **Deployment** — loads the production bundle and only the production
  bundle. Neither choice here affects what visitors load, and the dev preview is never
  injected into the site.
