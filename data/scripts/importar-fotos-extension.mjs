/**
 * Importa al catálogo las fotos juntadas con la extensión de Chrome (extension-fotos).
 *
 * Uso:  node data/scripts/importar-fotos-extension.mjs [carpeta] [--supabase]
 *   carpeta     por defecto: Descargas/fotos-catalogo
 *   --supabase  además actualiza el campo `foto` en Supabase de los productos que cambian de archivo
 *
 * Por cada código:
 *   - si hay varias (<codigo>.jpg, <codigo>-2.webp...) usa la de mayor resolución
 *   - la deja cuadrada (máx. 1000×1000), JPG, fondo blanco, producto centrado con margen
 *   - guarda respaldo de la foto anterior en data/fotos-respaldo/<fecha>/
 *   - escribe public/fotos/<codigo>.jpg (y data/fotos/), actualiza data/productos.json
 *   - mueve las originales a <carpeta>/importadas/<fecha>/ y saca el código de extension-fotos/lista.json
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

// En Windows sharp deja los archivos abiertos (caché) y después no se pueden mover.
sharp.cache(false);

const args = process.argv.slice(2);
const SUBIR = args.includes('--supabase');
const SRC = args.find((a) => !a.startsWith('--')) || path.join(os.homedir(), 'Downloads', 'fotos-catalogo');
const LADO = 1000;
const MARGEN = 0.06;
const CALIDAD = 85;
const fecha = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
const RESPALDO = path.join('data', 'fotos-respaldo', fecha);
const IMPORTADAS = path.join(SRC, 'importadas', fecha);
const LISTA_EXT = path.join('extension-fotos', 'lista.json');

if (!fs.existsSync(SRC)) {
  console.error('No existe la carpeta:', SRC);
  process.exit(1);
}

async function normalizar(entrada) {
  const base = await sharp(entrada, { failOn: 'none' }).rotate().flatten({ background: '#ffffff' }).toColourspace('srgb').png().toBuffer();
  let recorte = base;
  try {
    const t = await sharp(base).trim({ background: '#ffffff', threshold: 18 }).png().toBuffer({ resolveWithObject: true });
    if (t.info.width >= 40 && t.info.height >= 40) recorte = t.data;
  } catch {
    /* imagen uniforme: se usa completa */
  }
  const { width, height } = await sharp(recorte).metadata();
  const lado = Math.min(LADO, Math.round(Math.max(width, height) / (1 - 2 * MARGEN)));
  const interior = Math.round(lado * (1 - 2 * MARGEN));
  const cuerpo = await sharp(recorte)
    .resize(interior, interior, { fit: 'inside', withoutEnlargement: true })
    .png()
    .toBuffer({ resolveWithObject: true });
  return sharp({ create: { width: lado, height: lado, channels: 3, background: '#ffffff' } })
    .composite([{ input: cuerpo.data, left: Math.round((lado - cuerpo.info.width) / 2), top: Math.round((lado - cuerpo.info.height) / 2) }])
    .jpeg({ quality: CALIDAD, mozjpeg: true })
    .toBuffer();
}

function mover(origen, destino) {
  try {
    fs.renameSync(origen, destino);
    return true;
  } catch {
    try {
      fs.copyFileSync(origen, destino);
      fs.unlinkSync(origen);
      return true;
    } catch {
      return false;
    }
  }
}

const productos = JSON.parse(fs.readFileSync('data/productos.json', 'utf8'));
const idx = new Map(productos.map((p) => [p.codigo, p]));

const grupos = new Map();
for (const f of fs.readdirSync(SRC)) {
  const m = f.match(/^(\d+)(?:-\d+)?\.(jpe?g|png|webp|avif|gif)$/i);
  if (!m) continue;
  if (!grupos.has(m[1])) grupos.set(m[1], []);
  grupos.get(m[1]).push(f);
}
if (!grupos.size) {
  console.log('No hay fotos para importar en', SRC);
  process.exit(0);
}

const reporte = { fecha, carpeta: SRC, importadas: [], omitidas: [] };
const cambiosDB = [];

