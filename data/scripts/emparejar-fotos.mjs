/**
 * Empareja visualmente las fotos de public/fotos para que la grilla del catálogo
 * se vea pareja: fondo blanco liso, lienzo cuadrado (1:1), producto centrado y
 * el mismo margen (7% por lado) en todas.
 *
 * Reglas:
 *  - Conserva SIEMPRE el nombre y la extensión del archivo (productos.json los
 *    referencia por nombre exacto en `foto` y `galeria`). Nunca borra nada.
 *  - Respeta la orientación EXIF (rotate() antes de procesar).
 *  - Si la foto tiene transparencia, la aplana sobre blanco.
 *  - Detecta el fondo mirando los 4 bordes: si son casi blancos (promedio > 235)
 *    recorta el fondo con trim y tolerancia moderada. Si el fondo NO es claro
 *    (gris, madera, mesa oscura) NO recorta ni intenta borrar el fondo: solo
 *    lleva la imagen al lienzo cuadrado.
 *  - Si el recorte deja menos del 25% del área original, se descarta el recorte.
 *  - Nunca agranda una foto (no upscaling).
 *  - Saltea las fotos que ya cumplen (cuadradas ±2%, fondo blanco, margen 5-10%).
 *
 * Sobre el tamaño del lienzo
 * --------------------------
 * Casi todas las fotos del catálogo son chicas (100-500 px de lado). Con la regla
 * de "no agrandar", fijar el lienzo en 1000x1000 dejaría al producto como una
 * mancha diminuta en el centro de un lienzo enorme: en la grilla se vería MUCHO
 * más chico que hoy. Por eso, por defecto el lienzo es proporcional:
 *
 *      lado = min(1000, ceil(ladoMayorDelContenido / 0.86))
 *
 * Así el margen queda exactamente en 7% por lado en todas las fotos, la imagen
 * sigue siendo cuadrada y no se agranda ni se resamplea nada. En una grilla CSS
 * todas se ven idénticas, porque lo que importa es la proporción, no los píxeles.
 *
 * Si igual se quiere el lienzo fijo de 1000x1000, usar --lienzo-fijo
 * (las fotos chicas van a quedar centradas y chiquitas), o --lienzo-fijo
 * --permitir-upscale para además estirarlas hasta el 86% del lado.
 *
 * Uso:
 *   node data/scripts/emparejar-fotos.mjs --dry-run
 *   node data/scripts/emparejar-fotos.mjs --dry-run --limite 50
 *   node data/scripts/emparejar-fotos.mjs
 *   node data/scripts/emparejar-fotos.mjs --lienzo-fijo
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

// ---------------------------------------------------------------- parámetros
const DIR = path.resolve(process.cwd(), 'public/fotos');
const EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const MARGEN = 0.07; // 7% por lado -> el producto ocupa como máximo el 86%
const OCUPACION = 1 - MARGEN * 2; // 0.86
const LADO_MAX = 1000; // lienzo máximo
const UMBRAL_BORDE_CLARO = 235; // promedio de los 4 bordes para considerar fondo claro
const UMBRAL_BORDE_BLANCO = 245; // más estricto, para decidir si ya está bien
const TRIM_TOLERANCIA = 12; // tolerancia moderada del trim
const AREA_MINIMA_TRIM_DEF = 0.25; // si el recorte deja menos, se descarta
const TOLERANCIA_CUADRADO = 0.02; // ±2%
const MARGEN_MIN_OK = 0.05;
const MARGEN_MAX_OK = 0.10;
const CALIDAD = 86;

const argv = process.argv.slice(2);
const DRY_RUN = argv.includes('--dry-run');
const LIENZO_FIJO = argv.includes('--lienzo-fijo');
const PERMITIR_UPSCALE = argv.includes('--permitir-upscale');
const iLim = argv.indexOf('--limite');
const LIMITE = iLim >= 0 && argv[iLim + 1] ? parseInt(argv[iLim + 1], 10) : Infinity;
// Piezas muy chicas o muy finitas (resortes, retenes, juntas) dan un recorte
// legítimo con poca área. Con --area-minima se puede aflojar la protección.
const iArea = argv.indexOf('--area-minima');
const AREA_MINIMA_TRIM =
  iArea >= 0 && argv[iArea + 1] ? parseFloat(argv[iArea + 1]) : AREA_MINIMA_TRIM_DEF;

// ------------------------------------------------------------------ helpers
/** Promedio de una banda de píxeles del buffer raw (3 canales). */
function promedioBanda(data, width, height, x0, y0, x1, y1) {
  let suma = 0;
  let n = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * width + x) * 3;
      suma += data[i] + data[i + 1] + data[i + 2];
      n += 3;
    }
  }
  return n ? suma / n : 255;
}

