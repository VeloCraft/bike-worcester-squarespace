# Draft — calendar → Squarespace event entry

Status: **draft, nothing executed, nothing committed.** Supersedes the Q7–Q11 framing in the
2026-11-10 handoff and the mechanical-matcher draft that preceded this one.

Approach, settled by the maintainer: **a manually-run skill, judgement not code.** An agent in a
pi session reads the BW calendars with the existing `calendar_*` tools, reads the site's own events
listing, decides by reading what is missing, proposes names **in the site's existing style**, waits
for approval, then enters the approved events into the Squarespace editor through the browser.

No API integration. No Vercel function. No matcher, no normalisation spec, no test corpus. The
comparison is the agent reading two lists.

## Why judgement rather than rules

The mechanical version was designed against assumptions the live data contradicted:

| observation (verified 2026-11-10) | consequence |
| --- | --- |
| Site has **2 upcoming** events; *neither* is in any BW calendar | the traffic is currently site → calendar, not the reverse |
| **Every** upcoming calendar event is an instance of an infinite series (*Bike Recycling* weekly, *Repair Cafe* monthly, *Critical Mass* monthly) | series handling, not one-off matching, is the real work |
| *Bike Recycling* is in **both** calendars, same time | cross-calendar duplicates already exist |
| Site titles per occurrence: `Critical Mass Cycle Ride - September 2026`; calendar says `Critical Mass` | a regex would report these as unmatched forever; a reader recognises them at once |
| Community titles: `[CONFIRMED] Bike fixing at DinesFest [LEAD: Al]` | brackets are internal status, stripped by understanding not by rule |
| Two `Punctures and Pizza` entries already on the site (25 & 26 Nov 2025) | duplicates exist on the site side; the run should notice, not normalise them away |
| `…/config/pages` → `login.squarespace.com` | the browser is not authenticated — one human step |

A matcher could be made to pass these, but only by encoding the very naming exceptions a reader
gets for free. At this volume (single-digit proposals per run) the encoding costs more than it
saves, and every new naming habit would need a code change.

## Consequence, stated plainly

There is **no test suite for the judgement**. The verification is the proposal the human reads
before approving — which is the same kind of gate ADR 0001 already uses: a human looking at the
output, not a green check. If the agent misjudges a duplicate, a human sees it in the table and
says so. That is the accepted trade.

## Deliverable

`.agents/skills/events-from-calendar/` — a project skill:

- `SKILL.md` — the procedure: read the site, read the calendars, judge, propose names in house
  style, wait, enter one at a time, verify the saved page.
- `references/setup.md` — the browser/login step.
- `references/editor.md` — written from the verified end-to-end run on 2026-11-10.

Vocabulary settled after this note: **site event**, **calendar event**, **entry run**,
**house title**, **collapsed series** are in `GLOSSARY.md`; the decision that an agent may enter
content outside the deploy gate is ADR 0003.

Rules carried in the skill rather than enforced in code:

- **Create only.** Renames, moves, cancellations and deletions after the fact are *reported*, never
  acted on. Adding is reversible by a human in seconds; editing live content is not.
- Never invent a time, venue or image. A missing field is stated as missing.
- Approval before the editor is touched.
- Stop on the first failed save; never create a second copy to repair the first.

## Still open

1. **Series expansion / staleness.** One page per occurrence is the site's history; collapsed
   series pages go stale once the date passes and create-only cannot replace them. Ledger vs
   never-create-series vs one-draft-per-run is put to the maintainer and unanswered.
2. **Shortlist source** — the poster's `events.selected.json`, or a separate one.
3. **`[CONFIRMED]`** — treated as internal status, never gating.
4. **Photos.** Proposal says `[no image]`; the human attaches during approval, or accepts an
   imageless page.
5. **Login persistence** — whether the DevTools MCP reuses a Chrome profile is still unverified.

## Follow-ups, not this skill

- ~~`GLOSSARY.md` has no word for the platform's content~~ — done: **site event**, **calendar
  event**, **entry run**, **house title**, **collapsed series**, plus a scope line on **gate**.
- ~~ADR: content entered by an agent, outside the deploy gate~~ — done: ADR 0003.
- The reverted events restyle stays reverted. No visual change to the listing.
