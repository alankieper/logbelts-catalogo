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

// Agrega una foto o video YA subido a Supabase Storage a la galería del producto
// (si todavía no tiene portada, la usa como portada). tipo = 'foto' | 'video'.
export async function agregarMediaGaleria(formData) {
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
  const codigo = formData.get('codigo');
  const url = (formData.get('url') || '').toString();
  await store.usarComoPortada(codigo, url);
  revalidatePath('/', 'layout');
  redirect(`/admin/productos/${encodeURIComponent(codigo)}?ok=1`);
}

// Agrega uno o más códigos originales (OEM) a un producto, sin pisar los que ya tiene.
export async function agregarOem(formData) {
  const codigo = formData.get('codigo');
  const crudo = (formData.get('oem') || '').toString();
  const volver = (formData.get('volver') || `/admin/productos/${encodeURIComponent(codigo)}`).toString();
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

// Quita la foto de portada. Si hay fotos en la galería, la primera pasa a ser la portada nueva.
export async function quitarMediaProducto(formData) {
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
  const codigo = formData.get('codigo');
  const p = await store.obtener(codigo);
  await store.setOculto(codigo, !p?.oculto);
  revalidatePath('/', 'layout');
  revalidatePath('/admin/productos');
}

export async function cambiarCodigoProducto(formData) {
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
