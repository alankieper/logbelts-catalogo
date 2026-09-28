'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { crearSesion, opcionesCookie, COOKIE_SESION, COOKIE_NOMBRE, DURACION_SEGUNDOS } from '../../lib/sesion';

/**
 * Entrar como vendedor. La cookie la firma el SERVIDOR y sólo con un nombre que exista
 * en la lista de vendedores activos: antes el navegador se escribía la cookie solo y podía
 * poner cualquier nombre, incluido "Admin".
 */
export async function entrarComoVendedor(formData) {
  const nombre = String(formData.get('nombre') || '').trim();
  if (!nombre) redirect('/login?err=1');

  const { data } = await supabase.from('vendedores').select('nombre').eq('nombre', nombre).eq('activo', true).limit(1);
  if (!data || !data.length) redirect('/login?err=1');

  const sesion = await crearSesion(data[0].nombre);
  if (!sesion) redirect('/login?err=2');

  const galleta = cookies();
  galleta.set(COOKIE_SESION, sesion, opcionesCookie());
  galleta.set(COOKIE_NOMBRE, data[0].nombre, { path: '/', maxAge: DURACION_SEGUNDOS, sameSite: 'lax' });
  redirect('/');
}
