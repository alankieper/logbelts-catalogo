/**
 * Genera las imágenes para compartir: la general (app/opengraph-image.png) y la de cada
 * familia del catálogo (public/og/<slug>.png). Son de 1200×630, con todo dentro del cuadrado
 * central para que Instagram y WhatsApp no corten.
 * El nombre, el lema y el logo salen de lib/marca.js.
 * Correr después de cambiar familias, el logo o la marca:  node data/scripts/og-familias.mjs
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { MARCA } from '../../lib/marca.js';

const slugify = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const escapar = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const productos = JSON.parse(fs.readFileSync('data/productos.json', 'utf8'));
const cuenta = new Map();
for (const p of productos) {
  if (!p.familia) continue;
  cuenta.set(p.familia, (cuenta.get(p.familia) || 0) + 1);
}

const W = 1200, H = 630;
// Pie de las placas: el rubro de la marca ("Venta mayorista · Bosque y jardín")
const AMBITO = MARCA.rubro.replace(/^Repuestos para /i, '');
const PIE = `Venta mayorista · ${AMBITO.charAt(0).toUpperCase() + AMBITO.slice(1)}`;
const logo = await sharp(path.join('public', MARCA.logoClaro.replace(/^\//, ''))).resize({ width: 220 }).toBuffer();
const anchoLogo = (await sharp(logo).metadata()).width;
fs.mkdirSync('public/og', { recursive: true });

// Corta el nombre en líneas que entren en el cuadrado central
const enLineas = (texto, porLinea = 15) => {
  const palabras = texto.split(' ');
  const lineas = [];
  let actual = '';
  for (const p of palabras) {
    if ((actual + ' ' + p).trim().length > porLinea && actual) { lineas.push(actual); actual = p; }
    else actual = (actual + ' ' + p).trim();
  }
  if (actual) lineas.push(actual);
  return lineas.slice(0, 3);
};

for (const [familia, n] of cuenta) {
  const nombre = familia.charAt(0).toUpperCase() + familia.slice(1);
  const lineas = enLineas(nombre.toUpperCase());
  const tam = lineas.length > 2 ? 52 : 60;
  const alto = lineas.length * (tam + 8);
  const y0 = 300 + (3 - lineas.length) * 14;
  const titulo = lineas.map((l, i) => `<text x="600" y="${y0 + i * (tam + 8)}" font-size="${tam}" font-weight="900" font-style="italic" fill="#ffffff">${escapar(l)}</text>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><radialGradient id="g" cx="50%" cy="34%" r="78%">
      <stop offset="0%" stop-color="#1b48a0"/><stop offset="55%" stop-color="#0a2149"/><stop offset="100%" stop-color="#061129"/>
    </radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <rect x="304" y="22" width="592" height="586" rx="26" fill="none" stroke="#8fb0ff" stroke-opacity="0.32" stroke-width="2"/>
    <g font-family="Arial, Helvetica, sans-serif" text-anchor="middle">
      <text x="600" y="248" font-size="20" font-weight="700" letter-spacing="4" fill="#8fb0ff">REPUESTOS PARA</text>
      ${titulo}
      <text x="600" y="${y0 + alto + 26}" font-size="30" font-weight="700" fill="#8fb0ff">${n.toLocaleString('es-AR')} repuestos</text>
      <text x="600" y="566" font-size="21" fill="#cdd8ef">${escapar(PIE)}</text>
    </g>
  </svg>`;
  await sharp(Buffer.from(svg))
    .composite([{ input: logo, left: Math.round((W - anchoLogo) / 2), top: 78 }])
    .png().toFile(path.join('public/og', `${slugify(familia)}.png`));
}

// Imagen general del sitio (la que comparte la portada): nombre y lema de lib/marca.js
const lema = enLineas(MARCA.lema.toUpperCase(), 17);
const tamLema = lema.length > 2 ? 62 : 72;
const yLema = 320 + (3 - lema.length) * 18;
const lineasFamilias = [...cuenta.keys()].slice(0, 4)
  .map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(' · ');
const svgGeneral = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><radialGradient id="g" cx="50%" cy="34%" r="78%">
    <stop offset="0%" stop-color="#1b48a0"/><stop offset="55%" stop-color="#0a2149"/><stop offset="100%" stop-color="#061129"/>
  </radialGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect x="304" y="22" width="592" height="586" rx="26" fill="none" stroke="#8fb0ff" stroke-opacity="0.32" stroke-width="2"/>
  <g font-family="Arial, Helvetica, sans-serif" text-anchor="middle">
    <text x="600" y="262" font-size="20" font-weight="700" letter-spacing="4" fill="#8fb0ff">${escapar(PIE.toUpperCase())}</text>
    ${lema.map((l, i) => `<text x="600" y="${yLema + i * (tamLema + 8)}" font-size="${tamLema}" font-weight="900" font-style="italic" fill="${i === lema.length - 1 ? '#8fb0ff' : '#ffffff'}">${escapar(l)}</text>`).join('')}
    <text x="600" y="530" font-size="26" fill="#cdd8ef">${escapar(lineasFamilias)}</text>
  </g>
</svg>`;
await sharp(Buffer.from(svgGeneral))
  .composite([{ input: logo, left: Math.round((W - anchoLogo) / 2), top: 80 }])
  .png().toFile('app/opengraph-image.png');
fs.writeFileSync('app/opengraph-image.alt.txt', `${MARCA.nombre} — ${MARCA.rubro}. Venta mayorista.\n`);

console.log('listas', cuenta.size, 'imágenes en public/og + la general en app/opengraph-image.png');
