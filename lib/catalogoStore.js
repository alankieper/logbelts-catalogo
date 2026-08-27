import fs from 'fs';
import path from 'path';

/**
 * Almacén del catálogo para esta etapa: los datos viven en data/productos.json.
 * El panel de administración escribe acá. Cuando se pase a base de datos,
 * sólo cambia este archivo (la misma interfaz).
 */

const FILE = path.join(process.cwd(), 'data', 'productos.json');

export function leerTodos() {
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function guardar(lista) {
  fs.writeFileSync(FILE, JSON.stringify(lista, null, 1));
}

export function obtener(codigo) {
  return leerTodos().find((p) => p.codigo === codigo) || null;
}

const CAMPOS_EDITABLES = [
  'nombre',
  'descripcion',
  'familia',
  'subcategoria',
  'compatibilidad',
  'ubicacion',
  'oculto',
];

export function actualizar(codigo, cambios) {
  const lista = leerTodos();
  const i = lista.findIndex((p) => p.codigo === codigo);
  if (i === -1) return { ok: false, error: 'No existe el producto ' + codigo };
  const p = lista[i];

  for (const k of CAMPOS_EDITABLES) {
    if (k in cambios) p[k] = cambios[k];
  }
  if ('marcas' in cambios) {
    p.marcas = Array.isArray(cambios.marcas)
      ? cambios.marcas
      : String(cambios.marcas || '').split(',').map((s) => s.trim()).filter(Boolean);
  }
  if ('codigo_original' in cambios) {
    p.codigo_original = Array.isArray(cambios.codigo_original)
      ? cambios.codigo_original
      : String(cambios.codigo_original || '').split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
  }
  if ('medidas' in cambios) {
    p.medidas = Array.isArray(cambios.medidas)
      ? cambios.medidas
      : String(cambios.medidas || '').split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
  }

  if (p.descripcion) {
    p.fuente_desc = 'editado';
    if (p.estado && p.estado.startsWith('derivado')) p.estado = 'completo';
  }
  p.editado_en = new Date().toISOString();

  lista[i] = p;
  guardar(lista);
  return { ok: true, producto: p };
}

export function crear(datos) {
  const lista = leerTodos();
  const codigo = String(datos.codigo || '').trim();
  if (!codigo) return { ok: false, error: 'Falta el código.' };
  if (lista.some((p) => p.codigo === codigo)) return { ok: false, error: 'Ya existe un producto con ese código.' };

  const nuevo = {
    codigo,
    estado: 'completo',
    nombre: datos.nombre || null,
    descripcion: datos.descripcion || null,
    fuente_desc: 'manual',
    familia: datos.familia || null,
    familia_indice: datos.familia || null,
    subcategoria: datos.subcategoria || null,
    marcas: String(datos.marcas || '').split(',').map((s) => s.trim()).filter(Boolean),
    codigo_original: String(datos.codigo_original || '').split(/[,\n]/).map((s) => s.trim()).filter(Boolean),
    compatibilidad: datos.compatibilidad || null,
    ubicacion: datos.ubicacion || null,
    medidas: String(datos.medidas || '').split(/[,\n]/).map((s) => s.trim()).filter(Boolean),
    ref_interna: [],
    clave_rubro: null,
    clave_subrubro: null,
    clave_producto: null,
    clave_valida: false,
    pagina: datos.pagina ? Number(datos.pagina) : null,
    origen: 'manual',
    flags: [],
    encabezado_pdf: null,
    foto: datos.foto || null,
    foto_confianza: datos.foto ? 'manual' : null,
    oculto: false,
    editado_en: new Date().toISOString(),
  };
  lista.push(nuevo);
  guardar(lista);
  return { ok: true, producto: nuevo };
}

export function setOculto(codigo, oculto) {
  return actualizar(codigo, { oculto: !!oculto });
}

export function setFoto(codigo, nombreArchivo) {
  const lista = leerTodos();
  const i = lista.findIndex((p) => p.codigo === codigo);
  if (i === -1) return { ok: false, error: 'No existe el producto.' };
  lista[i].foto = nombreArchivo || null;
  lista[i].foto_confianza = nombreArchivo ? 'manual' : null;
  lista[i].editado_en = new Date().toISOString();
  guardar(lista);
  return { ok: true, producto: lista[i] };
}

export function renombrarSubcategoria(familia, viejo, nuevo) {
  const lista = leerTodos();
  let n = 0;
  for (const p of lista) {
    if (p.familia === familia && p.subcategoria === viejo) {
      p.subcategoria = nuevo;
      p.editado_en = new Date().toISOString();
      n++;
    }
  }
  guardar(lista);
  return { ok: true, afectados: n };
}

export function renombrarFamilia(viejo, nuevo) {
  const lista = leerTodos();
  let n = 0;
  for (const p of lista) {
    if (p.familia === viejo) {
      p.familia = nuevo;
      p.editado_en = new Date().toISOString();
      n++;
    }
  }
  guardar(lista);
  return { ok: true, afectados: n };
}

export function moverSubcategoria(familiaVieja, subVieja, familiaNueva, subNueva) {
  const lista = leerTodos();
  let n = 0;
  for (const p of lista) {
    if (p.familia === familiaVieja && p.subcategoria === subVieja) {
      p.familia = familiaNueva;
      p.subcategoria = subNueva || subVieja;
      p.editado_en = new Date().toISOString();
      n++;
    }
  }
  guardar(lista);
  return { ok: true, afectados: n };
}

export function estadisticas() {
  const lista = leerTodos();
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
