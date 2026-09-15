import CatalogoHeader from '../components/CatalogoHeader';
import CatalogoPie from '../components/CatalogoPie';
import MiCuenta from '../components/MiCuenta';

export const metadata = { title: 'Mi cuenta', robots: { index: false } };

export default function MiCuentaPage() {
  return (
    <>
      <CatalogoHeader />
      <main className="cat">
        <div className="wrap">
          <nav className="crumb">
            <a href="/#catalogo">Catálogo</a>
            <span className="sep">/</span>
            <span aria-current="page">Mi cuenta</span>
          </nav>
          <h1 className="page">Mi cuenta</h1>
          <p className="lead">Tus favoritos, tus pedidos anteriores y el contacto de tu vendedor, en un solo lugar.</p>
          <MiCuenta />
        </div>
      </main>
      <CatalogoPie />
    </>
  );
}
