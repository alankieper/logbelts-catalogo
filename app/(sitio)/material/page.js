import Image from 'next/image';
import GeneradorPlaca from '../../components/sitio/GeneradorPlaca';
import { notFound } from 'next/navigation';
import { MARCA, modulo, slugMarca } from '../../../lib/marca';
import { fotosMaterial } from '../../../lib/material';
import { temporadaVigente } from '../../../lib/ajustes';

export const metadata = {
  title: 'Material para distribuidores',
  description: 'Logos, fotos de producto y placas para redes sociales con el nombre de tu comercio.',
};

// Las imágenes de producto se editan desde /admin/material
export const dynamic = 'force-dynamic';

export default async function Material() {
  if (!modulo('material')) notFound();
  const [FOTOS, estado] = await Promise.all([fotosMaterial(), temporadaVigente().catch(() => null)]);

  return (
    <>
      <section className="cabecera oscuro">
        <div className="contenedor">
          <p className="antetitulo">Para distribuidores</p>
          <h1 className="titulo-seccion">Material para tu comercio</h1>
          <p>Todo lo que necesitás para mostrar que vendés {MARCA.nombre}: logos, fotos y placas listas para redes.</p>
        </div>
      </section>

      <section className="seccion seccion--suelo" aria-labelledby="placa-titulo">
        <div className="contenedor">
          <div className="seccion__cabeza">
            <div>
              <p className="antetitulo">Nuevo</p>
              <h2 id="placa-titulo" className="titulo-seccion">Creá tu placa para redes</h2>
              <p className="bajada" style={{ marginTop: 12 }}>Elegí el formato, el producto y el fondo, sumá tu logo y el nombre de tu comercio, y descargala lista para Instagram, Facebook o WhatsApp.</p>
            </div>
          </div>
          <GeneradorPlaca fotos={FOTOS} temporada={estado?.foco || 'cesped'} />
        </div>
      </section>

      <section className="seccion" aria-labelledby="descargas-titulo">
        <div className="contenedor">
          <div className="seccion__cabeza">
            <div>
              <p className="antetitulo">Descargas</p>
              <h2 id="descargas-titulo" className="titulo-seccion">Logos y fotos</h2>
            </div>
          </div>
          <div className="material-grilla">
            <a className="material-item material-item--oscuro" href={MARCA.logoClaro} download={`${slugMarca()}-logo-blanco.png`}>
              <Image src={MARCA.logoClaro} alt="" width={1254} height={620} sizes="240px" />
              <span>Logo blanco (PNG)</span>
            </a>
            <a className="material-item" href={MARCA.logoOscuro} download={`${slugMarca()}-logo-azul.png`}>
              <Image src={MARCA.logoOscuro} alt="" width={1254} height={620} sizes="240px" />
              <span>Logo azul (PNG)</span>
            </a>
            {FOTOS.map(f => (
              <a key={f.src} className="material-item" href={f.src} download>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.src} alt="" loading="lazy" />
                <span>{f.nombre}</span>
              </a>
            ))}
          </div>
          <p className="nota-sitio">Usá el logo sin deformarlo ni cambiarle los colores. ¿Necesitás otro material? Pedíselo a tu vendedor.</p>
        </div>
      </section>
    </>
  );
}
