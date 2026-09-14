import Image from 'next/image';
import { LANZAMIENTOS, img } from '../../../lib/sitio';

export const metadata = { title: 'Lanzamientos' };

export default function Lanzamientos() {
  return (
    <section className="fondo-foto fondo-foto--oscuro lanzamientos oscuro">
      <Image className="fondo-foto__img" src={img('dd35f656ce4946e29a1665bc3bdf1413f000')} alt="" fill sizes="100vw" priority />
      <div className="contenedor">
        <p className="antetitulo">Novedades</p>
        <h1 className="titulo-seccion">Nuevos lanzamientos</h1>
        <p className="bajada">
          Con Logbelts, cada herramienta está pensada para rendir en condiciones reales de trabajo, garantizando
          confiabilidad, desempeño y resultados consistentes en cada uso.
        </p>
        <div className="lanzamientos__grilla">
          {LANZAMIENTOS.map(l => (
            <article key={l.modelo} className="lanzamiento">
              <h2>{l.titulo.toUpperCase()}</h2>
              <p className="etiqueta">{l.modelo}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
