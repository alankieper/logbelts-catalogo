'use server';

import { supabase } from '../../../lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { PROVINCIAS } from '../../../lib/provincias';

export async function agregarVendedor(formData) {
  const nombre = (formData.get('nombre') || '').toString().trim();
  if (!nombre) return;

  await supabase.from('vendedores').insert({ nombre });
  revalidatePath('/admin/vendedores');
}

export async function cambiarActivo(formData) {
  const id = formData.get('id');
  const activo = formData.get('activo') === 'true';

  await supabase.from('vendedores').update({ activo: !activo }).eq('id', id);
  revalidatePath('/admin/vendedores');
}

// Datos para asignar y avisar contactos (columnas de la migración 0011).
export async function guardarDatosVendedor(formData) {
  const id = formData.get('id');
  const provincias = formData.getAll('provincias').map(String).filter((p) => PROVINCIAS.includes(p));
  const { error } = await supabase
    .from('vendedores')
    .update({
      telefono: (formData.get('telefono') || '').toString().trim() || null,
      email: (formData.get('email') || '').toString().trim() || null,
      provincias,
      recibe_contactos: formData.get('recibe_contactos') === 'on',
    })
    .eq('id', id);
  revalidatePath('/admin/vendedores');
  redirect(`/admin/vendedores?${error ? 'err=1' : 'ok=1'}`);
}
