import fs from 'fs';
import path from 'path';
import { leerTodosRaw, getProducto } from './catalogo';
import { slugify } from './slug';
import { parsearMaquina, claveTexto } from './maquinaNombre';
import { tieneDespieceOnline } from './despieceOnline';

/**
 * Máquinas y sus repuestos: marca -> modelo -> repuestos compatibles.
 *
 * Fuente: el campo "Despiece" de cada producto (lista de máquinas, editable en Editar producto y en
 * el Excel). Todos los productos que nombran la misma máquina quedan vinculados a ella; la
 * comparación ignora mayúsculas, espacios, guiones y tildes (ver lib/maquinaNombre.js).
 *
 * Mientras la base de datos no tenga la columna `despiece`, se usa la carga inicial detectada del
 * texto de compatibilidad (data/producto-despiece.json, generado por data/scripts/extraer-despiece.mjs).
 */

let _inicial = null;
function cargaInicial() {
  if (_inicial) return _inicial;
  try {
    _inicial = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'producto-despiece.json'), 'utf8'));
  } catch {
    _inicial = {};
  }
  return _inicial;
}

/** Máquinas del campo "Despiece" de un producto crudo (o la carga inicial si todavía no existe). */
export function despieceDe(p) {
  return Array.isArray(p.despiece) ? p.despiece : cargaInicial()[p.codigo] || [];
}

let _cache = { raw: null, indice: null };

async function indice() {
  const raw = await leerTodosRaw();
  if (_cache.raw === raw && _cache.indice) return _cache.indice;

  const porClave = new Map(); // "stihl|fs55" -> máquina
  const porProducto = new Map();
  for (const p of raw) {
    if (p.oculto) continue;
    const vistos = new Set();
    for (const valor of despieceDe(p)) {
      const m = parsearMaquina(valor, (p.marcas || [])[0] || null);
      if (!m || vistos.has(m.clave)) continue;
      vistos.add(m.clave);
      if (!porClave.has(m.clave)) porClave.set(m.clave, { clave: m.clave, marca: m.marca, formas: new Map(), codigos: [] });
      const maq = porClave.get(m.clave);
      maq.formas.set(m.modelo, (maq.formas.get(m.modelo) || 0) + 1);
      maq.codigos.push(p.codigo);
      if (!porProducto.has(p.codigo)) porProducto.set(p.codigo, []);
      porProducto.get(p.codigo).push(m.clave);
    }
  }

  // Nombre visible: la forma más usada ("FS 55" le gana a "FS55")
  const marcas = new Map();
  for (const maq of porClave.values()) {
    maq.modelo = [...maq.formas.entries()].sort((a, b) => b[1] - a[1])[0][0];
    delete maq.formas;
    maq.marcaSlug = slugify(maq.marca);
    maq.modeloSlug = slugify(maq.modelo);
    maq.texto = `${maq.marca} ${maq.modelo}`;
    if (!marcas.has(maq.marcaSlug)) marcas.set(maq.marcaSlug, { marca: maq.marca, slug: maq.marcaSlug, modelos: new Map() });
    marcas.get(maq.marcaSlug).modelos.set(maq.modeloSlug, maq);
  }

  _cache = { raw, indice: { marcas, porClave, porProducto } };
  return _cache.indice;
}

const ordenNatural = (a, b) => a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' });

export async function listarMarcas() {
  return [...(await indice()).marcas.values()]
    .map((m) => {
      const codigos = new Set();
      for (const mo of m.modelos.values()) mo.codigos.forEach((c) => codigos.add(c));
      return { marca: m.marca, slug: m.slug, nModelos: m.modelos.size, nProductos: codigos.size };
    })
    .sort((a, b) => b.nModelos - a.nModelos || ordenNatural(a.marca, b.marca));
}

export async function listarModelos(marcaSlug) {
  const m = (await indice()).marcas.get(marcaSlug);
  if (!m) return null;
  return {
    marca: m.marca,
    slug: m.slug,
    modelos: [...m.modelos.values()]
      .map((mo) => ({ modelo: mo.modelo, slug: mo.modeloSlug, n: mo.codigos.length, clave: mo.clave }))
      .sort((a, b) => ordenNatural(a.modelo, b.modelo)),
  };
}

/** Todas las máquinas (para el selector del admin): [{ clave, marca, modelo, texto, n, marcaSlug, modeloSlug }] */
export async function listarMaquinas() {
  return [...(await indice()).porClave.values()]
    .map(({ clave, marca, modelo, texto, marcaSlug, modeloSlug, codigos }) => ({ clave, marca, modelo, texto, marcaSlug, modeloSlug, n: codigos.length }))
    .sort((a, b) => ordenNatural(a.texto, b.texto));
}

