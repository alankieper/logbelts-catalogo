/**
 * Sube a Supabase el cambio de `foto` (y foto_origen) de los productos del lote 2.
 * Uso:  node data/scripts/push-fotos-lote2-supabase.mjs "<carpeta con los .png>"
 */
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SRC = process.argv[2] ||
  'C:/Users/ADMINI~2/AppData/Local/Temp/claude/C--Users-Administrador-Documents-logbelts-catalogo/385192ea-e501-4b4f-847e-7aa282bb568f/scratchpad/lote2/fotos - copia';

const env = fs.readFileSync('.env.local', 'utf8');
const get = (k) => { const m = env.match(new RegExp('^' + k + '=(.*)$', 'm')); return m ? m[1].replace(/\r$/, '').trim().replace(/^["']|["']$/g, '') : undefined; };
const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY') || get('NEXT_PUBLIC_SUPABASE_ANON_KEY'), { auth: { persistSession: false } });

const codes = new Set();
const nested = path.join(SRC, 'fotos');
if (fs.existsSync(nested)) for (const f of fs.readdirSync(nested)) if (f.toLowerCase().endsWith('.png')) codes.add(f.replace(/\.png$/i, ''));
for (const f of fs.readdirSync(SRC)) if (f.toLowerCase().endsWith('.png')) codes.add(f.replace(/\.png$/i, ''));

const productos = JSON.parse(fs.readFileSync('data/productos.json', 'utf8'));
const idx = new Map(productos.map((p) => [p.codigo, p]));
// La tabla cat_productos NO tiene foto_origen (es campo local). Sólo foto + foto_confianza.
const filas = [...codes].map((c) => idx.get(c)).filter(Boolean).map((p) => ({
  codigo: p.codigo, foto: p.foto, foto_confianza: null,
}));

console.log('filas a actualizar:', filas.length);
let n = 0;
for (let i = 0; i < filas.length; i += 200) {
  const { error } = await sb.from('cat_productos').upsert(filas.slice(i, i + 200), { onConflict: 'codigo' });
  if (error) { console.error('ERROR:', error.message); process.exit(1); }
  n += Math.min(200, filas.length - i);
}
console.log(`Listo: ${n} filas actualizadas en Supabase.`);
