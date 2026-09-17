import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MARCA, modulo } from '../../../../lib/marca';
import { espadasYCadenas } from '../../../../lib/guias';
import FiltroEspadas from '../../../components/sitio/FiltroEspadas';

export const revalidate = 3600;

export const metadata = {
  title: 'Espadas y cadenas de motosierra: paso, calibre y eslabones',
  description: `Qué significan el paso, el calibre y la cantidad de eslabones de una cadena de motosierra, y buscador por medida sobre el catálogo ${MARCA.nombre}.`,
};

export default async function GuiaEspadas() {
  if (!modulo('guias')) notFound();
  const lista = await espadasYCadenas();

  return (
    <>
      <section className="cabecera oscuro">
        <div className="contenedor">
          <p className="antetitulo"><Link href="/guias">Guías técnicas</Link></p>
          <h1 className="titulo-seccion">Espadas y cadenas</h1>
          <p>Las tres medidas que tienen que coincidir entre la espada, la cadena y el piñón.</p>
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor guia">
          <article className="guia__texto">
            <h2>Paso</h2>
            <p>
              Es la distancia entre eslabones: la distancia entre tres remaches consecutivos dividida por dos. Los pasos más
              comunes son 1/4&quot;, .325&quot;, 3/8&quot; LP (perfil bajo), 3/8&quot; y .404&quot;. La cadena, la espada y el piñón tienen que
              tener el mismo paso.
            </p>
            <h2>Calibre</h2>
            <p>
              Es el espesor del eslabón impulsor, la parte que entra en la ranura de la espada. Se expresa en pulgadas o en
              milímetros: .043&quot; (1,1 mm), .050&quot; (1,3 mm), .058&quot; (1,5 mm) y .063&quot; (1,6 mm).
            </p>
            <h2>Eslabones (DL)</h2>
            <p>
              Es la cantidad de eslabones impulsores que tiene la cadena. Depende del largo de la espada y del paso: dos cadenas
              con el mismo paso y calibre pero distinta cantidad de eslabones no sirven para la misma espada.
            </p>
            <h2>¿Dónde leer las medidas?</h2>
            <p>
              Normalmente vienen grabadas en la espada, cerca del anclaje a la máquina, y en el embalaje de la cadena. Si no se
              leen, contá los eslabones impulsores de la cadena usada.
            </p>
            <p className="nota-sitio" style={{ textAlign: 'left' }}>Los datos del buscador salen del texto del catálogo y son orientativos. Confirmá con tu vendedor antes de pedir.</p>
          </article>

          <FiltroEspadas items={lista} />
        </div>
      </section>
    </>
  );
}
