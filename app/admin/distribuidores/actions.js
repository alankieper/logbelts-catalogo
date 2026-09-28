'use server';
import { exigirAdmin } from '../../../lib/sesionServidor';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { borrarDistribuidor, guardarDistribuidor } from '../../../lib/distribuidores';

export async function guardarDistribuidorAction(formData) {
  await exigirAdmin();
  const r = await guardarDistribuidor({
    id: formData.get('id') || null,
    nombre: formData.get('nombre'),
    direccion: formData.get('direccion'),
    localidad: formData.get('localidad'),
    provincia: formData.get('provincia'),
    telefono: formData.get('telefono'),
    whatsapp: formData.get('whatsapp'),
    lat: formData.get('lat'),
    lng: formData.get('lng'),
    orden: formData.get('orden'),
    publico: formData.get('publico') === 'on',
  });
  revalidatePath('/admin/distribuidores');
  revalidatePath('/donde-comprar');
  redirect(`/admin/distribuidores?${r.ok ? 'ok=1' : `err=${encodeURIComponent(r.error || '1')}`}`);
}

export async function borrarDistribuidorAction(formData) {
  await exigirAdmin();
  await borrarDistribuidor(formData.get('id'));
  revalidatePath('/admin/distribuidores');
  revalidatePath('/donde-comprar');
  redirect('/admin/distribuidores?ok=1');
}
