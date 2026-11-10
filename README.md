# Bike Worcester Squarespace

A repository of scripts and styles for the Bike Worcester Squarespace website.

## Installation

Install httrack using `brew install httrack` or `sudo apt install httrack`.
Run `pnpm install` to install dependencies.

## Development

Run `pnpm run sync` to store a copy of the site to the `html` directory. Alternatively, run `pnpm run sync pathname` to store a copy of a specific page and subpages.
Run `pnpm run watch` to run a local development server using the site files, watch for changes and reload the injected scripts when changes are made.

The project is built using Webpack. The entry point is `src/index.js` and `src/index.css` and the output is compiled to `dist/index.js` with all assets (including images and css) encoded as base64 strings and included in the output js file.

See `docs/dev-loop.md` for the full fix-and-ship loop. In short: `dev` deploys a preview, and merging `dev` to `main` deploys production automatically.

## Deployment

The live site has one injection point and it loads the **production bundle** only — never
a preview, never a local build. The `dev` preview is a separate, non-public deployment: it
is not injected into the site, and it is opened by its own alias as the pre-merge gate (see
`docs/dev-loop.md` and
[ADR 0002](docs/adr/0002-preview-deployment-protection.md)).

In the Squarespace sidebar, choose `Website > Pages > Website Tools > Code Injection` and paste the following code into the `Header` section:

```html
<script
  type="text/javascript"
  src="https://bike-worcester-squarespace.vercel.app/index.js"
></script>
```
