import fs from 'fs';
import path from 'path';

/**
 * Links de despiece a diyspareparts.com, directos a la página de diagramas de cada modelo
 * (https://www.diyspareparts.com/parts/<marca>/diagrams/<modelo>/). Nunca a buscadores.
 *
 * El sitio mezcla formatos (fs160 y ms250 sin guion; fs-55, bg-55 y br-320 con guion) y no tiene
 * todos los modelos. Por eso solo se enlaza directo lo verificado:
 * - DIRECTOS (cargados a mano) y data/despiece-links.json (generado por data/scripts/links-despiece.mjs).
 * - Resto de marcas presentes en el sitio -> índice de diagramas de la marca.
 * - Marcas que no están en el sitio -> sin link.
 * Los links cargados en Admin > Manuales (despieces curados) tienen prioridad sobre estos.
 */

const BASE = 'https://www.diyspareparts.com/parts';

// Marcas con índice de diagramas en diyspareparts.com (verificado).
export const MARCAS_DIY = {
  Stihl: 'stihl',
  Husqvarna: 'husqvarna',
  Echo: 'echo',
  'Oleo Mac': 'oleo-mac',
  Honda: 'honda',
  Homelite: 'homelite',
  Kohler: 'kohler',
  MTD: 'mtd',
  Murray: 'murray',
  Jonsered: 'jonsered',
  McCulloch: 'mcculloch',
  'John Deere': 'john-deere',
  'Cub Cadet': 'cub-cadet',
};

// "FS 161/221" -> "FS161": primer modelo, sin espacios ni símbolos.
export function claveModelo(marca, modelo) {
  const primero = String(modelo || '').split('/')[0];
  return `${marca}|${primero.toUpperCase().replace(/[^A-Z0-9]/g, '')}`;
}

// Páginas verificadas a mano: clave -> slug del sitio.
const DIRECTOS = {
  'Stihl|FS160': 'fs160',
  'Stihl|MS250': 'ms250',
  'Stihl|MS170': 'ms170',
  'Stihl|FS55': 'fs-55',
  'Stihl|FS38': 'fs-38',
  'Stihl|BG55': 'bg-55',
  'Stihl|HS81': 'hs-81',
  'Stihl|BR320': 'br-320',
};

const ARCHIVO = path.join(process.cwd(), 'data', 'despiece-links.json');
let _verificados = null;
let _mtime = 0;

function verificados() {
  try {
    const mt = fs.statSync(ARCHIVO).mtimeMs;
    if (_verificados && mt === _mtime) return _verificados;
    _verificados = JSON.parse(fs.readFileSync(ARCHIVO, 'utf8'));
    _mtime = mt;
  } catch {
    _verificados = _verificados || {};
  }
  return _verificados;
}

/** { url, label, directo } o null si no hay despiece online para esa marca. */
export function linkDespiece(marca, modelo) {
  const slugMarca = MARCAS_DIY[marca];
  if (!slugMarca) return null;
  const clave = claveModelo(marca, modelo);
  const slugModelo = DIRECTOS[clave] || verificados()[clave];
  if (slugModelo) {
    return { url: `${BASE}/${slugMarca}/diagrams/${slugModelo}/`, label: `Despiece ${marca} ${modelo}`, directo: true };
  }
  return { url: `${BASE}/${slugMarca}/diagrams/`, label: `Despieces ${marca}`, directo: false };
}
