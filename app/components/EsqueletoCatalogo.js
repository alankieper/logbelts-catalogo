/*
 * Esqueletos (skeletons) de carga del catálogo: tienen la misma forma que la tarjeta
 * de producto nueva, así la página no salta cuando llegan los datos. La animación se
 * apaga con prefers-reduced-motion (ver .sk en app/globals.css).
 */

/** Una tarjeta de producto en gris. */
export function EsqueletoCard() {
  return (
    <div className="skcard" aria-hidden="true">
      <div className="sk skcard__img" />
      <div className="skcard__body">
        <div className="sk skcard__code" />
        <div className="sk skcard__nm" />
        <div className="sk skcard__nm2" />
        <div className="sk skcard__tags" />
        <div className="sk skcard__acts" />
      </div>
    </div>
  );
}

/** Grilla de tarjetas en gris, con el mismo alto y ancho de columna que .pgrid. */
export function EsqueletoGrilla({ n = 12 }) {
  return (
    <div className="pgrid">
      {Array.from({ length: n }, (_, i) => (
        <EsqueletoCard key={i} />
      ))}
    </div>
  );
}

/** Encabezado en gris: migas, título y bajada. */
export function EsqueletoEncabezado({ conLead = true }) {
  return (
    <>
      <div className="sk sk-crumb" aria-hidden="true" />
      <div className="sk sk-h1" aria-hidden="true" />
      {conLead ? <div className="sk sk-lead" aria-hidden="true" /> : null}
    </>
  );
}

/** Grilla de tarjetas de familia / subcategoría en gris (mismo alto que .tile--dib). */
export function EsqueletoTiles({ n = 8 }) {
  return (
    <div className="tiles tiles--dib">
      {Array.from({ length: n }, (_, i) => (
        <div className="sktile" key={i} aria-hidden="true">
          <div className="sk sktile__dib" />
          <div className="sk sktile__nm" />
          <div className="sk sktile__n" />
        </div>
      ))}
    </div>
  );
}

/** Columna de filtros en gris (sólo se ve en escritorio). */
export function EsqueletoFiltros() {
  return (
    <div className="skfilters" aria-hidden="true">
      <div className="sk" style={{ width: '45%' }} />
      <div className="sk" style={{ width: '85%' }} />
      <div className="sk" style={{ width: '70%' }} />
      <div className="sk" style={{ width: '78%' }} />
      <div className="sk" style={{ width: '60%' }} />
      <div className="sk" style={{ width: '82%' }} />
    </div>
  );
}
