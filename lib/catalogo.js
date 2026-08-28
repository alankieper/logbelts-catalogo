import fs from 'fs';
import path from 'path';
import { db, usandoDB } from './db';

/**
 * Acceso a los datos del catálogo.
 * - Si CATALOGO_USA_DB=1 y hay credenciales: lee de Supabase (cat_productos).
 * - Si no: lee de data/productos.json (modo local).
 * La interfaz pública no cambia; sólo que ahora las funciones son async.
 */

const FILE = path.join(process.cwd(), 'data', 'productos.json');
const TTL = 20 * 1000; // 20 s de caché del snapshot completo

let _raw = null;
let _rawAt = 0;
let _rawMtime = 0;
let _index = null;
let _indexKey = '';

export function slugify(s) {
  return (s || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
function norm(s) {
  return (s || '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
function cap(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/** Lee TODOS los productos (con ocultos), cacheado. Fuente: DB o archivo. */
export async function leerTodosRaw() {
  if (usandoDB) {
    if (_raw && Date.now() - _rawAt < TTL) return _raw;
    let all = [];
    let desde = 0;
    // paginar de a 1000 (límite por defecto de PostgREST)
    while (true) {
      const { data, error } = await db.from('cat_productos').select('*').range(desde, desde + 999);
      if (error) throw new Error('Supabase: ' + error.message);
      all = all.concat(data || []);
      if (!data || data.length < 1000) break;
      desde += 1000;
    }
    _raw = all;
    _rawAt = Date.now();
    return all;
  }
  // modo archivo
  let mt = 0;
  try {
    mt = fs.statSync(FILE).mtimeMs;
  } catch {}
  if (_raw && mt === _rawMtime) return _raw;
  _rawMtime = mt;
  _raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  return _raw;
}

async function index() {
  const raw = await leerTodosRaw();
  const key = usandoDB ? String(_rawAt) : String(_rawMtime);
  if (_index && _indexKey === key) return _index;
  _indexKey = key;

  // copias: NO mutar los objetos crudos (se persisten tal cual en modo archivo)
  const productos = raw.filter((p) => !p.oculto).map((p) => ({ ...p }));
  const porCodigo = new Map();
  const familiasMap = new Map();
  const marcasSet = new Set();

  for (const p of productos) {
    p.familiaSlug = slugify(p.familia || 'sin-familia');
    p.subSlug = slugify(p.subcategoria || 'general');
    p.subLabel = p.subcategoria ? cap(p.subcategoria) : 'General';
    porCodigo.set(p.codigo, p);
    for (const m of p.marcas || []) marcasSet.add(m);

    if (!familiasMap.has(p.familiaSlug)) {
      familiasMap.set(p.familiaSlug, { slug: p.familiaSlug, nombre: p.familia || 'Sin familia', subcats: new Map(), count: 0 });
    }
    const fam = familiasMap.get(p.familiaSlug);
    fam.count++;
    if (!fam.subcats.has(p.subSlug)) fam.subcats.set(p.subSlug, { slug: p.subSlug, nombre: p.subLabel, count: 0 });
    fam.subcats.get(p.subSlug).count++;
  }

  const familias = [...familiasMap.values()]
    .map((f) => ({
      slug: f.slug,
      nombre: f.nombre,
      count: f.count,
      subcats: [...f.subcats.values()].sort((a, b) => b.count - a.count || a.nombre.localeCompare(b.nombre)),
    }))
    .sort((a, b) => b.count - a.count);

  _index = {
    productos,
    familias,
    porCodigo,
    marcas: [...marcasSet].sort((a, b) => a.localeCompare(b)),
    total: productos.length,
    conFoto: productos.filter((p) => p.foto).length,
  };
  return _index;
}

export function invalidarCache() {
  _raw = null;
  _rawAt = 0;
  _rawMtime = 0;
  _index = null;
  _indexKey = '';
}

export async function getCatalogoResumen() {
  const c = await index();
  return { total: c.total, conFoto: c.conFoto, familias: c.familias.map((f) => ({ slug: f.slug, nombre: f.nombre, count: f.count })) };
}

export async function getFamilias() {
  return (await index()).familias;
}

/** Todas las marcas con las que trabajamos (con repuestos en el catálogo) + conteo. */
export async function getMarcasConteo() {
  const c = await index();
  const cont = new Map();
  for (const p of c.productos) for (const m of p.marcas || []) cont.set(m, (cont.get(m) || 0) + 1);
  return [...cont.entries()]
    .map(([nombre, count]) => ({ nombre, slug: slugify(nombre), count }))
    .sort((a, b) => b.count - a.count || a.nombre.localeCompare(b.nombre));
}

export async function getFamilia(famSlug) {
  return (await index()).familias.find((f) => f.slug === famSlug) || null;
}

export async function getProductosDeSubcategoria(famSlug, subSlug) {
  const c = await index();
  return c.productos.filter((p) => p.familiaSlug === famSlug && p.subSlug === subSlug);
}

export async function getProducto(codigo) {
  return (await index()).porCodigo.get(codigo) || null;
}

export async function getRelacionados(codigo, n = 4) {
  const c = await index();
  const p = c.porCodigo.get(codigo);
  if (!p) return [];
  return c.productos.filter((x) => x.codigo !== codigo && x.familiaSlug === p.familiaSlug && x.subSlug === p.subSlug).slice(0, n);
}

export async function getVecinos(codigo) {
  const c = await index();
  const p = c.porCodigo.get(codigo);
  if (!p) return { prev: null, next: null };
  const sibs = c.productos
    .filter((x) => x.familiaSlug === p.familiaSlug && x.subSlug === p.subSlug)
    .sort((a, b) => a.codigo.localeCompare(b.codigo));
  const i = sibs.findIndex((x) => x.codigo === codigo);
  return { prev: i > 0 ? sibs[i - 1] : null, next: i >= 0 && i < sibs.length - 1 ? sibs[i + 1] : null };
}

export async function getPorMarca(marcaSlug) {
  const c = await index();
  const list = c.productos.filter(
    (p) =>
      (p.marcas || []).some((m) => slugify(m) === marcaSlug) ||
      (p.compatibilidad && slugify(p.compatibilidad).includes(marcaSlug))
  );
  const nombre = c.marcas.find((m) => slugify(m) === marcaSlug) || marcaSlug;
  return { nombre, productos: list };
}

/** Búsqueda rankeada por código / OEM / nombre / marca / compatibilidad / descripción. */
export async function buscar(q, limite = 0) {
  const c = await index();
  const raw = norm(q).trim();
  if (!raw) return [];
  const terms = raw.split(/\s+/).filter(Boolean);
  const digits = raw.replace(/[^0-9]/g, '');
  const out = [];

  for (const p of c.productos) {
    const code = norm(p.codigo);
    const oems = (p.codigo_original || []).map((o) => norm(o));
    const hay = norm(
      [p.codigo, p.nombre, (p.marcas || []).join(' '), p.compatibilidad, (p.codigo_original || []).join(' '), p.descripcion, p.subcategoria].join(' ')
    );
    let score = 0;
    let motivo = '';

    if (code === raw) {
      score = 120;
      motivo = 'Código exacto';
    } else if (oems.some((o) => o.replace(/[^a-z0-9]/g, '') === raw.replace(/[^a-z0-9]/g, ''))) {
      score = 100;
      motivo = 'Código original';
    } else if (digits.length >= 3 && p.codigo.startsWith(digits)) {
      score = 82;
      motivo = 'Código que empieza con "' + digits + '"';
    } else if (raw.length >= 3 && oems.some((o) => o.includes(raw))) {
      score = 70;
      motivo = 'Código original';
    } else if (terms.every((t) => hay.includes(t))) {
      if (norm(p.nombre).includes(raw)) {
        score = 55;
        motivo = 'En el nombre';
      } else {
        score = 40;
        const m = (p.marcas || []).find((x) => terms.some((t) => norm(x).includes(t)));
        motivo = m ? 'Marca ' + m : 'Coincide con la búsqueda';
      }
    }

    if (score > 0) out.push({ p, score, motivo });
  }

  out.sort((a, b) => b.score - a.score || a.p.codigo.localeCompare(b.p.codigo));
  return limite ? out.slice(0, limite) : out;
}
