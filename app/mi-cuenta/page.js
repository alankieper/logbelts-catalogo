import CatalogoHeader from '../components/CatalogoHeader';
import MiCuenta from '../components/MiCuenta';

export const metadata = { title: 'Mi cuenta', robots: { index: false } };

export default function MiCuentaPage() {
  return (
    <>
      <CatalogoHeader />
      <main className="cat">
        <div className="wrap">
          <nav className="crumb">
            <a href="/productos">Catálogo</a>
            <span className="sep">/</span>
            <span aria-current="page">Mi cuenta</span>
          </nav>
          <h1 className="page">Mi cuenta</h1>
          <p className="lead">Tus favoritos, tus pedidos anteriores y el contacto de tu vendedor, en un solo lugar.</p>
          <MiCuenta />
        </div>
      </main>
      <footer className="cat">
        <div className="wrap">Logbelts · Catálogo · versión de trabajo</div>
      </footer>
    </>
  );
}
