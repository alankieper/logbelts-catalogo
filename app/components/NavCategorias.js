import '../navegacion-catalogo.css';

const Flecha = ({ izq }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={izq ? 'M19 12H5M11 18l-6-6 6-6' : 'M5 12h14M13 6l6 6-6 6'} />
  </svg>
);

/**
 * Recorrer el catálogo sin volver al menú: categoría anterior y siguiente
 * (ver getNavegacionCategorias en lib/catalogo). variante="barra" va arriba, compacta;
 * variante="final" va al terminar la última página, con "Ir a la siguiente categoría →" destacado.
 */
export default function NavCategorias({ anterior, siguiente, variante = 'barra', tipo = 'categoría' }) {
  if (!anterior && !siguiente) return null;
  const detalle = (x) => (x.familia && x.familia !== x.nombre ? x.familia : null);

  if (variante === 'final') {
    return (
      <nav className="navcat-final" aria-label="Seguir recorriendo el catálogo">
        {siguiente ? (
          <a className="navcat-final__sig" href={siguiente.href}>
            <span className="navcat-final__k">Terminaste esta {tipo}</span>
            <span className="navcat-final__t">Ir a la siguiente {tipo} <Flecha /></span>
            <span className="navcat-final__n">{siguiente.nombre}{detalle(siguiente) ? ` · ${detalle(siguiente)}` : ''}</span>
          </a>
        ) : (
          <a className="navcat-final__sig" href="/#catalogo">
            <span className="navcat-final__k">Llegaste al final del catálogo</span>
            <span className="navcat-final__t">Volver a todas las familias <Flecha /></span>
          </a>
        )}
        {anterior ? (
          <a className="navcat-final__ant" href={anterior.href}><Flecha izq /> Volver a {anterior.nombre}</a>
        ) : null}
      </nav>
    );
  }

  return (
    <nav className="navcat" aria-label={tipo === 'familia' ? 'Familia anterior y siguiente' : 'Categoría anterior y siguiente'}>
      {anterior ? (
        <a className="navcat__lnk" href={anterior.href} rel="prev">
          <Flecha izq />
          <span><small>Anterior {tipo}</small>{anterior.nombre}</span>
        </a>
      ) : <span />}
      {siguiente ? (
        <a className="navcat__lnk navcat__lnk--sig" href={siguiente.href} rel="next">
          <span><small>Siguiente {tipo}</small>{siguiente.nombre}</span>
          <Flecha />
        </a>
      ) : null}
    </nav>
  );
}
