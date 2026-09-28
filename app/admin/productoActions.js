'use server';
import { exigirAdmin } from '../../lib/sesionServidor';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import * as store from '../../lib/catalogoStore';
import { borrarMediaPorUrl, BUCKET } from '../../lib/media';
import { db, usandoDB } from '../../lib/db';
import { guardarFotoEditadaArchivo } from '../../lib/fotoEditada';

export async function guardarProducto(formData) {
  await exigirAdmin();
  const codigo = formData.get('codigo');
  const cambios = {
    nombre: (formData.get('nombre') || '').trim() || null,
    descripcion: (formData.get('descripcion') || '').trim() || null,
    familia: (formData.get('familia') || '').trim() || null,
    subcategoria: (formData.get('subcategoria') || '').trim() || null,
    marcas: formData.get('marcas') || '',
    codigo_original: formData.get('codigo_original') || '',
    compatibilidad: (formData.get('compatibilidad') || '').trim() || null,
    ubicacion: (formData.get('ubicacion') || '').trim() || null,
    medidas: formData.get('medidas') || '',
    ...(formData.has('despiece') ? { despiece: formData.get('despiece') || '' } : {}),
  };
  const r = await store.actualizar(codigo, cambios);
  revalidatePath('/', 'layout');
  redirect(`/admin/productos/${encodeURIComponent(codigo)}?ok=1`);
}

