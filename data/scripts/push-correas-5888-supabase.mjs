/**
 * Sube a Supabase los productos tocados por normalizar-correas-5888.mjs
 * (usa data/scripts/normalizar-correas-5888-reporte.json para saber qué códigos).
 */
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf8');
const get = (k) => { const m = env.match(new RegExp('^' + k + '=(.*)$', 'm')); return m ? m[1].replace(/\r$/, '').trim().replace(/^["']|["']$/g, '') : undefined; };
const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY') || get('NEXT_PUBLIC_SUPABASE_ANON_KEY'), { auth: { persistSession: false } });

const codigos = JSON.parse(fs.readFileSync('data/scripts/normalizar-correas-5888-reporte.json', 'utf8'));
const productos = JSON.parse(fs.readFileSync('data/productos.json', 'utf8'));
const idx = new Map(productos.map((p) => [p.codigo, p]));

const filas = codigos.map((c) => idx.get(c)).filter(Boolean).map((p) => ({
  codigo: p.codigo, nombre: p.nombre, familia: p.familia, familia_indice: p.familia_indice, subcategoria: p.subcategoria,
}));

console.log('filas a actualizar:', filas.length);
let n = 0;
for (let i = 0; i < filas.length; i += 200) {
  const { error } = await sb.from('cat_productos').upsert(filas.slice(i, i + 200), { onConflict: 'codigo' });
  if (error) { console.error('ERROR:', error.message); process.exit(1); }
  n += Math.min(200, filas.length - i);
}
console.log(`Listo: ${n} filas actualizadas en Supabase.`);
