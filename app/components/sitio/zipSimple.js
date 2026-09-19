/**
 * ZIP mínimo (sin compresión, método "store") para descargar varias placas juntas.
 * Los PNG ya vienen comprimidos, así que comprimirlos de nuevo no ahorra casi nada.
 * archivos: [{ nombre: 'placa.png', datos: Uint8Array }]  →  Blob application/zip
 */

const TABLA = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(datos) {
  let c = 0xffffffff;
  for (let i = 0; i < datos.length; i++) c = TABLA[(c ^ datos[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

export function armarZip(archivos) {
  const enc = new TextEncoder();
  const partes = [];
  const central = [];
  let offset = 0;

  for (const a of archivos) {
    const nombre = enc.encode(a.nombre);
    const crc = crc32(a.datos);
    const tam = a.datos.length;

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);        // versión
    local.setUint16(6, 0x0800, true);    // nombres en UTF-8
    local.setUint16(8, 0, true);         // sin compresión
    local.setUint32(14, crc, true);
    local.setUint32(18, tam, true);
    local.setUint32(22, tam, true);
    local.setUint16(26, nombre.length, true);
    partes.push(new Uint8Array(local.buffer), nombre, a.datos);

    const cen = new DataView(new ArrayBuffer(46));
    cen.setUint32(0, 0x02014b50, true);
    cen.setUint16(4, 20, true);
    cen.setUint16(6, 20, true);
    cen.setUint16(8, 0x0800, true);
    cen.setUint32(16, crc, true);
    cen.setUint32(20, tam, true);
    cen.setUint32(24, tam, true);
    cen.setUint16(28, nombre.length, true);
    cen.setUint32(42, offset, true);
    central.push(new Uint8Array(cen.buffer), nombre);

    offset += 30 + nombre.length + tam;
  }

  const tamCentral = central.reduce((s, p) => s + p.length, 0);
  const fin = new DataView(new ArrayBuffer(22));
  fin.setUint32(0, 0x06054b50, true);
  fin.setUint16(8, archivos.length, true);
  fin.setUint16(10, archivos.length, true);
  fin.setUint32(12, tamCentral, true);
  fin.setUint32(16, offset, true);

  return new Blob([...partes, ...central, new Uint8Array(fin.buffer)], { type: 'application/zip' });
}
