import Image from 'next/image';
import Link from 'next/link';
import { getFamilias, getMarcasConteo } from '../../lib/catalogo';
import { logosClaros, logosMarcas } from '../../lib/logosMarcas';
import { datosSelector } from '../../lib/maquinas';
import { img } from '../../lib/sitio';
import { Auricular, Buscar, Escudo, Flecha, Medalla } from '../components/sitio/Iconos';
import SelectorMaquina from '../components/SelectorMaquina';
import Dibujo from '../components/sitio/Dibujo';
import Piezas3D from '../components/sitio/Piezas3D';
import { DesmalezadoraContorno, MinitractorContorno, MotosierraContorno } from '../components/sitio/LineasMaquinas';
import CintaMarcas from '../components/sitio/CintaMarcas';
import { Arranque, Bujia, Cabezal, Cadena, Carburador, Correa, FiltroAire, Piston, dibujoFamilia } from '../components/sitio/LineasRepuestos';

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

const TIPOS = [
  { Icono: Carburador, nombre: 'Carburadores', href: '/f/carburacion' },
  { Icono: Piston, nombre: 'Pistones y cilindros', href: '/buscar?q=piston' },
  { Icono: Bujia, nombre: 'Bujías y encendido', href: '/buscar?q=bujia' },
  { Icono: Cadena, nombre: 'Cadenas y espadas', href: '/guias/espadas-y-cadenas' },
  { Icono: Correa, nombre: 'Correas y poleas', href: '/guias/correas' },
  { Icono: FiltroAire, nombre: 'Filtros de aire', href: '/buscar?q=filtro%20aire' },
  { Icono: Cabezal, nombre: 'Cabezales y tanzas', href: '/buscar?q=cabezal' },
  { Icono: Arranque, nombre: 'Sistemas de arranque', href: '/f/sistemas-de-arranque' },
];

const PRECISION = [
  { Icono: Carburador, titulo: 'Carburación', texto: 'Carburadores completos, kits de membranas, tornillos de regulación y cebadores.', href: '/f/carburacion' },
  { Icono: Piston, titulo: 'Motor', texto: 'Pistones, aros, cilindros, bielas y juntas para motores 2T y 4T.', href: '/f/motores-4t-y-generadores' },
  { Icono: Bujia, titulo: 'Encendido', texto: 'Bujías, bobinas y juntas de motor.', href: '/f/juntas-de-motor' },
];

/** Dibujo de línea grande de fondo, se traza al entrar en pantalla. */
const Decor = ({ Icono, clase }) => (
  <Dibujo className={`decor ${clase}`} aria-hidden="true">
    <Icono />
  </Dibujo>
);

async function marcasDelCatalogo() {
  try {
    const logos = logosMarcas();
    const claros = logosClaros();
    return (await getMarcasConteo())
      .filter((m) => m.count >= 2)
      .slice(0, 40)
      .map((m) => ({ ...m, logo: logos[m.slug] || null, claro: claros.has(m.slug) }));
  } catch {
    return [];
  }
}

async function familiasDelCatalogo() {
  try {
    return await getFamilias();
  } catch {
    return [];
  }
}

const VENTAJAS = [
  { Icono: Medalla, titulo: "Calidad premium", texto: "Repuestos que marcan la diferencia: elegimos línea por línea lo que de verdad aguanta en el taller." },
  { Icono: Auricular, titulo: "Atención al cliente personalizada", texto: "Un vendedor te asesora por WhatsApp, te ayuda a identificar la pieza y te acompaña en cada pedido." },
  { Icono: Escudo, titulo: "Abastecemos todo el país", texto: "Trabajamos con comercios y talleres de todas las provincias, con reposición durante toda la temporada." },
];

const PRODUCTOS_HERO = [
  { clase: 'tractor', nombre: 'Minitractores', href: '/f/minitractores', Dibujo: MinitractorContorno },
  { clase: 'desma', nombre: 'Desmalezadoras', href: '/f/desmalezadoras', Dibujo: DesmalezadoraContorno },
  { clase: 'moto', nombre: 'Motosierras', href: '/f/motosierras', Dibujo: MotosierraContorno },
];

