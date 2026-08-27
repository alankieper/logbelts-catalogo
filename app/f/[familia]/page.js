import { notFound } from 'next/navigation';
import CatalogoHeader from '../../components/CatalogoHeader';
import Icono from '../../components/Icono';
import { getFamilias, getFamilia } from '../../../lib/catalogo';

export function generateStaticParams() {
  return getFamilias().map((f) => ({ familia: f.slug }));
}

export default function FamiliaPage({ params }) {
  const fam = getFamilia(params.familia);
  if (!fam) notFound();

  return (
    <>
      <CatalogoHeader />
      <main className="cat">
        <div className="wrap">
          <nav className="crumb">
            <a href="/">Inicio</a>
            <span className="sep">/</span>
            <span aria-current="page">{fam.nombre}</span>
          </nav>
          <h1 className="page">{fam.nombre}</h1>
          <p className="lead">{fam.count.toLocaleString('es-AR')} productos en {fam.subcats.length} subcategorías.</p>

          <div className="tiles">
            {fam.subcats.map((s) => (
              <a className="tile" key={s.slug} href={`/c/${fam.slug}/${s.slug}`}>
                <span className="ic"><Icono nombre={s.nombre} size={22} /></span>
                <span className="txt">
                  <h3>{s.nombre}</h3>
                  <span className="count">{s.count.toLocaleString('es-AR')} productos</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </main>
      <footer className="cat">
        <div className="wrap">Logbelts · Catálogo · versión de trabajo</div>
      </footer>
    </>
  );
}