/** Promedio de los 4 bordes (banda del 2% del lado menor, mínimo 2 px). */
function promediosDeBordes(data, width, height) {
  const banda = Math.max(2, Math.round(Math.min(width, height) * 0.02));
  const b = Math.min(banda, Math.floor(Math.min(width, height) / 2) || 1);
  return {
    arriba: promedioBanda(data, width, height, 0, 0, width, b),
    abajo: promedioBanda(data, width, height, 0, height - b, width, height),
    izq: promedioBanda(data, width, height, 0, 0, b, height),
    der: promedioBanda(data, width, height, width - b, 0, width, height),
  };
}

function minBorde(b) {
  return Math.min(b.arriba, b.abajo, b.izq, b.der);
}

/** Recorta el fondo blanco y devuelve {data, info} o null si no se pudo. */
async function recortar(data, width, height) {
  try {
    const r = await sharp(data, { raw: { width, height, channels: 3 } })
      .trim({ background: '#ffffff', threshold: TRIM_TOLERANCIA })
      .raw()
      .toBuffer({ resolveWithObject: true });
    if (!r.info.width || !r.info.height) return null;
    return r;
  } catch {
    // sharp tira error si la imagen queda en blanco / vacía
    return null;
  }
}

function codificar(pipeline, ext) {
  if (ext === '.png') return pipeline.png({ compressionLevel: 9 });
  if (ext === '.webp') return pipeline.webp({ quality: CALIDAD });
  return pipeline.jpeg({ quality: CALIDAD, chromaSubsampling: '4:4:4', mozjpeg: true });
}

// -------------------------------------------------------------------- main
const archivos = fs
  .readdirSync(DIR)
  .filter((f) => EXTS.has(path.extname(f).toLowerCase()))
  .sort();

const resumen = {
  total: archivos.length,
  procesadas: 0,
  salteadas: 0,
  errores: 0,
  recortadas: 0,
  sinRecorte: 0,
  recorteDescartado: 0,
  reducidas: 0,
  bytesAntes: 0,
  bytesDespues: 0,
};
const conError = [];
const dudosas = [];
const salteadas = [];

