## Agent skills

### Issue tracker

GitHub Issues using the `gh` CLI. PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Default labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Dev loop

Before touching styles or injected DOM, read `docs/dev-loop.md`: sync the mirror, run the watch loop, verify in the mirror, merge to `dev` (preview), pass the gate by looking at the preview alias, then merge to `main` (production).

### Domain docs

Single-context: `GLOSSARY.md` (canonical terms) + `docs/adr/` (decisions, from `0001` on) at repo root. See `docs/agents/domain.md`.
