import fs from 'fs';
import path from 'path';
import { db, usandoDB } from './db';
import { leerTodosRaw, invalidarCache } from './catalogo';

/**
 * Escritura del catálogo. DB (Supabase) o archivo local, según CATALOGO_USA_DB.
 * El panel de administración usa estas funciones (ahora async).
 */

const FILE = path.join(process.cwd(), 'data', 'productos.json');

const COLS = [
  'codigo', 'nombre', 'descripcion', 'fuente_desc', 'familia', 'familia_indice', 'subcategoria',
  'compatibilidad', 'ubicacion', 'marcas', 'codigo_original', 'medidas', 'ref_interna',
  'clave_rubro', 'clave_subrubro', 'clave_producto', 'clave_valida', 'fuente_nombre',
  'pagina', 'origen', 'flags', 'encabezado_pdf', 'foto', 'foto_confianza', 'video', 'estado',
  'oculto', 'descontinuado', 'editado_en',
];
function aRow(p) {
  const r = {};
  for (const k of COLS) if (p[k] !== undefined) r[k] = p[k];
  for (const k of ['marcas', 'codigo_original', 'medidas', 'ref_interna', 'flags']) r[k] = r[k] || [];
  return r;
}

export async function leerTodos() {
  return leerTodosRaw();
}
export async function obtener(codigo) {
  return (await leerTodos()).find((p) => p.codigo === codigo) || null;
}

function fileWriteAll(lista) {
  fs.writeFileSync(FILE, JSON.stringify(lista, null, 1));
}

async function guardarUno(obj, { insertar = false } = {}) {
  if (usandoDB) {
    const { error } = await db.from('cat_productos').upsert(aRow(obj), { onConflict: 'codigo' });
    if (error) throw new Error(error.message);
  } else {
    const limpio = { ...obj };
    for (const k of ['familiaSlug', 'subSlug', 'subLabel', 'tienePorFoto']) delete limpio[k];
    const lista = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    const i = lista.findIndex((p) => p.codigo === limpio.codigo);
    if (i === -1 || insertar) lista.push(limpio);
    else lista[i] = limpio;
    fileWriteAll(lista);
  }
  invalidarCache();
}

async function actualizarMasivo(filtro, cambios) {
  if (usandoDB) {
    let q = db.from('cat_productos').update({ ...cambios, editado_en: new Date().toISOString() });
    for (const [k, v] of Object.entries(filtro)) q = q.eq(k, v);
    const { error, count } = await q.select('codigo');
    if (error) throw new Error(error.message);
    invalidarCache();
    return count ?? null;
  }
  const lista = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  let n = 0;
  for (const p of lista) {
    if (Object.entries(filtro).every(([k, v]) => p[k] === v)) {
      Object.assign(p, cambios, { editado_en: new Date().toISOString() });
      n++;
    }
  }
  fileWriteAll(lista);
  invalidarCache();
  return n;
}

const CAMPOS_EDITABLES = ['nombre', 'descripcion', 'familia', 'subcategoria', 'compatibilidad', 'ubicacion', 'oculto'];

export async function actualizar(codigo, cambios) {
  const p = await obtener(codigo);
  if (!p) return { ok: false, error: 'No existe el producto ' + codigo };

  for (const k of CAMPOS_EDITABLES) if (k in cambios) p[k] = cambios[k];
  const asArr = (v, re = /[,\n]/) => (Array.isArray(v) ? v : String(v || '').split(re).map((s) => s.trim()).filter(Boolean));
  if ('marcas' in cambios) p.marcas = asArr(cambios.marcas, /,/);
  if ('codigo_original' in cambios) p.codigo_original = asArr(cambios.codigo_original);
  if ('medidas' in cambios) p.medidas = asArr(cambios.medidas);

  if (p.descripcion) {
    p.fuente_desc = 'editado';
    if (p.estado && p.estado.startsWith('derivado')) p.estado = 'completo';
  }
  p.editado_en = new Date().toISOString();

  await guardarUno(p);
  return { ok: true, producto: p };
}

export async function crear(datos) {
  const codigo = String(datos.codigo || '').trim();
  if (!codigo) return { ok: false, error: 'Falta el código.' };
  if (await obtener(codigo)) return { ok: false, error: 'Ya existe un producto con ese código.' };

  const split = (v, re = /[,\n]/) => String(v || '').split(re).map((s) => s.trim()).filter(Boolean);
  const nuevo = {
    codigo,
    estado: 'completo',
    nombre: datos.nombre || null,
    descripcion: datos.descripcion || null,
    fuente_desc: 'manual',
    familia: datos.familia || null,
    familia_indice: datos.familia || null,
    subcategoria: datos.subcategoria || null,
    marcas: split(datos.marcas, /,/),
    codigo_original: split(datos.codigo_original),
    compatibilidad: datos.compatibilidad || null,
    ubicacion: datos.ubicacion || null,
    medidas: split(datos.medidas),
    ref_interna: [],
    clave_rubro: null,
    clave_subrubro: null,
    clave_producto: null,
    clave_valida: false,
    fuente_nombre: null,
    pagina: datos.pagina ? Number(datos.pagina) : null,
    origen: 'manual',
    flags: [],
    encabezado_pdf: null,
    foto: datos.foto || null,
    foto_confianza: datos.foto ? 'manual' : null,
    oculto: false,
    descontinuado: false,
    editado_en: new Date().toISOString(),
  };
  await guardarUno(nuevo, { insertar: true });
  return { ok: true, producto: nuevo };
}

