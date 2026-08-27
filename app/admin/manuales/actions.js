'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { guardarCurado, borrarCurado } from '../../../lib/despieces';

const DEST = path.join(process.cwd(), 'public', 'despieces');

export async function guardarDespiece(formData) {
  const id = formData.get('id') || 'd-' + Date.now();
  const marca = (formData.get('marca') || '').trim();
  const modelo = (formData.get('modelo') || '').trim();
  const titulo = (formData.get('titulo') || '').trim();
  const tipo = formData.get('tipo') || 'despiece';
  const fuente = (formData.get('fuente') || '').trim();
  const publico = formData.get('publico') === 'on';
  let url = (formData.get('url') || '').trim();

  if (!marca || !modelo || !titulo) {
    redirect('/admin/manuales?err=' + encodeURIComponent('Completá marca, modelo y título.'));
  }

  let archivo = formData.get('archivo_actual') || null;
  const file = formData.get('archivo');
  if (file && typeof file !== 'string' && file.size) {
    if (process.env.VERCEL) {
      redirect('/admin/manuales?err=' + encodeURIComponent('Subir PDF propio corre sólo en local por ahora. Online: usá un enlace.'));
    }
    fs.mkdirSync(DEST, { recursive: true });
    const safe = `${marca}-${modelo}-${Date.now()}.pdf`.replace(/[^a-zA-Z0-9.\-]/g, '_');
    fs.writeFileSync(path.join(DEST, safe), Buffer.from(await file.arrayBuffer()));
    archivo = safe;
    url = '';
  }

  const entry = { id, marca, modelo, tipo, titulo, url: url || null, archivo, fuente: fuente || 'Logbelts', publico };
  await guardarCurado(entry);

  revalidatePath('/', 'layout');
  redirect('/admin/manuales?ok=1');
}

export async function borrarDespiece(formData) {
  const id = formData.get('id');
  await borrarCurado(id);
  revalidatePath('/', 'layout');
  redirect('/admin/manuales');
}
