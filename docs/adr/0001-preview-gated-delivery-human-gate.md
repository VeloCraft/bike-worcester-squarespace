# 0001. Preview-gated delivery, with a human as the gate

- **Status:** Accepted
- **Date:** 2026-11-10

## Context

This repository ships a stylesheet and script override for a site hosted on Squarespace.
We do not control the platform's markup, its release cadence, or its server-side
behaviour; we only control what our override bundle does once it is loaded. The site is a
real public site for a real organisation, so a bad deploy is visible to visitors
immediately, and the platform can change the markup we style without telling us.

Two questions kept being re-derived rather than looked up: why there is an integration
branch at all, and what each merge actually deploys. The answers determine how a change
gets verified — which is the subject of this record.

There is **no automated test suite** in this repository (see
[the trade-off](#the-trade-off-no-automated-test-suite)). The package's `test` script is
inherited scaffolding with no tests behind it, so nothing runs a check on our behalf.
Verification is therefore a question of process: who looks at what, and when.

## Decision

Delivery topology:

- **`dev` is the integration branch.** Work is integrated there first. Merging to `dev`
  deploys a **dev preview**: a real, non-public deployment of the override bundle built
  from `dev`.
- **Merging `dev` into `main` deploys production automatically.** `main` is what visitors
  get; there is no separate release step and no manual promotion.
- **The dev preview is the pre-merge gate.** A change is looked at on the preview before
  `dev` is merged into `main`. Looking at it there is what "verified" means for this repo,
  and it is the last checkpoint before production.
- **Local verification happens against the mirror.** While a change is being made, it is
  checked against a local mirror of the live site refreshed from the live site, rather
  than against a guess about the markup. The mirror is where fast iteration happens; the
  preview is where the decision to ship happens.

So the loop a change follows is: refresh the mirror, run the watch, verify in the mirror,
merge to `dev`, look at the preview, merge to `main`, look at the live page.

## The trade-off: no automated test suite

The gate is a human looking at a page. This is deliberate and accepted, not an oversight
or a TODO.

- **What it buys:** the only thing worth testing here is whether the injected styles and
  markup look and behave right on top of someone else's platform. That is cheap to check
  by eye against the real thing and expensive to assert in code: a test suite would have to
  pin Squarespace's markup, which changes without our involvement, so the tests would break
  for reasons that are not our bugs. A human looking at the preview also catches the class
  of failure that matters most — "it renders wrong" — which no assertion about our own
  output reliably catches.
- **What it costs:** nothing prevents a change from reaching production unverified except
  the discipline of whoever merges; there is no red build to stop them, and no regression
  signal if a visual change is missed. Verification is only as good as the attention paid
  to it, and it is not repeatable or recorded.
- **What would change the decision:** if regressions started reaching production that a
  repeatable check could have caught — repeated breakage of specific pages, or changes
  frequently touching behaviour beyond layout, such as the platform's forms, members or
  search — the trade-off would be re-opened and a targeted check added. The trigger is
  evidence of missed regressions, not a general preference for tests.

The bar the human holds is also deliberately narrow: **layout and injected DOM only**.
Platform API behaviour, forms, members and search cannot be exercised in the mirror and
are out of scope for local verification, so a change is never claimed to have verified
them.

## Alternatives considered

- **A duplicated Squarespace trial site, used as a staging environment.** Rejected: it is a
  second site to keep in sync, and it drifts — its plan, its content and its markup are
  never quite the same as production, so a change verified there proves less than the
  preview does. Keeping it in step would cost more than the preview, and the preview is a
  deployment of the same bundle rather than a copy of the site.
- **A feature branch per change, each deploying its own preview.** Rejected: it
  multiplies the number of deployments to look at and gives every in-flight change a URL,
  which invites merging straight to `main` from a branch that was never integrated with
  anything else. A single integration branch keeps one preview as one gate, and makes the
  question "is `dev` good?" the only question to answer before production.
- **No verification at all: commit and deploy directly.** Rejected: the site is public and
  the platform's markup moves underneath us, so an unstyled or broken page would be live
  with no checkpoint in between. The preview costs one extra merge and one look, and is the
  cheapest thing that stands between a mistake and visitors.

## Consequences

- Anyone can read this file and know what a merge to `dev` does, what a merge to `main`
  does, and where verification happens — no need to ask.
- A change is not "done" when it is committed; it is done when it has been looked at on the
  preview and then on the live page.
- Nothing automated will stop a bad merge. The process depends on the maintainer's
  attention at the gate, and that is the accepted price.
- Local verification can never cover platform behaviour; review expectations must stay
  honest about that boundary.
- If the trade-off is ever revisited, the trigger is recorded here: regressions reaching
  production that a repeatable check could have caught.
