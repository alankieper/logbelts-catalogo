import { LINEAS } from './sitio';
import { leerAjustes, guardarAjustes } from './ajustes';

/**
 * Imágenes de producto del generador de placas (/material) y de la sección de descargas.
 * Se editan desde /admin/material y se guardan en cat_config.ajustes.material.fotos.
 * Si nunca se editaron (o no hay base de datos), se usan estas por defecto.
 */
export const FOTOS_MATERIAL_DEFECTO = [
  { src: '/img/recorte-minitractor.webp', nombre: 'Minitractor (sin fondo)' },
  { src: '/img/recorte-motosierra.webp', nombre: 'Motosierra (sin fondo)' },
  { src: '/img/recorte-desmalezadora.webp', nombre: 'Desmalezadora (sin fondo)' },
  { src: '/img/recorte-cortacesped.webp', nombre: 'Cortacésped (sin fondo)' },
  ...LINEAS.map((l) => ({ src: l.img, nombre: l.titulo })),
];

export async function fotosMaterial() {
  const { material } = await leerAjustes();
  const fotos = Array.isArray(material?.fotos) ? material.fotos.filter((f) => f && f.src) : null;
  return fotos && fotos.length ? fotos : FOTOS_MATERIAL_DEFECTO;
}

export async function guardarFotosMaterial(fotos) {
  const limpias = (fotos || [])
    .filter((f) => f && typeof f.src === 'string' && f.src.trim())
    .map((f) => ({ src: f.src.trim(), nombre: String(f.nombre || '').trim().slice(0, 60) || 'Producto' }))
    .slice(0, 60);
  const { material } = await leerAjustes();
  return guardarAjustes({ material: { ...(material || {}), fotos: limpias } });
}
