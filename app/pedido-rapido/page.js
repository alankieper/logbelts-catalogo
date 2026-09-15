import CatalogoHeader from '../components/CatalogoHeader';
import CatalogoPie from '../components/CatalogoPie';
import PedidoRapido from '../components/PedidoRapido';

export const metadata = {
  title: 'Pedido rápido por códigos',
  description: 'Pegá tu lista de códigos Logbelts u originales, o subí un Excel, y armá el pedido en segundos.',
};

export default function PedidoRapidoPage() {
  return (
    <>
      <CatalogoHeader />
      <main className="cat">
        <div className="wrap">
          <nav className="crumb">
            <a href="/#catalogo">Catálogo</a>
            <span className="sep">/</span>
            <span aria-current="page">Pedido rápido</span>
          </nav>
          <p className="eyebrow">Para reponer stock</p>
          <h1 className="page">Pedido rápido</h1>
          <p className="lead">
            Pegá la lista de códigos o subí tu Excel. Revisamos cada código contra el catálogo (también los códigos originales)
            y lo mandás a tu vendedor en un solo mensaje. Precios y disponibilidad te los confirma el vendedor.
          </p>
          <PedidoRapido />
        </div>
      </main>
      <CatalogoPie />
    </>
  );
}
