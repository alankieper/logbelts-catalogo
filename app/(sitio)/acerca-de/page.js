import Image from 'next/image';
import Link from 'next/link';
import Dibujo from '../../components/sitio/Dibujo';
import { Flecha } from '../../components/sitio/Iconos';
import { Binoculares, Cabezal, Correa, Diana, Escudo } from '../../components/sitio/LineasRepuestos';
import { img } from '../../../lib/sitio';

export const metadata = { title: 'Nosotros' };

const BLOQUES = [
  {
    Dibujo: Diana,
    titulo: 'Misión',
    texto:
      'En LOGBELTS trabajamos con pasión y profesionalismo para acompañar a cada cliente en su camino de crecimiento. Creemos en la fuerza de un equipo comprometido, en la excelencia de nuestros productos y servicio, porque nuestra verdadera misión es estar siempre cerca, escuchando y ofreciendo soluciones que transformen su trabajo en resultados.',
  },
  {
    Dibujo: Binoculares,
    titulo: 'Visión',
    texto:
      'Soñamos con un futuro donde LOGBELTS sea sinónimo de confianza y evolución, consolidarnos como lideres en el mercado nacional e Internacional, aspiramos a ser la primera elección de quienes buscan calidad, servicio humano y soluciones innovadoras, creciendo junto a nuestros clientes con la mirada puesta en el crecimiento sostenido y la mejora continua.',
  },
  {
    Dibujo: Escudo,
    titulo: 'Valores',
    texto:
      'En LOGBELTS creemos en hacer las cosas con compromiso y pasión, trabajando con responsabilidad en cada detalle. Nuestra base es la honestidad, la lealtad hacia nuestros clientes y equipo, sosteniendo siempre la disciplina y cumpliendo con nuestra palabra, porque es la garantía de confianza que nos distingue.',
  },
];

// Salen del texto de "Valores"
const VALORES = ['Compromiso', 'Pasión', 'Responsabilidad', 'Honestidad', 'Lealtad', 'Disciplina', 'Palabra cumplida'];

export default function Nosotros() {
  return (
    <>
      <section className="cabecera oscuro con-decor nosotros-cabecera">
        <Dibujo className="decor decor--der-arriba decor--grande" aria-hidden="true"><Correa /></Dibujo>
        <Dibujo className="decor decor--izq-abajo" aria-hidden="true"><Cabezal /></Dibujo>
        <div className="contenedor">
          <p className="antetitulo aparecer">Nosotros</p>
          <h1 className="titulo-seccion aparecer" style={{ '--retraso': '.1s' }}>Pasión, profesionalismo y solución</h1>
          <p className="aparecer" style={{ '--retraso': '.22s' }}>
            Importamos y distribuimos repuestos para bosque y jardín, y acompañamos a comercios y talleres de todo el país.
          </p>
        </div>
      </section>

      <section className="seccion">
        <div className="contenedor nosotros-intro">
          <Dibujo className="revelar">
            <p className="antetitulo">Quiénes somos</p>
            <h2 className="titulo-seccion">Experiencia y solución</h2>
            <p className="bajada">
              Nos dedicamos exclusivamente a repuestos para bosque y jardín: conocemos lo que pasa en el campo y en el taller.
            </p>
            <p className="bajada">
              No vendemos por vender: escuchamos, asesoramos y acompañamos a cada cliente para que trabaje mejor y gane más.
            </p>
          </Dibujo>
          <Dibujo className="nosotros-fotos revelar revelar--lateral">
            <Image src={img('35b7b447b348484c9263a1ec91cde1eff000')} alt="Asesor de Logbelts explicando el uso de una desmalezadora" width={540} height={828} sizes="(max-width: 900px) 45vw, 270px" />
            <Image src={img('b07cb7ce240040feb30766b5e4571b47f000')} alt="Asesor de Logbelts con cabezales y bobinas de tanza" width={540} height={828} sizes="(max-width: 900px) 45vw, 270px" />
          </Dibujo>
        </div>
      </section>

      <section className="seccion seccion--suelo">
        <div className="contenedor">
          <Dibujo className="nosotros-bloques revelar">
            {BLOQUES.map(({ Dibujo: Icono, titulo, texto }, i) => (
              <article key={titulo} className="nosotros-bloque">
                <div className="nosotros-bloque__cabeza">
                  <Icono className="nosotros-bloque__dibujo" />
                  <span className="nosotros-bloque__n">0{i + 1}</span>
                </div>
                <h2 className="display">{titulo}</h2>
                <p>{texto}</p>
              </article>
            ))}
          </Dibujo>
        </div>
      </section>

      <section className="seccion seccion--oscura oscuro">
        <div className="contenedor nosotros-valores">
          <div>
            <p className="antetitulo">Lo que nos mueve</p>
            <h2 className="titulo-seccion">Nuestros valores</h2>
          </div>
          <Dibujo as="ul" className="nosotros-chips revelar">
            {VALORES.map(v => <li key={v}>{v}</li>)}
          </Dibujo>
          <div className="pasos__cta">
            <Link href="/contacto" className="boton boton--claro">Quiero ser distribuidor <Flecha /></Link>
            <Link href="/#catalogo" className="boton boton--borde">Ver catálogo</Link>
          </div>
        </div>
      </section>
    </>
  );
}
