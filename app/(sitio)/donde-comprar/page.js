import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MARCA, modulo } from '../../../lib/marca';
import { leerDistribuidores } from '../../../lib/distribuidores';
import { DISTRIBUIDORES_MUESTRA, CIUDADES_BUSCADOR } from '../../../lib/distribuidoresMuestra';
import { waLink } from '../../../lib/telefono';
import MapaDondeComprar from '../../components/sitio/MapaDondeComprar';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dónde comprar',
  description: `Comercios y talleres que venden repuestos ${MARCA.nombre} para bosque y jardín en todo el país. Encontrá el más cercano.`,
};

export default async function DondeComprar({ searchParams }) {
  if (!modulo('distribuidores')) notFound();

  const reales = await leerDistribuidores();
  // ?muestra=1 muestra 30 comercios inventados para ver cómo funciona el mapa (sólo si todavía no hay reales).
  const muestra = !reales.length && searchParams?.muestra === '1';
  const lista = (muestra ? DISTRIBUIDORES_MUESTRA : reales).map((d) => ({
    id: d.id, nombre: d.nombre, localidad: d.localidad || '', provincia: d.provincia || '',
    direccion: d.direccion || '', telefono: d.telefono || '', coord: d.coord || null,
    wa: waLink(d.whatsapp || d.telefono, `Hola, los encontré en la web de ${MARCA.nombre}.`) || null,
  }));

  return (
    <>
      <section className="cabecera oscuro">
        <div className="contenedor">
          <p className="antetitulo">Red de distribuidores</p>
          <h1 className="titulo-seccion">Dónde comprar {MARCA.nombre}</h1>
          <p>Vendemos únicamente por mayor. Si buscás repuestos para tu máquina, acercate al comercio más cercano.</p>
        </div>
      </section>

      <section className="seccion seccion--suelo">
        <div className="contenedor">
          {muestra ? (
            <p className="aviso-muestra" role="note">
              <strong>Vista de muestra.</strong> Estos 30 comercios son inventados para mostrar cómo funciona el mapa. Cuando se carguen los distribuidores reales, aparecen ellos.
            </p>
          ) : null}
          {lista.length ? (
            <MapaDondeComprar distribuidores={lista} ciudades={CIUDADES_BUSCADOR} muestra={muestra} />
          ) : (
            <div className="vacio-sitio">
              <h2 className="display">Estamos armando el mapa</h2>
              <p>Muy pronto vas a poder encontrar acá los comercios que venden {MARCA.nombre} en tu zona.</p>
              <div className="hero__acciones" style={{ justifyContent: 'center' }}>
                <Link className="boton" href="/contacto">¿Tenés un comercio? Sumate</Link>
              </div>
            </div>
          )}

          <p className="nota-sitio">¿Sos distribuidor y querés aparecer en el mapa? <Link href="/contacto">Avisale a tu vendedor</Link>.</p>
        </div>
      </section>
    </>
  );
}
