import Image from 'next/image';
import Link from 'next/link';
import { getFamilias } from '../../lib/catalogo';
import { CATALOGO, CATEGORIAS_HOME, LINEAS, img } from '../../lib/sitio';
import { Auricular, Buscar, Escudo, Flecha, Medalla } from '../components/sitio/Iconos';

export const revalidate = 3600;

const VALORES = [
  { Icono: Medalla, titulo: 'Más de 10 años en el rubro', texto: 'Dedicados exclusivamente a repuestos para bosque y jardín. Conocemos lo que pasa en el campo y en el taller.' },
  { Icono: Auricular, titulo: 'Asesoramiento personalizado', texto: 'No vendemos por vender: escuchamos, asesoramos y acompañamos a cada cliente para que trabaje mejor y gane más.' },
  { Icono: Escudo, titulo: 'Calidad garantizada', texto: 'Repuestos que marcan la diferencia, con la solución que tu cliente necesita en el mostrador.' },
];

const PASOS = [
  { titulo: 'Registrate', texto: 'Dejanos los datos de tu comercio o taller en un minuto.' },
  { titulo: 'Te contacta un vendedor', texto: 'Te asesoramos sobre las líneas que mejor funcionan en tu zona.' },
  { titulo: 'Accedé al portal B2B', texto: 'Hacé tus pedidos y consultá el catálogo completo cuando quieras.' },
];

// Cantidades reales del catálogo; si la base no responde, la portada igual se muestra sin números.
async function conteos() {
  try {
    const familias = await getFamilias();
    const porSlug = Object.fromEntries(familias.map(f => [f.slug, f.count]));
    const total = familias.reduce((acc, f) => acc + (f.count || 0), 0);
    return { porSlug, total };
  } catch {
    return { porSlug: {}, total: 0 };
  }
}

