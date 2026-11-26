import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');
const distAssetsDir = path.join(distDir, 'assets');
const publicOutPath = path.join(rootDir, 'public', 'algebralab-artifact1.html');
const distOutPath = path.join(distDir, 'algebralab-artifact1.html');

if (!fs.existsSync(distAssetsDir)) {
  throw new Error('dist/assets not found. Run `npm run build` first.');
}

const assetFiles = fs.readdirSync(distAssetsDir);
const jsFile = assetFiles.find((f) => f.endsWith('.js'));
const cssFile = assetFiles.find((f) => f.endsWith('.css'));

if (!jsFile || !cssFile) {
  throw new Error('Missing compiled JS or CSS file in dist/assets.');
}

let css = fs.readFileSync(path.join(distAssetsDir, cssFile), 'utf8');
const js = fs
  .readFileSync(path.join(distAssetsDir, jsFile), 'utf8')
  .replace(/<\/script/gi, '<\\/script');

// Inline .woff2 KaTeX fonts cleanly and strip unused .woff / .ttf /assets fallbacks
css = css.replace(/url\(\/assets\/([^)]+\.woff2)\)/g, (_match, fileName) => {
  const fontPath = path.join(distAssetsDir, fileName);
  if (!fs.existsSync(fontPath)) return _match;
  const b64 = fs.readFileSync(fontPath).toString('base64');
  return `url(data:font/woff2;base64,${b64})`;
});
css = css.replace(
  /,?url\(\/assets\/[^)]+\.(?:woff|ttf)\) format\("(?:woff|truetype)"\)/g,
  ''
);

const standaloneHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AlgebraLab — Interactive Abstract Algebra Learning Platform (Artifact 1)</title>
    <meta
      name="description"
      content="University-level interactive abstract algebra learning platform covering Finite Abelian Groups, Permutation Groups, Dihedral Groups, and Cyclic Group Generators (Artifact 1)."
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,500;0,8..60,600;0,8..60,700;1,8..60,400&display=swap"
      rel="stylesheet"
    />
    <style>${css}</style>
  </head>
  <body class="antialiased">
    <div id="root"></div>
    <script>${js}</script>
  </body>
</html>
`;

fs.mkdirSync(path.dirname(publicOutPath), { recursive: true });
fs.writeFileSync(publicOutPath, standaloneHtml, 'utf8');
fs.writeFileSync(distOutPath, standaloneHtml, 'utf8');

const sizeKb = (Buffer.byteLength(standaloneHtml, 'utf8') / 1024).toFixed(1);
console.log(`Generated standalone HTML (${sizeKb} KB):`);
console.log(` - ${publicOutPath}`);
console.log(` - ${distOutPath}`);
