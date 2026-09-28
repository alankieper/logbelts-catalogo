/**
 * Contraseña del panel. Importar SOLO desde código server-side (route handlers, server actions).
 *
 * Se configura con la variable de entorno ADMIN_PASSWORD (en Vercel: Settings → Environment Variables).
 * Mientras no esté configurada se sigue aceptando la contraseña vieja, para no dejar a nadie afuera,
 * y el panel muestra un aviso rojo pidiendo configurarla (ver app/admin/page.js).
 */
const POR_DEFECTO = '1234';

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || POR_DEFECTO;

/** true si todavía se está usando la contraseña de fábrica (hay que cambiarla). */
export const PASSWORD_SIN_CONFIGURAR = !process.env.ADMIN_PASSWORD;

/** Compara sin filtrar información por el tiempo que tarda. */
export function passwordCorrecta(intento) {
  const a = String(intento || '');
  const b = ADMIN_PASSWORD;
  if (a.length !== b.length) return false;
  let dif = 0;
  for (let i = 0; i < a.length; i++) dif |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return dif === 0;
}