export default async function Inicio() {
  const { porSlug, total } = await conteos();
  const totalRedondeado = total >= 100 ? `+${(Math.floor(total / 100) * 100).toLocaleString('es-AR')}` : null;

  return (
    <>
      <section className="hero oscuro">
        <Image className="hero__foto" src={img('8250887d5bc84de4ae3e2b1157a80746')} alt="" fill sizes="100vw" priority />
        <div className="contenedor hero__grilla">
          <div>
            <p className="antetitulo">Venta mayorista · Bosque y jardín</p>
            <h1 className="display">Repuestos que <em>marcan la diferencia</em></h1>
            <p className="bajada">
              Importamos y distribuimos repuestos para motosierras, desmalezadoras, minitractores y motores.
              Abastecemos a comercios y talleres de todo el país.
            </p>

            <form className="hero__buscar" action="/buscar" method="get" role="search">
              <label htmlFor="hero-q" className="visually-hidden" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }}>Buscar repuestos</label>
              <input id="hero-q" name="q" type="search" placeholder="Código, código original o modelo de máquina" autoComplete="off" />
              <button type="submit" className="boton"><Buscar /> Buscar</button>
            </form>
            <p className="hero__ayuda">Ej: 5888 · Stihl MS 250 · Husqvarna 143R</p>

            <div className="hero__acciones">
              <Link href="/contacto" className="boton boton--claro">Quiero ser distribuidor <Flecha /></Link>
              <Link href={CATALOGO} className="boton boton--borde">Ver catálogo</Link>
            </div>
          </div>
          <div className="hero__productos" aria-hidden="true">
            <Image className="hero__p3" src="/img/recorte-desmalezadora.webp" alt="" width={929} height={467} sizes="(max-width: 900px) 50vw, 300px" />
            <Image className="hero__p1" src="/img/recorte-minitractor.webp" alt="" width={616} height={470} sizes="(max-width: 900px) 65vw, 380px" priority />
            <Image className="hero__p2" src="/img/recorte-motosierra.webp" alt="" width={708} height={257} sizes="(max-width: 900px) 55vw, 320px" />
          </div>
        </div>
      </section>

      <section className="datos" aria-label="Logbelts en números">
        <div className="contenedor datos__grilla">
          <div className="dato"><strong>+10</strong><span>años en el rubro</span></div>
          <div className="dato"><strong>{totalRedondeado || 'Online'}</strong><span>{totalRedondeado ? 'repuestos en catálogo' : 'catálogo de repuestos'}</span></div>
          <div className="dato"><strong>B2B</strong><span>portal de pedidos</span></div>
          <div className="dato"><strong>100%</strong><span>venta mayorista</span></div>
        </div>
      </section>

      <section className="seccion seccion--suelo" aria-labelledby="lineas-titulo">
        <div className="contenedor">
          <div className="seccion__cabeza">
            <div>
              <p className="antetitulo">Líneas principales</p>
              <h2 id="lineas-titulo" className="titulo-seccion">Todo lo que tu mostrador necesita</h2>
            </div>
            <Link className="boton boton--borde" href={CATALOGO}>Catálogo completo <Flecha /></Link>
          </div>
          <div className="lineas__grilla">
            {LINEAS.map(l => (
              <Link key={l.titulo} className="linea" href={l.href}>
                <div className="linea__img">
                  <Image src={l.img} alt={l.titulo} width={400} height={400} sizes="(max-width: 520px) 90vw, (max-width: 1000px) 45vw, 280px" />
                </div>
                <div className="linea__pie">
                  <h3 className="display">{l.titulo}</h3>
                  <p>{l.sub}</p>
                  <span className="linea__meta">
                    {porSlug[l.slug] ? `${porSlug[l.slug].toLocaleString('es-AR')} productos` : 'Ver productos'} <Flecha />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="seccion" aria-labelledby="porque-titulo">
        <div className="contenedor porque__grilla">
          <div>
            <p className="antetitulo">Por qué Logbelts</p>
            <h2 id="porque-titulo" className="titulo-seccion">Experiencia y solución</h2>
            <p className="bajada" style={{ marginTop: 16 }}>
              Cuando elegís Logbelts no comprás solo un repuesto: sumás un proveedor que te acompaña.
              Nuestro principal motor es tu satisfacción.
            </p>
            <div className="valores">
              {VALORES.map(({ Icono, titulo, texto }) => (
                <div key={titulo} className="valor">
                  <span className="valor__icono"><Icono /></span>
                  <div>
                    <h3>{titulo}</h3>
                    <p>{texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="porque__fotos">
            <Image src={img('35b7b447b348484c9263a1ec91cde1eff000')} alt="Asesor de Logbelts explicando el uso de una desmalezadora" width={540} height={828} sizes="(max-width: 900px) 45vw, 270px" />
            <Image src={img('b07cb7ce240040feb30766b5e4571b47f000')} alt="Asesor de Logbelts con cabezales y bobinas de tanza" width={540} height={828} sizes="(max-width: 900px) 45vw, 270px" />
          </div>
        </div>
      </section>

      <section className="seccion seccion--oscura oscuro" aria-labelledby="pasos-titulo">
        <div className="contenedor">
          <div className="seccion__cabeza">
            <div>
              <p className="antetitulo">Para comercios y talleres</p>
              <h2 id="pasos-titulo" className="titulo-seccion">Cómo ser distribuidor</h2>
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
          <div className="pasos__cta">
            <Link href="/contacto" className="boton boton--claro">Quiero ser distribuidor <Flecha /></Link>
            <Link href="/distribuidores" className="boton boton--borde">Ya soy distribuidor</Link>
          </div>
        </div>
      </section>

      <section className="seccion seccion--suelo" aria-labelledby="categorias-titulo">
        <div className="contenedor">
          <div className="seccion__cabeza">
            <div>
              <p className="antetitulo">Catálogo por categoría</p>
              <h2 id="categorias-titulo" className="titulo-seccion">Encontrá el repuesto justo</h2>
            </div>
            <Link className="boton boton--borde" href="/descargas">Catálogos en PDF <Flecha /></Link>
          </div>
          <div className="categorias__grilla">
            {CATEGORIAS_HOME.map(c => (
              <Link key={c.titulo} href={c.href} className="categoria">
                <Image src={c.img} alt="" fill sizes="(max-width: 1000px) 45vw, 290px" />
                <span>{c.titulo} <Flecha /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="fondo-foto fondo-foto--oscuro temporada oscuro">
        <Image className="fondo-foto__img" src={img('3d5e5148663349a9beae8fb6ac532baff000')} alt="" fill sizes="100vw" />
        <div className="contenedor">
          <p className="antetitulo">Temporada primavera · verano</p>
          <h2 className="display">Prepará tu stock para la temporada</h2>
          <p className="temporada__bajada">¡No te lo pierdas!</p>
          <p>Registrate como distribuidor e incorporá toda la línea de productos de calidad Logbelts.</p>
          <div className="hero__acciones">
            <Link href="/contacto" className="boton boton--claro">Contactate con nosotros <Flecha /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
