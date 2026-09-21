import fs from 'fs';
import path from 'path';
import { db, usandoDB } from './db';

/**
 * Diagramas de despiece propios, por máquina. Una máquina ("Stihl FS 55") puede tener varios:
 * uno por variante (FS 55, FS 55 R, FS 55 T), cada uno con su imagen y los números del dibujo.
 *
 * Registro: { id, marca, modelo, clave, variante, imagen, piezas: [{ ref, codigo? , nombre? }], orden, publico }
 *  - `clave` es el nombre normalizado de la máquina ("stihl|fs55"): la une con sus repuestos.
 *  - `piezas` sólo guarda los NÚMEROS del dibujo. Qué repuestos son de la máquina sale solo
 *    del campo "Despiece" de cada producto (lib/maquinas.js).
 *
 * Fuente: tabla cat_despiece_diagramas (supabase/migrations/0013) o data/despiece-diagramas.json.
 */

const ARCHIVO = path.join(process.cwd(), 'data', 'despiece-diagramas.json');
const TTL = 15000;
let _cache = null;
let _at = 0;

export const FALTA_TABLA = 'Falta actualizar la base de datos para los despieces (archivo supabase/despieces-para-pegar.sql).';
const esFaltaTabla = (e) => /cat_despiece_diagramas|relation .* does not exist|schema cache/i.test(e?.message || '');

export async function leerDiagramas() {
  if (_cache && Date.now() - _at < TTL) return _cache;
  if (usandoDB) {
    const { data, error } = await db.from('cat_despiece_diagramas').select('*');
    if (error) {
      if (esFaltaTabla(error)) return [];
      throw new Error(error.message);
    }
    _cache = data || [];
  } else {
    try {
      _cache = JSON.parse(fs.readFileSync(ARCHIVO, 'utf8'));
    } catch {
      _cache = [];
    }
  }
  _at = Date.now();
  return _cache;
}

const ordenar = (a, b) =>
  (a.orden || 0) - (b.orden || 0) || String(a.variante).localeCompare(String(b.variante), 'es', { numeric: true });

/** Diagramas de una máquina (por su clave normalizada). */
export async function diagramasDeMaquina(clave, { todos = false } = {}) {
  return (await leerDiagramas()).filter((d) => d.clave === clave && (todos || d.publico !== false)).sort(ordenar);
}

export async function obtenerDiagrama(id) {
  return (await leerDiagramas()).find((d) => d.id === id) || null;
}

/** Cuántos diagramas públicos tiene cada máquina: Map(clave -> [variantes]) */
export async function resumenDiagramas() {
  const m = new Map();
  for (const d of (await leerDiagramas()).filter((x) => x.publico !== false).sort(ordenar)) {
    if (!m.has(d.clave)) m.set(d.clave, []);
    m.get(d.clave).push(d);
  }
  return m;
}

export async function guardarDiagrama(d) {
  const fila = { ...d, updated_at: new Date().toISOString() };
  if (usandoDB) {
    const { error } = await db.from('cat_despiece_diagramas').upsert(fila, { onConflict: 'id' });
    if (error) throw new Error(esFaltaTabla(error) ? FALTA_TABLA : error.message);
  } else {
    const lista = [...(await leerDiagramas())];
    const i = lista.findIndex((x) => x.id === d.id);
    if (i >= 0) lista[i] = fila;
    else lista.push({ created_at: fila.updated_at, ...fila });
    fs.writeFileSync(ARCHIVO, JSON.stringify(lista, null, 1));
  }
  _cache = null;
}

export async function borrarDiagrama(id) {
  if (usandoDB) {
    const { error } = await db.from('cat_despiece_diagramas').delete().eq('id', id);
    if (error) throw new Error(esFaltaTabla(error) ? FALTA_TABLA : error.message);
  } else {
    const lista = (await leerDiagramas()).filter((x) => x.id !== id);
    fs.writeFileSync(ARCHIVO, JSON.stringify(lista, null, 1));
  }
  _cache = null;
}

const refOrden = (a, b) => String(a.ref).localeCompare(String(b.ref), 'es', { numeric: true });

/**
 * Arma la lista que se muestra de un diagrama:
 *  - numeradas: [{ ref, nombre, producto|null }] ordenadas por número del dibujo
 *  - otros: repuestos de la máquina que todavía no tienen número en este dibujo
 * `productos` = repuestos vinculados a la máquina (ya con sus datos, visibles).
 */
export function armarPiezas(diagrama, productos) {
  const porCodigo = new Map(productos.map((p) => [p.codigo, p]));
  const numerados = new Set();
  const numeradas = [];
  for (const x of diagrama.piezas || []) {
    const ref = String(x.ref || '').trim();
    if (!ref) continue;
    const producto = x.codigo ? porCodigo.get(x.codigo) || null : null;
    if (x.codigo && !producto) continue; // el repuesto ya no está vinculado o está oculto
    if (producto) numerados.add(producto.codigo);
    numeradas.push({ ref, nombre: producto ? producto.nombre || producto.clave_producto || producto.codigo : x.nombre || '', producto });
  }
  numeradas.sort(refOrden);
  const otros = productos.filter((p) => !numerados.has(p.codigo));
  return { numeradas, otros };
}
