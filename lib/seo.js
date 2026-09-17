// El catálogo se hace visible en Google sólo cuando SITIO_PUBLICO=1.
// Mientras esté en "versión de trabajo", queda con noindex y robots bloqueado.
export const SITIO_PUBLICO = process.env.SITIO_PUBLICO === '1';

// Dominio del deploy. Se define con NEXT_PUBLIC_SITE_URL; el valor de abajo es sólo
// el respaldo del deploy actual (no es identidad de marca: eso vive en lib/marca.js).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://logbelts-catalogo.vercel.app').replace(/\/$/, '');

// robots para el metadata de cada página
export const robotsMeta = SITIO_PUBLICO
  ? { index: true, follow: true }
  : { index: false, follow: false, nocache: true };
