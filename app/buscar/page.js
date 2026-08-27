import CatalogoHeader from '../components/CatalogoHeader';
import ProductoCard from '../components/ProductoCard';
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
      <main className="cat">
        <div className="wrap">
          <nav className="crumb">
            <a href="/">Inicio</a>
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
            <div className="pgrid">
              {res.map((r) => (
                <ProductoCard key={r.p.codigo} p={r.p} motivo={r.motivo} />
              ))}
            </div>
          ) : q ? (
            <div className="empty">
              No se encontraron productos. Probá con parte del código (por ejemplo <b>5888</b>) o con la marca.
            </div>
          ) : null}
        </div>
      </main>
      <footer className="cat">
        <div className="wrap">Logbelts · Catálogo · versión de trabajo</div>
      </footer>
    </>
  );
}
