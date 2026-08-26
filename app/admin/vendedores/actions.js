'use server';

import { supabase } from '../../../lib/supabase';
import { revalidatePath } from 'next/cache';

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
