import CatalogoHeader from './components/CatalogoHeader';
import Icono from './components/Icono';
import { getFamilias, getCatalogoResumen } from '../lib/catalogo';

export const dynamic = 'force-static';

export default function Home() {
  const familias = getFamilias();
  const resumen = getCatalogoResumen();

  return (
    <>
      <CatalogoHeader />
      <main className="cat">
        <div className="wrap">
          <p className="eyebrow">Catálogo de repuestos</p>
          <h1 className="page">Repuestos para bosque, jardín e industria</h1>
          <p className="lead">
            {resumen.total.toLocaleString('es-AR')} productos. Buscá por código Logbelts, por el
            código original del fabricante, o por marca y modelo de máquina.
          </p>

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
