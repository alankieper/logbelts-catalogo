/**
 * Banner de marcas en movimiento (derecha -> izquierda).
 * Muestra todas las marcas para las que Logbelts tiene repuestos.
 * Animación 100% CSS (ver .marq* en globals.css). Se pausa al pasar el mouse
 * y se detiene si el usuario pidió "menos movimiento" en el sistema.
 */
export default function MarcasMarquee({ marcas = [] }) {
  if (!marcas.length) return null;
  // se repite la lista para que el loop sea continuo
  const fila = [...marcas, ...marcas];

  return (
    <section className="marq" aria-label="Marcas con las que trabajamos">
      <div className="marq-head">
        <span className="marq-kick">Trabajamos repuestos de</span>
        <span className="marq-n">{marcas.length} marcas</span>
      </div>
      <div className="marq-mask">
        <ul className="marq-track">
          {fila.map((m, i) => (
            <li key={m.slug + '-' + i} aria-hidden={i >= marcas.length ? 'true' : undefined}>
              <a href={`/m/${m.slug}`} className="marq-chip" tabIndex={i >= marcas.length ? -1 : 0}>
                <span className="marq-name">{m.nombre}</span>
                <span className="marq-c">{m.count}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
