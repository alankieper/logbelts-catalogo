import CatalogoHeader from './components/CatalogoHeader';
import Icono from './components/Icono';
import MarcasMarquee from './components/MarcasMarquee';
import { getFamilias, getMarcasConteo } from '../lib/catalogo';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const familias = await getFamilias();
  const marcas = await getMarcasConteo();

  return (
    <>
      <CatalogoHeader />
      <main className="cat">
        <div className="wrap">
          <p className="eyebrow">Catálogo de repuestos</p>
          <h1 className="page">Repuestos para bosque y jardín</h1>
          <p className="lead">
            Buscá por código Logbelts, por el código original del fabricante, o por
            marca y modelo de máquina.
          </p>

          <a className="home-cta" href="/identificar">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="6" width="18" height="14" rx="2" />
              <circle cx="12" cy="13" r="4" />
              <path d="M8 6l1.5-2h5L16 6" />
            </svg>
            <span>
              <span className="t">¿No sabés qué repuesto es?</span>
              <span className="d"> Sacale una foto a la pieza rota y te decimos cuál es.</span>
            </span>
            <span className="go">Identificar por foto →</span>
          </a>

          <MarcasMarquee marcas={marcas} />

          <div className="tiles">
            {familias.map((f) => (
              <a className="tile" key={f.slug} href={`/f/${f.slug}`}>
                <span className="ic"><Icono nombre={f.nombre} size={24} /></span>
                <span className="txt">
                  <h3>{f.nombre}</h3>
                  <span className="count">{f.count.toLocaleString('es-AR')} productos</span>
                </span>
              </a>
            ))}
          </div>

          <p className="note">
            <b>Versión de trabajo.</b> Los datos salen de la primera extracción del catálogo
            2025/26. Algunas descripciones son genéricas (dicen “a confirmar”) y varias fotos
            están por revisar. Se corrigen desde administración.
          </p>
        </div>
      </main>
      <footer className="cat">
        <div className="wrap">Logbelts · Catálogo · versión de trabajo</div>
      </footer>
    </>
  );
}
