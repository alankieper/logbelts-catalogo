/**
 * Sube a Supabase los productos tocados por reordenar-categorias.mjs
 * (usa data/scripts/reordenar-categorias-reporte.json para saber qué códigos,
 * más el/los código(s) corregido(s) a mano después vía --extra).
 */
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf8');
const get = (k) => { const m = env.match(new RegExp('^' + k + '=(.*)$', 'm')); return m ? m[1].replace(/\r$/, '').trim().replace(/^["']|["']$/g, '') : undefined; };
const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY') || get('NEXT_PUBLIC_SUPABASE_ANON_KEY'), { auth: { persistSession: false } });

const reporte = JSON.parse(fs.readFileSync('data/scripts/reordenar-categorias-reporte.json', 'utf8'));
const extra = process.argv.slice(2).filter((a) => /^\d{5,8}$/.test(a));
const codigos = [...new Set([...reporte.map((c) => c.codigo), ...extra])];
const productos = JSON.parse(fs.readFileSync('data/productos.json', 'utf8'));
const idx = new Map(productos.map((p) => [p.codigo, p]));

const filas = codigos.map((c) => idx.get(c)).filter(Boolean).map((p) => ({
  codigo: p.codigo, subcategoria: p.subcategoria, familia: p.familia, clave_producto: p.clave_producto, nombre: p.nombre,
}));

console.log('filas a actualizar:', filas.length);
let n = 0;
for (let i = 0; i < filas.length; i += 200) {
  const { error } = await sb.from('cat_productos').upsert(filas.slice(i, i + 200), { onConflict: 'codigo' });
  if (error) { console.error('ERROR:', error.message); process.exit(1); }
  n += Math.min(200, filas.length - i);
}
console.log(`Listo: ${n} filas actualizadas en Supabase.`);
