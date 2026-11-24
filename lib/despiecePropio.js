/**
 * Despieces dibujados por Logbelts (contorno de cada pieza trazado desde las fotos del catálogo).
 * El dibujo de cada máquina es un JSON en public/dibujos-despiece, que el visor carga al abrir la página.
 * Se arma con el script de trazado (ver README de esa carpeta) y se agrega acá con su clave de máquina.
 */
const PROPIOS = {
  'stihl|fs120': '/dibujos-despiece/stihl-fs120.json',
};

/** Dirección del dibujo propio de una máquina ("marca|modelo"), o null si todavía no tiene. */
export function despiecePropio(clave) {
  return PROPIOS[clave] || null;
}
