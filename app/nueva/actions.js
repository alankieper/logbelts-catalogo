'use server';

import { supabase } from '../../lib/supabase';
import { redirect } from 'next/navigation';

export async function crearSolicitud(formData) {
    const titulo = formData.get('titulo');
    const producto = formData.get('producto');
    const pagina_catalogo = formData.get('pagina_catalogo');
    const descripcion = formData.get('descripcion');
    const prioridad = formData.get('prioridad');

  await supabase.from('solicitudes').insert({
        titulo,
        producto: producto || null,
        pagina_catalogo: pagina_catalogo || null,
        descripcion,
        prioridad,
  });

  redirect('/');
}
