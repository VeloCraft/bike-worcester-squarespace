# Glossary

The canonical vocabulary for this repository. When a term below is used in an issue, a
commit message, a document or a review, it means what this file says it means. Prefer
these words over the loose alternatives people reach for; if a concept is missing, that
is a gap worth naming rather than inventing a synonym for.

## Mirror (also: snapshot)

A local, static copy of the live site's rendered pages, taken at a point in time and
served for looking at while working. It stands in for the live site — it is not the live
site, and it never updates itself. "Mirror" is the word when the emphasis is on it
standing in for the real thing; "snapshot" is the word when the emphasis is on it being
frozen at the moment it was taken. They are the same artefact.

## Override bundle

The styles and scripts this repository produces and injects into the live site: everything
we own and ship, layered on top of the markup and assets the site platform already
serves. Nothing we ship changes the platform's own configuration — it is all override.

## Production bundle

The override bundle as served to real visitors, loaded by the live site. It is one
specific deployment of the override bundle, not the working copy built while developing
and not the build shown on a preview.

## Dev preview

An unlisted deployment of the override bundle, built from the integration branch and
reachable by its own address. It is a real deployment rather than a local copy, so it
shows the change as it would ship, but it is not the site visitors see. It exists to be
looked at before a change becomes production. Unlisted, not private: anyone holding the
address can load it, and search engines are asked not to index it.

## Freshness

How closely a mirror reflects the live site's current markup. A mirror is only as fresh as
its last refresh, and freshness decays on its own: the live site changes underneath a
mirror without the mirror changing at all. Staleness is the failure mode — work verified
against a stale mirror is verified against markup that may no longer exist.

## Dev loop

The working cycle for a change: refresh the mirror, run the watch, verify the change in
the mirror, deploy deliberately, pass the gate by looking at the dev preview before it
reaches production, then look at the live page. The watch (also "the watch loop") is the
rebuild-and-reload step inside the dev loop, not another name for the whole cycle. The dev
loop is how a change gets from "do this" to "it is live".

## Port reservation

The fixed set of ports the watch binds, derived from a single base port and written down
in `docs/dev-loop.md`. A reservation rather than a preference: the loop stops when a port
in it is taken instead of moving to another one, because a mirror on an undocumented port
is worse than no mirror. A second loop takes a different reservation (a different
`DEV_PORT_BASE`), so two loops on one machine cannot collide.

## Gate

The checkpoint a change must pass before it reaches production. In this repository the
gate is the dev preview looked at by a human; no automated check stands in that position.
Passing the gate is a judgement that the change looks right, not proof that it cannot
break.
