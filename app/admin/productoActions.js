'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import * as store from '../../lib/catalogoStore';
import { borrarMediaPorUrl } from '../../lib/media';

export async function guardarProducto(formData) {
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
  };
  const r = await store.actualizar(codigo, cambios);
  revalidatePath('/', 'layout');
  redirect(`/admin/productos/${encodeURIComponent(codigo)}?ok=1`);
}

// Guarda la URL de un archivo YA subido a Supabase Storage desde el navegador.
export async function guardarMediaUrl(formData) {
  const codigo = formData.get('codigo');
  const campo = formData.get('campo') === 'video' ? 'video' : 'foto';
  const url = (formData.get('url') || '').toString();
  if (!codigo || !/^https?:\/\//.test(url)) return { ok: false, error: 'Datos inválidos.' };
  if (campo === 'foto') {
    const prev = await store.obtener(codigo);
    if (prev?.foto && prev.foto !== url && /storage\/v1\/object\/public\/media\//.test(prev.foto)) {
      await borrarMediaPorUrl(prev.foto);
    }
  }
  await store.setMedia(codigo, campo, url);
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function quitarMediaProducto(formData) {
  const codigo = formData.get('codigo');
  const campo = formData.get('campo') === 'video' ? 'video' : 'foto';
  const p = await store.obtener(codigo);
  const url = campo === 'video' ? p?.video : p?.foto;
  if (url && /storage\/v1\/object\/public\/media\//.test(url)) await borrarMediaPorUrl(url);
  await store.setMedia(codigo, campo, null);
  revalidatePath('/', 'layout');
  redirect(`/admin/productos/${encodeURIComponent(codigo)}?ok=1`);
}

export async function alternarOculto(formData) {
  const codigo = formData.get('codigo');
  const p = await store.obtener(codigo);
  await store.setOculto(codigo, !p?.oculto);
  revalidatePath('/', 'layout');
  revalidatePath('/admin/productos');
}

export async function crearProducto(formData) {
  const datos = Object.fromEntries(formData.entries());
  const r = await store.crear(datos);
  if (!r.ok) {
    redirect('/admin/productos/nuevo?err=' + encodeURIComponent(r.error));
  }
  revalidatePath('/', 'layout');
  redirect(`/admin/productos/${encodeURIComponent(datos.codigo)}?ok=1`);
}

export async function renombrarSub(formData) {
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
  const viejo = formData.get('viejo');
  const nuevo = (formData.get('nuevo') || '').trim();
  if (nuevo && nuevo !== viejo) await store.renombrarFamilia(viejo, nuevo);
  revalidatePath('/', 'layout');
  revalidatePath('/admin/categorias');
}
