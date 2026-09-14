/* eslint-disable @next/next/no-img-element */

/** Cinta en movimiento con las marcas del catálogo; cada una lleva a sus repuestos (/m/<marca>). */
export default function CintaMarcas({ marcas }) {
  if (!marcas.length) return null;

  const lista = (copia) => (
    <ul className="marcas__lista" aria-hidden={copia || undefined}>
      {marcas.map((m) => (
        <li key={m.slug}>
          <a className={m.logo ? 'marca marca--logo' : 'marca'} href={`/m/${m.slug}`} tabIndex={copia ? -1 : undefined} aria-label={m.logo ? `Repuestos para ${m.nombre}` : undefined}>
            {m.logo ? <img className="marca__logo" src={m.logo} alt={m.nombre} loading="lazy" /> : <span className="marca__nombre">{m.nombre}</span>}
            <span className="marca__n">{m.count.toLocaleString('es-AR')} repuestos</span>
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <section className="marcas" aria-labelledby="marcas-titulo">
      <div className="contenedor marcas__cabeza">
        <p id="marcas-titulo">Repuestos compatibles con estas marcas</p>
        <a href="/productos">Ver catálogo →</a>
      </div>
      <div className="marcas__ventana">
        <div className="marcas__pista" style={{ '--duracion': `${Math.max(30, marcas.length * 3)}s` }}>
          {lista(false)}
          {lista(true)}
        </div>
      </div>
    </section>
  );
}
