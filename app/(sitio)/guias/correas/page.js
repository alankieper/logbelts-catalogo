import Link from 'next/link';
import { correas } from '../../../../lib/guias';
import FiltroCorreas from '../../../components/sitio/FiltroCorreas';

export const revalidate = 3600;

export const metadata = {
  title: 'Correas de minitractor: cómo medirlas y buscador',
  description: 'Guía para identificar correas de plataforma y transmisión de minitractores, con buscador por largo, ancho y marca sobre el catálogo Logbelts.',
};

export default async function GuiaCorreas() {
  const lista = await correas();

  return (
    <>
      <section className="cabecera oscuro">
        <div className="contenedor">
          <p className="antetitulo"><Link href="/guias">Guías técnicas</Link></p>
          <h1 className="titulo-seccion">Correas de minitractor</h1>
          <p>Cómo identificar la correa correcta y encontrarla en el catálogo por medida.</p>
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor guia">
          <article className="guia__texto">
            <h2>1. Buscá primero el código original</h2>
            <p>
              La forma más segura de identificar una correa es por el código del fabricante (por ejemplo 754-0260), que suele
              estar en el manual o en la etiqueta de la máquina. Buscalo en el <a href="/buscar">buscador del catálogo</a>: los
              códigos originales están cargados como equivalencias.
            </p>
            <h2>2. Si no hay código, medila</h2>
            <ul>
              <li><strong>Largo:</strong> medí el perímetro exterior con una cinta métrica flexible, siguiendo la correa.</li>
              <li><strong>Ancho:</strong> medí la cara superior. Las más comunes en minitractores son de 1/2&quot; y 5/8&quot;.</li>
              <li><strong>Uso:</strong> distinguí si es de la plataforma de corte o de la transmisión/tracción: no son intercambiables.</li>
            </ul>
            <p>Una correa usada puede estar estirada: tomá la medida como referencia y elegí la más cercana.</p>
            <h2>3. Confirmá con tu vendedor</h2>
            <p>Las medidas del buscador salen del texto del catálogo y son orientativas. Antes de pedir, confirmá el código con tu vendedor.</p>
          </article>

          <FiltroCorreas correas={lista} />
        </div>
      </section>
    </>
  );
}
