import fs from 'fs';
import path from 'path';
import { db, usandoDB } from './db';
import { BUCKET, borrarMediaPorUrl } from './media';
import { reemplazarFoto } from './catalogoStore';

const MAX = 5 * 1024 * 1024;

/**
 * Guarda una foto editada en el admin y la pone en el lugar de la original.
 * - Con base de datos: la sube al bucket 'media' y borra la anterior si también era del bucket.
 * - Sin base (modo local): pisa public/fotos/<archivo> y guarda la anterior en data/fotos-respaldo.
 */
export async function guardarFotoEditadaArchivo(codigo, original, buffer) {
  if (!buffer?.length || buffer.length > MAX) return { ok: false, error: 'La imagen editada no es válida.' };
  const sello = Date.now();

  if (usandoDB) {
    const ruta = `foto/${codigo}-${sello}.jpg`;
    const { error } = await db.storage.from(BUCKET).upload(ruta, buffer, { contentType: 'image/jpeg', upsert: true });
    if (error) return { ok: false, error: `No se pudo subir la foto: ${error.message}` };
    const nueva = db.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
    const r = await reemplazarFoto(codigo, original, nueva);
    if (!r.ok) return r;
    await borrarMediaPorUrl(original);
    return { ok: true };
  }

  // Modo local: las fotos viven en public/fotos
  const esLocal = !/^https?:\/\//.test(original);
  const nombre = esLocal ? path.basename(original).replace(/\.[a-z0-9]+$/i, '.jpg') : `${codigo}-${sello}.jpg`;
  if (!/^[\w.-]+\.jpg$/.test(nombre)) return { ok: false, error: 'Nombre de foto inválido.' };
  const destino = path.join(process.cwd(), 'public', 'fotos', nombre);
  try {
    if (esLocal) {
      const anterior = path.join(process.cwd(), 'public', 'fotos', path.basename(original));
      if (fs.existsSync(anterior)) {
        const respaldo = path.join(process.cwd(), 'data', 'fotos-respaldo');
        fs.mkdirSync(respaldo, { recursive: true });
        fs.copyFileSync(anterior, path.join(respaldo, `${sello}-${path.basename(original)}`));
      }
    }
    fs.writeFileSync(destino, buffer);
  } catch (e) {
    // En Vercel (sin base de datos) los archivos del servidor son de solo lectura
    if (['EROFS', 'EACCES', 'EPERM', 'ENOENT'].includes(e.code)) {
      return { ok: false, sinGuardado: true, error: 'Esta web no tiene base de datos, así que no puede guardar la foto.' };
    }
    throw e;
  }
  if (nombre !== original) {
    const r = await reemplazarFoto(codigo, original, nombre);
    if (!r.ok) return r;
  } else {
    await reemplazarFoto(codigo, original, original); // marca editado_en
  }
  return { ok: true };
}
