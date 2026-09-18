import crypto from 'crypto';

/**
 * Sesión de la extensión de Chrome "Logbelts · Fotos del catálogo".
 * Después de validar la contraseña del admin se entrega un token firmado (HMAC) que vence a los 90 días;
 * la extensión guarda sólo el token, nunca la contraseña.
 * Importar SOLO desde código server-side (route handlers).
 */
const DURACION = 1000 * 60 * 60 * 24 * 90;
const secreto = () => process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'logbelts-extension';
const firmar = (datos) => crypto.createHmac('sha256', secreto()).update(datos).digest('base64url');

export function crearToken() {
  const datos = Buffer.from(JSON.stringify({ u: 'extension', exp: Date.now() + DURACION })).toString('base64url');
  return `${datos}.${firmar(datos)}`;
}

export function tokenValido(token) {
  const [datos, firma] = String(token || '').split('.');
  if (!datos || !firma) return false;
  const esperada = firmar(datos);
  if (esperada.length !== firma.length || !crypto.timingSafeEqual(Buffer.from(esperada), Buffer.from(firma))) return false;
  try {
    return JSON.parse(Buffer.from(datos, 'base64url').toString('utf8')).exp > Date.now();
  } catch {
    return false;
  }
}

export function tokenDe(request) {
  return (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
}
