'use server';
import { exigirAdmin } from '../../../lib/sesionServidor';
import { refrescarCatalogo } from '../../../lib/revalidar';
import { elegirFoto, sacarFotoPdf } from '../../../lib/catalogoNuevo';

// Una decisión por vez: el navegador va mostrando el avance y no redirige.
export async function elegirUna(codigo, cual) {
  await exigirAdmin();
  try {
    await elegirFoto(String(codigo), cual === 'pdf' ? 'pdf' : 'actual');
    refrescarCatalogo();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || 'No se pudo guardar.' };
  }
}

export async function sacarUna(codigo) {
  await exigirAdmin();
  try {
    await sacarFotoPdf(String(codigo));
    refrescarCatalogo();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || 'No se pudo sacar la foto.' };
  }
}
