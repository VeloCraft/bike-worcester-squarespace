# 0002. Preview Deployment Protection is off; the gate is still a human

- **Status:** Accepted (revised 2026-11-10)
- **Date:** 2026-11-10

## Revision note

This record was first accepted the same day with the **opposite** decision: protection
stays on and the preview is non-public. It was revised after the maintainer turned
Deployment Protection off in the Vercel project, and the result was verified from a clean
shell with no browser session:

```
$ curl -sS -o /dev/null -w '%{http_code} %{size_download}\n' \
    https://bike-worcester-squarespace-git-dev-velocraft.vercel.app/index.js
200 66574
$ curl -sSI ... | grep -iE 'cache-control|x-robots-tag'
cache-control: public, max-age=0, must-revalidate
x-robots-tag: noindex
```

No SSO redirect, no cookie, no bypass secret. The decision below describes what is true
now; the superseded reasoning is kept under **Why the earlier decision was reversed** so
the reversal is not quietly rewritten away.

## Context

[ADR 0001](0001-preview-gated-delivery-human-gate.md) makes the **dev preview** the
pre-merge gate: a change is looked at on a real deployment of the override bundle before
`dev` is merged into `main`. That preview is a Vercel deployment, and Vercel can put its
Deployment Protection (an authentication wall) in front of preview URLs. That setting
decides two things at once:

- **Who can open the preview.** On: only a logged-in member of the Vercel project. Off: the
  preview is public — unlisted, but anyone holding the URL can load it.
- **What can fetch the preview.** On: nothing but a logged-in browser — no script, no
  command, no automation. Off: any client can fetch the artifact that is about to ship.

The second point is what makes the setting interesting: the local **mirror** is where fast
iteration happens (ADR 0001), and pointing the mirror at the preview's bundle would let the
gate grade the exact artifact that will ship against real Squarespace markup.

## Decision

- **Deployment Protection is off for previews.** The preview is public but unlisted: no
  link to it exists anywhere public, and Vercel serves `x-robots-tag: noindex`. It is not
  access control, and this record does not pretend otherwise.
- **The gate is still a human looking at the preview** — the changed pages, desktop and
  mobile widths, against real Squarespace markup. Nothing automated replaces that
  judgement (ADR 0001).
- **The mirror may be pointed at the preview bundle**, since nothing blocks an anonymous
  fetch: `BUNDLE_URL=https://bike-worcester-squarespace-git-dev-velocraft.vercel.app/index.js
  pnpm run watch`. The default stays the locally built bundle; the preview origin is never
  committed to a tracked file.
- **The gate is written down and repeatable**: see
  [the dev loop, step 6](../dev-loop.md#6-gate-before-merging-to-main).
- **The production injection point is unchanged.** The Squarespace Code Injection header
  documented in the README loads the production bundle and only the production bundle. The
  dev preview is never injected into the site.

## Why the earlier decision was reversed

The original record argued that a wall keeps the only reader of the preview a human who is
accountable for the merge, and that "unlisted" is not access control. Both points survive;
what changed is the price they were being paid for. Turning protection off costs:

- a publicly loadable copy of the override bundle, reachable by anyone who learns the alias;
- no per-identity access log for who looked at the preview.

It buys the ability to fetch the shipping artifact from the mirror and, later, from
automation — which is the thing the repo kept failing to do by hand. With no automated test
suite (ADR 0001), the gate is the only verification there is, so making the gate easier to
actually run beat keeping a wall in front of a bundle that ships publicly to the live site
moments later anyway.

## Alternatives considered

- **Protection on, gate in a logged-in browser.** The superseded decision. Rejected because
  it makes the gate depend on a Vercel session and blocks the mirror from rendering the
  shipping artifact — the manual step the repo was already failing to complete.
- **Protection on plus a bypass secret for automation.** Rejected: a new secret to hold and
  rotate, with no machine check yet to feed. Reconsider if automation is ever added.
- **A third-party proxy or auth-free staging host.** Rejected: another component to keep in
  sync, and another way for the preview to leak, to solve a problem the setting already
  solves. Same reasoning as the rejected trial-site staging in ADR 0001.
- **Skipping the preview and relying on the mirror alone.** Rejected: the mirror is a frozen
  snapshot of markup we do not control (see freshness in `GLOSSARY.md`), so it cannot stand
  in for a deployment of the bundle.

## Consequences

- The preview is fetchable by the mirror and by any future check, so "the artifact that will
  ship, rendered against live markup" is a repeatable step rather than a manual one.
- Anything holding the alias can load the bundle. Accepted, because the same bundle ships
  publicly to the live site one merge later; do not put anything secret in it.
- Rollback is unaffected: reverting on `dev` redeploys the preview, reverting on `main`
  redeploys production.
- If the preview must stop being public — a secret in the bundle, or a reviewer requiring
  access control — reopen this record and supersede it rather than editing the decision in
  place.
