import Image from 'next/image';
import Link from 'next/link';
import { PORTAL_DISTRIBUIDORES, img } from '../../../lib/sitio';

export const metadata = { title: 'Portal Distribuidores' };

export default function Distribuidores() {
  return (
    <section className="fondo-foto fondo-foto--oscuro temporada oscuro" style={{ minHeight: '70vh', display: 'grid', alignItems: 'center' }}>
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
  );
}
