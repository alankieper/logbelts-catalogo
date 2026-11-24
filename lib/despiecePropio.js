/**
 * Despieces dibujados por Logbelts (contorno de cada pieza trazado desde las fotos del catálogo).
 * El dibujo de cada máquina es un JSON en public/dibujos-despiece, que el visor carga al abrir la página.
 * Se arma con el script de trazado (ver README de esa carpeta) y se agrega acá con su clave de máquina.
 */
const PROPIOS = {
  'stihl|fs120': { src: '/dibujos-despiece/stihl-fs120.json', proporcion: '1800 / 1000' },
  'stihl|ms170': { src: '/dibujos-despiece/stihl-ms170.json', proporcion: '1800 / 1600' },
};

/** Dibujo propio de una máquina ("marca|modelo"): { src, proporcion }, o null si todavía no tiene. */
export function despiecePropio(clave) {
  return PROPIOS[clave] || null;
}
