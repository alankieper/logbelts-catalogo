import CatalogoHeader from '../components/CatalogoHeader';
import CatalogoPie from '../components/CatalogoPie';
import ProductoCard from '../components/ProductoCard';
import Registrar from '../components/Registrar';
import NoEncontrado from '../components/NoEncontrado';
import { buscar } from '../../lib/catalogo';
import { MARCA, modulo } from '../../lib/marca';

export const dynamic = 'force-dynamic';

export function generateMetadata({ searchParams }) {
  const q = (searchParams?.q || '').toString();
  return { title: q ? `“${q}” — Catálogo ${MARCA.nombre}` : `Búsqueda — Catálogo ${MARCA.nombre}` };
}

export default async function BuscarPage({ searchParams }) {
  const q = (searchParams?.q || '').toString().trim();
  const res = q ? await buscar(q, 300) : [];
  // Primer ejemplo de código del archivo de marca (ej: "5888"), para la ayuda de "sin resultados".
  const ejemploCodigo = (MARCA.codigo.ejemplos || '').split('·')[0].trim();

  return (
    <>
      <CatalogoHeader q={q} />
      {q ? <Registrar tipo="busqueda" q={q} n={res.length} /> : null}
      <main className="cat">
        <div className="wrap">
          <nav className="crumb">
            <a href="/#catalogo">Catálogo</a>
            <span className="sep">/</span>
            <span aria-current="page">Búsqueda</span>
          </nav>
          <h1 className="page">{q ? `Resultados para “${q}”` : 'Búsqueda'}</h1>
          <p className="lead">
            {q
              ? `${res.length.toLocaleString('es-AR')} ${res.length === 1 ? 'producto' : 'productos'}. Se busca por ${MARCA.codigo.etiqueta.toLowerCase()}, código original, nombre, marca, modelo y descripción.`
              : 'Escribí un código, un código original del fabricante, o una marca y modelo.'}
          </p>

          {q && res.length ? (
            <>
              <div className="pgrid">
                {res.map((r) => (
                  <ProductoCard key={r.p.codigo} p={r.p} motivo={r.motivo} />
                ))}
              </div>
              <details className="solicitud-mini">
                <summary>¿No es el repuesto exacto que buscás? Pedilo y te lo buscamos →</summary>
                <NoEncontrado q={q} />
              </details>
            </>
          ) : q ? (
            <>
              <div className="empty">
                No se encontraron productos. Probá con parte del código{ejemploCodigo ? <> (por ejemplo <b>{ejemploCodigo}</b>)</> : null}, con la marca
                {modulo('maquinas') ? <>, o buscá <a href="/maquinas">por {MARCA.maquinas.singular}</a></> : null}.
              </div>
              <NoEncontrado q={q} />
            </>
          ) : null}
        </div>
      </main>
      <CatalogoPie />
    </>
  );
}