let n = 0;
for (const nombre of archivos) {
  if (n >= LIMITE) break;
  n++;
  const ruta = path.join(DIR, nombre);
  const ext = path.extname(nombre).toLowerCase();
  const bytesAntes = fs.statSync(ruta).size;
  resumen.bytesAntes += bytesAntes;

  try {
    // 1. abrir, orientar por EXIF, aplanar sobre blanco, pasar a raw RGB
    const base = sharp(ruta, { failOn: 'none' }).rotate();
    const meta = await base.metadata();
    const { data, info } = await base
      .flatten({ background: '#ffffff' })
      .toColourspace('srgb')
      .raw()
      .toBuffer({ resolveWithObject: true });

    const W = info.width;
    const H = info.height;
    if (info.channels !== 3) throw new Error(`canales inesperados: ${info.channels}`);

    const bordes = promediosDeBordes(data, W, H);
    const fondoClaro = minBorde(bordes) > UMBRAL_BORDE_CLARO;

    // 2. recorte (solo si el fondo es claro)
    let cont = { data, width: W, height: H };
    let recorte = null;
    if (fondoClaro) {
      const r = await recortar(data, W, H);
      if (r) {
        const area = (r.info.width * r.info.height) / (W * H);
        if (area >= AREA_MINIMA_TRIM) {
          cont = { data: r.data, width: r.info.width, height: r.info.height };
          recorte = { area, offX: -r.info.trimOffsetLeft, offY: -r.info.trimOffsetTop };
          resumen.recortadas++;
          if (area < 0.35) {
            dudosas.push(`${nombre} (recorte deja ${(area * 100).toFixed(0)}% del área)`);
          }
        } else {
          resumen.recorteDescartado++;
          dudosas.push(
            `${nombre} (recorte descartado: dejaba ${(area * 100).toFixed(0)}% del área)`
          );
        }
      } else {
        resumen.recorteDescartado++;
      }
    } else {
      resumen.sinRecorte++;
    }

    // 3. ¿ya cumple? cuadrada ±2%, fondo blanco y margen 5-10% en los 4 lados
    const relacion = W / H;
    const esCuadrada = Math.abs(relacion - 1) <= TOLERANCIA_CUADRADO;
    const blanca = minBorde(bordes) >= UMBRAL_BORDE_BLANCO;
    let margenesOk = false;
    if (recorte) {
      const mIzq = recorte.offX / W;
      const mArr = recorte.offY / H;
      const mDer = (W - recorte.offX - cont.width) / W;
      const mAba = (H - recorte.offY - cont.height) / H;
      margenesOk = [mIzq, mArr, mDer, mAba].every(
        (m) => m >= MARGEN_MIN_OK && m <= MARGEN_MAX_OK
      );
    }
    if (esCuadrada && blanca && margenesOk) {
      resumen.salteadas++;
      resumen.bytesDespues += bytesAntes;
      salteadas.push(nombre);
      continue;
    }

    // 4. lienzo cuadrado + escala (nunca agranda, salvo --permitir-upscale)
    const mayor = Math.max(cont.width, cont.height);
    let lado;
    if (LIENZO_FIJO) {
      lado = LADO_MAX;
    } else {
      lado = Math.min(LADO_MAX, Math.ceil(mayor / OCUPACION));
    }
    const disponible = Math.floor(lado * OCUPACION);
    let escala = disponible / mayor;
    if (escala > 1 && !PERMITIR_UPSCALE) escala = 1; // no upscaling

    let pieza = cont;
    if (escala < 1) {
      const nw = Math.max(1, Math.round(cont.width * escala));
      const nh = Math.max(1, Math.round(cont.height * escala));
      const r = await sharp(cont.data, {
        raw: { width: cont.width, height: cont.height, channels: 3 },
      })
        .resize(nw, nh, { fit: 'fill', kernel: 'lanczos3' })
        .raw()
        .toBuffer({ resolveWithObject: true });
      pieza = { data: r.data, width: r.info.width, height: r.info.height };
      resumen.reducidas++;
    } else if (escala > 1) {
      const nw = Math.max(1, Math.round(cont.width * escala));
      const nh = Math.max(1, Math.round(cont.height * escala));
      const r = await sharp(cont.data, {
        raw: { width: cont.width, height: cont.height, channels: 3 },
      })
        .resize(nw, nh, { fit: 'fill', kernel: 'lanczos3' })
        .raw()
        .toBuffer({ resolveWithObject: true });
      pieza = { data: r.data, width: r.info.width, height: r.info.height };
    }

    const left = Math.round((lado - pieza.width) / 2);
    const top = Math.round((lado - pieza.height) / 2);

    const salida = await codificar(
      sharp({
        create: { width: lado, height: lado, channels: 3, background: '#ffffff' },
      }).composite([
        {
          input: pieza.data,
          raw: { width: pieza.width, height: pieza.height, channels: 3 },
          left,
          top,
        },
      ]),
      ext
    ).toBuffer();

    resumen.bytesDespues += DRY_RUN ? bytesAntes : salida.length;
    resumen.procesadas++;

    if (!DRY_RUN) {
      // escritura atómica: archivo temporal + rename (nunca se borra el original
      // sin tener el reemplazo listo)
      const tmp = ruta + '.tmp-emparejar';
      fs.writeFileSync(tmp, salida);
      fs.renameSync(tmp, ruta);
    }

    if (n % 200 === 0) {
      process.stdout.write(`  ... ${n}/${archivos.length}\n`);
    }
    void meta;
  } catch (e) {
    resumen.errores++;
    resumen.bytesDespues += bytesAntes;
    conError.push(`${nombre}: ${e.message}`);
  }
}

// ------------------------------------------------------------------ resumen
const mb = (b) => (b / 1024 / 1024).toFixed(1) + ' MB';
console.log('');
console.log(DRY_RUN ? '=== SIMULACIÓN (--dry-run, no se escribió nada) ===' : '=== RESULTADO ===');
console.log(`Archivos mirados : ${n} de ${archivos.length}`);
console.log(`Procesadas       : ${resumen.procesadas}`);
console.log(`Salteadas (ya ok): ${resumen.salteadas}`);
console.log(`Con error        : ${resumen.errores}`);
console.log(`  recortadas               : ${resumen.recortadas}`);
console.log(`  sin recorte (fondo osc.) : ${resumen.sinRecorte}`);
console.log(`  recorte descartado       : ${resumen.recorteDescartado}`);
console.log(`  achicadas para entrar    : ${resumen.reducidas}`);
console.log(`Peso antes       : ${mb(resumen.bytesAntes)}`);
console.log(`Peso después     : ${mb(resumen.bytesDespues)}${DRY_RUN ? ' (estimado = antes)' : ''}`);

if (conError.length) {
  console.log(`\nErrores (${conError.length}) — se dejaron intactas:`);
  for (const e of conError.slice(0, 40)) console.log('  - ' + e);
  if (conError.length > 40) console.log(`  ... y ${conError.length - 40} más`);
}
if (dudosas.length) {
  console.log(`\nRecortes dudosos para revisar a ojo (${dudosas.length}):`);
  for (const d of dudosas.slice(0, 40)) console.log('  - ' + d);
  if (dudosas.length > 40) console.log(`  ... y ${dudosas.length - 40} más`);
}
if (salteadas.length) {
  console.log(`\nSalteadas: ${salteadas.slice(0, 15).join(', ')}${salteadas.length > 15 ? ' ...' : ''}`);
}
