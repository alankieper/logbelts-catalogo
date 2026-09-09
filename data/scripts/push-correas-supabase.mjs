/**
 * Sube a Supabase: los 53 productos nuevos de Correas de Kevlar + la foto de
 * referencia genérica aplicada a las 321 correas (268 existentes + 53 nuevas).
 * Usa data/productos.json ya actualizado por agregar-correas-faltantes.mjs.
 */
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf8');
const get = (k) => { const m = env.match(new RegExp('^' + k + '=(.*)$', 'm')); return m ? m[1].replace(/\r$/, '').trim().replace(/^["']|["']$/g, '') : undefined; };
const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY') || get('NEXT_PUBLIC_SUPABASE_ANON_KEY'), { auth: { persistSession: false } });

const productos = JSON.parse(fs.readFileSync('data/productos.json', 'utf8'));
const correas = productos.filter((p) => p.subcategoria === 'CORREAS DE KEVLAR');

const filas = correas.map((p) => ({
  codigo: p.codigo, estado: p.estado, nombre: p.nombre, descripcion: p.descripcion, fuente_desc: p.fuente_desc || null,
  familia: p.familia, familia_indice: p.familia_indice, subcategoria: p.subcategoria,
  marcas: p.marcas, codigo_original: p.codigo_original, compatibilidad: p.compatibilidad, ubicacion: p.ubicacion,
  medidas: p.medidas, ref_interna: p.ref_interna, foto: p.foto, foto_confianza: p.foto_confianza,
  clave_rubro: p.clave_rubro, clave_subrubro: p.clave_subrubro, clave_producto: p.clave_producto,
  clave_valida: p.clave_valida, pagina: p.pagina, origen: p.origen, flags: p.flags || [], encabezado_pdf: p.encabezado_pdf,
  oculto: p.oculto ?? false, descontinuado: p.descontinuado ?? false,
}));

console.log('filas a upsert (correas de kevlar):', filas.length);
let n = 0;
for (let i = 0; i < filas.length; i += 200) {
  const { error } = await sb.from('cat_productos').upsert(filas.slice(i, i + 200), { onConflict: 'codigo' });
  if (error) { console.error('ERROR:', error.message); process.exit(1); }
  n += Math.min(200, filas.length - i);
}
console.log(`Listo: ${n} filas actualizadas/creadas en Supabase.`);
