'use server';

import fs from 'fs';
import path from 'path';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { dirImport, registrarRun, actualizarRun, procesarPdf } from '../../../lib/importador';

export async function subirCatalogo(formData) {
  const file = formData.get('pdf');
  if (!file || typeof file === 'string' || !file.size) {
    redirect('/admin/importar?err=' + encodeURIComponent('Elegí un archivo PDF.'));
  }
  const id = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const carpeta = path.join(dirImport(), id);
  fs.mkdirSync(carpeta, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  const rutaPdf = path.join(carpeta, 'catalogo.pdf');
  fs.writeFileSync(rutaPdf, bytes);

  const autor = cookies().get('logbelts_user')?.value || null;
  registrarRun({
    id,
    archivo: file.name || 'catalogo.pdf',
    tamano: bytes.length,
    estado: 'procesando',
    autor,
    created_at: new Date().toISOString(),
  });

  const conIA = formData.get('con_ia') === 'on';
  try {
    const { stats, ia } = await procesarPdf(rutaPdf, id, { conIA });
    actualizarRun(id, { estado: 'revision', stats, ia });
  } catch (e) {
    actualizarRun(id, { estado: 'error', error: String(e.message || e).slice(0, 500) });
  }

  revalidatePath('/admin/importar');
  redirect('/admin/importar/' + id);
}
