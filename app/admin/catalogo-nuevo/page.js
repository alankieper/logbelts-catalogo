import AdminHeader from '../AdminHeader';
import { listarCatalogoNuevo } from '../../../lib/catalogoNuevo';
import ElegirFotos from './ElegirFotos';
import '../fotos-pendientes/bandeja-fotos.css';
import './catalogo-nuevo.css';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ver = (foto) => (!foto ? null : /^https?:\/\//.test(foto) ? foto : `/fotos/${foto}`);

export default async function CatalogoNuevo() {
  let datos = { aElegir: [], soloPdf: [] };
  let error = null;
  try {
    datos = await listarCatalogoNuevo();
  } catch (e) {
    error = e.message;
  }

  return (
    <>
      <AdminHeader activo="catalogo-nuevo" />
      <main className="adm">
        <div className="wrap">
          <h1>Nuevo catálogo · fotos</h1>
          <p className="sub">
            Al cargar el catálogo 2026.04.32, la foto de cada producto en el PDF quedó como segunda foto, al lado de la de
            siempre. Acá elegís cuál queda: la otra se quita. El cambio se ve en la web al instante.
          </p>
          {error ? <div className="err-msg">{error}</div> : null}
          <ElegirFotos
            aElegir={datos.aElegir.map((p) => ({ ...p, actual: ver(p.actual) }))}
            soloPdf={datos.soloPdf}
          />
        </div>
      </main>
    </>
  );
}
