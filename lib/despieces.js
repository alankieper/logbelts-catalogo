import fs from 'fs';
import path from 'path';
import { db, usandoDB } from './db';

/**
 * Manuales y despieces. Dos fuentes:
 *  1) Enlaces automáticos a buscadores oficiales/legales por marca + modelo
 *     (derivados de data/producto-modelos.json).
 *  2) Entradas curadas en data/despieces.json (links verificados y PDFs propios
 *     que carga LOGBELTS). NO se copia contenido de terceros.
 */

const MODELOS_FILE = path.join(process.cwd(), 'data', 'producto-modelos.json');
const CURADO_FILE = path.join(process.cwd(), 'data', 'despieces.json');

let _mod = null;
let _cur = null;
let _curMt = 0;

function modelos() {
  if (_mod) return _mod;
  try {
    _mod = JSON.parse(fs.readFileSync(MODELOS_FILE, 'utf8'));
  } catch {
    _mod = {};
  }
  return _mod;
}

export async function leerCurados() {
  if (usandoDB) {
    if (_cur && Date.now() - _curMt < 15000) return _cur;
    const { data, error } = await db.from('cat_despieces').select('*');
    if (error) throw new Error(error.message);
    _cur = data || [];
    _curMt = Date.now();
    return _cur;
  }
  let mt = 0;
  try {
    mt = fs.statSync(CURADO_FILE).mtimeMs;
  } catch {}
  if (_cur && mt === _curMt) return _cur;
  _curMt = mt;
  try {
    _cur = JSON.parse(fs.readFileSync(CURADO_FILE, 'utf8'));
  } catch {
    _cur = [];
  }
  return _cur;
}

export async function guardarCurado(entry) {
  if (usandoDB) {
    const { error } = await db.from('cat_despieces').upsert(entry, { onConflict: 'id' });
    if (error) throw new Error(error.message);
  } else {
    const lista = await leerCurados();
    const i = lista.findIndex((x) => x.id === entry.id);
    const next = i >= 0 ? lista.map((x) => (x.id === entry.id ? entry : x)) : [...lista, entry];
    fs.writeFileSync(CURADO_FILE, JSON.stringify(next, null, 1));
  }
  _cur = null;
  _curMt = 0;
}

export async function borrarCurado(id) {
  if (usandoDB) {
    const { error } = await db.from('cat_despieces').delete().eq('id', id);
    if (error) throw new Error(error.message);
  } else {
    const lista = (await leerCurados()).filter((x) => x.id !== id);
    fs.writeFileSync(CURADO_FILE, JSON.stringify(lista, null, 1));
  }
  _cur = null;
  _curMt = 0;
}

/* --- marca real a partir del prefijo del modelo (corrige ruido de la extracción) --- */
export function marcaDeModelo(marca, modelo) {
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

/* --- enlaces por marca --- */
const OFICIAL = {
  Husqvarna: { label: 'Sitio oficial Husqvarna', url: 'https://www.husqvarna.com/us/support/' },
  Honda: { label: 'Honda Parts Catalog (oficial)', url: 'https://peparts.honda.com/engines' },
  Stihl: { label: 'STIHL — información de producto', url: 'https://www.stihlusa.com/products/' },
  'John Deere': { label: 'John Deere Parts', url: 'https://partscatalog.deere.com/' },
  Toro: { label: 'Toro — repuestos', url: 'https://www.toro.com/en/parts' },
  MTD: { label: 'MTD Parts', url: 'https://www.mtdparts.com/' },
  Kohler: { label: 'Kohler Engines Parts', url: 'https://kohlerpower.com/en/engines/parts-lookup' },
  'Briggs & Stratton': { label: 'Briggs & Stratton Parts', url: 'https://www.briggsandstratton.com/na/en_us/support/manuals.html' },
};

function partstree(marca, modelo) {
  return {
    label: `Diagramas de partes — ${marca} ${modelo}`,
    url: 'https://www.partstree.com/models/?q=' + encodeURIComponent(`${marca} ${modelo}`.trim()),
  };
}

/**
 * Devuelve los recursos de despiece/manual para un producto.
 * { modelos: [{marca, modelo}], oficiales: [{marca, modelo, oficial, diagramas}], curados: [...] }
 */
export async function despiecesDeProducto(codigo, compat) {
  const raw = modelos()[codigo] || [];
  const vistos = new Set();
  const norm = [];
  for (const x of raw) {
    const marca = marcaDeModelo(x.marca, x.modelo);
    const key = marca + '|' + x.modelo;
    if (vistos.has(key)) continue;
    vistos.add(key);
    norm.push({ marca, modelo: x.modelo });
  }

  const oficiales = norm.map((x) => ({
    marca: x.marca,
    modelo: x.modelo,
    oficial: OFICIAL[x.marca] || null,
    diagramas: partstree(x.marca, x.modelo),
  }));

  const cur = await leerCurados();
  const curados = cur.filter((c) => {
    if (!c.publico) return false;
    return norm.some((x) => x.marca === c.marca && modeloIgual(x.modelo, c.modelo));
  });

  return { modelos: norm, oficiales, curados };
}

function modeloIgual(a, b) {
  const n = (s) => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const na = n(a);
  const nb = n(b);
  return na === nb || na.includes(nb) || nb.includes(na);
}

/* para la página /manuales: agrupar modelos por marca */
export function catalogoModelos() {
  const m = modelos();
  const map = new Map();
  for (const arr of Object.values(m)) {
    for (const x of arr) {
      const marca = marcaDeModelo(x.marca, x.modelo);
      if (!map.has(marca)) map.set(marca, new Map());
      const mm = map.get(marca);
      mm.set(x.modelo, (mm.get(x.modelo) || 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([marca, mm]) => ({
      marca,
      modelos: [...mm.entries()].map(([modelo, n]) => ({ modelo, n })).sort((a, b) => b.n - a.n || a.modelo.localeCompare(b.modelo)),
    }))
    .sort((a, b) => b.modelos.length - a.modelos.length);
}
