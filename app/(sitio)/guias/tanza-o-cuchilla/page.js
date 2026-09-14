import Link from 'next/link';
import { Flecha } from '../../../components/sitio/Iconos';

export const metadata = {
  title: '¿Tanza o cuchilla? Cómo elegir el accesorio de la desmalezadora',
  description: 'Cuándo conviene usar tanza y cuándo cuchilla en una desmalezadora, y qué revisar antes de cambiar el accesorio.',
};

export default function GuiaTanzaCuchilla() {
  return (
    <>
      <section className="cabecera oscuro">
        <div className="contenedor">
          <p className="antetitulo"><Link href="/guias">Guías técnicas</Link></p>
          <h1 className="titulo-seccion">¿Tanza o cuchilla?</h1>
          <p>Una guía rápida para recomendar el accesorio correcto según el trabajo.</p>
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor guia guia--simple">
          <article className="guia__texto">
            <div className="comparativa">
              <div>
                <h2>Tanza (cabezal)</h2>
                <ul>
                  <li>Pasto y maleza liviana.</li>
                  <li>Bordes, contra paredes, alambrados, árboles y canteros.</li>
                  <li>Más tolerante si toca obstáculos: la tanza se gasta y se repone.</li>
                  <li>Elegí el diámetro y la forma que admite el cabezal y la máquina.</li>
                </ul>
              </div>
              <div>
                <h2>Cuchilla</h2>
                <ul>
                  <li>Maleza densa, pastizales altos, cañas y arbustos finos.</li>
                  <li>Trabajo en terrenos abiertos, lejos de piedras y obstáculos.</li>
                  <li>Corta con menos esfuerzo en material duro.</li>
                  <li>Usala solo si la máquina lo permite y con el protector indicado para cuchillas.</li>
                </ul>
              </div>
            </div>

            <h2>Antes de cambiar el accesorio</h2>
            <ul>
              <li>Revisá en el manual qué accesorios admite la máquina: no todas las desmalezadoras están preparadas para cuchilla.</li>
              <li>Verificá la rosca y el tipo de montaje del cabezal o de la cuchilla.</li>
              <li>Usá siempre el protector que corresponde y equipo de protección (anteojos, protección auditiva, guantes y calzado).</li>
            </ul>
            <p className="nota-sitio" style={{ textAlign: 'left' }}>Guía orientativa. Ante la duda, consultá con tu vendedor.</p>

            <div className="hero__acciones">
              <a className="boton" href="/buscar?q=cabezal">Ver cabezales <Flecha /></a>
              <a className="boton boton--borde" href="/buscar?q=tanza">Ver tanzas</a>
              <a className="boton boton--borde" href="/buscar?q=cuchilla">Ver cuchillas</a>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
