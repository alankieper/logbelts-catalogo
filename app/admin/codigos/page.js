import AdminHeader from '../AdminHeader';
import { leerTodos } from '../../../lib/catalogoStore';
import { RUBROS, SUBRUBROS, PRODUCTOS, decodificarCodigo } from '../../../lib/codigoLogbelts';
import ExplorarCodigos from './ExplorarCodigos';

export const dynamic = 'force-dynamic';

export default async function Codigos() {
  const todos = await leerTodos();
  const productos = todos.map((p) => ({ codigo: p.codigo, nombre: p.nombre }));

  const ok = todos.reduce((n, p) => n + (decodificarCodigo(p.codigo).valido ? 1 : 0), 0);
  const pct = todos.length ? Math.round((ok / todos.length) * 100) : 0;

  return (
    <>
      <AdminHeader activo="codigos" />
      <main className="adm">
        <div className="wrap">
          <h1>Códigos Logbelts</h1>
          <p className="sub">
            Esquema [RUBRO][SUBRUBRO][PRODUCTO][ITEM] = 7 dígitos. Sirve para decodificar cualquier código
            y para armar el código de un producto nuevo desde "Agregar producto".
          </p>

          <div className="kpis" style={{ marginBottom: 26 }}>
            <div className="kpi"><div className="n">{todos.length}</div><div className="l">códigos en el catálogo</div></div>
            <div className="kpi"><div className="n">{pct}%</div><div className="l">coinciden con el esquema estándar</div></div>
            <div className="kpi"><div className="n">{todos.length - ok}</div><div className="l">con alguna excepción (no rompen nada)</div></div>
          </div>

          <ExplorarCodigos productos={productos} />

          <div className="cod-explorar-box">
            <label>Tablas de referencia</label>
            <div className="cod-ref-grid">
              <div>
                <p className="cod-ref-title">Rubro (posición 1)</p>
                <ul className="cod-ref-list">
                  {Object.entries(RUBROS).map(([k, v]) => <li key={k}><b>{k}</b> — {v}</li>)}
                </ul>
              </div>
              <div>
                <p className="cod-ref-title">Subrubro (posición 2, según rubro)</p>
                {Object.entries(SUBRUBROS).map(([rk, tabla]) => (
                  <div key={rk} style={{ marginBottom: 10 }}>
                    <p className="cod-ref-sub">Rubro {rk} · {RUBROS[rk]}</p>
                    <ul className="cod-ref-list">
                      {Object.entries(tabla).map(([k, v]) => <li key={k}><b>{k}</b> — {v}</li>)}
                    </ul>
                  </div>
                ))}
                <p className="sub" style={{ margin: '4px 0 0' }}>Rubros sin tabla de subrubros propia: 1 y 5.</p>
              </div>
              <div>
                <p className="cod-ref-title">Tipo de parte (posiciones 3-4, compartida)</p>
                <ul className="cod-ref-list">
                  {Object.entries(PRODUCTOS).map(([k, v]) => <li key={k}><b>{k}</b> — {v}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
