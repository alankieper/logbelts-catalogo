'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { leerTodos, aplicarCambiosMasivo } from '../../../lib/catalogoStore';
import { parseXlsx, calcularCambios } from '../../../lib/excel';

export async function importarExcel(formData) {
  const file = formData.get('archivo');
  if (!file || typeof file === 'string' || !file.size) {
    redirect('/admin/excel?err=' + encodeURIComponent('Elegí el archivo Excel.'));
  }
  if (file.size > 12 * 1024 * 1024) {
    redirect('/admin/excel?err=' + encodeURIComponent('El archivo es muy grande (máx. 12 MB).'));
  }

  let resumen;
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const filas = parseXlsx(buf);
    if (!filas.length) throw new Error('No se leyeron filas con código válido. ¿Es el Excel que bajaste de acá?');
    const productos = await leerTodos();
    const { cambios, sinCambio, noEncontrados } = calcularCambios(filas, productos);
    const r = await aplicarCambiosMasivo(cambios);
    const detalle = cambios.map((c) => `${c.codigo}:${Object.keys(c.campos).join('+')}`);
    resumen = { aplicados: r.aplicados, sinCambio, noEncontrados, detalle };
  } catch (e) {
    redirect('/admin/excel?err=' + encodeURIComponent(e.message || 'No se pudo procesar el Excel.'));
  }

  revalidatePath('/', 'layout');
  const sp = new URLSearchParams();
  sp.set('ok', String(resumen.aplicados));
  sp.set('sin', String(resumen.sinCambio));
  if (resumen.noEncontrados.length) sp.set('nf', resumen.noEncontrados.slice(0, 40).join(','));
  if (resumen.detalle.length) sp.set('ch', resumen.detalle.slice(0, 60).join(','));
  redirect('/admin/excel?' + sp.toString());
}
