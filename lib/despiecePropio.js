/**
 * Despieces dibujados por Logbelts (contorno de cada pieza trazado desde las fotos del catálogo).
 * El dibujo de cada máquina es un JSON en public/dibujos-despiece, que el visor carga al abrir la página.
 * Se arma con el script de trazado (ver README de esa carpeta) y se agrega acá con su clave de máquina.
 */
const PROPIOS = {
  'stihl|fs120': { src: '/dibujos-despiece/stihl-fs120.json', proporcion: '1800 / 1000' },
  'stihl|ms170': { src: '/dibujos-despiece/stihl-ms170.json', proporcion: '1800 / 1600' },
  'husqvarna|268': { src: '/dibujos-despiece/husqvarna-268.json', proporcion: '1800 / 1182' },
  'husqvarna|272': { src: '/dibujos-despiece/husqvarna-272.json', proporcion: '1800 / 1182' },
  'husqvarna|365': { src: '/dibujos-despiece/husqvarna-365.json', proporcion: '1800 / 1396' },
  'husqvarna|372': { src: '/dibujos-despiece/husqvarna-372.json', proporcion: '1800 / 1182' },
  'husqvarna|61': { src: '/dibujos-despiece/husqvarna-61.json', proporcion: '1800 / 1396' },
  'stihl|ms180': { src: '/dibujos-despiece/stihl-ms180.json', proporcion: '1800 / 1396' },
  'stihl|ms210': { src: '/dibujos-despiece/stihl-ms210.json', proporcion: '1800 / 1182' },
  'stihl|ms230': { src: '/dibujos-despiece/stihl-ms230.json', proporcion: '1800 / 1182' },
  'stihl|ms250': { src: '/dibujos-despiece/stihl-ms250.json', proporcion: '1800 / 1396' },
  'stihl|ms290': { src: '/dibujos-despiece/stihl-ms290.json', proporcion: '1800 / 968' },
  'stihl|ms341': { src: '/dibujos-despiece/stihl-ms341.json', proporcion: '1800 / 968' },
  'stihl|ms360': { src: '/dibujos-despiece/stihl-ms360.json', proporcion: '1800 / 1396' },
  'stihl|ms361': { src: '/dibujos-despiece/stihl-ms361.json', proporcion: '1800 / 1396' },
  'stihl|ms380': { src: '/dibujos-despiece/stihl-ms380.json', proporcion: '1800 / 1396' },
  'stihl|ms381': { src: '/dibujos-despiece/stihl-ms381.json', proporcion: '1800 / 1396' },
  'stihl|ms382': { src: '/dibujos-despiece/stihl-ms382.json', proporcion: '1800 / 1182' },
  'stihl|fs450': { src: '/dibujos-despiece/stihl-fs450.json', proporcion: '1800 / 1706' },
  'stihl|fs220': { src: '/dibujos-despiece/stihl-fs220.json', proporcion: '1800 / 1706' },
  'stihl|fs160': { src: '/dibujos-despiece/stihl-fs160.json', proporcion: '1800 / 1468' },
  'stihl|fs280': { src: '/dibujos-despiece/stihl-fs280.json', proporcion: '1800 / 1468' },
  'stihl|fs55': { src: '/dibujos-despiece/stihl-fs55.json', proporcion: '1800 / 1468' },
  'stihl|fs38': { src: '/dibujos-despiece/stihl-fs38.json', proporcion: '1800 / 1468' },
  'stihl|fs85': { src: '/dibujos-despiece/stihl-fs85.json', proporcion: '1800 / 1000' },
  'stihl|fs250': { src: '/dibujos-despiece/stihl-fs250.json', proporcion: '1800 / 1000' },
  'husqvarna|143r': { src: '/dibujos-despiece/husqvarna-143r.json', proporcion: '1800 / 1468' },
  'echo|srm4605': { src: '/dibujos-despiece/echo-srm4605.json', proporcion: '1800 / 1000' },
  'chinas|43cc': { src: '/dibujos-despiece/chinas-43cc.json', proporcion: '1800 / 1230' },
  'chinas|33cc': { src: '/dibujos-despiece/chinas-33cc.json', proporcion: '1800 / 1230' },
  'chinas|52cc': { src: '/dibujos-despiece/chinas-52cc.json', proporcion: '1800 / 1230' },
  'chinas|26cc': { src: '/dibujos-despiece/chinas-26cc.json', proporcion: '1800 / 1000' },
};

/** Dibujo propio de una máquina ("marca|modelo"): { src, proporcion }, o null si todavía no tiene. */
export function despiecePropio(clave) {
  return PROPIOS[clave] || null;
}
