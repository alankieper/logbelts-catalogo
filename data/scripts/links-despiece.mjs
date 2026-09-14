// Verifica qué modelos del catálogo tienen página de despiece en diyspareparts.com y guarda el
// formato correcto de cada uno en data/despiece-links.json ("Marca|MODELO" -> slug). Uso:
//   node data/scripts/links-despiece.mjs
// El sitio mezcla formatos (fs160 / fs-55), así que se prueban ambas variantes y se guarda solo
// la que responde con la página de diagramas. Consulta de a una, pausada y con agente identificado.

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const RAIZ = process.cwd();
const MODELOS = path.join(RAIZ, 'data', 'producto-modelos.json');
const SALIDA = path.join(RAIZ, 'data', 'despiece-links.json');
const BASE = 'https://www.diyspareparts.com/parts';
const UA = 'Mozilla/5.0 (compatible; LogbeltsCatalogo/1.0; verificacion de enlaces de despiece)';
const PAUSA_MS = 1200;

// Misma tabla que MARCAS_DIY en lib/despieceLinks.js.
const MARCAS_DIY = {
  Stihl: 'stihl', Husqvarna: 'husqvarna', Echo: 'echo', 'Oleo Mac': 'oleo-mac', Honda: 'honda',
  Homelite: 'homelite', Kohler: 'kohler', MTD: 'mtd', Murray: 'murray', Jonsered: 'jonsered',
  McCulloch: 'mcculloch', 'John Deere': 'john-deere', 'Cub Cadet': 'cub-cadet',
};

// Misma corrección de marca que marcaDeModelo() en lib/despieces.js.
function marcaDeModelo(marca, modelo) {
  const m = (modelo || '').toUpperCase();
  if (/^(MS|FS|HS|BG|BR|TS|SH|SR|MSA|FSA|HSA|RE|SE)\b/.test(m)) return 'Stihl';
  if (/^(GX|GC|GCV|GXV|EU|EX|EB|EG|EM|WX|WB|EP)\b/.test(m)) return 'Honda';
  if (/^(YTH|GTH|RZT|CTH|LT|YT|CT|TC|R\d)\b/.test(m)) return 'Husqvarna';
  if (/^(SRM|DSRM|PB|PPT|PAS|DPB|CS|GT|SHC|HC)\b/.test(m)) return 'Echo';
  if (/^(GS|SP|BC|PM|OM|EF|GST)\b/.test(m)) return 'Oleo Mac';
  if (/^\d{2,3}(R|RII|RX|XP|X|E)?$/.test(m)) {
    if (marca === 'Echo' || marca === 'Oleo Mac' || marca === 'Homelite') return marca;
    return 'Husqvarna';
  }
  return marca || 'Genérico';
}

// Misma clave que claveModelo() en lib/despieceLinks.js.
const clave = (marca, modelo) => `${marca}|${String(modelo).split('/')[0].toUpperCase().replace(/[^A-Z0-9]/g, '')}`;

function variantes(modelo) {
  const primero = String(modelo).split('/')[0].toLowerCase().trim();
  const sinGuion = primero.replace(/[^a-z0-9]/g, '');
  const partes = primero.match(/^([a-z]+)\s*-?\s*(\d+)\s*([a-z0-9]*)$/);
  const conGuion = partes ? `${partes[1]}-${partes[2]}${partes[3]}` : primero.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return [...new Set([sinGuion, conGuion])].filter(s => s && /[0-9]/.test(s));
}

const esperar = ms => new Promise(r => setTimeout(r, ms));

function existe(url) {
  try {
    const salida = execFileSync('curl', ['-s', '-A', UA, '-w', '\n__STATUS__%{http_code}', url], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
    const status = Number((salida.match(/__STATUS__(\d+)\s*$/) || [])[1]);
    const titulo = (salida.match(/<title>([^<]*)<\/title>/i) || [])[1] || '';
    return { status, ok: status === 200 && /Parts Diagrams/i.test(titulo) };
  } catch {
    return { status: 0, ok: false };
  }
}

const raw = JSON.parse(fs.readFileSync(MODELOS, 'utf8'));
const pares = new Map();
for (const lista of Object.values(raw)) {
  for (const x of lista || []) {
    const modelo = String(x.modelo || '').trim();
    const marca = marcaDeModelo(x.marca, modelo);
    if (modelo && MARCAS_DIY[marca]) pares.set(clave(marca, modelo), { marca, modelo });
  }
}

const previos = fs.existsSync(SALIDA) ? JSON.parse(fs.readFileSync(SALIDA, 'utf8')) : {};
const encontrados = { ...previos };
let revisados = 0;
let bloqueos = 0;

for (const [k, { marca, modelo }] of pares) {
  revisados++;
  if (encontrados[k]) continue;
  for (const slug of variantes(modelo)) {
    const r = existe(`${BASE}/${MARCAS_DIY[marca]}/diagrams/${slug}/`);
    await esperar(PAUSA_MS);
    if (r.status === 403 || r.status === 429) {
      bloqueos++;
      if (bloqueos >= 5) { console.log('El sitio empezó a rechazar consultas: se corta la verificación para no insistir.'); break; }
    }
    if (r.ok) { encontrados[k] = slug; break; }
  }
  if (bloqueos >= 5) break;
  if (revisados % 20 === 0) console.log(`${revisados}/${pares.size} revisados · ${Object.keys(encontrados).length} con despiece`);
}

const ordenado = Object.fromEntries(Object.entries(encontrados).sort(([a], [b]) => a.localeCompare(b, 'es', { numeric: true })));
fs.writeFileSync(SALIDA, JSON.stringify(ordenado, null, 1) + '\n');
const porMarca = {};
for (const k of Object.keys(ordenado)) { const m = k.split('|')[0]; porMarca[m] = (porMarca[m] || 0) + 1; }
console.log(`Listo: ${Object.keys(ordenado).length} de ${pares.size} modelos con despiece directo.`, porMarca);
