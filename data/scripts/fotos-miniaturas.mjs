/**
 * Genera una versión liviana de cada foto de producto para los LISTADOS.
 *
 * Por qué: en una grilla del catálogo se cargan 20 o 30 fotos de una.
 * La foto original mide 974 px y pesa ~33 KB; en la grilla se ve a 200 px,
 * así que se descarga muchísimo más de lo que se ve. La miniatura mide 400 px
 * en formato WebP y pesa ~5 KB: la misma pantalla pasa de ~800 KB a ~130 KB.
 *
 * La foto grande de la ficha de producto NO se toca: ahí se ve grande y se usa el zoom.
 *
 * Cómo se usa (después de agregar fotos nuevas a public/fotos):
 *   node data/scripts/fotos-miniaturas.mjs
 *
 * Resultado:
 *   public/fotos/m/<nombre>.webp   las miniaturas
 *   data/fotos-mini.json           la lista de cuáles tienen miniatura
 *
 * Es seguro correrlo muchas veces: salta las que ya están hechas.
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ORIGEN = path.join(process.cwd(), 'public', 'fotos');
const DESTINO = path.join(ORIGEN, 'm');
const LISTA = path.join(process.cwd(), 'data', 'fotos-mini.json');

const ANCHO = 400;
const CALIDAD = 78;

fs.mkdirSync(DESTINO, { recursive: true });

const fotos = fs
  .readdirSync(ORIGEN)
  .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
  .sort();

const hechas = [];
let nuevas = 0;
let saltadas = 0;
let fallas = 0;

for (const archivo of fotos) {
  const salida = path.join(DESTINO, archivo.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
  if (fs.existsSync(salida)) {
    hechas.push(archivo);
    saltadas++;
    continue;
  }
  try {
    await sharp(path.join(ORIGEN, archivo))
      .resize(ANCHO, ANCHO, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: CALIDAD })
      .toFile(salida);
    hechas.push(archivo);
    nuevas++;
    if (nuevas % 200 === 0) console.log('  ' + nuevas + ' nuevas...');
  } catch (e) {
    fallas++;
    console.log('  falló ' + archivo + ': ' + e.message);
  }
}

fs.writeFileSync(LISTA, JSON.stringify(hechas.sort()), 'utf8');

const peso = (dir, filtro) =>
  fs
    .readdirSync(dir)
    .filter(filtro)
    .reduce((t, f) => t + fs.statSync(path.join(dir, f)).size, 0);

const mb = (b) => (b / 1048576).toFixed(1) + ' MB';

console.log('');
console.log('Miniaturas nuevas:   ' + nuevas);
console.log('Ya estaban:          ' + saltadas);
if (fallas) console.log('Fallaron:            ' + fallas);
console.log('Total con miniatura: ' + hechas.length + ' de ' + fotos.length);
console.log('Peso originales:     ' + mb(peso(ORIGEN, (f) => /\.(jpg|jpeg|png)$/i.test(f))));
console.log('Peso miniaturas:     ' + mb(peso(DESTINO, (f) => /\.webp$/i.test(f))));
