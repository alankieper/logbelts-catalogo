import fs from 'fs';
import path from 'path';

/**
 * Logos de marcas para la cinta de la portada. Subir el archivo a public/marcas/<slug>.<svg|png|webp>
 * (ej: public/marcas/stihl.svg) y aparece solo; sin archivo se muestra el nombre de la marca.
 * Los logos actuales salen de Wikimedia Commons (dominio público); ver public/marcas/FUENTES.md.
 */
export function logosMarcas() {
  const logos = {};
  try {
    for (const archivo of fs.readdirSync(path.join(process.cwd(), 'public', 'marcas'))) {
      const m = archivo.match(/^(.+)\.(svg|png|webp)$/i);
      if (m) logos[m[1].toLowerCase()] = `/marcas/${archivo}`;
    }
  } catch { /* carpeta todavía vacía */ }
  return logos;
}
