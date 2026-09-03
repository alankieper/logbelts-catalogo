/**
 * Sube a Supabase SÓLO las filas cuya descripción se acaba de cargar desde el
 * catálogo (las 498 que estaban en "Requiere revisión"). Upsert por `codigo`.
 * Uso:  node data/scripts/push-desc-supabase.mjs <desc-catalogo.json>
 */
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const SRC = process.argv.find((a) => a.endsWith('.json') && !a.includes('productos')) ||
  'C:/Users/ADMINI~2/AppData/Local/Temp/claude/C--Users-Administrador-Documents-logbelts-catalogo/385192ea-e501-4b4f-847e-7aa282bb568f/scratchpad/desc-catalogo.json';

const env = fs.readFileSync('.env.local', 'utf8');
const get = (k) => { const m = env.match(new RegExp('^' + k + '=(.*)$', 'm')); return m ? m[1].replace(/\r$/, '').trim().replace(/^["']|["']$/g, '') : undefined; };
const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY') || get('NEXT_PUBLIC_SUPABASE_ANON_KEY'), { auth: { persistSession: false } });

const codigos = Object.keys(JSON.parse(fs.readFileSync(SRC, 'utf8')));
const productos = JSON.parse(fs.readFileSync('data/productos.json', 'utf8'));
const idx = new Map(productos.map((p) => [p.codigo, p]));

const filas = codigos.map((c) => idx.get(c)).filter(Boolean).map((p) => ({
  codigo: p.codigo,
  nombre: p.nombre,
  descripcion: p.descripcion,
  fuente_desc: p.fuente_desc || null,
  compatibilidad: p.compatibilidad || null,
  estado: p.estado || null,
}));

console.log('filas a actualizar:', filas.length);
let n = 0;
for (let i = 0; i < filas.length; i += 200) {
  const { error } = await sb.from('cat_productos').upsert(filas.slice(i, i + 200), { onConflict: 'codigo' });
  if (error) { console.error('ERROR:', error.message); process.exit(1); }
  n += Math.min(200, filas.length - i);
  process.stdout.write(`  ${n}/${filas.length}\r`);
}
console.log(`\nListo: ${n} filas actualizadas en Supabase.`);
