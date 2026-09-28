import { notFound } from 'next/navigation';
import CatalogoHeader from '../../../components/CatalogoHeader';
import CatalogoPie from '../../../components/CatalogoPie';
import ListadoProductos from '../../../components/ListadoProductos';
import NavCategorias from '../../../components/NavCategorias';
import { MarcaDeAgua } from '../../../components/DibujoCatalogo';
import { getFamilia, getProductosDeSubcategoria, getNavegacionCategorias } from '../../../../lib/catalogo';
import { MARCA } from '../../../../lib/marca';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const fam = await getFamilia(params.familia);
  const sub = fam?.subcats.find((s) => s.slug === params.sub);
  if (!sub) return { title: 'Categoría no encontrada', robots: { index: false, follow: true } };
  const n = (await getProductosDeSubcategoria(fam.slug, sub.slug)).length;
  const title = `${sub.nombre} para ${fam.nombre.toLowerCase()}`;
  const description = `${n} repuestos ${MARCA.nombre} de ${sub.nombre.toLowerCase()} para ${fam.nombre.toLowerCase()}. Buscá por código, código original o marca. Venta mayorista.`;
  return { title, description, openGraph: { title: `${title} · ${MARCA.nombre}`, description, images: ['/opengraph-image.png'] } };
}

export default async function SubcategoriaPage({ params, searchParams }) {
  const fam = await getFamilia(params.familia);
  if (!fam) notFound();
  const sub = fam.subcats.find((s) => s.slug === params.sub);
  if (!sub) notFound();

  const [todos, nav] = await Promise.all([
    getProductosDeSubcategoria(fam.slug, sub.slug),
    getNavegacionCategorias(fam.slug, sub.slug),
  ]);

  // Chips: "Ver todo en [familia]" primero y después las subcategorías hermanas
  const categorias = [
    { href: `/f/${fam.slug}/todo`, nombre: `Ver todo en ${fam.nombre}`, on: false },
    ...fam.subcats.map((s) => ({ href: `/c/${fam.slug}/${s.slug}`, nombre: s.nombre, on: s.slug === sub.slug })),
  ];

  return (
    <>
      <CatalogoHeader />
      <main className="cat">
        <div className="wrap">
          <div className="pghead">
            <nav className="crumb">
              <a href="/#catalogo">Catálogo</a>
              <span className="sep">/</span>
              <a href={`/f/${fam.slug}`}>{fam.nombre}</a>
              <span className="sep">/</span>
              <span aria-current="page">{sub.nombre}</span>
            </nav>
            <h1 className="page">{sub.nombre}</h1>
            <p className="lead">
              {todos.length.toLocaleString('es-AR')} repuestos de {sub.nombre.toLowerCase()} para {fam.nombre.toLowerCase()}.{' '}
              <a className="lead-todo" href={`/f/${fam.slug}/todo`}>Ver todo en {fam.nombre} →</a>
            </p>
            <MarcaDeAgua nombre={sub.nombre} familia={fam.nombre} />
          </div>

          <NavCategorias anterior={nav.anterior} siguiente={nav.siguiente} />

          <ListadoProductos
            todos={todos}
            base={`/c/${fam.slug}/${sub.slug}`}
            searchParams={searchParams}
            categorias={categorias}
            nav={nav}
          />
        </div>
      </main>
      <CatalogoPie />
    </>
  );
}
