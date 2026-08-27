import fs from 'fs';
import path from 'path';

/**
 * Acceso a los datos del catálogo (primera etapa: se leen de data/productos.json).
 * Más adelante esto se reemplaza por la base de datos. La interfaz pública
 * (getCatalogo, getFamilias, getSubcategorias, getProducto, buscar) no cambia.
 */

let _cache = null;
let _mtime = 0;

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

function load() {
  const file = path.join(process.cwd(), 'data', 'productos.json');
  let mt = 0;
  try {
    mt = fs.statSync(file).mtimeMs;
  } catch (e) {}
  if (_cache && mt === _mtime) return _cache;
  _mtime = mt;

  const todos = JSON.parse(fs.readFileSync(file, 'utf8'));
  const productos = todos.filter((p) => !p.oculto);

  const porCodigo = new Map();
  const familiasMap = new Map(); // slug -> { slug, nombre, subcats: Map(slug -> {slug,nombre,count}), count }
  const marcasSet = new Set();

  for (const p of productos) {
    p.familiaSlug = slugify(p.familia || 'sin-familia');
    p.subSlug = slugify(p.subcategoria || 'general');
    p.subLabel = p.subcategoria ? cap(p.subcategoria) : 'General';
    p.tienePorFoto = !!p.foto;
    porCodigo.set(p.codigo, p);

    for (const m of p.marcas || []) marcasSet.add(m);

    if (!familiasMap.has(p.familiaSlug)) {
      familiasMap.set(p.familiaSlug, { slug: p.familiaSlug, nombre: p.familia || 'Sin familia', subcats: new Map(), count: 0 });
    }
    const fam = familiasMap.get(p.familiaSlug);
    fam.count++;
    if (!fam.subcats.has(p.subSlug)) {
      fam.subcats.set(p.subSlug, { slug: p.subSlug, nombre: p.subLabel, count: 0 });
    }
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

  _cache = {
    productos,
    familias,
    porCodigo,
    marcas: [...marcasSet].sort((a, b) => a.localeCompare(b)),
    total: productos.length,
    conFoto: productos.filter((p) => p.foto).length,
  };
  return _cache;
}

export function getCatalogoResumen() {
  const c = load();
  return { total: c.total, conFoto: c.conFoto, familias: c.familias.map((f) => ({ slug: f.slug, nombre: f.nombre, count: f.count })) };
}

export function getFamilias() {
  return load().familias;
}

export function getFamilia(famSlug) {
  return load().familias.find((f) => f.slug === famSlug) || null;
}

export function getProductosDeSubcategoria(famSlug, subSlug) {
  const c = load();
  return c.productos.filter((p) => p.familiaSlug === famSlug && p.subSlug === subSlug);
}

export function getProducto(codigo) {
  return load().porCodigo.get(codigo) || null;
}

export function getRelacionados(codigo, n = 4) {
  const c = load();
  const p = c.porCodigo.get(codigo);
  if (!p) return [];
  return c.productos
    .filter((x) => x.codigo !== codigo && x.familiaSlug === p.familiaSlug && x.subSlug === p.subSlug)
    .slice(0, n);
}

export function getVecinos(codigo) {
  const c = load();
  const p = c.porCodigo.get(codigo);
  if (!p) return { prev: null, next: null };
  const sibs = c.productos
    .filter((x) => x.familiaSlug === p.familiaSlug && x.subSlug === p.subSlug)
    .sort((a, b) => a.codigo.localeCompare(b.codigo));
  const i = sibs.findIndex((x) => x.codigo === codigo);
  return { prev: i > 0 ? sibs[i - 1] : null, next: i >= 0 && i < sibs.length - 1 ? sibs[i + 1] : null };
}

export function getPorMarca(marcaSlug) {
  const c = load();
  const list = c.productos.filter(
    (p) =>
      (p.marcas || []).some((m) => slugify(m) === marcaSlug) ||
      (p.compatibilidad && slugify(p.compatibilidad).includes(marcaSlug))
  );
  const nombre = (c.marcas.find((m) => slugify(m) === marcaSlug)) || marcaSlug;
  return { nombre, productos: list };
}

/** Búsqueda rankeada por código / OEM / nombre / marca / compatibilidad / descripción. */
export function buscar(q, limite = 0) {
  const c = load();
  const raw = norm(q).trim();
  if (!raw) return [];
  const terms = raw.split(/\s+/).filter(Boolean);
  const digits = raw.replace(/[^0-9]/g, '');
  const out = [];

  for (const p of c.productos) {
    const code = norm(p.codigo);
    const oems = (p.codigo_original || []).map((o) => norm(o));
    const hay = norm(
      [
        p.codigo,
        p.nombre,
        (p.marcas || []).join(' '),
        p.compatibilidad,
        (p.codigo_original || []).join(' '),
        p.descripcion,
        p.subcategoria,
      ].join(' ')
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
