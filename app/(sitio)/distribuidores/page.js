import Image from 'next/image';
import Link from 'next/link';
import { CONDICIONES, PORTAL_DISTRIBUIDORES, img } from '../../../lib/sitio';

export const metadata = { title: 'Portal Distribuidores' };

export default function Distribuidores() {
  const condiciones = CONDICIONES.filter(c => c.texto);

  return (
    <>
      <section className="fondo-foto fondo-foto--oscuro temporada oscuro" style={{ minHeight: '56vh', display: 'grid', alignItems: 'center' }}>
        <Image className="fondo-foto__img" src={img('18e35fe7479247d785321d692b9e50adf000')} alt="" fill sizes="100vw" priority />
        <div className="contenedor">
          <p className="antetitulo">Distribuidores</p>
          <h1 className="display">Acceso al portal de distribuidores</h1>
          <p className="temporada__bajada">Con solo un click ya accedés al portal</p>
          <div className="hero__acciones">
            <a className="boton boton--claro" href={PORTAL_DISTRIBUIDORES} target="_blank" rel="noopener noreferrer">Ingresá aquí</a>
            <Link className="boton boton--borde" href="/contacto">Todavía no soy distribuidor</Link>
          </div>
        </div>
      </section>

      <section className="seccion seccion--suelo" aria-labelledby="condiciones-titulo">
        <div className="contenedor">
          <div className="seccion__cabeza">
            <div>
              <p className="antetitulo">Cómo trabajamos</p>
              <h2 id="condiciones-titulo" className="titulo-seccion">Condiciones comerciales</h2>
            </div>
          </div>
          <dl className="condiciones">
            {condiciones.map(c => (
              <div key={c.titulo}>
                <dt>{c.titulo}</dt>
                <dd>{c.texto}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="seccion" aria-labelledby="recursos-titulo">
        <div className="contenedor">
          <div className="seccion__cabeza">
            <div>
              <p className="antetitulo">Para tu comercio</p>
              <h2 id="recursos-titulo" className="titulo-seccion">Herramientas para vender más</h2>
            </div>
          </div>
          <div className="herramientas__accesos herramientas__accesos--claro">
            <a href="/pedido-rapido"><strong>Pedido rápido</strong><span>Reponé stock pegando códigos o subiendo tu Excel.</span></a>
            <Link href="/material"><strong>Material para redes</strong><span>Logos, fotos y placas con el nombre de tu comercio.</span></Link>
            <Link href="/donde-comprar"><strong>Dónde comprar</strong><span>Aparecé en el mapa para que te encuentren clientes de tu zona.</span></Link>
            <a href="/mi-cuenta"><strong>Mi cuenta</strong><span>Favoritos, pedidos anteriores y tu vendedor asignado.</span></a>
          </div>
        </div>
      </section>
    </>
  );
}
