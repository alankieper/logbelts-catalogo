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
export function logosClaros() {
  try {
    return new Set(JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "marcas-logos-claros.json"), "utf8")));
  } catch {
    return new Set();
  }
}

export function logosMarcas() {
  const logos = {};
  try {
    for (const archivo of fs.readdirSync(path.join(process.cwd(), 'public', 'marcas'))) {
      const m = archivo.match(/^(.+)\.(svg|png|webp|jpe?g)$/i);
      if (m) logos[m[1].toLowerCase()] = `/marcas/${archivo}`;
    }
  } catch { /* carpeta todavía vacía */ }
  return logos;
}
