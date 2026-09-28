import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_SESION, leerSesion } from './sesion';
import { esAdmin } from './admins';

/**
 * Quién está usando el panel, según la cookie FIRMADA (ver lib/sesion.js).
 * Se usa en server actions y páginas del servidor. El middleware hace lo mismo para redirigir,
 * pero la autorización de verdad se hace acá: una server action se puede invocar desde afuera.
 */
export async function usuarioActual() {
  const valor = cookies().get(COOKIE_SESION)?.value;
  const sesion = await leerSesion(valor);
  return sesion?.usuario || null;
}

/** Nombre del admin, o manda al login. Llamar como PRIMERA línea de cada acción del panel. */
export async function exigirAdmin() {
  const usuario = await usuarioActual();
  if (!usuario || !esAdmin(usuario)) redirect('/login');
  return usuario;
}

/** Igual que exigirAdmin pero alcanza con estar identificado (vendedor o admin). */
export async function exigirSesion() {
  const usuario = await usuarioActual();
  if (!usuario) redirect('/login');
  return usuario;
}
