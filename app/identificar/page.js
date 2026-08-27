import CatalogoHeader from '../components/CatalogoHeader';
import IdentificadorUI from '../components/IdentificadorUI';

export const metadata = {
  title: 'Identificar repuesto por foto — Catálogo Logbelts',
  description: 'Subí una foto del repuesto roto y te decimos cuál es y su código Logbelts.',
};

export default function IdentificarPage() {
  return (
    <>
      <CatalogoHeader />
      <main className="cat">
        <div className="wrap">
          <nav className="crumb">
            <a href="/">Inicio</a>
            <span className="sep">/</span>
            <span aria-current="page">Identificar por foto</span>
          </nav>
          <p className="eyebrow">Nuevo</p>
          <h1 className="page">¿No sabés qué repuesto es? Sacale una foto</h1>
          <p className="lead">
            Subí una foto de la pieza rota. La comparamos con todo el catálogo y te decimos qué es,
            el código Logbelts, y las opciones más parecidas. Funciona mejor con la pieza limpia,
            de cerca y con buena luz.
          </p>
          <IdentificadorUI />
        </div>
      </main>
      <footer className="cat">
        <div className="wrap">Logbelts · Catálogo · versión de trabajo</div>
      </footer>
    </>
  );
}
