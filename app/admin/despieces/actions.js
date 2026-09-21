'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db, usandoDB } from '../../../lib/db';
import { BUCKET, borrarMediaPorUrl } from '../../../lib/media';
import { parsearMaquina, slugTexto } from '../../../lib/maquinaNombre';
import { maquinaPorClave } from '../../../lib/maquinas';
import { guardarDiagrama, obtenerDiagrama, borrarDiagrama } from '../../../lib/despieceDiagramas';

const MAX = 4 * 1024 * 1024; // la imagen llega achicada desde el navegador

/** Sube la imagen del diagrama y devuelve su dirección pública. */
export async function subirImagenDespiece(formData) {
  const archivo = formData.get('archivo');
  if (!archivo || typeof archivo === 'string') return { ok: false, error: 'Elegí una imagen.' };
  if (!/^image\/(png|jpe?g|webp)$/i.test(archivo.type)) return { ok: false, error: 'Tiene que ser una imagen PNG, JPG o WEBP.' };
  if (archivo.size > MAX) return { ok: false, error: 'La imagen es demasiado pesada (más de 4 MB).' };
  const ext = archivo.type.includes('png') ? 'png' : archivo.type.includes('webp') ? 'webp' : 'jpg';
  const nombre = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const datos = Buffer.from(await archivo.arrayBuffer());

  if (usandoDB) {
    const ruta = `despieces/${nombre}`;
    const { error } = await db.storage.from(BUCKET).upload(ruta, datos, { contentType: archivo.type, upsert: false });
    if (error) return { ok: false, error: `No se pudo subir la imagen: ${error.message}` };
    return { ok: true, url: db.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl };
  }
  // sin base de datos (en la computadora): se guarda en public/despieces/diagramas
  try {
    const dir = path.join(process.cwd(), 'public', 'despieces', 'diagramas');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, nombre), datos);
    return { ok: true, url: `/despieces/diagramas/${nombre}` };
  } catch {
    return { ok: false, error: 'No se pudo guardar la imagen en este servidor.' };
  }
}

/** Crea un despiece nuevo para una máquina que YA existe (no crea máquinas). */
export async function crearDespiece(datos) {
  const maquina = parsearMaquina(datos?.maquina || '');
  const variante = String(datos?.variante || '').replace(/\s+/g, ' ').trim();
  if (!maquina) return { ok: false, error: 'Elegí la máquina de la lista.' };
  const existente = await maquinaPorClave(maquina.clave);
  if (!existente) {
    return {
      ok: false,
      error: `No hay ninguna máquina "${maquina.texto}" en el catálogo. Elegila de la lista (sale del campo "Despiece" de los productos).`,
    };
  }
  if (!variante) return { ok: false, error: 'Escribí el nombre de la variante (por ejemplo "FS 55 R").' };
  if (!/^(https?:\/\/|\/despieces\/)/.test(String(datos?.imagen || ''))) return { ok: false, error: 'Falta la imagen del diagrama.' };

  const id = `${slugTexto(`${existente.marca} ${variante}`)}-${Date.now().toString(36)}`;
  try {
    await guardarDiagrama({
      id,
      marca: existente.marca,
      modelo: existente.modelo,
      clave: existente.clave,
      variante,
      imagen: datos.imagen,
      piezas: [],
      orden: 0,
      publico: true,
    });
  } catch (e) {
    return { ok: false, error: e.message };
  }
  revalidatePath('/', 'layout');
  return { ok: true, id };
}

/** Guarda variante, orden, visibilidad, imagen y los números del dibujo. */
export async function guardarDespiece(formData) {
  const id = String(formData.get('id') || '');
  const d = await obtenerDiagrama(id);
  if (!d) redirect('/admin/despieces?error=' + encodeURIComponent('Ese despiece ya no existe.'));

  const piezas = [];
  // números de los repuestos vinculados: campos "ref_<código>"
  for (const [k, v] of formData.entries()) {
    if (!k.startsWith('ref_')) continue;
    const ref = String(v || '').trim();
    if (ref) piezas.push({ ref, codigo: k.slice(4) });
  }
  // piezas que no se venden (tornillos, etc.): sólo número y nombre
  const refsExtra = formData.getAll('extra_ref');
  const nombresExtra = formData.getAll('extra_nombre');
  refsExtra.forEach((r, i) => {
    const ref = String(r || '').trim();
    const nombre = String(nombresExtra[i] || '').trim();
    if (ref && nombre) piezas.push({ ref, nombre });
  });

  const imagen = String(formData.get('imagen') || d.imagen);
  const cambios = {
    ...d,
    variante: String(formData.get('variante') || d.variante).replace(/\s+/g, ' ').trim() || d.variante,
    orden: Number(formData.get('orden')) || 0,
    publico: formData.get('publico') === 'on',
    imagen,
    piezas,
  };
  let error = null;
  try {
    await guardarDiagrama(cambios);
    if (imagen !== d.imagen) await borrarMediaPorUrl(d.imagen).catch(() => {});
  } catch (e) {
    error = e.message;
  }
  revalidatePath('/', 'layout');
  redirect(`/admin/despieces/${encodeURIComponent(id)}?${error ? 'error=' + encodeURIComponent(error) : 'ok=1'}`);
}

export async function borrarDespiece(formData) {
  const id = String(formData.get('id') || '');
  const d = await obtenerDiagrama(id);
  let error = null;
  try {
    await borrarDiagrama(id);
    if (d?.imagen) await borrarMediaPorUrl(d.imagen).catch(() => {});
  } catch (e) {
    error = e.message;
  }
  revalidatePath('/', 'layout');
  redirect(`/admin/despieces?${error ? 'error=' + encodeURIComponent(error) : 'borrado=1'}`);
}
