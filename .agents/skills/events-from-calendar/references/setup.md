# Setup — browser session (draft)

The one thing only a human can do: get a browser that is logged into Squarespace.

## Check first

1. `list_pages` with the Chrome DevTools MCP.
2. `navigate_page` to `https://www.bikeworcester.org.uk/config/pages`.
3. Logged in → you land in the Squarespace admin. Not logged in → you land on
   `login.squarespace.com`. On 2026-11-10 it was the latter.

## If not logged in — ask, don't automate

Stop the run and ask the human to log in **in the browser window the MCP controls**. Never type
their password, never handle 2FA, never paste cookies into a file, never commit a profile.

Then re-run the check.

## Persistence — unverified

Whether the DevTools MCP reuses a persistent Chrome profile across sessions is not established.
If it starts a fresh profile each time, the login is a per-session step: tell the human up front
that each run begins with a login, rather than discovering it mid-entry after the plan was approved.

A persistent named profile would remove this, and `puppeteer@23` is already a devDependency if a
scripted browser with its own profile turns out to be better. That is a change to this skill, not
a prerequisite.

## Never

- Credentials in the repo, in `.env`, in a skill file, or in chat.
- A saved session in `chrome/` or any other tracked directory.
