import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MARCA, modulo } from '../../../lib/marca';
import { leerDistribuidores } from '../../../lib/distribuidores';
import { PROVINCIAS } from '../../../lib/provincias';
import { waLink } from '../../../lib/telefono';
import { MAPA_ALTO, MAPA_ANCHO, RUTAS_DIVISIONES, RUTA_ARGENTINA, proyectar } from '../../admin/metricas/mapaArgentina';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dónde comprar',
  description: `Comercios y talleres que venden repuestos ${MARCA.nombre} para bosque y jardín en todo el país.`,
};

export default async function DondeComprar({ searchParams }) {
  if (!modulo('distribuidores')) notFound();

  const todos = await leerDistribuidores();
  const provincia = PROVINCIAS.includes(searchParams?.provincia) ? searchParams.provincia : '';
  const visibles = provincia ? todos.filter(d => d.provincia === provincia) : todos;
  const provinciasConDistribuidores = PROVINCIAS.filter(p => todos.some(d => d.provincia === p));

  const porProvincia = new Map();
  for (const d of visibles) {
    const clave = d.provincia || 'Otras';
    if (!porProvincia.has(clave)) porProvincia.set(clave, []);
    porProvincia.get(clave).push(d);
  }

  return (
    <>
      <section className="cabecera oscuro">
        <div className="contenedor">
          <p className="antetitulo">Red de distribuidores</p>
          <h1 className="titulo-seccion">Dónde comprar {MARCA.nombre}</h1>
          <p>Vendemos únicamente por mayor. Si buscás repuestos para tu máquina, acercate a uno de estos comercios.</p>
        </div>
      </section>

      <section className="seccion seccion--suelo">
        <div className="contenedor">
          {todos.length ? (
            <div className="mapa-dist">
              <div className="mapa-dist__mapa">
                <svg viewBox={`-6 -6 ${MAPA_ANCHO + 12} ${MAPA_ALTO + 12}`} role="img" aria-label={`Mapa de Argentina con ${visibles.length} distribuidores`}>
                  <path d={RUTA_ARGENTINA} className="mapa-dist__pais" />
                  {RUTAS_DIVISIONES.map((d, i) => <path key={i} d={d} className="mapa-dist__division" />)}
                  {visibles.filter(d => d.coord).map(d => {
                    const [x, y] = proyectar(d.coord);
                    return (
                      <circle key={d.id} cx={x} cy={y} r="3.2" className="mapa-dist__pin">
                        <title>{`${d.nombre} · ${[d.localidad, d.provincia].filter(Boolean).join(', ')}`}</title>
                      </circle>
                    );
                  })}
                </svg>
              </div>

              <div>
                <nav className="chips-provincias" aria-label="Filtrar por provincia">
                  <Link href="/donde-comprar" aria-current={!provincia ? 'page' : undefined}>Todas</Link>
                  {provinciasConDistribuidores.map(p => (
                    <Link key={p} href={`/donde-comprar?provincia=${encodeURIComponent(p)}`} aria-current={provincia === p ? 'page' : undefined}>{p}</Link>
                  ))}
                </nav>

                {[...porProvincia.entries()].map(([prov, lista]) => (
                  <div key={prov} className="dist-grupo">
                    <h2>{prov}</h2>
                    <ul>
                      {lista.map(d => {
                        const wa = waLink(d.whatsapp || d.telefono, `Hola, los encontré en la web de ${MARCA.nombre}.`);
                        return (
                          <li key={d.id} className="dist-item">
                            <div>
                              <strong>{d.nombre}</strong>
                              <span>{[d.direccion, d.localidad].filter(Boolean).join(' · ')}</span>
                            </div>
                            <div className="dist-item__acc">
                              {d.telefono ? <a href={`tel:${d.telefono.replace(/[^\d+]/g, '')}`}>Llamar</a> : null}
                              {wa ? <a href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a> : null}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="vacio-sitio">
              <h2 className="display">Estamos armando el mapa</h2>
              <p>Muy pronto vas a poder encontrar acá los comercios que venden {MARCA.nombre} en tu zona.</p>
              <div className="hero__acciones" style={{ justifyContent: 'center' }}>
                <Link className="boton" href="/contacto">¿Tenés un comercio? Sumate</Link>
              </div>
            </div>
          )}

          <p className="nota-sitio">¿Sos distribuidor y querés aparecer en el mapa? <Link href="/contacto">Avisale a tu vendedor</Link>.</p>
        </div>
      </section>
    </>
  );
}
