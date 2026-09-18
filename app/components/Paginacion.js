import { numerosDePagina } from '../../lib/paginar';
import '../navegacion-catalogo.css';

const Flecha = ({ izq }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={izq ? 'M19 12H5M11 18l-6-6 6-6' : 'M5 12h14M13 6l6 6-6 6'} />
  </svg>
);

/**
 * Paginación: Anterior | 1 2 3 … | Siguiente. Los links llevan #productos para que,
 * al cambiar de página, la vista quede al principio de la grilla (no arriba de todo).
 * `href(n)` arma la URL de la página n manteniendo filtros y orden.
 */
export default function Paginacion({ pagina, paginas, href }) {
  if (paginas <= 1) return null;
  const link = (n) => `${href(n)}#productos`;
  return (
    <nav className="paginacion" aria-label="Páginas de productos">
      {pagina > 1 ? (
        <a className="paginacion__paso" href={link(pagina - 1)} rel="prev"><Flecha izq /> Anterior</a>
      ) : (
        <span className="paginacion__paso" aria-disabled="true"><Flecha izq /> Anterior</span>
      )}
      <ol className="paginacion__nums">
        {numerosDePagina(pagina, paginas).map((n, i) => (
          <li key={n ?? `x${i}`}>
            {n === null ? (
              <span className="paginacion__puntos" aria-hidden="true">…</span>
            ) : n === pagina ? (
              <span className="paginacion__num" aria-current="page" aria-label={`Página ${n}, actual`}>{n}</span>
            ) : (
              <a className="paginacion__num" href={link(n)} aria-label={`Página ${n}`}>{n}</a>
            )}
          </li>
        ))}
      </ol>
      {pagina < paginas ? (
        <a className="paginacion__paso" href={link(pagina + 1)} rel="next">Siguiente <Flecha /></a>
      ) : (
        <span className="paginacion__paso" aria-disabled="true">Siguiente <Flecha /></span>
      )}
    </nav>
  );
}
