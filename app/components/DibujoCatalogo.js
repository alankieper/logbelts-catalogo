/*
 * Dibujos de línea del catálogo: son los mismos de la sección "¿Qué pieza necesitás?"
 * de la portada (app/components/sitio/LineasRepuestos.js). Acá se usan como marca de agua
 * del encabezado, como ilustración de las tarjetas de familia/subcategoría y como
 * reemplazo del gris vacío en los productos sin foto. Siempre decorativos (aria-hidden).
 */
import DibujoVisible from './DibujoVisible';
import { dibujoFamilia, Universal } from './sitio/LineasRepuestos';
import { modulo } from '../../lib/marca';

/**
 * ¿Está prendido el módulo de dibujos? Las páginas lo usan para elegir las clases
 * (tarjeta con dibujo grande o tarjeta compacta con ícono, como antes).
 */
export const hayDibujos = () => modulo('dibujos');

/** Elige el dibujo más específico: primero por el nombre propio, si no por el de la familia. */
export function elegirDibujo(...nombres) {
  for (const n of nombres) {
    if (!n) continue;
    const D = dibujoFamilia(n);
    if (D !== Universal) return D;
  }
  return Universal;
}

/** Marca de agua grande y tenue, del lado derecho del encabezado de familia o subcategoría. */
export function MarcaDeAgua({ nombre, familia }) {
  if (!modulo('dibujos')) return null;
  const D = elegirDibujo(nombre, familia);
  return (
    <DibujoVisible className="pghead__dib" aria-hidden="true">
      <D />
    </DibujoVisible>
  );
}

/** Dibujo grande de una tarjeta de familia / subcategoría (mismo aire que las tarjetas .tipo). */
export function DibujoTile({ nombre, familia }) {
  if (!modulo('dibujos')) return null;
  const D = elegirDibujo(nombre, familia);
  return (
    <DibujoVisible as="span" className="tdib" aria-hidden="true">
      <D />
    </DibujoVisible>
  );
}

/** Dibujo tenue y centrado para un producto sin foto (sin animación: hay muchos por grilla). */
export function DibujoSinFoto({ subcategoria, familia }) {
  if (!modulo('dibujos')) return null;
  const D = elegirDibujo(subcategoria, familia);
  return (
    <span className="noimg__dib" aria-hidden="true">
      <D />
    </span>
  );
}
