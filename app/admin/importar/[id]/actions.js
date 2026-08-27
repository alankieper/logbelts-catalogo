'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { leerCambios, guardarCambios, aplicar, revertir } from '../../../../lib/importador';

export async function decidirCambio(formData) {
  const id = formData.get('id');
  const key = formData.get('key');
  const decision = formData.get('decision'); // aprobado | rechazado | pendiente
  const cambios = leerCambios(id);
  if (!cambios) return;
  const c = cambios.find((x) => x.key === key);
  if (c) c.decision = decision;
  guardarCambios(id, cambios);
  revalidatePath(`/admin/importar/${id}`);
}

export async function decidirLote(formData) {
  const id = formData.get('id');
  const tipo = formData.get('tipo'); // nuevo | modificado | eliminado | todos
  const decision = formData.get('decision');
  const cambios = leerCambios(id);
  if (!cambios) return;
  for (const c of cambios) {
    if (tipo === 'todos' || c.tipo === tipo) c.decision = decision;
  }
  guardarCambios(id, cambios);
  revalidatePath(`/admin/importar/${id}`);
}

export async function aplicarImport(formData) {
  const id = formData.get('id');
  const autor = cookies().get('logbelts_user')?.value || null;
  const r = aplicar(id, autor);
  revalidatePath('/', 'layout');
  redirect(`/admin/importar/${id}?${r.ok ? 'aplicado=1' : 'err=' + encodeURIComponent(r.error)}`);
}

export async function revertirImport(formData) {
  const id = formData.get('id');
  revertir(id);
  revalidatePath('/', 'layout');
  redirect(`/admin/importar/${id}?revertido=1`);
}
