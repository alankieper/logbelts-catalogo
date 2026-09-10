'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { setGateClientes } from '../../lib/config';

export async function cambiarGateClientes(formData) {
  const activo = formData.get('activo') === '1';
  const d = (formData.get('d') || '30').toString();
  const r = await setGateClientes(activo);
  revalidatePath('/admin/metricas');
  redirect(`/admin/metricas?d=${encodeURIComponent(d)}${r.ok ? '' : '&errGate=1'}`);
}
