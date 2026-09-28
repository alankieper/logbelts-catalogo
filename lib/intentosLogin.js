/**
 * Freno a los intentos de adivinar la contraseña: después de 5 fallos desde la misma IP,
 * la espera crece (10 s, 20 s, 40 s… hasta 5 minutos). Se guarda en memoria del servidor;
 * alcanza para que probar todas las contraseñas deje de ser cuestión de segundos.
 */
const FALLOS_LIBRES = 5;
const BASE_MS = 10 * 1000;
const TOPE_MS = 5 * 60 * 1000;
const OLVIDO_MS = 30 * 60 * 1000;

const intentos = new Map(); // ip -> { fallos, ultimo }

/**
 * Devuelve los milisegundos que faltan para poder volver a intentar (0 = puede intentar).
 * Con `fallo = true` registra un intento fallido.
 */
export function esperaAntiFuerzaBruta(ip, fallo = false) {
  const ahora = Date.now();
  const previo = intentos.get(ip);
  if (previo && ahora - previo.ultimo > OLVIDO_MS) intentos.delete(ip);

  if (fallo) {
    const actual = intentos.get(ip) || { fallos: 0, ultimo: 0 };
    intentos.set(ip, { fallos: actual.fallos + 1, ultimo: ahora });
    if (intentos.size > 5000) intentos.clear(); // no crecer sin límite
    return 0;
  }

  const estado = intentos.get(ip);
  if (!estado || estado.fallos < FALLOS_LIBRES) return 0;
  const castigo = Math.min(BASE_MS * 2 ** (estado.fallos - FALLOS_LIBRES), TOPE_MS);
  return Math.max(0, estado.ultimo + castigo - ahora);
}

/** Al entrar bien se limpia el contador de esa IP. */
export function olvidarIntentos(ip) {
  intentos.delete(ip);
}
