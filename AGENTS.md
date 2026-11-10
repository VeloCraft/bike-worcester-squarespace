## Agent skills

### Issue tracker

GitHub Issues using the `gh` CLI. PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Default labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Dev loop

Before touching styles or injected DOM, read `docs/dev-loop.md`: sync the mirror, run the watch loop, verify in the mirror, then deploy via `dev` (preview) to `main` (production).

### Domain docs

Single-context: `GLOSSARY.md` + `docs/adr/` at repo root. See `docs/agents/domain.md`.
