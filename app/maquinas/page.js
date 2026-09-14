import CatalogoHeader from '../components/CatalogoHeader';
import SelectorMaquina from '../components/SelectorMaquina';
import { datosSelector, listarMarcas } from '../../lib/maquinas';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Repuestos por máquina',
  description: 'Elegí la marca y el modelo de la máquina y encontrá los repuestos compatibles del catálogo Logbelts.',
};

export default function MaquinasPage() {
  const marcas = listarMarcas();

  return (
    <>
      <CatalogoHeader />
      <main className="cat">
        <div className="wrap">
          <nav className="crumb">
            <a href="/productos">Catálogo</a>
            <span className="sep">/</span>
            <span aria-current="page">Por máquina</span>
          </nav>
          <p className="eyebrow">Buscador por máquina</p>
          <h1 className="page">¿Para qué máquina es el repuesto?</h1>
          <p className="lead">Elegí la marca y el modelo, y te mostramos los repuestos del catálogo que le sirven.</p>

          <div className="banda-maquina">
            <SelectorMaquina datos={datosSelector()} />
          </div>

          <div className="tiles">
            {marcas.map((m) => (
              <a className="tile" key={m.slug} href={`/maquinas/${m.slug}`}>
                <span className="txt">
                  <h3>{m.marca}</h3>
                  <span className="count">
                    {m.nModelos} modelo{m.nModelos === 1 ? '' : 's'} · {m.nProductos} repuesto{m.nProductos === 1 ? '' : 's'}
                  </span>
                </span>
              </a>
            ))}
          </div>

          <p className="note">
            <b>¿No está tu máquina?</b> La compatibilidad sale del catálogo y se sigue completando. Buscá por código
            original o <a href="/buscar">escribí la marca y el modelo en el buscador</a>; si no aparece, pedilo y te lo buscamos.
          </p>
        </div>
      </main>
      <footer className="cat">
        <div className="wrap">Logbelts · Catálogo · versión de trabajo</div>
      </footer>
    </>
  );
}
