/**
 * Sesión del panel: cookie FIRMADA, que el navegador no puede falsificar.
 *
 * Antes alcanzaba con escribir `logbelts_user=Admin` en el navegador para entrar al admin.
 * Ahora la cookie lleva una firma (HMAC SHA-256) hecha con un secreto que sólo conoce el servidor,
 * así que sólo sirve si la emitió el servidor después de validar la contraseña.
 *
 * Funciona igual en el middleware (runtime Edge) y en el servidor, porque usa Web Crypto.
 */

export const COOKIE_SESION = 'lb_sesion';
// Cookie aparte, sin firma y legible por el navegador, SÓLO para mostrar el nombre en pantalla.
// No sirve para autorizar nada.
export const COOKIE_NOMBRE = 'lb_nombre';

const DURACION_DIAS = 30;
export const DURACION_SEGUNDOS = 60 * 60 * 24 * DURACION_DIAS;

const texto = new TextEncoder();

function secreto() {
  const s = process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (s) return s;
  // En la computadora del desarrollador se usa un secreto de juguete; en producción, sin secreto
  // no se valida ninguna sesión (se cierra en vez de abrirse).
  return process.env.NODE_ENV === 'production' ? '' : 'logbelts-desarrollo-local';
}

const aBase64Url = (bytes) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const deBase64Url = (s) => {
  const base = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(base + '='.repeat((4 - (base.length % 4)) % 4));
  return new Uint8Array([...bin].map((c) => c.charCodeAt(0)));
};

async function firmar(datos) {
  const clave = await crypto.subtle.importKey('raw', texto.encode(secreto()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return aBase64Url(await crypto.subtle.sign('HMAC', clave, texto.encode(datos)));
}

/** Compara sin filtrar información por el tiempo que tarda. */
function igual(a, b) {
  if (a.length !== b.length) return false;
  let dif = 0;
  for (let i = 0; i < a.length; i++) dif |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return dif === 0;
}

/** Valor de la cookie de sesión para ese usuario (o null si no hay secreto configurado). */
export async function crearSesion(usuario) {
  if (!secreto()) return null;
  const datos = aBase64Url(texto.encode(JSON.stringify({ u: usuario, exp: Date.now() + DURACION_SEGUNDOS * 1000 })));
  return `${datos}.${await firmar(datos)}`;
}

/** { usuario } si la cookie es válida y no venció; null en cualquier otro caso. */
export async function leerSesion(valor) {
  if (!valor || !secreto()) return null;
  const [datos, firma] = String(valor).split('.');
  if (!datos || !firma) return null;
  try {
    if (!igual(await firmar(datos), firma)) return null;
    const { u, exp } = JSON.parse(new TextDecoder().decode(deBase64Url(datos)));
    if (!u || !exp || exp < Date.now()) return null;
    return { usuario: u };
  } catch {
    return null;
  }
}

/** Opciones de la cookie: no se puede leer ni escribir desde el navegador. */
export function opcionesCookie() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: DURACION_SEGUNDOS,
  };
}