export async function setOculto(codigo, oculto) {
  return actualizar(codigo, { oculto: !!oculto });
}

export async function setFoto(codigo, nombreArchivo) {
  const p = await obtener(codigo);
  if (!p) return { ok: false, error: 'No existe el producto.' };
  p.foto = nombreArchivo || null;
  p.foto_confianza = nombreArchivo ? 'manual' : null;
  p.editado_en = new Date().toISOString();
  await guardarUno(p);
  return { ok: true, producto: p };
}

/**
 * Aplica muchos cambios de una (carga masiva desde Excel).
 * cambios = [{ codigo, campos: { nombre?, descripcion?, familia?, subcategoria?,
 *              compatibilidad?, ubicacion?, marcas?[], codigo_original?[], medidas?[] } }]
 */
export async function aplicarCambiosMasivo(cambios) {
  if (!cambios || !cambios.length) return { ok: true, aplicados: 0 };
  const todos = await leerTodos();
  const idx = new Map(todos.map((p) => [p.codigo, p]));
  const tocados = [];
  const ahora = new Date().toISOString();

  for (const { codigo, campos } of cambios) {
    const p = idx.get(codigo);
    if (!p) continue;
    for (const k of ['nombre', 'descripcion', 'familia', 'subcategoria', 'compatibilidad', 'ubicacion']) {
      if (k in campos) p[k] = campos[k] || null;
    }
    if ('familia' in campos) p.familia_indice = p.familia_indice || campos.familia || null;
    for (const k of ['marcas', 'codigo_original', 'medidas']) {
      if (k in campos) p[k] = Array.isArray(campos[k]) ? campos[k] : [];
    }
    if (p.descripcion) {
      p.fuente_desc = 'editado';
      if (p.estado && p.estado.startsWith('derivado')) p.estado = 'completo';
    }
    p.editado_en = ahora;
    tocados.push(p);
  }

  if (usandoDB) {
    for (let i = 0; i < tocados.length; i += 300) {
      const chunk = tocados.slice(i, i + 300).map(aRow);
      const { error } = await db.from('cat_productos').upsert(chunk, { onConflict: 'codigo' });
      if (error) throw new Error(error.message);
    }
  } else {
    fileWriteAll(todos); // los objetos de `todos` son los mismos que mutamos
  }
  invalidarCache();
  return { ok: true, aplicados: tocados.length };
}

/** Reemplaza la lista de códigos originales (OEM) de un producto. */
export async function actualizarOem(codigo, lista) {
  const p = await obtener(codigo);
  if (!p) return { ok: false, error: 'No existe el producto.' };
  p.codigo_original = Array.isArray(lista) ? lista.map((s) => String(s).trim()).filter(Boolean) : [];
  p.editado_en = new Date().toISOString();
  await guardarUno(p);
  return { ok: true, producto: p };
}

/** Setea la foto o el video (URL) subido desde el admin. campo = 'foto' | 'video'. */
export async function setMedia(codigo, campo, url) {
  const p = await obtener(codigo);
  if (!p) return { ok: false, error: 'No existe el producto.' };
  if (campo === 'video') {
    p.video = url || null;
  } else {
    p.foto = url || null;
    p.foto_confianza = url ? 'manual' : null;
  }
  p.editado_en = new Date().toISOString();
  await guardarUno(p);
  return { ok: true, producto: p };
}

export async function renombrarSubcategoria(familia, viejo, nuevo) {
  const n = await actualizarMasivo({ familia, subcategoria: viejo }, { subcategoria: nuevo });
  return { ok: true, afectados: n };
}
export async function renombrarFamilia(viejo, nuevo) {
  const n = await actualizarMasivo({ familia: viejo }, { familia: nuevo });
  return { ok: true, afectados: n };
}
export async function moverSubcategoria(familiaVieja, subVieja, familiaNueva, subNueva) {
  const n = await actualizarMasivo(
    { familia: familiaVieja, subcategoria: subVieja },
    { familia: familiaNueva, subcategoria: subNueva || subVieja }
  );
  return { ok: true, afectados: n };
}

export async function estadisticas() {
  const lista = await leerTodos();
  const por = (f) => lista.reduce((a, p) => ((a[p[f] || '(sin)'] = (a[p[f] || '(sin)'] || 0) + 1), a), {});
  return {
    total: lista.length,
    ocultos: lista.filter((p) => p.oculto).length,
    sinFoto: lista.filter((p) => !p.foto).length,
    derivadas: lista.filter((p) => p.fuente_desc && p.fuente_desc.startsWith('derivada')).length,
    sinCategoria: lista.filter((p) => !p.familia).length,
    editados: lista.filter((p) => p.editado_en).length,
    porEstado: por('estado'),
    porFamilia: por('familia'),
  };
}
