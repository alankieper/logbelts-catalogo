import AdminHeader from '../AdminHeader';
import { supabase } from '../../../lib/supabase';
import { PROVINCIAS } from '../../../lib/provincias';
import { agregarVendedor, cambiarActivo, guardarDatosVendedor } from './actions';
import { MARCA } from '../../../lib/marca';

// Dominio de los mails del equipo, tomado del mail de contacto de lib/marca.js.
const DOMINIO = (MARCA.contacto.email || '').split('@')[1] || 'tuempresa.com';

export const dynamic = 'force-dynamic';

export default async function Vendedores({ searchParams }) {
  const result = await supabase.from('vendedores').select('*').order('nombre');
  const vendedores = result.data || [];
  const faltaMigracion = vendedores.length > 0 && !('provincias' in vendedores[0]);

  return (
    <>
      <AdminHeader activo="vendedores" />
      <main className="adm">
        <div className="wrap">
          <h1>Vendedores</h1>
          <p className="sub">
            Cada contacto de la web se asigna al vendedor que cubre su provincia. Si nadie la cubre, va a un vendedor sin
            provincias marcadas (general). Con teléfono cargado, el cliente puede escribirle directo y los pedidos le llegan a él.
          </p>

          {searchParams?.ok ? <p className="ok-msg">Datos guardados.</p> : null}
          {searchParams?.err ? <p className="err-msg">No se pudo guardar. ¿Ya se corrió la migración 0011?</p> : null}
          {faltaMigracion ? (
            <div className="adm-aviso">
              <b>Falta la migración 0011.</b> Corré <code>supabase/migrations/0011_web_contactos.sql</code> en Supabase para cargar teléfono, email y zonas.
            </div>
          ) : null}

          {vendedores.map((v) => (
            <div key={v.id} className={'adm-card' + (v.activo ? '' : ' adm-inactivo')}>
              <h3>
                {v.nombre}
                {v.activo ? null : <span className="est estado-descartado">Inactivo</span>}
                <form action={cambiarActivo} style={{ marginLeft: 'auto' }}>
                  <input type="hidden" name="id" value={v.id} />
                  <input type="hidden" name="activo" value={String(v.activo)} />
                  <span className="adm-acciones" style={{ marginTop: 0 }}>
                    <button type="submit" className={v.activo ? 'ghost' : ''}>{v.activo ? 'Desactivar' : 'Activar'}</button>
                  </span>
                </form>
              </h3>
              <form action={guardarDatosVendedor}>
                <input type="hidden" name="id" value={v.id} />
                <div className="adm-form">
                  <label>WhatsApp<input name="telefono" defaultValue={v.telefono || ''} placeholder="11 5555-5555" /></label>
                  <label>Email para avisos<input name="email" type="email" defaultValue={v.email || ''} placeholder={`nombre@${DOMINIO}`} /></label>
                  <label style={{ alignSelf: 'end', display: 'flex', gap: 8, alignItems: 'center', fontWeight: 400 }}>
                    <input type="checkbox" name="recibe_contactos" defaultChecked={v.recibe_contactos !== false} /> Recibe contactos de la web
                  </label>
                  <fieldset className="full" style={{ border: 0, padding: 0, margin: 0 }}>
                    <legend style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', marginBottom: 6 }}>Provincias que atiende (vacío = general)</legend>
                    <div className="adm-provincias">
                      {PROVINCIAS.map((p) => (
                        <label key={p}>
                          <input type="checkbox" name="provincias" value={p} defaultChecked={(v.provincias || []).includes(p)} /> {p}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
                <div className="adm-acciones"><button type="submit">Guardar</button></div>
              </form>
            </div>
          ))}

          <form action={agregarVendedor} className="admbar" style={{ marginTop: 18 }}>
            <input name="nombre" required placeholder="Nombre del nuevo vendedor" />
            <button className="btn" type="submit">Agregar vendedor</button>
          </form>
        </div>
      </main>
    </>
  );
}