export async function maquinaPorClave(clave) {
  const mo = (await indice()).porClave.get(clave);
  return mo ? { clave: mo.clave, marca: mo.marca, modelo: mo.modelo, texto: mo.texto, marcaSlug: mo.marcaSlug, modeloSlug: mo.modeloSlug, codigos: mo.codigos } : null;
}

/** Datos compactos para el selector (marca -> modelos) de la portada y el catálogo. */
export async function datosSelector() {
  const marcas = await listarMarcas();
  return Promise.all(
    marcas.map(async (m) => ({
      m: m.marca,
      s: m.slug,
      mods: (await listarModelos(m.slug)).modelos.map((mo) => [mo.modelo, mo.slug, mo.n]),
    }))
  );
}

/** Igual que datosSelector, pero sólo con las máquinas que tienen despiece (para la portada). */
export async function datosSelectorDespiece() {
  const todas = await datosSelector();
  const ind = await indice();
  return todas
    .map((m) => ({
      ...m,
      mods: m.mods.filter(([, slug]) => {
        const mo = ind.marcas.get(m.s)?.modelos.get(slug);
        return mo && tieneDespieceOnline(mo.clave);
      }),
    }))
    .filter((m) => m.mods.length);
}

/** Máquinas con despiece y más repuestos en el catálogo (accesos rápidos de la portada). */
export async function maquinasConDespiece(limite = 8) {
  return (await listarMaquinas()).filter((m) => tieneDespieceOnline(m.clave)).sort((a, b) => b.n - a.n).slice(0, limite);
}

function buscarModelo(ind, marcaSlug, modeloSlug) {
  const m = ind.marcas.get(marcaSlug);
  if (!m) return null;
  // también acepta direcciones escritas distinto: /maquinas/stihl/fs55 = /maquinas/stihl/fs-55
  return m.modelos.get(modeloSlug) || ind.porClave.get(`${marcaSlug}|${claveTexto(modeloSlug)}`) || null;
}

export async function productosDeMaquina(marcaSlug, modeloSlug) {
  const mo = buscarModelo(await indice(), marcaSlug, modeloSlug);
  if (!mo) return null;
  const productos = (await Promise.all(mo.codigos.map((c) => getProducto(c)))).filter(Boolean);
  return { marca: mo.marca, marcaSlug: mo.marcaSlug, modelo: mo.modelo, modeloSlug: mo.modeloSlug, clave: mo.clave, productos };
}

export async function maquinasDeProducto(codigo) {
  const ind = await indice();
  return (ind.porProducto.get(codigo) || [])
    .map((k) => ind.porClave.get(k))
    .map((mo) => ({ marca: mo.marca, marcaSlug: mo.marcaSlug, modelo: mo.modelo, modeloSlug: mo.modeloSlug, clave: mo.clave }));
}

/** Otros repuestos que sirven para las mismas máquinas, ordenados por cuántas máquinas comparten. */
export async function compatiblesPorMaquina(codigo, limite = 8) {
  const ind = await indice();
  const cuenta = new Map();
  for (const k of ind.porProducto.get(codigo) || []) {
    for (const c of ind.porClave.get(k)?.codigos || []) {
      if (c !== codigo) cuenta.set(c, (cuenta.get(c) || 0) + 1);
    }
  }
  const codigos = [...cuenta.entries()].sort((a, b) => b[1] - a[1]).slice(0, limite * 2).map(([c]) => c);
  return (await Promise.all(codigos.map((c) => getProducto(c)))).filter(Boolean).slice(0, limite);
}

/** Búsqueda flexible por texto (para el asistente): "stihl ms 250", "husqvarna 143r". */
export async function buscarMaquina(marcaTexto, modeloTexto) {
  const ms = slugify(marcaTexto || '');
  const mos = claveTexto(modeloTexto || '');
  const candidatos = [];
  for (const m of (await indice()).marcas.values()) {
    if (ms && !m.slug.includes(ms) && !ms.includes(m.slug)) continue;
    for (const mo of m.modelos.values()) {
      const plano = claveTexto(mo.modelo);
      if (!mos || plano === mos || plano.includes(mos) || mos.includes(plano)) {
        candidatos.push({ mo, exacto: plano === mos });
      }
    }
  }
  candidatos.sort((a, b) => Number(b.exacto) - Number(a.exacto));
  const elegido = candidatos[0];
  if (!elegido) return null;
  return productosDeMaquina(elegido.mo.marcaSlug, elegido.mo.modeloSlug);
}
