'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import * as store from '../../lib/catalogoStore';

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
  const r = store.actualizar(codigo, cambios);
  revalidatePath('/', 'layout');
  redirect(`/admin/productos/${encodeURIComponent(codigo)}?ok=1`);
}

export async function alternarOculto(formData) {
  const codigo = formData.get('codigo');
  const p = store.obtener(codigo);
  store.setOculto(codigo, !p?.oculto);
  revalidatePath('/', 'layout');
  revalidatePath('/admin/productos');
}

export async function crearProducto(formData) {
  const datos = Object.fromEntries(formData.entries());
  const r = store.crear(datos);
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
    store.moverSubcategoria(familia, viejo, familiaNueva, nuevo || viejo);
  }
  revalidatePath('/', 'layout');
  revalidatePath('/admin/categorias');
}

export async function renombrarFam(formData) {
  const viejo = formData.get('viejo');
  const nuevo = (formData.get('nuevo') || '').trim();
  if (nuevo && nuevo !== viejo) store.renombrarFamilia(viejo, nuevo);
  revalidatePath('/', 'layout');
  revalidatePath('/admin/categorias');
}
