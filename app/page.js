import CatalogoHeader from './components/CatalogoHeader';
import Icono from './components/Icono';
import { getFamilias } from '../lib/catalogo';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const familias = await getFamilias();

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

          <p className="aviso-mayorista">
            Venta mayorista únicamente. Comunicate con nuestros vendedores para más información.
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
