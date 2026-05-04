import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderAsync} from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, '..');
const publicDir = path.join(repoRoot, 'public');

const logoSvgPath = path.join(publicDir, 'logo.svg');

const outputs = [
  // PWA
  {file: 'pwa-192x192.png', width: 192, height: 192},
  {file: 'pwa-512x512.png', width: 512, height: 512},
  // iOS
  {file: 'apple-touch-icon.png', width: 180, height: 180},
  // Favicons
  {file: 'favicon-16x16.png', width: 16, height: 16},
  {file: 'favicon-32x32.png', width: 32, height: 32},
  // Social preview (PNG)
  {file: 'og-image.png', width: 1200, height: 630},
];

const logoSvg = await fs.readFile(logoSvgPath, 'utf8');

await fs.mkdir(publicDir, {recursive: true});

function extractInnerSvg(svgText) {
  const openMatch = svgText.match(/<svg\b[^>]*>/i);
  if (!openMatch) return {open: '<svg>', inner: svgText, close: '</svg>'};

  const open = openMatch[0];
  const closeIndex = svgText.toLowerCase().lastIndexOf('</svg>');
  const close = closeIndex >= 0 ? svgText.slice(closeIndex) : '</svg>';
  const innerStart = openMatch.index + open.length;
  const inner =
    closeIndex >= 0 ? svgText.slice(innerStart, closeIndex) : svgText.slice(innerStart);
  return {open, inner, close};
}

function wrapSvgExactSize(svgText, width, height) {
  const {open, inner} = extractInnerSvg(svgText);
  const viewBoxMatch = open.match(/\bviewBox\s*=\s*["']([^"']+)["']/i);
  const xmlns =
    open.match(/\bxmlns\s*=\s*["']([^"']+)["']/i)?.[0] ??
    'xmlns="http://www.w3.org/2000/svg"';

  // If original has a viewBox, preserve it; otherwise let the nested svg handle scaling.
  const viewBoxAttr = viewBoxMatch ? `viewBox="${viewBoxMatch[1]}"` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg ${xmlns} width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <svg x="0" y="0" width="${width}" height="${height}" ${viewBoxAttr} preserveAspectRatio="xMidYMid meet">
    ${inner}
  </svg>
</svg>`;
}

for (const {file, width, height} of outputs) {
  const svg = wrapSvgExactSize(logoSvg, width, height);
  const png = await renderAsync(svg, {
    fitTo: {mode: 'original'},
  });
  await fs.writeFile(path.join(publicDir, file), png.asPng());
}

console.log(
  `Generated ${outputs.length} assets from ${path.relative(repoRoot, logoSvgPath)}`,
);
