import '../admin-extra.css';
import AdminHeader from '../AdminHeader';
import { getFamilias } from '../../../lib/catalogo';
import { leerAjustes } from '../../../lib/ajustes';
import { MODOS, TEMPORADAS, estadoTemporada, ordenarFamilias, esDeTemporada, FAMILIAS_INICIO } from '../../../lib/temporada';
import { usandoDB } from '../../../lib/db';
import { guardarTemporada } from '../configActions';

export const dynamic = 'force-dynamic';

const AYUDA = {
  auto: 'Césped de septiembre a abril, poda de mayo a agosto; agosto y abril son pretemporada.',
  cesped: 'Desmalezadoras, minitractores y césped al frente.',
  poda: 'Motosierras, arranque y poda al frente.',
  'pre-cesped': 'Preparar la web para la temporada de césped que viene.',
  'pre-poda': 'Preparar la web para la temporada de poda que viene.',
};

export default async function Temporada({ searchParams }) {
  const [ajustes, familias] = await Promise.all([leerAjustes(), getFamilias()]);
  const modo = ajustes.temporada || 'auto';
  const estado = estadoTemporada(modo);
  const orden = ordenarFamilias(familias, estado);
  const err = searchParams?.err;

  return (
    <>
      <AdminHeader activo="temporada" />
      <main className="adm">
        <div className="wrap">
          <h1>Temporada</h1>
          <p className="sub">
            Decide qué familias tienen protagonismo en la web. No oculta productos: sólo cambia el orden y los textos de temporada.
          </p>
          {searchParams?.ok ? <div className="ok-msg">Temporada guardada. La web ya muestra el nuevo orden.</div> : null}
          {err ? <div className="err-msg">{err === '1' ? 'Elegí una opción válida.' : err}</div> : null}
          {!usandoDB ? <div className="err-msg">Sin base de datos la temporada queda en automático (según la fecha).</div> : null}

          <section className="mcard">
            <h2>Ahora</h2>
            <div className="temp-estado">
              <span className="temp-chip">{TEMPORADAS[estado.actual].nombre}</span>
              {estado.pre ? <span className="temp-chip temp-chip--pre">Pretemporada: {TEMPORADAS[estado.pre].nombre.toLowerCase()}</span> : null}
            </div>
            <p className="mut">Protagonismo en la web: <strong>{estado.temporada.nombre}</strong>{modo === 'auto' ? ' (automático por fecha)' : ' (elegido a mano)'}.</p>

            <form action={guardarTemporada}>
              <div className="temp-modos" role="radiogroup" aria-label="Modo de temporada">
                {MODOS.map((m) => (
                  <label key={m.id} className="temp-modo">
                    <input type="radio" name="modo" value={m.id} defaultChecked={m.id === modo} />
                    <span>{m.nombre}<small>{AYUDA[m.id]}</small></span>
                  </label>
                ))}
              </div>
              <button type="submit" className="temp-guardar">Guardar temporada</button>
            </form>
          </section>

          <section className="mcard">
            <h2>Orden de &quot;Todo el catálogo por familia&quot;</h2>
            <p className="mut">
              Las tres primeras son fijas. Después van las de la temporada en foco (en negrita) y el resto por cantidad de productos.
              La navegación &quot;siguiente categoría&quot; del catálogo sigue este mismo orden.
            </p>
            <ol className="temp-orden">
              {orden.map((f) => (
                <li key={f.slug} className={esDeTemporada(f.slug, estado) && !FAMILIAS_INICIO.includes(f.slug) ? 'de-temporada' : undefined}>
                  {f.nombre} <span className="mut">({f.count})</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>
    </>
  );
}