// Agrega una foto o video YA subido a Supabase Storage a la galería del producto
// (si todavía no tiene portada, la usa como portada). tipo = 'foto' | 'video'.
export async function agregarMediaGaleria(formData) {
  await exigirAdmin();
  const codigo = formData.get('codigo');
  const tipo = formData.get('tipo') === 'video' ? 'video' : 'foto';
  const url = (formData.get('url') || '').toString();
  if (!codigo || !/^https?:\/\//.test(url)) return { ok: false, error: 'Datos inválidos.' };
  await store.agregarMedia(codigo, tipo, url);
  revalidatePath('/', 'layout');
  return { ok: true };
}

// Quita una foto o video puntual de la galería (no la portada) y lo borra del storage.
export async function quitarMediaGaleria(formData) {
  await exigirAdmin();
  const codigo = formData.get('codigo');
  const tipo = formData.get('tipo') === 'video' ? 'video' : 'galeria';
  const url = (formData.get('url') || '').toString();
  if (url && /storage\/v1\/object\/public\/media\//.test(url)) await borrarMediaPorUrl(url);
  await store.quitarDeGaleria(codigo, tipo, url);
  revalidatePath('/', 'layout');
  redirect(`/admin/productos/${encodeURIComponent(codigo)}?ok=1`);
}

// Promueve una foto de la galería a portada (la portada anterior pasa a la galería).
export async function promoverPortada(formData) {
  await exigirAdmin();
  const codigo = formData.get('codigo');
  const url = (formData.get('url') || '').toString();
  await store.usarComoPortada(codigo, url);
  revalidatePath('/', 'layout');
  redirect(`/admin/productos/${encodeURIComponent(codigo)}?ok=1`);
}

// Agrega uno o más códigos originales (OEM) a un producto, sin pisar los que ya tiene.
export async function agregarOem(formData) {
  await exigirAdmin();
  const codigo = formData.get('codigo');
  const crudo = (formData.get('oem') || '').toString();
  const pedido = (formData.get('volver') || '').toString();
  // sólo se vuelve a una pantalla del propio panel
  const volver = pedido.startsWith('/admin/') && !pedido.startsWith('//') ? pedido : `/admin/productos/${encodeURIComponent(codigo)}`;
  const nuevos = crudo.split(/[,\n;]+/).map((s) => s.trim()).filter((s) => s.length >= 2);
  if (nuevos.length) {
    const p = await store.obtener(codigo);
    if (p) {
      const set = new Set((p.codigo_original || []).map((x) => x.toLowerCase()));
      const add = nuevos.filter((x) => !set.has(x.toLowerCase()));
      if (add.length) {
        await store.actualizarOem(codigo, [...(p.codigo_original || []), ...add]);
      }
    }
  }
  revalidatePath('/', 'layout');
  redirect(volver + (volver.includes('?') ? '&' : '?') + 'ok=1');
}

// Vincula un término de búsqueda (que no daba resultados) a un producto:
// lo agrega como "código original" para que la próxima vez lo encuentre.
export async function vincularBusqueda(formData) {
  await exigirAdmin();
  const termino = (formData.get('termino') || '').toString().trim();
  const codigo = (formData.get('codigo') || '').toString().trim();
  const d = (formData.get('d') || '30').toString();
  if (termino && codigo) {
    const p = await store.obtener(codigo);
    if (p) {
      const set = new Set((p.codigo_original || []).map((x) => x.toLowerCase()));
      if (!set.has(termino.toLowerCase())) {
        await store.actualizarOem(codigo, [...(p.codigo_original || []), termino]);
      }
    }
  }
  revalidatePath('/', 'layout');
  redirect(`/admin/metricas?d=${encodeURIComponent(d)}&ok=1`);
}

/**
 * Permiso temporal para subir UN archivo al depósito de imágenes.
 * Desde la migración 0015 el depósito no acepta subidas con la clave pública: el navegador del
 * admin pide este permiso (que sólo se entrega si la sesión es de admin) y sube con él.
 */
export async function pedirSubidaMedia({ codigo, clase, extension }) {
  await exigirAdmin();
  const cod = String(codigo || '').replace(/[^a-zA-Z0-9_-]/g, '');
  const tipo = clase === 'video' ? 'video' : 'foto';
  const ext = String(extension || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'jpg';
  if (!cod) return { ok: false, error: 'Falta el código del producto.' };
  if (!usandoDB) return { ok: false, error: 'Sin base de datos no se pueden subir archivos.' };

  const ruta = `${tipo}/${cod}-${Date.now()}.${ext}`;
  const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(ruta);
  if (error) return { ok: false, error: error.message };
  return {
    ok: true,
    ruta,
    token: data.token,
    url: db.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl,
  };
}

// Quita la foto de portada. Si hay fotos en la galería, la primera pasa a ser la portada nueva.
export async function quitarMediaProducto(formData) {
  await exigirAdmin();
  const codigo = formData.get('codigo');
  const p = await store.obtener(codigo);
  const url = p?.foto;
  if (url && /storage\/v1\/object\/public\/media\//.test(url)) await borrarMediaPorUrl(url);
  const [siguiente] = p?.galeria || [];
  await store.setFotoPortada(codigo, siguiente || null);
  if (siguiente) await store.quitarDeGaleria(codigo, 'galeria', siguiente);
  revalidatePath('/', 'layout');
  redirect(`/admin/productos/${encodeURIComponent(codigo)}?ok=1`);
}

export async function alternarOculto(formData) {
  await exigirAdmin();
  const codigo = formData.get('codigo');
  const p = await store.obtener(codigo);
  await store.setOculto(codigo, !p?.oculto);
  revalidatePath('/', 'layout');
  revalidatePath('/admin/productos');
}

export async function cambiarCodigoProducto(formData) {
  await exigirAdmin();
  const codigoViejo = formData.get('codigoViejo');
  const codigoNuevo = formData.get('codigoNuevo');
  const r = await store.cambiarCodigo(codigoViejo, codigoNuevo);
  if (!r.ok) {
    redirect(`/admin/productos/${encodeURIComponent(codigoViejo)}?err=${encodeURIComponent(r.error)}`);
  }
  revalidatePath('/', 'layout');
  redirect(`/admin/productos/${encodeURIComponent(r.codigo)}?ok=1`);
}

export async function crearProducto(formData) {
  await exigirAdmin();
  const datos = Object.fromEntries(formData.entries());
  const r = await store.crear(datos);
  if (!r.ok) {
    redirect('/admin/productos/nuevo?err=' + encodeURIComponent(r.error));
  }
  revalidatePath('/', 'layout');
  redirect(`/admin/productos/${encodeURIComponent(datos.codigo)}?ok=1`);
}

export async function renombrarSub(formData) {
  await exigirAdmin();
  const familia = formData.get('familia');
  const viejo = formData.get('viejo');
  const nuevo = (formData.get('nuevo') || '').trim();
  const familiaNueva = (formData.get('familiaNueva') || '').trim() || familia;
  if (nuevo || familiaNueva !== familia) {
    await store.moverSubcategoria(familia, viejo, familiaNueva, nuevo || viejo);
  }
  revalidatePath('/', 'layout');
  revalidatePath('/admin/categorias');
}

export async function renombrarFam(formData) {
  await exigirAdmin();
  const viejo = formData.get('viejo');
  const nuevo = (formData.get('nuevo') || '').trim();
  if (nuevo && nuevo !== viejo) await store.renombrarFamilia(viejo, nuevo);
  revalidatePath('/', 'layout');
  revalidatePath('/admin/categorias');
}

// Guarda la foto que salió del editor (recortar / rotar / espejar) en lugar de la original.
export async function guardarFotoEditada(formData) {
  await exigirAdmin();
  const codigo = (formData.get('codigo') || '').toString();
  const original = (formData.get('original') || '').toString();
  const datos = (formData.get('imagen') || '').toString();
  const m = datos.match(/^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/);
  if (!codigo || !original || !m) return { ok: false, error: 'Datos inválidos.' };
  try {
    const r = await guardarFotoEditadaArchivo(codigo, original, Buffer.from(m[1], 'base64'));
    if (!r.ok) return r;
    revalidatePath('/', 'layout');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || 'No se pudo guardar la foto.' };
  }
}
