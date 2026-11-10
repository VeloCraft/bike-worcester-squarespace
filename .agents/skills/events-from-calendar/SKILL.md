---
name: events-from-calendar
description: Propose and enter site events from the Bike Worcester Google Calendars into the Squarespace events collection, curated rather than mirrored. Use when asked to sync, add, or check calendar events against the site, or to catch up the events listing.
---

# Events from calendar

Manual, human-curated entry of calendar events onto `bikeworcester.org.uk/events`.
Nothing here runs on a schedule. **You are the comparison** — no matcher, no diff tool.

The rule that shapes everything: **the calendar is not the shortlist.** *Bike Recycling* is
weekly, so a straight read is 13 events in three months, and they would drown the rides you
actually want people to turn up to. Collapse first, curate second, enter third.

Hard rules, no exceptions:

- **Create only.** Never edit, delete, unpublish or "correct" an existing site event. A mismatch is
  reported, never fixed.
- **Never invent** a start time, end time, venue, price or image. If the calendar does not say it,
  the proposal says it is missing.
- **Wait for approval** before touching the editor.
- Never handle Squarespace credentials. The browser profile is already logged in or the run stops.

## 1. Read both sides

```bash
curl -s "https://www.bikeworcester.org.uk/events?format=json" -o /tmp/sq-events.json
```

`upcoming` is already filtered and ordered. Page size is 30 — follow `pagination.nextPageUrl` if a
page comes back full. The `past` list is the **house style corpus**, not a target; read it, then open
two or three recent event pages to see body length, tone and image treatment.

Calendars: **`BW: Public events`** and **`BW: Community events`** (ids from `calendar_list`). Window:
now → 6 months.

## 2. Merge, dedupe, collapse — in that order

This is the same pipeline the save-the-date generator uses
(`~/Documents/bike-worcester-savethedate-print/lib/events.ts`), and the rules are worth copying
rather than inventing:

1. **Dedupe across sources.** Same instant, or **same `Europe/London` day** with one loose title
   contained in the other (`looseTitle` = lower-case alphanumerics only, so `Glow Ride` ≈
   `Worcester Glow Ride`). **The site entry always wins** — it has the artwork, slug and writing.
2. **Collapse repeating series** to their **next** instance: the same `slug` appears once. `Bike
   Recycling` ×13 becomes one row; `Critical Mass` ×6 becomes one row.
3. Sort by date.

Measured 2026-11-10: 39 calendar instances in six months collapse to 3 — *Bike Recycling* (11 Nov),
*Repair Cafe* (14 Nov), *Critical Mass* (21 Nov). That is the whole difference between a shortlist and
a flood.

## 3. Judge what is missing

Three buckets, and say which is which:

- **missing** — a calendar event with no site counterpart. These are the candidates.
- **already there** — a site event that a human would call the same event. Name the site event you
  matched and why.
- **site only** — a site event with no calendar match. **Report it; never act on it.** On 2026-11-10
  both upcoming site events (*Cycling UK Advocacy Network*, *Critical and Kidical X-MASS*) were absent
  from every BW calendar.

Ignore anything already started.

## 4. Curate before proposing

Present the collapsed candidate list and let the human cut it down. Default: one row per activity,
the next occurrence. Offer a **max** — the save-the-date poster caps at 7 rows — and say what gets
dropped past it.

The site has **no shared shortlist file**. The approved proposal *is* the shortlist for that run.
Do not read the save-the-date repo's `events.selected.json`: it holds dated instances under a
7-row layout cap, regenerated for one print, and letting it govern the site would import both the
cap and the staleness. The only thing that persists between runs is the ledger (section 8).

Do not treat the current "Other events" Google Calendar embed on `/events` as coverage — it is being
removed, so a series still needs a page. But neither does every occurrence need one.

## 5. Propose a name in the site's own style

Do not normalise or strip — **look at how the site already names things.** From the 2025–2026 corpus:

| calendar | site |
| --- | --- |
| `Critical Mass` (monthly series) | `Critical Mass Cycle Ride - September 2026` |
| `Bike Recycling` | `Bike Recycling` |
| `[CONFIRMED] Bike fixing at DinesFest [LEAD: Al]` | `Bike fixing at DinesFest` |
| `Kidical Mass: World Car Free Day` | `Worcester Kidical Mass September 2025` |
| `Annual General Meeting` | `Annual General Meeting` |

The recurring rides carry a `- <Month> <Year>` suffix because each occurrence is its own page;
one-offs usually do not. Square-bracketed segments (`[CONFIRMED]`, `[LEAD: Al]`) are internal status
and never appear on the site.

Show each proposed title **next to the existing titles it is modelled on**. If the event resembles
nothing in the corpus, say so and propose a plainly-derived name rather than inventing a style.

## 6. Present, then stop

Title, start, end, all-day?, venue, excerpt (one or two sentences), body (the calendar description,
tidied), source calendar, image status. Plus the counts and the cuts.

## 7. Enter on approval

`references/editor.md` has the verified click-path. In outline, one event at a time:

1. `/config/pages/66e1891326641352b9d00fbb` → `Add`
2. title → `Date and Time` → `Location` (click the autocomplete suggestion)
3. `SAVE` in the panel → stored as a **draft**, invisible publicly
4. reopen → `Edit` → fill the body block → `Save`
5. `Item options` → `Settings` → `Content` → `EXCERPT` (the listing shows this, not the body)
6. `PUBLISH` only when the human asked for it live in this run
7. verify: `DRAFT` badge in the panel, absent from `/events?format=json`; once published, present and
   correct there

Re-take a snapshot after every save — the editor re-creates its overlays and uids go stale.

On a failed save: **stop the run**, report. Never create a second copy to "fix" the first. A wrong
event is undone with `Item options` → `Delete`.

## 8. Keep the ledger; supersede only your own pages

A **collapsed series** gets one page per date, and create-only cannot move it to the next date. The
ledger is the one exception, and it is narrow: a run may replace a page **it created itself**, never
one a human made.

After each save, append to `ledger.json` (next to this file):

```json
{ "series": "bike-recycling", "title": "Bike Recycling", "url": "/events/bike-recycling",
  "startDate": "2026-11-11T19:20:00Z", "created": "2026-11-10", "status": "draft" }
```

`series` is the collapsed-series key, so the next run can find its predecessor. Set `status` to
`published` in a later run rather than trusting the create step.

When a run proposes an instance of a series that the ledger already has with a **past** `startDate`,
the proposal row says `replaces: /events/<old>` and names the ledger entry. The human's approval of
that row covers the replacement — no separate permission is needed, and no replacement happens for a
row that was cut.

Replace in this order, never the reverse:

1. create the new page (draft) and verify it — the platform gives it `<slug>-1` because the old one
   still holds the slug;
2. delete the old page (`Item options` → `Delete`), confirming its URL matches the ledger entry;
3. set the new page's `EVENT URL` to the now-free slug, so `/events/bike-recycling` keeps pointing
   at the current instance;
4. mark the old ledger entry `superseded` and append the new one.

A page that is not in the ledger is never touched, whatever its title or how wrong it looks.

## Stop conditions

- Not logged into Squarespace → stop, ask for the login (see `references/setup.md`).
- Calendar tool error for a calendar → that calendar was not read; say so.
- A duplicate title+day already on the site → report it, do not create a third.

## Files

- `references/editor.md` — the verified editor walkthrough (also covers login).
- `references/setup.md` — browser profile and login, the one human-only step.
- `ledger.json` — the site events this skill created, and may therefore supersede.

## Vocabulary

Use the repo's words: **site event**, **calendar event**, **entry run**, **house title**,
**collapsed series** (`GLOSSARY.md`). The reason an agent may touch the platform's content
at all — and why that sits outside the deploy gate — is
[ADR 0003](../../../docs/adr/0003-agent-entered-content-outside-the-gate.md).
