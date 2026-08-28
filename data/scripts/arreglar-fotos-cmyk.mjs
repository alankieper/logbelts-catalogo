/**
 * Las fotos extraídas del PDF vienen en JPEG CMYK invertido (estilo Adobe):
 * el navegador las muestra casi negras / "en negativo".
 * Este script las reconvierte a JPEG RGB (sRGB) normal.
 *
 * - Sólo toca los JPEG de 4 canales (CMYK). Los de 3 canales (RGB) se dejan igual.
 * - Conserva nombre y dimensiones.
 * - Procesa data/fotos y public/fotos.
 *
 * Uso:  node data/scripts/arreglar-fotos-cmyk.mjs [--apply]
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const APPLY = process.argv.includes('--apply');
const DIRS = ['public/fotos', 'data/fotos'];

function esCMYK(buf) {
  // recorre los marcadores JPEG buscando SOF y contando componentes
  let i = 2;
  while (i < buf.length - 1) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    i += 2;
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (i + 1 >= buf.length) break;
    const len = buf.readUInt16BE(i);
    const isSOF = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isSOF) return buf[i + 7] === 4;
    if (marker === 0xda) break;
    i += len;
  }
  return false;
}

(async () => {
  let cmyk = 0, rgb = 0, err = 0;
  for (const dir of DIRS) {
    if (!fs.existsSync(dir)) { console.log('(no existe)', dir); continue; }
    const files = fs.readdirSync(dir).filter((f) => /\.jpe?g$/i.test(f));
    let dCmyk = 0, dRgb = 0;
    for (const f of files) {
      const p = path.join(dir, f);
      const buf = fs.readFileSync(p);
      if (!esCMYK(buf)) { dRgb++; continue; }
      dCmyk++;
      if (APPLY) {
        try {
          const out = await sharp(buf)
            .negate()                       // deshace la inversión CMYK de Adobe
            .toColourspace('srgb')
            .jpeg({ quality: 86, chromaSubsampling: '4:4:4' })
            .toBuffer();
          fs.writeFileSync(p, out);
        } catch (e) {
          err++;
          console.log('  ERROR', p, e.message);
        }
      }
    }
    console.log(`${dir}: ${files.length} jpg  |  CMYK ${dCmyk}  |  RGB ${dRgb}`);
    cmyk += dCmyk; rgb += dRgb;
  }
  console.log(APPLY ? `\nConvertidas ${cmyk} (errores: ${err}). RGB intactas: ${rgb}.` : '\nSimulación. Usar --apply para reconvertir.');
})().catch((e) => { console.error(e); process.exit(1); });
