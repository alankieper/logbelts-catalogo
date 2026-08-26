'use server';

import { supabase } from '../../lib/supabase';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function crearSolicitud(formData) {
  const titulo = formData.get('titulo');
  const producto = formData.get('producto');
  const pagina_catalogo = formData.get('pagina_catalogo');
  const descripcion = formData.get('descripcion');
  const prioridad = formData.get('prioridad');

  const cookieStore = cookies();
  const usuarioCookie = cookieStore.get('logbelts_user');
  const creado_por = usuarioCookie ? decodeURIComponent(usuarioCookie.value) : null;

  await supabase.from('solicitudes').insert({
    titulo,
    producto: producto || null,
    pagina_catalogo: pagina_catalogo || null,
    descripcion,
    prioridad,
    creado_por,
  });

  redirect('/');
}
