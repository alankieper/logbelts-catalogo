import fs from 'fs';
import path from 'path';

/**
 * Logos de marcas para la cinta de la portada. Subir el archivo a public/marcas/<slug>.<svg|png|webp>
 * (ej: public/marcas/stihl.svg) y aparece solo; sin archivo se muestra el nombre de la marca.
 * Los logos actuales salen de Wikimedia Commons (dominio público); ver public/marcas/FUENTES.md.
 */
/**
 * Marcas cuyo logo es claro y viene recortado (sin fondo propio): necesitan placa oscura para verse.
 * La lista se calcula midiendo el brillo de cada archivo (ver data/marcas-logos-claros.json).
 */
/**
 * Los archivos de logos no cambian mientras la web está publicada: se agregan y recién se ven
 * al publicar de nuevo. Por eso se leen del disco UNA sola vez y después se reutiliza el
 * resultado, en vez de recorrer la carpeta en cada visita a la portada.
 */
let _claros = null;
let _logos = null;

export function logosClaros() {
  if (_claros) return _claros;
  try {
    _claros = new Set(JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'marcas-logos-claros.json'), 'utf8')));
  } catch {
    _claros = new Set();
  }
  return _claros;
}

export function logosMarcas() {
  if (_logos) return _logos;
  const logos = {};
  try {
    for (const archivo of fs.readdirSync(path.join(process.cwd(), 'public', 'marcas'))) {
      const m = archivo.match(/^(.+)\.(svg|png|webp|jpe?g)$/i);
      if (m) logos[m[1].toLowerCase()] = `/marcas/${archivo}`;
    }
  } catch { /* carpeta todavía vacía */ }
  _logos = logos;
  return _logos;
}
