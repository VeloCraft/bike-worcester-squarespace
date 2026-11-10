# 0003. An agent enters site content, outside the deploy gate

- **Status:** Accepted
- **Date:** 2026-11-10

## Context

ADRs [0001](0001-preview-gated-delivery-human-gate.md) and
[0002](0002-preview-deployment-protection.md) are about the override bundle, and the gate they
describe — a human looking at the dev preview — only ever sees that bundle. The site's *content*,
the events collection above all, is a different kind of artefact: it lives in the platform, cannot
be versioned here, and never passes through a deployment. Nothing in the existing process governs
it at all.

Keeping the events listing current has been a person opening the Squarespace editor and typing.
The platform offers no write API for events; the only machine-readable surface is
`/events?format=json`, which reads and cannot create. So any automation of the typing is UI
automation, or it is nothing.

## Decision

An agent may create **site events** in the platform's own admin UI, under these rules:

- **Only from an approved proposal.** The run reads both sides, judges what is missing, and shows
  a table the human cuts down and approves. The editor is not touched before that approval.
- **Create only.** Existing site events are never edited, unpublished, renamed or deleted. A
  mismatch is reported; fixing it is a human's decision.
- **Drafts, not publishes,** unless the human asked for live in that run.
- **Nothing invented.** A time, venue, price or image the source does not supply is reported as
  missing, not filled in.
- **No credentials handled by the agent.** The browser is logged in by a human or the run stops;
  no password is typed, no session is stored in the repo.
- **The procedure lives in a skill** (`.agents/skills/events-from-calendar/`), not in a service.
  It runs when a person asks for it, and it can be read and argued with.

The judgement it depends on — is this the same event as that one, is this the house title for that
series — is deliberately not encoded in a matcher.

## Alternatives considered

- **Read-only: report what is missing and let a human type it.** Rejected as the whole answer: it
  leaves the typing, which is the bottleneck. It remains the fallback when the browser step cannot
  be done.
- **Reverse-engineer the admin's internal HTTP calls and post directly.** Rejected: undocumented,
  changes without notice, and its failures are silent — a mangled event that looks saved. Driving
  the real editor fails visibly, in the same place a human would notice.
- **A matcher with normalised titles and an alias table.** Rejected after the live data: every
  upcoming calendar event is an instance of an infinite series, site titles carry a per-occurrence
  suffix, and community titles carry internal status brackets. Encoding those exceptions as rules
  costs more than a reader spends on them, and each new naming habit would need a code change.

## The trade-off, stated plainly

**Verification moves from a page to a proposal.** ADR 0001's gate is a human looking at what will
ship. Here the human looks at a table of what *will be* created, then at the created pages. There
is no build, no preview, no diff, and no test for the judgement itself; if the agent misjudges a
duplicate, the only thing that catches it is the human reading the proposal.

**Nothing is versioned or rollback-able in the usual way.** A published site event is live the
moment it is published. Undoing a mistake means `Delete` in the editor, which is fast but leaves no
record. Keeping the listing current is worth this because the alternative is that it is not kept
current at all.

**Create-only has a cost.** A wrong entry, or an entry for an event that changes, stays until a
human removes it; the run will report it rather than repair it. That is the price of never aiming a
delete at content a human made.

## Consequences

- Content changes can no longer be assumed to have come from a person at a keyboard, and a run's
  output is reviewed as a proposal rather than as a diff.
- A stale series page has no owner by default: collapse-to-next-instance is right when proposing and
  wrong once the date passes, and create-only cannot replace it. Decided: a run keeps a **ledger** of
  the pages it created and may supersede only those — create the newer instance, verify it, delete
  its own predecessor, and keep the URL. A page that is not in the ledger is never touched.
- The site has no shared shortlist with the save-the-date poster. The approved proposal is the
  shortlist for one run; only the ledger persists between runs.
- The shared login and the browser profile are part of the process, and the honest description of
  the process says so.
