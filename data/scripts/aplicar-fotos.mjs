import fs from 'fs';

const JSON_IN = process.argv[2] || 'data/productos.json';
const MAP_IN = process.argv[3] || 'data/scripts/fotos-map.json';
const CSV_OUT = process.argv[4] || 'data/productos.csv';

const P = JSON.parse(fs.readFileSync(JSON_IN, 'utf8'));
const M = JSON.parse(fs.readFileSync(MAP_IN, 'utf8'));

let conFoto = 0, placeholders = 0;
for (const p of P) {
  const f = M[p.codigo];
  p.foto = f ? f.archivo : null;
  p.foto_confianza = f ? f.confianza : null;
  if (f) conFoto++;

  // nombre placeholder para los que no tienen texto: usar subcategoría + marca (NO inventado, viene del catálogo)
  if (!p.descripcion && (!p.nombre || p.nombre === p.clave_producto)) {
    const base = p.subcategoria && !/^C[OÓ]DIGO$/i.test(p.subcategoria)
      ? p.subcategoria.charAt(0) + p.subcategoria.slice(1).toLowerCase()
      : (p.clave_producto || 'Producto');
    const m = (p.marcas || [])[0];
    p.nombre = m ? `${base} — ${m}` : base;
    p.fuente_nombre = 'categoria';
    placeholders++;
    if (p.estado === 'falta_descripcion') p.estado = f ? 'falta_descripcion_con_foto' : 'falta_descripcion';
  }
}

fs.writeFileSync(JSON_IN, JSON.stringify(P, null, 1));

const COLS = ['codigo', 'estado', 'nombre', 'descripcion', 'familia', 'familia_indice', 'subcategoria', 'marcas',
  'codigo_original', 'compatibilidad', 'ubicacion', 'medidas', 'ref_interna', 'foto', 'foto_confianza',
  'clave_rubro', 'clave_subrubro', 'clave_producto', 'pagina', 'origen', 'fuente_nombre', 'flags', 'encabezado_pdf'];
const cell = v => {
  let s = Array.isArray(v) ? v.join(' | ') : v == null ? '' : String(v);
  if (/[",\n;]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
};
fs.writeFileSync(CSV_OUT, '﻿' + [COLS.join(';'), ...P.map(r => COLS.map(c => cell(r[c])).join(';'))].join('\r\n'));

const st = {};
for (const r of P) st[r.estado] = (st[r.estado] || 0) + 1;
console.log('con foto:', conFoto, '/', P.length);
console.log('nombres placeholder (de categoría):', placeholders);
console.log('estado:', JSON.stringify(st));
