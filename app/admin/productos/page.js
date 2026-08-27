import AdminHeader from '../AdminHeader';
import { alternarOculto } from '../productoActions';
import { leerTodos } from '../../../lib/catalogoStore';

export const dynamic = 'force-dynamic';

const PAGE = 40;

export default async function ListaProductos({ searchParams }) {
  const q = (searchParams?.q || '').toString().trim().toLowerCase();
  const familia = (searchParams?.familia || '').toString();
  const soloDeriv = searchParams?.deriv === '1';
  const soloSinFoto = searchParams?.sinfoto === '1';
  const soloOcultos = searchParams?.ocultos === '1';
  const pagina = Math.max(1, parseInt(searchParams?.p || '1', 10) || 1);

  let lista = await leerTodos();
  if (familia) lista = lista.filter((p) => p.familia === familia);
  if (soloDeriv) lista = lista.filter((p) => p.fuente_desc && p.fuente_desc.startsWith('derivada'));
  if (soloSinFoto) lista = lista.filter((p) => !p.foto);
  if (soloOcultos) lista = lista.filter((p) => p.oculto);
  if (q) {
    lista = lista.filter((p) => {
      const hay = [p.codigo, p.nombre, p.descripcion, (p.marcas || []).join(' '), (p.codigo_original || []).join(' '), p.subcategoria]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }
  lista.sort((a, b) => a.codigo.localeCompare(b.codigo));

  const total = lista.length;
  const paginas = Math.max(1, Math.ceil(total / PAGE));
  const p = Math.min(pagina, paginas);
  const slice = lista.slice((p - 1) * PAGE, p * PAGE);

  const qs = (over) => {
    const sp = new URLSearchParams();
    if (over.q ?? q) sp.set('q', over.q ?? q);
    if (over.familia ?? familia) sp.set('familia', over.familia ?? familia);
    if ((over.deriv ?? soloDeriv)) sp.set('deriv', '1');
    if ((over.sinfoto ?? soloSinFoto)) sp.set('sinfoto', '1');
    if ((over.ocultos ?? soloOcultos)) sp.set('ocultos', '1');
    if (over.p && over.p > 1) sp.set('p', String(over.p));
    const s = sp.toString();
    return '/admin/productos' + (s ? `?${s}` : '');
  };

  return (
    <>
      <AdminHeader activo="productos" />
      <main className="adm">
        <div className="wrap">
          <h1>Productos</h1>
          <p className="sub">{total.toLocaleString('es-AR')} productos {familia ? `en ${familia}` : ''}{soloDeriv ? ' · descripción a confirmar' : ''}{soloSinFoto ? ' · sin foto' : ''}{soloOcultos ? ' · ocultos' : ''}</p>

          <form className="admbar" method="get">
            <input name="q" defaultValue={q} placeholder="Buscar código, nombre, marca, OEM…" style={{ minWidth: 260 }} />
            {familia ? <input type="hidden" name="familia" value={familia} /> : null}
            {soloDeriv ? <input type="hidden" name="deriv" value="1" /> : null}
            <button className="btn" type="submit">Buscar</button>
            <a className="btn ghost" href="/admin/productos/nuevo">+ Agregar</a>
            {(q || familia || soloDeriv || soloSinFoto || soloOcultos) ? <a className="btn ghost" href="/admin/productos">Limpiar</a> : null}
          </form>

          <div className="admbar" style={{ fontSize: 12.5, color: 'var(--ink-faint)' }}>
            Filtros rápidos:
            <a className="btn ghost" href={qs({ deriv: !soloDeriv })}>{soloDeriv ? '✓ ' : ''}A confirmar</a>
            <a className="btn ghost" href={qs({ sinfoto: !soloSinFoto })}>{soloSinFoto ? '✓ ' : ''}Sin foto</a>
            <a className="btn ghost" href={qs({ ocultos: !soloOcultos })}>{soloOcultos ? '✓ ' : ''}Ocultos</a>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admtable">
              <thead>
                <tr>
                  <th style={{ width: 84 }}>Código</th>
                  <th>Nombre</th>
                  <th style={{ width: 170 }}>Categoría</th>
                  <th style={{ width: 120 }}>Estado</th>
                  <th style={{ width: 150 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((row) => {
                  const deriv = row.fuente_desc && row.fuente_desc.startsWith('derivada');
                  return (
                    <tr key={row.codigo}>
                      <td className="cod">{row.codigo}</td>
                      <td>
                        <a href={`/admin/productos/${encodeURIComponent(row.codigo)}`}>{row.nombre || row.clave_producto || '(sin nombre)'}</a>
                        {row.marcas && row.marcas.length ? <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{row.marcas.join(', ')}</div> : null}
                      </td>
                      <td style={{ fontSize: 12 }}>{row.familia || '—'}<div style={{ color: 'var(--ink-faint)' }}>{row.subcategoria || ''}</div></td>
                      <td>
                        {row.oculto ? <span className="tag off">Oculto</span> : deriv ? <span className="tag warn">A confirmar</span> : <span className="tag ok">OK</span>}
                        {!row.foto ? <span className="tag off" style={{ marginLeft: 4 }}>sin foto</span> : null}
                      </td>
                      <td>
                        <a href={`/admin/productos/${encodeURIComponent(row.codigo)}`} style={{ marginRight: 10 }}>Editar</a>
                        <form action={alternarOculto} style={{ display: 'inline' }}>
                          <input type="hidden" name="codigo" value={row.codigo} />
                          <button type="submit" style={{ background: 'none', border: 0, color: 'var(--brand-ink)', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                            {row.oculto ? 'Mostrar' : 'Ocultar'}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
                {!slice.length ? <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-faint)', padding: 30 }}>Sin resultados.</td></tr> : null}
              </tbody>
            </table>
          </div>

          {paginas > 1 ? (
            <div className="pager">
              {p > 1 ? <a href={qs({ p: p - 1 })}>← Anterior</a> : null}
              <span>Página {p} de {paginas}</span>
              {p < paginas ? <a href={qs({ p: p + 1 })}>Siguiente →</a> : null}
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
