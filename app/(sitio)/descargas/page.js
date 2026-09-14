import Image from 'next/image';
import Link from 'next/link';
import { CATALOGOS_PDF, CATALOGO, CATALOGO_COMPLETO } from '../../../lib/sitio';
import { Buscar, Descarga } from '../../components/sitio/Iconos';

export const metadata = { title: 'Catálogos en PDF' };

export default function Descargas() {
  return (
    <>
      <section className="cabecera oscuro">
        <div className="contenedor">
          <p className="antetitulo">Catálogo 2025/26</p>
          <h1 className="titulo-seccion">Catálogos en PDF</h1>
          <p>Descargá cada línea para tenerla a mano o compartirla. Para buscar un repuesto puntual, usá el catálogo online.</p>
          <div className="cabecera__acciones">
            <Link className="boton boton--claro" href={CATALOGO}><Buscar /> Buscar en el catálogo online</Link>
            <a className="boton boton--borde" href={CATALOGO_COMPLETO} target="_blank" rel="noopener noreferrer"><Descarga /> Catálogo completo</a>
          </div>
        </div>
      </section>

      <section className="catalogos">
        <div className="contenedor catalogos__grilla">
          {CATALOGOS_PDF.map(c => (
            <article key={c.titulo} className="catalogo-pdf">
              <div className="catalogo-pdf__img">
                <Image src={c.img} alt={c.titulo} width={400} height={400} sizes="(max-width: 600px) 90vw, 280px" />
              </div>
              <div className="catalogo-pdf__pie">
                <h2>
                  {c.titulo}
                  {c.sub && <small>{c.sub}</small>}
                </h2>
                <div className="catalogo-pdf__acciones">
                  <Link className="boton boton--chico" href={c.href}>Ver online</Link>
                  <a className="boton boton--chico boton--borde" href={c.pdf} target="_blank" rel="noopener noreferrer" aria-label={`Descargar PDF de ${c.titulo}`}>
                    <Descarga /> PDF
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
