import { notFound } from 'next/navigation';
import CatalogoHeader from '../../components/CatalogoHeader';
import CatalogoPie from '../../components/CatalogoPie';
import ListaModelos from '../../components/ListaModelos';
import { listarModelos } from '../../../lib/maquinas';

export const dynamic = 'force-dynamic';

export function generateMetadata({ params }) {
  const datos = listarModelos(params.marca);
  if (!datos) return { title: 'Marca no encontrada' };
  return {
    title: `Repuestos para ${datos.marca} por modelo`,
    description: `Repuestos Logbelts compatibles con ${datos.modelos.length} modelos de ${datos.marca}. Venta mayorista.`,
  };
}

export default function MarcaMaquinaPage({ params }) {
  const datos = listarModelos(params.marca);
  if (!datos) notFound();

  return (
    <>
      <CatalogoHeader />
      <main className="cat">
        <div className="wrap">
          <nav className="crumb">
            <a href="/#catalogo">Catálogo</a>
            <span className="sep">/</span>
            <a href="/maquinas">Por máquina</a>
            <span className="sep">/</span>
            <span aria-current="page">{datos.marca}</span>
          </nav>
          <h1 className="page">Repuestos para {datos.marca}</h1>
          <p className="lead">{datos.modelos.length} modelos con repuestos en el catálogo. Elegí el tuyo.</p>
          <ListaModelos marcaSlug={datos.slug} modelos={datos.modelos} />
        </div>
      </main>
      <CatalogoPie />
    </>
  );
}