export default async function Inicio() {
  const [marcas, familias] = await Promise.all([marcasDelCatalogo(), familiasDelCatalogo()]);

  return (
    <>
      <section className="banner-portada oscuro" aria-labelledby="banner-titulo">
        <Image className="banner-portada__foto" src={img("77d023f846654192a94d33c8a444d7f2f000")} alt="" fill sizes="100vw" priority />
        <div className="contenedor banner-portada__grilla">
          <div>
            <p className="antetitulo">Temporada de corte</p>
            <h2 id="banner-titulo" className="display banner-portada__titulo">
              Encontrá todo para tu temporada en
              {" "}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="banner-portada__logo" src="/logo-blanco.png" alt="Logbelts" width="178" height="88" />
            </h2>
            <div className="hero__acciones">
              <a className="boton boton--claro" href="#catalogo">Ver el catálogo <Flecha /></a>
              <Link className="boton boton--borde" href="/contacto">Hablar con un vendedor</Link>
            </div>
          </div>
          <Image className="banner-portada__repuestos" src={img("35daaca77e6a45339220cc0b68371b60")} alt="Repuestos Logbelts para máquinas de jardín" width={1000} height={667} sizes="(max-width: 900px) 92vw, 540px" priority />
        </div>
      </section>

      <section className="ventajas" aria-label="Por qué nos eligen">
        <div className="contenedor ventajas__grilla">
          {VENTAJAS.map(({ Icono, titulo, texto }) => (
            <div className="ventaja" key={titulo}>
              <span className="ventaja__icono"><Icono /></span>
              <div>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

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
              <label htmlFor="hero-q" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }}>Buscar repuestos</label>
              <input id="hero-q" name="q" type="search" placeholder="Código, código original o modelo de máquina" autoComplete="off" />
              <button type="submit" className="boton"><Buscar /> Buscar</button>
            </form>
            <p className="hero__ayuda">Ej: 5888 · Stihl MS 250 · Husqvarna 143R</p>

            <div className="hero__acciones">
              <Link href="/contacto" className="boton boton--claro">Quiero ser distribuidor <Flecha /></Link>
              <a href="#catalogo" className="boton boton--borde">Ver catálogo</a>
            </div>
          </div>
          <div className="hero__productos">
            {PRODUCTOS_HERO.map(({ clase, nombre, href, Dibujo: Contorno }) => (
              <Dibujo key={clase} as="a" href={href} className={`hero__prod hero__prod--${clase}`}>
                <Contorno className="hero__contorno" />
                <span className="hero__prod-nombre">{nombre} <Flecha /></span>
              </Dibujo>
            ))}
          </div>
        </div>
      </section>

      <CintaMarcas marcas={marcas} />

      <section id="catalogo" className="seccion catalogo-portada" aria-labelledby="catalogo-titulo">
        <div className="contenedor">
          <div className="seccion__cabeza">
            <div>
              <p className="antetitulo">Catálogo de repuestos</p>
              <h2 id="catalogo-titulo" className="titulo-seccion">Todo el catálogo, por familia</h2>
              <p className="bajada" style={{ marginTop: 14 }}>
                Buscá por código Logbelts, por código original del fabricante o por marca y modelo de máquina.
              </p>
            </div>
            <Link className="boton boton--borde" href="/descargas">Catálogos en PDF <Flecha /></Link>
          </div>
          <Dibujo className="tipos__grilla">
            {familias.map((f) => {
              const DibujoFamilia = dibujoFamilia(f.nombre);
              return (
                <a key={f.slug} className="tipo" href={`/f/${f.slug}`}>
                  <DibujoFamilia className="tipo__dibujo" />
                  <span className="tipo__nombre">{f.nombre.charAt(0).toUpperCase() + f.nombre.slice(1)}</span>
                  <span className="tipo__cant">{f.count.toLocaleString('es-AR')} {f.count === 1 ? 'producto' : 'productos'}</span>
                  <span className="tipo__ver">Ver repuestos <Flecha /></span>
                </a>
              );
            })}
          </Dibujo>
          <p className="catalogo-portada__aviso">Venta mayorista únicamente. Comunicate con nuestros vendedores para más información.</p>
        </div>
      </section>
      <section className="herramientas oscuro con-decor" aria-labelledby="herramientas-titulo">
        <Decor Icono={Correa} clase="decor--der-arriba decor--grande" />
        <div className="contenedor herramientas__grilla">
          <div>
            <p className="antetitulo">Encontrá el repuesto correcto</p>
            <h2 id="herramientas-titulo" className="titulo-seccion">¿Para qué máquina es?</h2>
            <p className="bajada">Elegí marca y modelo y te mostramos los repuestos compatibles del catálogo.</p>
          </div>
          <div>
            <SelectorMaquina datos={datosSelector()} oscuro />
            <div className="herramientas__accesos">
              <a href="/pedido-rapido"><strong>Pedido rápido</strong><span>Pegá tus códigos o subí un Excel</span></a>
              <Link href="/guias"><strong>Guías técnicas</strong><span>Correas, espadas y cadenas por medida</span></Link>
              <a href="/mi-cuenta"><strong>Mi cuenta</strong><span>Favoritos y pedidos para repetir</span></a>
            </div>
          </div>
        </div>
      </section>
      <section className="seccion tipos con-decor" aria-labelledby="tipos-titulo">
        <Decor Icono={Carburador} clase="decor--izq-arriba decor--enorme" />
        <Decor Icono={FiltroAire} clase="decor--der-abajo" />
        <div className="contenedor">
          <div className="seccion__cabeza">
            <div>
              <p className="antetitulo">Por tipo de repuesto</p>
              <h2 id="tipos-titulo" className="titulo-seccion">¿Qué pieza necesitás?</h2>
            </div>
            <a className="boton boton--borde" href="#catalogo">Todo el catálogo <Flecha /></a>
          </div>
          <Dibujo className="tipos__grilla">
            {TIPOS.map(({ Icono, nombre, href }) => (
              <a key={nombre} href={href} className="tipo">
                <Icono className="tipo__dibujo" />
                <span className="tipo__nombre">{nombre}</span>
                <span className="tipo__ver">Ver repuestos <Flecha /></span>
              </a>
            ))}
          </Dibujo>
        </div>
      </section>
      <section className="precision oscuro con-decor" aria-labelledby="precision-titulo">
        <Decor Icono={Piston} clase="decor--izq-abajo decor--grande" />
        <div className="contenedor precision__grilla">
          <div>
            <p className="antetitulo">Ingeniería en cada repuesto</p>
            <h2 id="precision-titulo" className="titulo-seccion">Precisión que se ve</h2>
            <p className="bajada" style={{ marginTop: 14 }}>
              Cada pieza tiene que calzar exacto en la máquina de tu cliente. Por eso trabajamos con códigos originales,
              medidas y compatibilidades por modelo.
            </p>
            <ul className="precision__lista">
              {PRECISION.map(({ Icono, titulo, texto, href }) => (
                <li key={titulo}>
                  <a href={href}>
                    <Dibujo className="precision__icono"><Icono /></Dibujo>
                    <span>
                      <strong>{titulo}</strong>
                      <span>{texto}</span>
                    </span>
                    <Flecha />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <Piezas3D />
        </div>
      </section>
      <section className="seccion con-decor" aria-labelledby="porque-titulo">
        <Decor Icono={Bujia} clase="decor--izq-abajo" />
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
      <section className="seccion seccion--suelo con-decor" aria-labelledby="pasos-titulo">
        <Decor Icono={Cadena} clase="decor--der-abajo decor--enorme" />
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
            <Link href="/donde-comprar" className="boton boton--borde">Dónde comprar</Link>
          </div>
        </div>
      </section>







    </>
  );
}
