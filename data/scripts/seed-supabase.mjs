/**
 * Carga data/productos.json en la tabla cat_productos de Supabase.
 * Requisitos:
 *   1) Correr antes supabase/migrations/0004_catalogo.sql en el SQL Editor.
 *   2) Tener en .env.local: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
 * Uso:  node data/scripts/seed-supabase.mjs
 */
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function readEnv() {
  const env = {};
  try {
    for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch {}
  return { ...env, ...process.env };
}

const env = readEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Falta NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local');
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

const productos = JSON.parse(fs.readFileSync(path.join('data', 'productos.json'), 'utf8'));

const filas = productos.map((p) => ({
  codigo: p.codigo,
  clave_valida: p.clave_valida ?? null,
  fuente_nombre: p.fuente_nombre ?? null,
  descontinuado: !!p.descontinuado,
  nombre: p.nombre,
  descripcion: p.descripcion,
  fuente_desc: p.fuente_desc || null,
  familia: p.familia,
  familia_indice: p.familia_indice || null,
  subcategoria: p.subcategoria,
  compatibilidad: p.compatibilidad || null,
  ubicacion: p.ubicacion || null,
  marcas: p.marcas || [],
  codigo_original: p.codigo_original || [],
  medidas: p.medidas || [],
  ref_interna: p.ref_interna || [],
  clave_rubro: p.clave_rubro || null,
  clave_subrubro: p.clave_subrubro || null,
  clave_producto: p.clave_producto || null,
  pagina: p.pagina || null,
  origen: p.origen || null,
  flags: p.flags || [],
  encabezado_pdf: p.encabezado_pdf || null,
  foto: p.foto || null,
  foto_confianza: p.foto_confianza || null,
  video: p.video || null,
  estado: p.estado || null,
  oculto: !!p.oculto,
}));

// categorías únicas
const cats = new Map();
for (const p of productos) {
  if (!p.familia || !p.subcategoria) continue;
  cats.set(p.familia + '||' + p.subcategoria, { familia: p.familia, subcategoria: p.subcategoria });
}

async function run() {
  console.log('Cargando', cats.size, 'categorías…');
  const catRows = [...cats.values()];
  for (let i = 0; i < catRows.length; i += 200) {
    const { error } = await sb.from('cat_categorias').upsert(catRows.slice(i, i + 200), { onConflict: 'familia,subcategoria' });
    if (error) throw error;
  }

  console.log('Cargando', filas.length, 'productos…');
  for (let i = 0; i < filas.length; i += 300) {
    const chunk = filas.slice(i, i + 300);
    const { error } = await sb.from('cat_productos').upsert(chunk, { onConflict: 'codigo' });
    if (error) throw error;
    process.stdout.write(`  ${Math.min(i + 300, filas.length)}/${filas.length}\r`);
  }

  // despieces curados
  try {
    const desp = JSON.parse(fs.readFileSync(path.join('data', 'despieces.json'), 'utf8'));
    if (desp.length) {
      const { error } = await sb.from('cat_despieces').upsert(desp, { onConflict: 'id' });
      if (error) throw error;
      console.log('\nDespieces:', desp.length);
    }
  } catch (e) {
    console.log('\n(despieces: ' + (e.message || e) + ')');
  }

  console.log('\nListo.');
}

run().catch((e) => {
  console.error('\nError:', e.message || e);
  process.exit(1);
});
