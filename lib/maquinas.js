import fs from 'fs';
import path from 'path';
import { marcaDeModelo } from './despieces';
import { getProducto, slugify } from './catalogo';

/**
 * "Buscador por máquina": marca -> modelo -> repuestos compatibles.
 * Fuente: data/producto-modelos.json (modelos detectados en la compatibilidad de cada producto,
 * regenerable con data/scripts/extraer-modelos.mjs). Misma corrección de marca que /manuales.
 */

let _indice = null;

function indice() {
  if (_indice) return _indice;
  let raw = {};
  try {
    raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'producto-modelos.json'), 'utf8'));
  } catch { /* sin archivo: buscador vacío */ }

  const marcas = new Map();
  const porProducto = new Map();
  for (const [codigo, lista] of Object.entries(raw)) {
    const vistos = new Set();
    for (const x of lista || []) {
      const modelo = String(x.modelo || '').trim();
      if (!modelo) continue;
      const marca = marcaDeModelo(x.marca, modelo);
      const marcaSlug = slugify(marca);
      const modeloSlug = slugify(modelo);
      const clave = `${marcaSlug}|${modeloSlug}`;
      if (vistos.has(clave)) continue;
      vistos.add(clave);

      if (!marcas.has(marcaSlug)) marcas.set(marcaSlug, { marca, slug: marcaSlug, modelos: new Map() });
      const modelos = marcas.get(marcaSlug).modelos;
      if (!modelos.has(modeloSlug)) modelos.set(modeloSlug, { modelo, slug: modeloSlug, codigos: [] });
      modelos.get(modeloSlug).codigos.push(codigo);

      if (!porProducto.has(codigo)) porProducto.set(codigo, []);
      porProducto.get(codigo).push({ marca, marcaSlug, modelo, modeloSlug });
    }
  }
  _indice = { marcas, porProducto };
  return _indice;
}

const ordenNatural = (a, b) => a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' });

export function listarMarcas() {
  return [...indice().marcas.values()]
    .map(m => {
      const codigos = new Set();
      for (const mo of m.modelos.values()) mo.codigos.forEach(c => codigos.add(c));
      return { marca: m.marca, slug: m.slug, nModelos: m.modelos.size, nProductos: codigos.size };
    })
    .sort((a, b) => b.nModelos - a.nModelos || ordenNatural(a.marca, b.marca));
}

export function listarModelos(marcaSlug) {
  const m = indice().marcas.get(marcaSlug);
  if (!m) return null;
  return {
    marca: m.marca,
    slug: m.slug,
    modelos: [...m.modelos.values()]
      .map(mo => ({ modelo: mo.modelo, slug: mo.slug, n: mo.codigos.length }))
      .sort((a, b) => ordenNatural(a.modelo, b.modelo)),
  };
}

/** Datos compactos para el selector (marca -> modelos) de la portada y el catálogo. */
export function datosSelector() {
  return listarMarcas().map(m => ({
    m: m.marca,
    s: m.slug,
    mods: listarModelos(m.slug).modelos.map(mo => [mo.modelo, mo.slug, mo.n]),
  }));
}

export async function productosDeMaquina(marcaSlug, modeloSlug) {
  const m = indice().marcas.get(marcaSlug);
  const mo = m?.modelos.get(modeloSlug);
  if (!mo) return null;
  const productos = (await Promise.all(mo.codigos.map(c => getProducto(c)))).filter(Boolean);
  return { marca: m.marca, marcaSlug: m.slug, modelo: mo.modelo, modeloSlug: mo.slug, productos };
}

export function maquinasDeProducto(codigo) {
  return indice().porProducto.get(codigo) || [];
}

/** Otros repuestos que sirven para las mismas máquinas, ordenados por cuántas máquinas comparten. */
export async function compatiblesPorMaquina(codigo, limite = 8) {
  const { marcas } = indice();
  const cuenta = new Map();
  for (const x of maquinasDeProducto(codigo)) {
    const mo = marcas.get(x.marcaSlug)?.modelos.get(x.modeloSlug);
    for (const c of mo?.codigos || []) {
      if (c !== codigo) cuenta.set(c, (cuenta.get(c) || 0) + 1);
    }
  }
  const codigos = [...cuenta.entries()].sort((a, b) => b[1] - a[1]).slice(0, limite * 2).map(([c]) => c);
  return (await Promise.all(codigos.map(c => getProducto(c)))).filter(Boolean).slice(0, limite);
}

/** Búsqueda flexible por texto (para el asistente): "stihl ms 250", "husqvarna 143r". */
export async function buscarMaquina(marcaTexto, modeloTexto) {
  const ms = slugify(marcaTexto || '');
  const mos = slugify(modeloTexto || '').replace(/-/g, '');
  const candidatos = [];
  for (const m of indice().marcas.values()) {
    if (ms && !m.slug.includes(ms) && !ms.includes(m.slug)) continue;
    for (const mo of m.modelos.values()) {
      const plano = mo.slug.replace(/-/g, '');
      if (!mos || plano === mos || plano.includes(mos) || mos.includes(plano)) {
        candidatos.push({ m, mo, exacto: plano === mos });
      }
    }
  }
  candidatos.sort((a, b) => Number(b.exacto) - Number(a.exacto));
  const elegido = candidatos[0];
  if (!elegido) return null;
  return productosDeMaquina(elegido.m.slug, elegido.mo.slug);
}
