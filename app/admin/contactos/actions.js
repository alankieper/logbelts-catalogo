'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { actualizarContacto } from '../../../lib/contactos';

export async function guardarSeguimiento(formData) {
  const id = formData.get('id');
  const r = await actualizarContacto(id, {
    estado: formData.get('estado'),
    vendedor_id: formData.get('vendedor_id') || null,
    notas: (formData.get('notas') || '').toString(),
  });
  revalidatePath('/admin/contactos');
  const volver = (formData.get('volver') || '').toString();
  const destino = volver.startsWith('/admin/contactos') ? volver : '/admin/contactos';
  redirect(`${destino}${destino.includes('?') ? '&' : '?'}${r.ok ? 'ok=1' : 'err=1'}`);
}
