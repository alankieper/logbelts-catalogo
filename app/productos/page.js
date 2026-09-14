import CatalogoHeader from '../components/CatalogoHeader';
import Icono from '../components/Icono';
import SelectorMaquina from '../components/SelectorMaquina';
import { getFamilias } from '../../lib/catalogo';
import { datosSelector } from '../../lib/maquinas';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Repuestos para bosque y jardín' };

// Portada del catálogo (antes estaba en "/"; ahora "/" es la web institucional)
export default async function CatalogoInicio() {
  const familias = await getFamilias();

  return (
    <>
      <CatalogoHeader />
      <main className="cat">
        <div className="wrap">
          <nav className="crumb">
            <a href="/">Inicio</a>
            <span className="sep">/</span>
            <span aria-current="page">Catálogo</span>
          </nav>
          <p className="eyebrow">Catálogo de repuestos</p>
          <h1 className="page">Repuestos para bosque y jardín</h1>
          <p className="lead">
            Buscá por código Logbelts, por el código original del fabricante, o por
            marca y modelo de máquina.
          </p>

          <p className="aviso-mayorista">
            Venta mayorista únicamente. Comunicate con nuestros vendedores para más información.
          </p>

          <section className="banda-maquina" aria-labelledby="por-maquina">
            <h2 id="por-maquina">Buscá por máquina</h2>
            <p>Elegí marca y modelo y te mostramos los repuestos que le sirven.</p>
            <SelectorMaquina datos={datosSelector()} />
            <div className="accesos">
              <a className="chip-lnk" href="/pedido-rapido">Pedido rápido por códigos o Excel</a>
              <a className="chip-lnk" href="/guias">Guías técnicas: correas, espadas y cadenas</a>
              <a className="chip-lnk" href="/mi-cuenta">Mis favoritos y pedidos</a>
            </div>
          </section>

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
