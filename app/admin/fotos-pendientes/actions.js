'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { aprobarPendiente, rechazarPendiente } from '../../../lib/fotosPendientes';

function volver(params) {
  revalidatePath('/', 'layout');
  redirect(`/admin/fotos-pendientes?${new URLSearchParams(params)}`);
}

export async function aprobarFoto(formData) {
  let error = null;
  try {
    await aprobarPendiente(formData.get('nombre'));
  } catch (e) {
    error = e.message;
  }
  volver(error ? { err: error } : { ok: '1', n: '1' });
}

export async function rechazarFoto(formData) {
  let error = null;
  try {
    await rechazarPendiente(formData.get('nombre'));
  } catch (e) {
    error = e.message;
  }
  volver(error ? { err: error } : { rechazada: '1' });
}

// Aprueba todas las que se muestran. Si hay varias del mismo producto, queda de portada la última.
export async function aprobarTodas(formData) {
  const nombres = formData.getAll('nombre').map(String);
  let n = 0;
  const errores = [];
  for (const nombre of nombres) {
    try {
      await aprobarPendiente(nombre);
      n++;
    } catch (e) {
      errores.push(`${nombre}: ${e.message}`);
    }
  }
  volver(errores.length ? { ok: '1', n: String(n), err: errores.slice(0, 3).join(' · ') } : { ok: '1', n: String(n) });
}
