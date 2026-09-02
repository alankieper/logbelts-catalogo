import AdminHeader from '../AdminHeader';
import { agregarOem } from '../productoActions';
import { leerTodos } from '../../../lib/catalogoStore';
import { getFamilias } from '../../../lib/catalogo';
import { leerEventos } from '../../../lib/eventos';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const PAGE = 30;

// arma una búsqueda de Google útil para encontrar el código original
function linkBusqueda(p) {
  const marca = (p.marcas || [])[0] || '';
  const nombre = (p.nombre || p.clave_producto || '').replace(/\s+—.*$/, '').replace(/\bRepl\b.*/i, '').trim();
  const modelo = ((p.compatibilidad || p.descripcion || '').match(/\b(?:FS|MS|HS|GX|GC|CS|SRM|PB|LT|YTH|RZT)[ -]?\d{2,4}[A-Z]{0,3}|\b\d{2,3}R\b/i) || [''])[0];
  // dedupe de palabras (los nombres OCR vienen repetidos)
  const vistas = new Set();
  const q = [marca, nombre, modelo, 'número de parte OEM despiece']
    .join(' ')
    .split(/\s+/)
    .filter((w) => w && (vistas.has(w.toLowerCase()) ? false : vistas.add(w.toLowerCase())))
    .join(' ');
  return 'https://www.google.com/search?q=' + encodeURIComponent(q);
}

export default async function AdminOem({ searchParams }) {
  const q = (searchParams?.q || '').toString().trim().toLowerCase();
  const familia = (searchParams?.familia || '').toString();
  const orden = (searchParams?.orden || 'vistos').toString();
  const pagina = Math.max(1, parseInt(searchParams?.p || '1', 10) || 1);
  const ok = searchParams?.ok === '1';

  const [todos, familias, eventos] = await Promise.all([
    leerTodos(),
    getFamilias().then((f) => f.map((x) => x.nombre)),
    leerEventos(90).catch(() => []),
  ]);

  const interes = new Map();
  for (const e of eventos) {
    if ((e.tipo === 'ver' || e.tipo === 'consulta') && e.codigo) interes.set(e.codigo, (interes.get(e.codigo) || 0) + 1);
  }

  let lista = todos.filter((p) => !p.oculto && (!p.codigo_original || !p.codigo_original.length));
  if (familia) lista = lista.filter((p) => p.familia === familia);
  if (q) {
    lista = lista.filter((p) =>
      [p.codigo, p.nombre, p.descripcion, (p.marcas || []).join(' '), p.subcategoria].join(' ').toLowerCase().includes(q)
    );
  }
  lista.sort((a, b) => {
    if (orden === 'vistos') {
      const d = (interes.get(b.codigo) || 0) - (interes.get(a.codigo) || 0);
      if (d) return d;
    }
    return a.codigo.localeCompare(b.codigo);
  });

  const total = lista.length;
  const paginas = Math.max(1, Math.ceil(total / PAGE));
  const p = Math.min(pagina, paginas);
  const slice = lista.slice((p - 1) * PAGE, p * PAGE);

  const conOem = todos.filter((x) => x.codigo_original && x.codigo_original.length).length;
  const qs = (over) => {
    const sp = new URLSearchParams();
    if (over.q ?? q) sp.set('q', over.q ?? q);
    if (over.familia ?? familia) sp.set('familia', over.familia ?? familia);
    if ((over.orden ?? orden) !== 'vistos') sp.set('orden', over.orden ?? orden);
    if (over.p && over.p > 1) sp.set('p', String(over.p));
    const s = sp.toString();
    return '/admin/oem' + (s ? `?${s}` : '');
  };
  const volver = qs({ p });

  return (
    <>
      <AdminHeader activo="oem" />
      <main className="adm">
        <div className="wrap">
          <h1>Códigos originales (OEM)</h1>
          <p className="sub">
            {conOem.toLocaleString('es-AR')} productos con código original · <b>{total.toLocaleString('es-AR')} sin cargar</b>
            {familia ? ` en ${familia}` : ''}. Están arriba los más vistos/consultados.
          </p>
          {ok ? <div className="ok-msg">Código original guardado.</div> : null}

          <form className="admbar" method="get">
            <input name="q" defaultValue={q} placeholder="Buscar código, nombre, marca…" style={{ minWidth: 240 }} />
            <select name="familia" defaultValue={familia}>
              <option value="">Todas las familias</option>
              {familias.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <select name="orden" defaultValue={orden}>
              <option value="vistos">Más vistos primero</option>
              <option value="codigo">Por código</option>
            </select>
            <button className="btn" type="submit">Filtrar</button>
            {(q || familia || orden !== 'vistos') ? <a className="btn ghost" href="/admin/oem">Limpiar</a> : null}
          </form>

          <div style={{ overflowX: 'auto' }}>
            <table className="admtable oemtable">
              <thead>
                <tr>
                  <th style={{ width: 78 }}>Código</th>
                  <th>Producto</th>
                  <th style={{ width: 120 }}>Buscar</th>
                  <th style={{ width: 320 }}>Código original</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((row) => (
                  <tr key={row.codigo}>
                    <td className="cod">
                      <a href={`/admin/productos/${encodeURIComponent(row.codigo)}`}>{row.codigo}</a>
                      {interes.get(row.codigo) ? <div className="oem-int">{interes.get(row.codigo)} vistas</div> : null}
                    </td>
                    <td>
                      {row.nombre || row.clave_producto || '(sin nombre)'}
                      <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
                        {(row.marcas || []).join(', ')}{row.compatibilidad ? ` · ${row.compatibilidad.slice(0, 60)}` : ''}
                      </div>
                    </td>
                    <td>
                      <a className="btn ghost" href={linkBusqueda(row)} target="_blank" rel="noreferrer">Google ↗</a>
                    </td>
                    <td>
                      <form action={agregarOem} className="oem-add">
                        <input type="hidden" name="codigo" value={row.codigo} />
                        <input type="hidden" name="volver" value={volver} />
                        <input name="oem" placeholder="pegá el/los códigos, separados por coma" />
                        <button type="submit">Guardar</button>
                      </form>
                    </td>
                  </tr>
                ))}
                {!slice.length ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: 30, color: 'var(--ink-faint)' }}>Sin productos sin OEM con estos filtros.</td></tr> : null}
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
