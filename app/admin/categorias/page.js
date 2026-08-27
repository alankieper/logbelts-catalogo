import AdminHeader from '../AdminHeader';
import { renombrarSub, renombrarFam } from '../productoActions';
import { leerTodos } from '../../../lib/catalogoStore';

export const dynamic = 'force-dynamic';

export default function Categorias() {
  const lista = leerTodos();
  const fams = new Map();
  for (const p of lista) {
    const f = p.familia || '(sin familia)';
    if (!fams.has(f)) fams.set(f, new Map());
    const subs = fams.get(f);
    const s = p.subcategoria || '(sin subcategoría)';
    subs.set(s, (subs.get(s) || 0) + 1);
  }
  const familiasOrden = [...fams.entries()].sort((a, b) => {
    const na = [...a[1].values()].reduce((x, y) => x + y, 0);
    const nb = [...b[1].values()].reduce((x, y) => x + y, 0);
    return nb - na;
  });
  const todasFamilias = familiasOrden.map(([f]) => f);

  return (
    <>
      <AdminHeader activo="categorias" />
      <main className="adm">
        <div className="wrap">
          <h1>Categorías</h1>
          <p className="sub">
            Renombrá o movés subcategorías. Los cambios se aplican a todos los productos de esa subcategoría.
            Sirve para juntar duplicados (ej. “Cilindros completos” + “Kit de cilindros”).
          </p>

          {familiasOrden.map(([familia, subs]) => (
            <div key={familia} style={{ marginBottom: 30 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                <h2 style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', textTransform: 'uppercase', fontSize: '1.15rem', margin: 0 }}>
                  {familia}
                </h2>
                <form action={renombrarFam} style={{ display: 'flex', gap: 6 }}>
                  <input type="hidden" name="viejo" value={familia} />
                  <input name="nuevo" placeholder="Renombrar familia…" style={{ fontSize: 12, padding: '5px 9px', border: '1px solid var(--rule-strong)', borderRadius: 7 }} />
                  <button type="submit" style={{ fontSize: 12, padding: '5px 10px', borderRadius: 7, border: 0, background: 'var(--surface-2)', cursor: 'pointer' }}>OK</button>
                </form>
              </div>

              <table className="admtable">
                <thead>
                  <tr><th>Subcategoría</th><th style={{ width: 70, textAlign: 'right' }}>Prod.</th><th style={{ width: 420 }}>Renombrar / mover</th></tr>
                </thead>
                <tbody>
                  {[...subs.entries()].sort((a, b) => b[1] - a[1]).map(([sub, n]) => (
                    <tr key={sub}>
                      <td>{sub}</td>
                      <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{n}</td>
                      <td>
                        <form action={renombrarSub} style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <input type="hidden" name="familia" value={familia} />
                          <input type="hidden" name="viejo" value={sub} />
                          <input name="nuevo" placeholder="Nuevo nombre" defaultValue={sub} style={{ flex: 1, minWidth: 150, fontSize: 12, padding: '5px 9px', border: '1px solid var(--rule-strong)', borderRadius: 7 }} />
                          <select name="familiaNueva" defaultValue={familia} style={{ fontSize: 12, padding: '5px 8px', border: '1px solid var(--rule-strong)', borderRadius: 7 }}>
                            {todasFamilias.map((f) => <option key={f} value={f}>{f}</option>)}
                          </select>
                          <button type="submit" style={{ fontSize: 12, padding: '5px 12px', borderRadius: 7, border: 0, background: 'var(--brand)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                            Aplicar
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
