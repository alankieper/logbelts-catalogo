import CatalogoHeader from '../components/CatalogoHeader';
import ProductoCard from '../components/ProductoCard';
import Registrar from '../components/Registrar';
import NoEncontrado from '../components/NoEncontrado';
import { buscar } from '../../lib/catalogo';

export const dynamic = 'force-dynamic';

export function generateMetadata({ searchParams }) {
  const q = (searchParams?.q || '').toString();
  return { title: q ? `“${q}” — Catálogo Logbelts` : 'Búsqueda — Catálogo Logbelts' };
}

export default async function BuscarPage({ searchParams }) {
  const q = (searchParams?.q || '').toString().trim();
  const res = q ? await buscar(q, 300) : [];

  return (
    <>
      <CatalogoHeader q={q} />
      {q ? <Registrar tipo="busqueda" q={q} n={res.length} /> : null}
      <main className="cat">
        <div className="wrap">
          <nav className="crumb">
            <a href="/productos">Catálogo</a>
            <span className="sep">/</span>
            <span aria-current="page">Búsqueda</span>
          </nav>
          <h1 className="page">{q ? `Resultados para “${q}”` : 'Búsqueda'}</h1>
          <p className="lead">
            {q
              ? `${res.length.toLocaleString('es-AR')} ${res.length === 1 ? 'producto' : 'productos'}. Se busca por código Logbelts, código original, nombre, marca, modelo y descripción.`
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
                No se encontraron productos. Probá con parte del código (por ejemplo <b>5888</b>), con la marca,
                o buscá <a href="/maquinas">por máquina</a>.
              </div>
              <NoEncontrado q={q} />
            </>
          ) : null}
        </div>
      </main>
      <footer className="cat">
        <div className="wrap">Logbelts · Catálogo · versión de trabajo</div>
      </footer>
    </>
  );
}
