import { notFound } from 'next/navigation';
import CatalogoHeader from '../../components/CatalogoHeader';
import ProductoCard from '../../components/ProductoCard';
import { getPorMarca, getFamilia } from '../../../lib/catalogo';

export const dynamic = 'force-dynamic';

export function generateMetadata({ params }) {
  const { nombre } = getPorMarca(params.marca);
  return { title: `Todo para ${nombre} — Catálogo Logbelts` };
}

export default function MarcaPage({ params }) {
  const { nombre, productos } = getPorMarca(params.marca);
  if (!productos.length) notFound();

  const porFam = {};
  for (const p of productos) (porFam[p.familiaSlug] = porFam[p.familiaSlug] || []).push(p);

  return (
    <>
      <CatalogoHeader />
      <main className="cat">
        <div className="wrap">
          <nav className="crumb">
            <a href="/">Inicio</a>
            <span className="sep">/</span>
            <span aria-current="page">Marca</span>
          </nav>
          <h1 className="page">Todo para {nombre}</h1>
          <p className="lead">
            {productos.length.toLocaleString('es-AR')} productos compatibles con {nombre}, en todas las categorías.
          </p>

          {Object.entries(porFam).map(([fslug, arr]) => {
            const fam = getFamilia(fslug);
            return (
              <div key={fslug} style={{ marginBottom: 34 }}>
                <h2 className="page" style={{ fontSize: '1.15rem', margin: '10px 0 12px' }}>
                  {fam ? fam.nombre : fslug}
                </h2>
                <div className="pgrid">
                  {arr
                    .slice()
                    .sort((a, b) => a.codigo.localeCompare(b.codigo))
                    .map((p) => (
                      <ProductoCard key={p.codigo} p={p} />
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <footer className="cat">
        <div className="wrap">Logbelts · Catálogo · versión de trabajo</div>
      </footer>
    </>
  );
}
