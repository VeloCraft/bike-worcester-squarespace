# The Squarespace event editor — verified walkthrough

Verified 2026-11-10 against the live site, logged in as `bikeworcester99+calendars@gmail.com`.
Everything below was actually done, not inferred. One draft event was created and left unpublished;
nothing was published.

## Getting in

1. `navigate_page` → `https://cinnamon-lynx-zkjd.squarespace.com/config/pages` — **use the
   `cinnamon-lynx-zkjd.squarespace.com` host, not `bikeworcester.org.uk`**, or the OAuth round-trip
   restarts.
2. Not logged in → `login.squarespace.com`. Email + password, then a **"Verify your email address"**
   screen that asks for a code mailed to the account. **`SKIP` works** and lands you in the admin.
3. The Events collection panel: `https://cinnamon-lynx-zkjd.squarespace.com/config/pages/66e1891326641352b9d00fbb`
   (collection id `66e1891326641352b9d00fbb`). It lists upcoming events, `DRAFT` badges included.

## Create an event

Click **`Add`** (top left of the panel). A full-screen editor opens with a small panel:

| field | notes |
| --- | --- |
| `EVENT TITLE` | plain textbox |
| `Date and Time` | opens a month calendar + a `Set time` textbox. Click the day button (`11/25/2026`), then type into `Set time` (`19:20`). End is set the same way after selecting the **`Event End`** tab; it defaults to the start time |
| `Location` | opens `Business Name` / `Address` / `City, State, Zip` / `Country` plus a map. **The autocomplete is on `Address`, not `Business Name`** — type the venue name there (e.g. `Cafe Viaduct Worcester`), wait half a second, then click the suggestion row. It fills Address, City and postcode, and the map geocodes. Typing in `Business Name` alone produces no list |

Before saving, read the summary line under `DETAILS` — it is the only place both times are visible together.

`SAVE` (in that panel) stores the event as a **draft** — it does not appear in
`/events?format=json` and is invisible to visitors. `PUBLISH` in the top bar is what makes it live.

## Body text

The event page is a real page and has **one empty text block** by default. Right after the first save
there is **no body block in the accessibility tree** — do not hunt for it, and do not click into the
page (that selects the site header instead). `Exit`, click the event's row in the list, then `Edit`:

1. Inside the preview iframe the body block is now a ProseMirror `div.tiptap`. It is exposed to the
   accessibility tree as a **`textbox multiline`** — `fill` it directly. Multi-paragraph text is fine.
2. `Save` in the top bar. A disabled `Save` afterwards means it took.

Adding a *new* block or section is possible but was not needed: the default block is enough.

## Excerpt and URL

`Item options` (the ⋯ at the end of the event's row) → **`Settings`** → `Event Settings` panel with
tabs `Content | Options | SEO | Social Image | Share | Location`.

`Content` holds:

- `FEATURED IMAGE` — `ADD IMAGE` / `SEARCH FOR IMAGES`. Optional; the calendar never supplies one.
- `EXCERPT` — rich text. **This is what the listing row shows**, so it must be written; the body
  alone does not appear on `/events`.
- `EVENT URL` — pre-filled, but **never trust it**: it may be a random id
  (`/events/k4re1jocz6jvbx3gd7cp9vgwhw2sp4`) or carry a `-1` suffix. Set it deliberately to the house
  slug. `fill` **appends** to this field's existing value (it produced
  `november-repair-cafe-1november-2026-repair-cafe`); clear it by setting `.value` and dispatching
  `input`, then check the snapshot shows the whole value you wanted.
- `AUTHOR` — defaults to the account, `BW Calendars`.
- `SOURCE URL` — renders an attribution line; useful for community events that have one.
- `DUPLICATE`, `DELETE` — delete is how a mistake gets undone.

`Item options` also offers `Duplicate` and `Delete` directly.

## What a saved event looks like publicly

`/events?format=json` carries `title`, `startDate`, `endDate`, `location.*`, `excerpt` (rich HTML),
`body` (block layout HTML), `fullUrl`, `urlId`, `assetUrl` (absent when there is no featured
image). Drafts are absent from `upcoming` entirely.

## Traps

- The editor overlays are re-created on every save; **uids go stale**. Take a fresh snapshot after
  each save, not once per event.
- **The end time does not follow the start.** After the start moves, `Event End` can still hold its old
  value (seen: start `11:00 AM`, end `7:30 PM`). Set both, then read the summary line.
- The date/time and location panels are sub-screens with their own `Back` button — leaving via the
  browser's back button loses the edit.
- `fill` on the location and URL inputs does not fire the widget's own listeners. Where a snapshot
  edit does nothing, set `el.value` through the native setter and dispatch `input`.
- Changing `EVENT URL` leaves the preview iframe on the old address, showing **“Page not found”**.
  Expected — re-select the row and it loads the new one.
- Drafts never appear in `/events?format=json`, so that list cannot confirm a create. Use the `DRAFT`
  badge in the list and the rendered draft page instead.
- The `Set time` box keeps the typed value (`21:00`) as its `value` while displaying `9:00 PM` —
  read the label, not the input, to confirm.
- `Save` in the top bar is greyed out when nothing changed. A disabled `Save` is success, not
  failure.
- The site preview iframe is same-origin: `iframe.contentDocument` works for reading state, which is
  much cheaper than snapshotting the whole page.
