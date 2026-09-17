import Link from 'next/link';
import { CONDICIONES, CONTACTO, PORTAL_DISTRIBUIDORES } from '../../../lib/sitio';
import { MARCA, modulo } from '../../../lib/marca';
import { SITE_URL } from '../../../lib/seo';
import { Flecha } from '../../components/sitio/Iconos';

export const metadata = {
  title: 'Condiciones para distribuidores',
  description: 'Cómo trabajamos con comercios y talleres: venta mayorista, cómo hacer pedidos, precios, atención y preguntas frecuentes.',
  alternates: { canonical: `${SITE_URL}/condiciones` },
};

const PASOS = [
  { titulo: 'Registrate', texto: 'Dejanos los datos de tu comercio o taller en un minuto.' },
  { titulo: 'Te contacta un vendedor', texto: 'Te asesoramos sobre las líneas que mejor funcionan en tu zona.' },
  { titulo: 'Accedé al portal B2B', texto: 'Hacé tus pedidos y consultá el catálogo completo cuando quieras.' },
];

const texto = (titulo) => CONDICIONES.find(c => c.titulo === titulo)?.texto;

// Solo respuestas que salen de las condiciones cargadas en lib/sitio.js (nada inventado)
const PREGUNTAS = [
  { p: '¿Venden al público?', r: texto('Venta mayorista') },
  { p: '¿Cómo hago un pedido?', r: texto('Cómo se pide') },
  { p: '¿Dónde veo precios y disponibilidad?', r: texto('Precios y disponibilidad') },
  { p: '¿Cuál es el horario de atención?', r: texto('Atención') },
  { p: '¿Cuál es la compra mínima?', r: texto('Compra mínima') },
  { p: '¿Qué formas de pago aceptan?', r: texto('Formas de pago') },
  { p: '¿Hacen envíos?', r: texto('Envíos') },
].filter(x => x.r);

export default function Condiciones() {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PREGUNTAS.map(({ p, r }) => ({ '@type': 'Question', name: p, acceptedAnswer: { '@type': 'Answer', text: r } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <section className="cabecera oscuro">
        <div className="contenedor">
          <p className="antetitulo">Distribuidores</p>
          <h1 className="titulo-seccion">Condiciones para distribuidores</h1>
          <p>Todo lo que necesitás saber para trabajar con {MARCA.nombre} desde tu comercio o taller.</p>
          <div className="cabecera__acciones">
            <Link className="boton boton--claro" href="/contacto">Quiero ser distribuidor <Flecha /></Link>
            {modulo('distribuidores') && <a className="boton boton--borde" href={PORTAL_DISTRIBUIDORES} target="_blank" rel="noopener noreferrer">Ya soy distribuidor</a>}
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
            {CONDICIONES.map(c => (
              <div key={c.titulo}>
                <dt>{c.titulo}</dt>
                <dd className={c.texto ? undefined : 'condiciones__pendiente'}>{c.texto || 'Consultalo con tu vendedor.'}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="seccion seccion--oscura oscuro" aria-labelledby="empezar-titulo">
        <div className="contenedor">
          <div className="seccion__cabeza">
            <div>
              <p className="antetitulo">Para comercios y talleres</p>
              <h2 id="empezar-titulo" className="titulo-seccion">Cómo empezar</h2>
            </div>
          </div>
          <ol className="pasos">
            {PASOS.map(p => (
              <li key={p.titulo} className="paso">
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="seccion" aria-labelledby="faq-titulo">
        <div className="contenedor">
          <div className="seccion__cabeza">
            <div>
              <p className="antetitulo">Dudas</p>
              <h2 id="faq-titulo" className="titulo-seccion">Preguntas frecuentes</h2>
            </div>
          </div>
          <div className="faq">
            {PREGUNTAS.map(({ p, r }) => (
              <details key={p}>
                <summary>{p}</summary>
                <p>{r}</p>
              </details>
            ))}
          </div>
          <div className="pasos__cta">
            <Link className="boton" href="/contacto">Quiero ser distribuidor <Flecha /></Link>
            <a className="boton boton--borde" href={CONTACTO.whatsapp} target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a>
          </div>
        </div>
      </section>
    </>
  );
}
