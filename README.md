# Bike Worcester Squarespace
A repository of scripts and styles for the Bike Worcester Squarespace website.

## Installation
Run `pnpm install` to install dependencies.

## Development
Run `npm run build` to build the project.
Run `npm run watch` to watch for changes and rebuild the project.

The project is built using Webpack. The entry point is `src/index.js` and the output is `dist/index.js` with all assets (including images and css) encoded as base64 strings and included in the output js file.

Push to `main` to trigger a fresh deployment to Vercel.

## Deployment
In the Squarespace sidebar, choose `Website > Pages > Website Tools > Code Injection` and paste the following code into the `Header` section:

```html
<script type="text/javascript" src="https://bike-worcester-squarespace.vercel.app/index.js"></script>
```
