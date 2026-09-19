'use server';

import { revalidatePath } from 'next/cache';
import { db, usandoDB } from '../../../lib/db';
import { BUCKET } from '../../../lib/media';
import { guardarFotosMaterial, FOTOS_MATERIAL_DEFECTO } from '../../../lib/material';

const MAX = 8 * 1024 * 1024;

/** Sube una imagen para el generador de placas y devuelve su URL pública. */
export async function subirImagenMaterial(formData) {
  if (!usandoDB) return { ok: false, error: 'Sin base de datos no se pueden subir imágenes.' };
  const archivo = formData.get('archivo');
  if (!archivo || typeof archivo === 'string') return { ok: false, error: 'Elegí una imagen.' };
  if (!/^image\/(png|jpe?g|webp)$/i.test(archivo.type)) return { ok: false, error: 'Tiene que ser PNG, JPG o WEBP.' };
  if (archivo.size > MAX) return { ok: false, error: 'La imagen pesa más de 8 MB.' };
  const ext = archivo.type.includes('png') ? 'png' : archivo.type.includes('webp') ? 'webp' : 'jpg';
  const ruta = `material/${Date.now()}.${ext}`;
  const { error } = await db.storage.from(BUCKET).upload(ruta, Buffer.from(await archivo.arrayBuffer()), { contentType: archivo.type, upsert: false });
  if (error) return { ok: false, error: `No se pudo subir: ${error.message}` };
  return { ok: true, url: db.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl };
}

/** Guarda la lista completa (orden, nombres, altas y bajas). */
export async function guardarMaterial(fotos) {
  const r = await guardarFotosMaterial(fotos);
  if (r.ok) revalidatePath('/material');
  return r;
}

export async function restablecerMaterial() {
  const r = await guardarFotosMaterial(FOTOS_MATERIAL_DEFECTO);
  if (r.ok) revalidatePath('/material');
  return r;
}
