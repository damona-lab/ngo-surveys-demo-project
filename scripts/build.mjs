// Vite-free production build.
// Compiles the JSX/React sources in src/ into the static browser bundle that
// Express serves from dist/. esbuild is a compiler/bundler only (no dev server,
// no plugins), so the running app stays a plain Node/Express server.
//
// Output:
//   dist/index.html          generated shell that references the bundle
//   dist/assets/index.js     bundled + minified application JavaScript (ESM)
//   dist/assets/index.css    bundled stylesheet (styles.css is plain CSS)
//   dist/logo-mark.svg       copied from public/
import { build } from 'esbuild';
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(projectRoot);

rmSync('dist', { recursive: true, force: true });
mkdirSync(path.join('dist', 'assets'), { recursive: true });

// Same-origin deployments leave VITE_API_BASE_URL empty, so the browser calls /api on
// this origin. A separately hosted frontend sets it (e.g. on Netlify) to the API's URL.
const apiBaseUrl = process.env.VITE_API_BASE_URL || '';

await build({
  entryPoints: ['src/main.jsx'],
  bundle: true,
  format: 'esm',
  jsx: 'automatic',
  minify: true,
  sourcemap: false,
  outdir: path.join('dist', 'assets'),
  entryNames: 'index',
  assetNames: '[name]',
  // Replaces import.meta.env at build time because there is no Vite to inject it.
  define: { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl) },
  loader: { '.svg': 'file', '.png': 'file', '.jpg': 'file', '.jpeg': 'file', '.gif': 'file', '.webp': 'file' },
  logLevel: 'info',
});

// Static files that are served as-is (logos, favicons, etc.).
cpSync('public', 'dist', { recursive: true });

writeFileSync(path.join('dist', 'index.html'), `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0F766E" />
    <link rel="icon" type="image/svg+xml" href="/logo-mark.svg" />
    <title>NGO SURVEYS</title>
    <script type="module" crossorigin src="/assets/index.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`);

console.log('Built dist/index.html, dist/assets/index.js and dist/assets/index.css');
