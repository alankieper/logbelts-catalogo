import FormularioContacto from '../../components/sitio/FormularioContacto';

export const metadata = { title: 'Contacto' };

export default function Contacto() {
  return (
    <>
      <section className="cabecera oscuro" style={{ paddingBottom: 90 }}>
        <div className="contenedor">
          <p className="antetitulo">Venta mayorista</p>
          <h1 className="titulo-seccion">Contactate con nosotros</h1>
          <p>¿Tenés un comercio o taller? Dejanos tus datos y un vendedor te contacta para asesorarte.</p>
        </div>
      </section>
      <div className="contenedor">
        <FormularioContacto />
      </div>
    </>
  );
}
