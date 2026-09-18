import { db, usandoDB } from './db';
import * as store from './catalogoStore';

/**
 * Bandeja de fotos que manda la extensión de Chrome, a la espera de que el admin las apruebe.
 * Viven en Supabase Storage (bucket público 'media'): pendientes/<codigo>-<ts>.jpg + <codigo>-<ts>.json (datos).
 * Al aprobar, la foto pasa a foto/<codigo>-<ts>.jpg y queda como portada del producto.
 */
const BUCKET = 'media';
const CARPETA = 'pendientes';
const NOMBRE_OK = /^(\d{7})-(\d+)\.(jpe?g|png|webp)$/i;

function exigirDB() {
  if (!usandoDB) throw new Error('La base de datos no está configurada en este sitio.');
}

export async function guardarPendiente({ codigo, datos, tipo, origen, pagina, lado }) {
  exigirDB();
  const ts = Date.now();
  const ext = /png/.test(tipo) ? 'png' : /webp/.test(tipo) ? 'webp' : 'jpg';
  const nombre = `${codigo}-${ts}.${ext}`;
  const bucket = db.storage.from(BUCKET);
  const { error } = await bucket.upload(`${CARPETA}/${nombre}`, datos, { contentType: tipo || 'image/jpeg', upsert: false });
  if (error) throw new Error(error.message);
  const meta = { codigo, origen, pagina, lado, fecha: new Date(ts).toISOString() };
  await bucket.upload(`${CARPETA}/${codigo}-${ts}.json`, Buffer.from(JSON.stringify(meta)), {
    contentType: 'application/json',
    upsert: true,
  });
  return { nombre };
}

export async function listarPendientes() {
  if (!usandoDB) return [];
  const bucket = db.storage.from(BUCKET);
  let archivos = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await bucket.list(CARPETA, { limit: 100, offset, sortBy: { column: 'name', order: 'asc' } });
    if (error) throw new Error(error.message);
    archivos = archivos.concat(data || []);
    if (!data || data.length < 100) break;
  }
  const conDatos = new Set(archivos.filter((f) => f.name.endsWith('.json')).map((f) => f.name.replace(/\.json$/, '')));
  const fotos = archivos.filter((f) => NOMBRE_OK.test(f.name));
  return Promise.all(
    fotos.map(async (f) => {
      const [, codigo, ts] = f.name.match(NOMBRE_OK);
      const base = `${codigo}-${ts}`;
      let meta = {};
      if (conDatos.has(base)) {
        const { data } = await bucket.download(`${CARPETA}/${base}.json`);
        if (data) meta = JSON.parse(await data.text()).valueOf() || {};
      }
      return {
        nombre: f.name,
        codigo,
        fecha: meta.fecha || new Date(Number(ts)).toISOString(),
        url: bucket.getPublicUrl(`${CARPETA}/${f.name}`).data.publicUrl,
        origen: meta.origen || '',
        pagina: meta.pagina || '',
        lado: meta.lado || null,
      };
    }),
  );
}

function validar(nombre) {
  const m = String(nombre || '').match(NOMBRE_OK);
  if (!m) throw new Error('Nombre de foto inválido.');
  return { codigo: m[1], base: `${m[1]}-${m[2]}` };
}

/** Aprueba: mueve la foto a foto/ y la pone como portada del producto. */
export async function aprobarPendiente(nombre) {
  exigirDB();
  const { codigo, base } = validar(nombre);
  const bucket = db.storage.from(BUCKET);
  const destino = `foto/${nombre}`;
  const { error } = await bucket.move(`${CARPETA}/${nombre}`, destino);
  if (error) throw new Error(error.message);
  const url = bucket.getPublicUrl(destino).data.publicUrl;
  const r = await store.setFotoPortada(codigo, url);
  if (!r.ok) throw new Error(r.error);
  await bucket.remove([`${CARPETA}/${base}.json`]);
  return { codigo, url };
}

/** Rechaza: borra la foto y sus datos de la bandeja. */
export async function rechazarPendiente(nombre) {
  exigirDB();
  const { base } = validar(nombre);
  const { error } = await db.storage.from(BUCKET).remove([`${CARPETA}/${nombre}`, `${CARPETA}/${base}.json`]);
  if (error) throw new Error(error.message);
}
