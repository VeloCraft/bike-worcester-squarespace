# PROTOTYPE — individual event page variants (throwaway)

**Question:** what should an individual event page look like?

> Five variants of the single-event page, switchable via `?variant=`, rendered on a copy of the
> existing mirrored event page. `A` is what ships today, for reference.

Nothing here is production code. It is not wired into `src/`, it does not run in the bundle, and it
touches no goal in the tracker. The question it answers is a design one, and only the maintainer
can answer it.

## Run it

```sh
pnpm run proto:event
```

That copies the mirrored event pages, injects `variants.css` + `switcher.js` into each copy, and
writes them **beside the originals** in `html/www.bikeworcester.org.uk/events/` so every relative
asset URL keeps resolving. It prints the URLs. It needs the watch loop (`pnpm run watch`) to be
serving the mirror.

If the pages are missing or stale: `pnpm run sync events` first — the mirror is a snapshot, and a
stale snapshot makes every variant look wrong.

## Variants

| key | name              | shape                                                                    |
| --- | ----------------- | ------------------------------------------------------------------------ |
| A   | Today (reference) | the platform's own layout + the shipped override bundle                   |
| B   | Poster            | one centred column; the date as a white chip with dark ink; body at 62ch   |
| C   | Dossier           | labelled fact panel on the left (When / Where / Add to calendar), body right |
| D   | Timeline          | a rail with a dot per step: date → venue → details, body hung off the rail |
| E   | Hero band         | a green band across the content column carrying the title, then a details bar, then body |

Use the floating bar at the bottom, or the arrow keys, or the URL (`?variant=C`).

## Things this run turned up

- **Add to calendar is switched off on the site.** `body:not(.tweak-events-stacked-ical-gcal-links)
  .event-meta-addtocalendar-container { display: none }` is in the platform stylesheet, and the site
  does not have that tweak, so the Google Calendar / ICS links never render. The variants style them
  but do not force them visible — forcing them would be shipping a feature nobody asked for. If
  they are wanted, that is a Squarespace tweak, not an override.
- **The single-event markup is not the listing's markup.** `eventitem-*`, not `eventlist-*`; there
  is no thumbnail slot, no date tag, no badges. Nothing from the listing's CSS applies here, which
  is why the listing's revert changed nothing on these pages.
- **The platform fights back in two places**, if a variant is ever promoted: `.eventitem-title` is
  locked with `!important` (font-size / line-height / margin), and
  `.cdk-section[data-definition-name="website.components.eventsItem"] .eventitem-meta-item` sets
  `padding: 0` at three class-levels of specificity. Both are answered here by a `.events-item`
  prefix on every selector, plus `!important` on the title only.
- **The baseline page already overflows sideways at 500px** (scrollWidth 545 vs 500) because of the
  next-event panel. The variants do not; that was not the question, but it is a real bug.
- No 390px measurement was made: the DevTools MCP viewport will not go below 500px wide. 500 is the
  narrowest width anything here was checked at.

## Assumptions

- Same fonts (Jost), same palette as the rest of the site: `--bwGreen`, `--bwBlue`, `--bwBlack`,
  `--bwWhite`, the platform's own white for the date chip. No new colours, no new webfonts.
- No event in the mirror has a thumbnail, and the single-event markup has no thumbnail slot at all
  (`eventitem-*` is a different component from the listing's `eventlist-*`). So no variant designs
  around a hero image. If images are wanted on event pages, that is a Squarespace content change,
  not an override.
- The only DOM change needed is the floating switcher itself. Every visual variant is CSS over the
  markup the platform already renders — `.eventitem-column-meta { display: contents }` is what lets
  the title, date, venue and calendar be placed independently. Anything that needs injected markup
  is called out in the CSS as such, because that is a real cost.

## Status

Uncommitted and untracked, on purpose: `dev` is frozen at the `2d29938` revert while the maintainer runs the gate.
When a direction is picked, capture the verdict here and move the whole directory (plus the
`proto:event` script) to a throwaway branch — the variants are the primary source, not the bin. The
only thing that goes on `main` is the winning design, rewritten properly.
