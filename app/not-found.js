import CatalogoHeader from './components/CatalogoHeader';
import CatalogoPie from './components/CatalogoPie';
import { MARCA } from '../lib/marca';

/**
 * Página que se ve cuando alguien abre una dirección que no existe: un código de producto
 * mal tipeado, un link viejo o un enlace roto de otra web.
 *
 * Antes salía el cartel en inglés de Next.js ("This page could not be found"). Ahora sale
 * la web de siempre, en castellano, con los caminos para seguir buscando.
 */
export const metadata = {
  title: 'No encontramos esa página',
  robots: { index: false, follow: true },
};

const SALIDAS = [
  { href: '/#catalogo', titulo: 'Ver el catálogo', detalle: 'Todos los repuestos por familia' },
  { href: '/maquinas', titulo: `Buscar por ${MARCA.maquinas.singular}`, detalle: 'Marca y modelo de la máquina' },
  { href: '/despiece', titulo: 'Despieces', detalle: 'Ubicá la pieza en el dibujo' },
  { href: '/contacto', titulo: 'Escribirnos', detalle: 'Te ayudamos a encontrarlo' },
];

export default function NoEncontrada() {
  return (
    <>
      <CatalogoHeader />
      <main className="cat">
        <div className="wrap">
          <p className="eyebrow">Error 404</p>
          <h1 className="page">No encontramos esa página</h1>
          <p className="lead">
            Puede que el enlace esté viejo o que el código tenga algún error de tipeo. El buscador de
            arriba encuentra por código {MARCA.nombre}, por código original y por nombre de repuesto.
          </p>
          <div className="nf-salidas">
            {SALIDAS.map((s) => (
              <a key={s.href} className="nf-salida" href={s.href}>
                <span className="nf-salida__t">{s.titulo}</span>
                <span className="nf-salida__d">{s.detalle}</span>
              </a>
            ))}
          </div>
        </div>
      </main>
      <CatalogoPie />
    </>
  );
}
