import AdminHeader from '../AdminHeader';
import { PROVINCIAS } from '../../../lib/provincias';
import { escrituraDisponible, leerDistribuidores } from '../../../lib/distribuidores';
import { borrarDistribuidorAction, guardarDistribuidorAction } from './actions';

export const dynamic = 'force-dynamic';

function Formulario({ d = {} }) {
  return (
    <form action={guardarDistribuidorAction}>
      {d.id ? <input type="hidden" name="id" value={d.id} /> : null}
      <div className="adm-form">
        <label>Nombre del comercio *<input name="nombre" defaultValue={d.nombre || ''} required /></label>
        <label>Dirección<input name="direccion" defaultValue={d.direccion || ''} /></label>
        <label>Localidad<input name="localidad" defaultValue={d.localidad || ''} /></label>
        <label>
          Provincia
          <select name="provincia" defaultValue={d.provincia || ''}>
            <option value="">—</option>
            {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label>Teléfono<input name="telefono" defaultValue={d.telefono || ''} /></label>
        <label>WhatsApp<input name="whatsapp" defaultValue={d.whatsapp || ''} /></label>
        <label>Latitud (opcional)<input name="lat" defaultValue={d.lat ?? ''} placeholder="-34.6037" /></label>
        <label>Longitud (opcional)<input name="lng" defaultValue={d.lng ?? ''} placeholder="-58.3816" /></label>
        <label>Orden<input name="orden" type="number" defaultValue={d.orden ?? 0} /></label>
        <label style={{ alignSelf: 'end', display: 'flex', gap: 8, alignItems: 'center', fontWeight: 400 }}>
          <input type="checkbox" name="publico" defaultChecked={d.publico !== false} /> Visible en “Dónde comprar”
        </label>
      </div>
      <div className="adm-acciones"><button type="submit">{d.id ? 'Guardar cambios' : 'Agregar distribuidor'}</button></div>
    </form>
  );
}

export default async function DistribuidoresAdmin({ searchParams }) {
  const lista = await leerDistribuidores({ incluirOcultos: true });
  const editando = lista.find((d) => d.id === searchParams?.editar);

  return (
    <>
      <AdminHeader activo="distribuidores" />
      <main className="adm">
        <div className="wrap">
          <h1>Distribuidores</h1>
          <p className="sub">
            Comercios que aceptaron aparecer en el mapa público <a href="/donde-comprar">Dónde comprar</a>. Si no cargás
            coordenadas, se ubican por la localidad (o la capital de la provincia).
          </p>

          {searchParams?.ok ? <p className="ok-msg">Listo.</p> : null}
          {searchParams?.err ? <p className="err-msg">No se pudo guardar: {searchParams.err}</p> : null}
          {!escrituraDisponible ? (
            <div className="adm-aviso">
              <b>Para cargar distribuidores falta:</b>
              <ol>
                <li>Correr <code>supabase/migrations/0011_web_contactos.sql</code> en Supabase.</li>
                <li>Agregar <code>SUPABASE_SERVICE_ROLE_KEY</code> en las variables de entorno de Vercel.</li>
              </ol>
            </div>
          ) : null}

          <div className="adm-card">
            <h3>{editando ? `Editar: ${editando.nombre}` : 'Nuevo distribuidor'}</h3>
            <Formulario key={editando?.id || 'nuevo'} d={editando} />
            {editando ? <p style={{ marginTop: 10 }}><a href="/admin/distribuidores">Cancelar edición</a></p> : null}
          </div>

          {lista.length ? (
            <table className="admtable">
              <thead><tr><th>Comercio</th><th>Zona</th><th>Contacto</th><th>Mapa</th><th /></tr></thead>
              <tbody>
                {lista.map((d) => (
                  <tr key={d.id} className={d.publico ? '' : 'adm-inactivo'}>
                    <td><b>{d.nombre}</b><div className="mut">{d.direccion}</div></td>
                    <td>{[d.localidad, d.provincia].filter(Boolean).join(', ')}</td>
                    <td>{[d.telefono, d.whatsapp].filter(Boolean).join(' · ') || '—'}</td>
                    <td>{d.coord ? (d.aproximado ? 'Aproximado (provincia)' : 'OK') : 'Sin ubicar'}{d.publico ? '' : ' · oculto'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <a href={`/admin/distribuidores?editar=${d.id}`}>Editar</a>
                      <form action={borrarDistribuidorAction} style={{ display: 'inline', marginLeft: 10 }}>
                        <input type="hidden" name="id" value={d.id} />
                        <button type="submit" style={{ background: 'none', border: 0, color: 'var(--peligro, #b42318)', cursor: 'pointer', font: 'inherit', fontWeight: 600 }}>Borrar</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty">Todavía no hay distribuidores cargados.</p>
          )}
        </div>
      </main>
    </>
  );
}
