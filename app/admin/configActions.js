'use server';
import { exigirAdmin } from '../../lib/sesionServidor';

import { revalidatePath } from 'next/cache';
import { refrescarCatalogo } from '../../lib/revalidar';
import { redirect } from 'next/navigation';
import { setGateClientes } from '../../lib/config';
import { reiniciarEstadisticas } from '../../lib/eventos';
import { guardarAjustes } from '../../lib/ajustes';
import { MODOS } from '../../lib/temporada';

export async function cambiarGateClientes(formData) {
  await exigirAdmin();
  const activo = formData.get('activo') === '1';
  const d = (formData.get('d') || '30').toString();
  const r = await setGateClientes(activo);
  revalidatePath('/admin/metricas');
  redirect(`/admin/metricas?d=${encodeURIComponent(d)}${r.ok ? '' : '&errGate=1'}`);
}

// Reinicia las estadísticas (eventos y visitas). Exige escribir REINICIAR para evitar accidentes.
export async function reiniciarEstadisticasAccion(formData) {
  await exigirAdmin();
  const d = (formData.get('d') || '30').toString();
  const volver = (q) => redirect(`/admin/metricas?d=${encodeURIComponent(d)}&${q}#reiniciar`);
  if ((formData.get('confirmacion') || '').toString().trim() !== 'REINICIAR') volver('reinicio=confirmar');
  const r = await reiniciarEstadisticas();
  if (!r.ok) volver(`reinicio=error&msg=${encodeURIComponent(r.error)}`);
  await guardarAjustes({ estadisticasDesde: new Date().toISOString() });
  revalidatePath('/admin/metricas');
  volver('reinicio=ok');
}

// Cambia la temporada que tiene protagonismo en la web (o la deja automática por fecha).
export async function guardarTemporada(formData) {
  await exigirAdmin();
  const modo = (formData.get('modo') || 'auto').toString();
  if (!MODOS.some((m) => m.id === modo)) redirect('/admin/temporada?err=1');
  const r = await guardarAjustes({ temporada: modo });
  refrescarCatalogo();
  redirect(r.ok ? '/admin/temporada?ok=1' : `/admin/temporada?err=${encodeURIComponent(r.error)}`);
}
