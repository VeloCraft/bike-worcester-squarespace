# Bike Worcester Squarespace

A repository of scripts and styles for the Bike Worcester Squarespace website.

## Installation

Install httrack using `brew install httrack` or `sudo apt install httrack`.
Run `pnpm install` to install dependencies.

## Development

Run `pnpm run scrape` to store a copy of the site to the `html` directory.
Run `pnpm run dev` to run a local development server using the scrape site files, watch for changes and reload the injected scripts.

The project is built using Webpack. The entry point is `src/index.js` and the output is `dist/index.js` with all assets (including images and css) encoded as base64 strings and included in the output js file.

Push to `main` to trigger a fresh deployment to Vercel.

## Deployment

In the Squarespace sidebar, choose `Website > Pages > Website Tools > Code Injection` and paste the following code into the `Header` section:

```html
<script
  type="text/javascript"
  src="https://bike-worcester-squarespace.vercel.app/index.js"
></script>
```
