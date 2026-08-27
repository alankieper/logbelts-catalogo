import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const run = promisify(execFile);

const DIR = path.join(process.cwd(), 'data', 'import');
const PRODUCTOS = path.join(process.cwd(), 'data', 'productos.json');
const VERSION_FILE = path.join(process.cwd(), 'data', 'catalogo-version.json');

export function dirImport() {
  fs.mkdirSync(DIR, { recursive: true });
  return DIR;
}

export function listarRuns() {
  dirImport();
  const idx = path.join(DIR, 'runs.json');
  if (!fs.existsSync(idx)) return [];
  return JSON.parse(fs.readFileSync(idx, 'utf8')).sort((a, b) => b.id.localeCompare(a.id));
}

function guardarRuns(lista) {
  fs.writeFileSync(path.join(DIR, 'runs.json'), JSON.stringify(lista, null, 1));
}

export function getRun(id) {
  return listarRuns().find((r) => r.id === id) || null;
}

export function leerCambios(id) {
  const f = path.join(DIR, id, 'cambios.json');
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

export function guardarCambios(id, cambios) {
  fs.writeFileSync(path.join(DIR, id, 'cambios.json'), JSON.stringify(cambios, null, 1));
}

/* ---------- comparación ---------- */

const CAMPOS_COMPARA = ['nombre', 'descripcion', 'familia', 'subcategoria', 'compatibilidad', 'ubicacion'];
const CAMPOS_ARRAY = ['marcas', 'codigo_original', 'medidas'];

function distintos(a, b) {
  const dif = [];
  for (const k of CAMPOS_COMPARA) {
    const va = (a[k] || '').toString().trim();
    const vb = (b[k] || '').toString().trim();
    if (va !== vb) dif.push({ campo: k, antes: a[k] ?? null, despues: b[k] ?? null });
  }
  for (const k of CAMPOS_ARRAY) {
    const va = (a[k] || []).join(' | ');
    const vb = (b[k] || []).join(' | ');
    if (va !== vb) dif.push({ campo: k, antes: a[k] || [], despues: b[k] || [] });
  }
  return dif;
}

export function comparar(actuales, nuevos) {
  const mapA = new Map(actuales.map((p) => [p.codigo, p]));
  const mapN = new Map(nuevos.map((p) => [p.codigo, p]));

  const cambios = [];
  for (const n of nuevos) {
    const a = mapA.get(n.codigo);
    if (!a) {
      cambios.push({ key: 'new-' + n.codigo, tipo: 'nuevo', codigo: n.codigo, pagina: n.pagina || null, actual: null, propuesto: n, dif: [], decision: 'pendiente' });
    } else {
      const dif = distintos(a, n);
      if (dif.length) {
        cambios.push({ key: 'mod-' + n.codigo, tipo: 'modificado', codigo: n.codigo, pagina: n.pagina || null, actual: a, propuesto: n, dif, decision: 'pendiente' });
      }
    }
  }
  for (const a of actuales) {
    if (a.origen === 'manual') continue; // los cargados a mano no se dan de baja por importación
    if (a.oculto) continue;
    if (!mapN.has(a.codigo)) {
      cambios.push({ key: 'del-' + a.codigo, tipo: 'eliminado', codigo: a.codigo, pagina: a.pagina || null, actual: a, propuesto: null, dif: [], decision: 'pendiente' });
    }
  }

  const stats = {
    nuevos: cambios.filter((c) => c.tipo === 'nuevo').length,
    modificados: cambios.filter((c) => c.tipo === 'modificado').length,
    eliminados: cambios.filter((c) => c.tipo === 'eliminado').length,
    total_nuevo_pdf: nuevos.length,
    total_actual: actuales.length,
  };
  return { cambios, stats };
}

/* ---------- pipeline ---------- */

export async function procesarPdf(rutaPdf, id, opciones = {}) {
  dirImport();
  const carpeta = path.join(DIR, id);
  fs.mkdirSync(carpeta, { recursive: true });
  const pagesJson = path.join(carpeta, 'pages.json');
  const nuevosJson = path.join(carpeta, 'extraido.json');
  const nuevosCsv = path.join(carpeta, 'extraido.csv');

  // 1) texto con posiciones
  await run('node', ['data/scripts/extraer-posiciones.mjs', rutaPdf, pagesJson], {
    cwd: process.cwd(),
    timeout: 5 * 60 * 1000,
    maxBuffer: 64 * 1024 * 1024,
  });
  // 2) parseo a productos
  await run('node', ['data/scripts/parsear-catalogo.mjs', pagesJson, nuevosJson, nuevosCsv], {
    cwd: process.cwd(),
    timeout: 3 * 60 * 1000,
    maxBuffer: 64 * 1024 * 1024,
  });
  // 3) aplicar fotos derivadas (sin fotos nuevas; sólo normaliza descripciones)
  try {
    const mapVacio = path.join(carpeta, 'fotos-map.json');
    fs.writeFileSync(mapVacio, '{}');
    await run('node', ['data/scripts/aplicar-fotos.mjs', nuevosJson, mapVacio, nuevosCsv], {
      cwd: process.cwd(),
      timeout: 60 * 1000,
      maxBuffer: 32 * 1024 * 1024,
    });
  } catch (e) {
    /* opcional */
  }

  const nuevos = JSON.parse(fs.readFileSync(nuevosJson, 'utf8'));
  const actuales = JSON.parse(fs.readFileSync(PRODUCTOS, 'utf8'));

  // 4) (opcional) mejorar descripciones con IA — sólo para códigos que no están todavía
  let ia = null;
  if (opciones.conIA) {
    try {
      const { enriquecerDescripciones } = await import('./iaDescripciones.js');
      const actualesSet = new Set(actuales.map((p) => p.codigo));
      const soloNuevos = nuevos.filter((p) => !actualesSet.has(p.codigo));
      ia = await enriquecerDescripciones(soloNuevos);
      fs.writeFileSync(nuevosJson, JSON.stringify(nuevos, null, 1));
    } catch (e) {
      ia = { ok: false, error: String(e.message || e).slice(0, 300), mejorados: 0 };
    }
  }

  const { cambios, stats } = comparar(actuales, nuevos);
  guardarCambios(id, cambios);
  return { stats, nuevos: nuevos.length, ia };
}

/* ---------- aplicar ---------- */

export function aplicar(id, autor) {
  const carpeta = path.join(DIR, id);
  const cambios = leerCambios(id);
  if (!cambios) return { ok: false, error: 'No hay cambios para este import.' };

  const actuales = JSON.parse(fs.readFileSync(PRODUCTOS, 'utf8'));
  // backup para poder volver atrás
  fs.writeFileSync(path.join(carpeta, 'backup-productos.json'), JSON.stringify(actuales, null, 1));

  const map = new Map(actuales.map((p) => [p.codigo, p]));
  let aplicados = { nuevos: 0, modificados: 0, eliminados: 0 };

  for (const c of cambios) {
    if (c.decision !== 'aprobado') continue;
    const prop = c.edicion ? { ...c.propuesto, ...c.edicion } : c.propuesto;

    if (c.tipo === 'nuevo') {
      if (!map.has(c.codigo)) {
        map.set(c.codigo, { ...prop, oculto: false, editado_en: new Date().toISOString(), fuente_desc: prop.fuente_desc || 'importado' });
        aplicados.nuevos++;
      }
    } else if (c.tipo === 'modificado') {
      const cur = map.get(c.codigo);
      if (cur) {
        const merged = { ...cur };
        for (const d of c.dif) {
          const val = c.edicion && d.campo in c.edicion ? c.edicion[d.campo] : d.despues;
          merged[d.campo] = val;
        }
        merged.editado_en = new Date().toISOString();
        merged.fuente_desc = 'importado';
        map.set(c.codigo, merged);
        aplicados.modificados++;
      }
    } else if (c.tipo === 'eliminado') {
      const cur = map.get(c.codigo);
      if (cur) {
        cur.descontinuado = true;
        cur.oculto = true;
        cur.editado_en = new Date().toISOString();
        aplicados.eliminados++;
      }
    }
  }

  fs.writeFileSync(PRODUCTOS, JSON.stringify([...map.values()], null, 1));

  // versión
  let ver = { version: 1, historial: [] };
  if (fs.existsSync(VERSION_FILE)) ver = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'));
  ver.version = (ver.version || 1) + 1;
  ver.historial.unshift({ version: ver.version, fecha: new Date().toISOString(), run_id: id, autor: autor || null, aplicados });
  fs.writeFileSync(VERSION_FILE, JSON.stringify(ver, null, 1));

  // marcar run
  const runs = listarRuns();
  const r = runs.find((x) => x.id === id);
  if (r) { r.estado = 'aplicado'; r.aplicado_en = new Date().toISOString(); r.aplicados = aplicados; guardarRuns(runs); }

  return { ok: true, aplicados, version: ver.version };
}

export function revertir(id) {
  const carpeta = path.join(DIR, id);
  const backup = path.join(carpeta, 'backup-productos.json');
  if (!fs.existsSync(backup)) return { ok: false, error: 'No hay backup de este import.' };
  fs.copyFileSync(backup, PRODUCTOS);
  const runs = listarRuns();
  const r = runs.find((x) => x.id === id);
  if (r) { r.estado = 'revertido'; r.revertido_en = new Date().toISOString(); guardarRuns(runs); }
  return { ok: true };
}

export function registrarRun(meta) {
  const runs = listarRuns();
  runs.push(meta);
  guardarRuns(runs);
}
export function actualizarRun(id, patch) {
  const runs = listarRuns();
  const r = runs.find((x) => x.id === id);
  if (r) Object.assign(r, patch);
  guardarRuns(runs);
}
