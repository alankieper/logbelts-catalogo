import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MARCA, modulo } from '../../../lib/marca';
import { Flecha } from '../../components/sitio/Iconos';

export const metadata = {
  title: 'Guías técnicas',
  description: `Cómo identificar correas de minitractor, espadas y cadenas de motosierra, y cuándo usar tanza o cuchilla. Con buscador sobre el catálogo ${MARCA.nombre}.`,
};

const GUIAS = [
  { href: '/guias/correas', titulo: 'Correas de minitractor', texto: 'Cómo medirlas y buscador por largo, ancho y marca sobre las correas del catálogo.' },
  { href: '/guias/espadas-y-cadenas', titulo: 'Espadas y cadenas', texto: 'Qué son el paso, el calibre y los eslabones, y buscador por medida.' },
  { href: '/guias/tanza-o-cuchilla', titulo: '¿Tanza o cuchilla?', texto: 'Qué accesorio conviene en desmalezadoras según el trabajo.' },
];

export default function Guias() {
  if (!modulo('guias')) notFound();

  return (
    <>
      <section className="cabecera oscuro">
        <div className="contenedor">
          <p className="antetitulo">Aprendé con {MARCA.nombre}</p>
          <h1 className="titulo-seccion">Guías técnicas</h1>
          <p>Para identificar el repuesto correcto en el mostrador, sin vueltas.</p>
        </div>
      </section>
      <section className="seccion seccion--suelo">
        <div className="contenedor guias-grilla">
          {GUIAS.map(g => (
            <Link key={g.href} href={g.href} className="guia-tarjeta">
              <h2 className="display">{g.titulo}</h2>
              <p>{g.texto}</p>
              <span>Leer guía <Flecha /></span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
