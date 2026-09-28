import { notFound } from 'next/navigation';
import CatalogoHeader from '../../components/CatalogoHeader';
import CatalogoPie from '../../components/CatalogoPie';
import ProductoCard from '../../components/ProductoCard';
import Paginacion from '../../components/Paginacion';
import { getPorMarca, getFamiliasOrdenadas } from '../../../lib/catalogo';
import { paginar } from '../../../lib/paginar';
import { MARCA } from '../../../lib/marca';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { nombre, productos } = await getPorMarca(params.marca);
  // Marca inventada o sin repuestos: no tiene que quedar en Google.
  if (!productos.length) return { title: 'Marca no encontrada', robots: { index: false, follow: true } };
  return { title: `Todo para ${nombre} — Catálogo ${MARCA.nombre}` };
}

export default async function MarcaPage({ params, searchParams }) {
  const { nombre, productos } = await getPorMarca(params.marca);
  if (!productos.length) notFound();
  const familias = await getFamiliasOrdenadas();
  const nombreFam = (slug) => familias.find((f) => f.slug === slug)?.nombre || slug;
  const ordenFam = new Map(familias.map((f, i) => [f.slug, i]));

  // Todas las familias en el orden del catálogo, y dentro de cada una por código; se muestra de a 24
  const ordenados = productos.slice().sort((a, b) =>
    (ordenFam.get(a.familiaSlug) ?? 99) - (ordenFam.get(b.familiaSlug) ?? 99) || a.codigo.localeCompare(b.codigo));
  const pag = paginar(ordenados, searchParams?.pagina);
  const porFam = {};
  for (const p of pag.items) (porFam[p.familiaSlug] = porFam[p.familiaSlug] || []).push(p);
  const base = `/m/${params.marca}`;

  return (
    <>
      <CatalogoHeader />
      <main className="cat">
        <div className="wrap">
          <nav className="crumb">
            <a href="/#catalogo">Catálogo</a>
            <span className="sep">/</span>
            <span aria-current="page">Marca</span>
          </nav>
          <h1 className="page">Todo para {nombre}</h1>
          <p className="lead">
            {productos.length.toLocaleString('es-AR')} productos compatibles con {nombre}, en todas las categorías.
            {pag.paginas > 1 ? ` Mostrando ${pag.desde}–${pag.hasta} (página ${pag.pagina} de ${pag.paginas}).` : ''}
          </p>
          <div id="productos" />

          {Object.entries(porFam).map(([fslug, arr]) => {
            return (
              <div key={fslug} style={{ marginBottom: 34 }}>
                <h2 className="sec">{nombreFam(fslug)}</h2>
                <div className="pgrid">
                  {arr.map((p) => (
                    <ProductoCard key={p.codigo} p={p} />
                  ))}
                </div>
              </div>
            );
          })}

          <Paginacion pagina={pag.pagina} paginas={pag.paginas} href={(n) => (n > 1 ? `${base}?pagina=${n}` : base)} />
        </div>
      </main>
      <CatalogoPie />
    </>
  );
}
