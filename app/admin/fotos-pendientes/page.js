import AdminHeader from '../AdminHeader';
import { listarPendientes } from '../../../lib/fotosPendientes';
import { leerTodos } from '../../../lib/catalogoStore';
import BandejaFotos from './BandejaFotos';
import './bandeja-fotos.css';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const fotoActual = (foto) => (!foto ? null : /^https?:\/\//.test(foto) ? foto : `/fotos/${foto}`);

export default async function FotosPendientes({ searchParams }) {
  let pendientes = [];
  let errorCarga = null;
  try {
    pendientes = await listarPendientes();
  } catch (e) {
    errorCarga = e.message;
  }
  const productos = new Map((await leerTodos()).map((p) => [p.codigo, p]));
  const ok = searchParams?.ok === '1';
  const n = Number(searchParams?.n || 0);
  const err = searchParams?.err || errorCarga;

  return (
    <>
      <AdminHeader activo="fotos" />
      <main className="adm">
        <div className="wrap">
          <h1>Fotos pendientes</h1>
          <p className="sub">
            Fotos que mandó la extensión de Chrome &ldquo;Logbelts · Fotos del catálogo&rdquo;. Al aprobar, la foto nueva
            reemplaza a la actual y se ve en la web al instante. Al rechazar, se borra.
          </p>

          {ok && n > 0 && pendientes.length ? <div className="ok-msg">{n === 1 ? 'Foto aprobada y publicada.' : `${n} fotos aprobadas y publicadas.`}</div> : null}
          {searchParams?.rechazada ? <div className="ok-msg">Foto rechazada.</div> : null}
          {err ? <div className="err-msg">{err}</div> : null}

          {pendientes.length ? (
            <BandejaFotos
              fotos={pendientes.map((f) => {
                const p = productos.get(f.codigo);
                return { nombre: f.nombre, codigo: f.codigo, producto: p?.nombre || '', actual: fotoActual(p?.foto), url: f.url, lado: f.lado || null, fecha: f.fecha, pagina: f.pagina || null };
              })}
            />
          ) : ok && n > 0 ? (
            <div className="bdj-exito" role="status">
              <strong>¡{n === 1 ? 'Se actualizó 1 foto' : `Se actualizaron ${n} fotos`}! 🎉</strong>
              <span>Ya se ven en la web. Las próximas que guardes con la extensión van a aparecer acá.</span>
            </div>
          ) : (
            <p style={{ marginTop: 18 }}>No hay fotos pendientes. Las que guardes con la extensión van a aparecer acá.</p>
          )}
        </div>
      </main>
    </>
  );
}