for (const [codigo, archivos] of grupos) {
  const p = idx.get(codigo);
  if (!p) {
    reporte.omitidas.push({ codigo, archivos, motivo: 'no existe en el catálogo' });
    continue;
  }
  const medidas = [];
  for (const f of archivos) {
    try {
      const datos = fs.readFileSync(path.join(SRC, f));
      const m = await sharp(datos, { failOn: 'none' }).metadata();
      medidas.push({ f, datos, w: m.width || 0, h: m.height || 0 });
    } catch {
      reporte.omitidas.push({ codigo, archivos: [f], motivo: 'imagen ilegible' });
    }
  }
  if (!medidas.length) continue;
  medidas.sort((a, b) => b.w * b.h - a.w * a.h);
  const mejor = medidas[0];

  let buf;
  try {
    buf = await normalizar(mejor.datos);
  } catch (e) {
    reporte.omitidas.push({ codigo, archivos: [mejor.f], motivo: 'no se pudo procesar: ' + e.message });
    continue;
  }

  const nombre = `${codigo}.jpg`;
  const antes = p.foto || null;
  if (antes && !/^https?:\/\//.test(antes) && fs.existsSync(path.join('public', 'fotos', antes))) {
    fs.mkdirSync(RESPALDO, { recursive: true });
    fs.copyFileSync(path.join('public', 'fotos', antes), path.join(RESPALDO, antes));
  }
  fs.writeFileSync(path.join('public', 'fotos', nombre), buf);
  if (fs.existsSync(path.join('data', 'fotos'))) fs.writeFileSync(path.join('data', 'fotos', nombre), buf);

  p.foto = nombre;
  p.foto_confianza = 'manual';
  p.foto_origen = 'extension';
  p.editado_en = new Date().toISOString();
  if (antes !== nombre) cambiosDB.push({ codigo, foto: nombre });

  fs.mkdirSync(IMPORTADAS, { recursive: true });
  for (const f of archivos) {
    if (!mover(path.join(SRC, f), path.join(IMPORTADAS, f))) console.warn(`  aviso: no se pudo mover ${f} (¿está abierto en otro programa?)`);
  }

  const final = await sharp(buf).metadata();
  reporte.importadas.push({
    codigo,
    nombre: p.nombre,
    archivo: mejor.f,
    original: `${mejor.w}x${mejor.h}`,
    final: `${final.width}x${final.height}`,
    antes,
    descartadas: medidas.slice(1).map((x) => x.f),
  });
}

fs.writeFileSync('data/productos.json', JSON.stringify(productos, null, 1));

if (fs.existsSync(LISTA_EXT)) {
  const hechos = new Set(reporte.importadas.map((x) => x.codigo));
  const lista = JSON.parse(fs.readFileSync(LISTA_EXT, 'utf8'));
  fs.writeFileSync(LISTA_EXT, JSON.stringify(lista.filter((x) => !hechos.has(x.c))));
}

if (SUBIR && cambiosDB.length) {
  const env = fs.readFileSync('.env.local', 'utf8');
  const get = (k) => {
    const m = env.match(new RegExp('^' + k + '=(.*)$', 'm'));
    return m ? m[1].replace(/\r$/, '').trim().replace(/^["']|["']$/g, '') : undefined;
  };
  const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY') || get('NEXT_PUBLIC_SUPABASE_ANON_KEY'), {
    auth: { persistSession: false },
  });
  for (const c of cambiosDB) {
    const { error } = await sb.from('cat_productos').update({ foto: c.foto, foto_confianza: 'manual' }).eq('codigo', c.codigo);
    if (error) {
      console.error(`ERROR Supabase en ${c.codigo}:`, error.message);
      process.exit(1);
    }
  }
}

const archivoReporte = path.join('data', 'scripts', `importar-fotos-extension-${fecha}.json`);
fs.mkdirSync(path.dirname(archivoReporte), { recursive: true });
fs.writeFileSync(archivoReporte, JSON.stringify(reporte, null, 1));

console.log(`Importadas: ${reporte.importadas.length} · Omitidas: ${reporte.omitidas.length}`);
for (const o of reporte.omitidas) console.log(`  omitida ${o.codigo}: ${o.motivo}`);
console.log(`Cambian de archivo en la base: ${cambiosDB.length}${SUBIR ? ' (actualizados en Supabase)' : cambiosDB.length ? ' — correr con --supabase para actualizarlos' : ''}`);
console.log('Reporte:', archivoReporte);
console.log('Para publicarlas en la web falta hacer commit y push (deploy en Vercel).');
