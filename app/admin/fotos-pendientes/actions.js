'use server';
import { exigirAdmin } from '../../../lib/sesionServidor';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { aprobarPendiente, rechazarPendiente, olvidarConteo } from '../../../lib/fotosPendientes';

function volver(params) {
  olvidarConteo();
  revalidatePath('/', 'layout');
  redirect(`/admin/fotos-pendientes?${new URLSearchParams(params)}`);
}

export async function aprobarFoto(formData) {
  await exigirAdmin();
  let error = null;
  try {
    await aprobarPendiente(formData.get('nombre'));
  } catch (e) {
    error = e.message;
  }
  volver(error ? { err: error } : { ok: '1', n: '1' });
}

export async function rechazarFoto(formData) {
  await exigirAdmin();
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
  await exigirAdmin();
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

// Versiones para la bandeja con barra de progreso: aprueban/rechazan UNA foto y devuelven el
// resultado (sin redirigir), así el navegador puede ir mostrando "2 de 5…" y al final refrescar.
export async function aprobarUna(nombre) {
  await exigirAdmin();
  try {
    await aprobarPendiente(String(nombre));
    olvidarConteo();
    revalidatePath('/', 'layout');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || 'No se pudo aprobar.' };
  }
}

export async function rechazarUna(nombre) {
  await exigirAdmin();
  try {
    await rechazarPendiente(String(nombre));
    olvidarConteo();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || 'No se pudo rechazar.' };
  }
}
