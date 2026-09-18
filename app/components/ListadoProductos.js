import ProductoCard from './ProductoCard';
import FiltrosMovil from './FiltrosMovil';
import Paginacion from './Paginacion';
import NavCategorias from './NavCategorias';
import { slugify } from '../../lib/catalogo';
import { paginar } from '../../lib/paginar';

/**
 * Listado de productos del catálogo con filtros (marca, foto y, en la vista de familia
 * completa, subcategoría), orden y paginación de a 24. Lo usan:
 *  - /c/[familia]/[sub]      una subcategoría
 *  - /f/[familia]/todo       "Ver todo en [familia]" (subcats = subcategorías de la familia)
 * Todo el estado vive en la URL (?marca=&foto=1&orden=&sub=&pagina=), así el botón Atrás
 * y los links compartidos vuelven exactamente al mismo lugar.
 *
 * Props:
 *  todos        productos del listado (sin filtrar)
 *  base         ruta del listado, sin query
 *  searchParams los de la página
 *  categorias   chips de categorías [{ href, nombre, on }]
 *  subcats      (sólo vista familia) [{ slug, nombre }] en el orden de la familia
 *  nav          { anterior, siguiente } para "Ir a la siguiente categoría" al final
 *  tipoNav      'categoría' | 'familia'
 */
export default function ListadoProductos({ todos, base, searchParams, categorias = [], subcats = null, nav = null, tipoNav = 'categoría' }) {
  const vistaFamilia = Array.isArray(subcats);
  const ordenSub = new Map((subcats || []).map((s, i) => [s.slug, i]));
  const nombreSub = new Map((subcats || []).map((s) => [s.slug, s.nombre]));

  const marcaSel = searchParams?.marca || '';
  const soloFoto = searchParams?.foto === '1';
  const subSel = vistaFamilia && ordenSub.has(searchParams?.sub) ? searchParams.sub : '';
  const ordenDefecto = vistaFamilia ? 'categoria' : 'codigo';
  const orden = ['codigo', 'nombre', 'categoria'].includes(searchParams?.orden) && (vistaFamilia || searchParams.orden !== 'categoria')
    ? searchParams.orden
    : ordenDefecto;

  // conteos para los filtros (sobre el total, sin filtrar)
  const marcaCount = {};
  for (const p of todos) for (const m of p.marcas || []) marcaCount[m] = (marcaCount[m] || 0) + 1;
  const marcasDisp = Object.keys(marcaCount).sort((a, b) => marcaCount[b] - marcaCount[a] || a.localeCompare(b));
  const subCount = {};
  if (vistaFamilia) for (const p of todos) subCount[p.subSlug] = (subCount[p.subSlug] || 0) + 1;

  let lista = todos.filter((p) => {
    if (subSel && p.subSlug !== subSel) return false;
    if (marcaSel && !(p.marcas || []).some((m) => slugify(m) === marcaSel)) return false;
    if (soloFoto && !p.foto) return false;
    return true;
  });
  const porCodigo = (a, b) => a.codigo.localeCompare(b.codigo);
  lista = lista.slice().sort((a, b) => {
    if (orden === 'nombre') return (a.nombre || '').localeCompare(b.nombre || '') || porCodigo(a, b);
    if (orden === 'categoria') return (ordenSub.get(a.subSlug) ?? 999) - (ordenSub.get(b.subSlug) ?? 999) || porCodigo(a, b);
    return porCodigo(a, b);
  });

  // Sólo se arma la página pedida (24 productos), no todo el listado de golpe
  const pag = paginar(lista, searchParams?.pagina);
  const filtrosActivos = (marcaSel ? 1 : 0) + (soloFoto ? 1 : 0) + (subSel ? 1 : 0);
  const qp = (over) => {
    const sp = new URLSearchParams();
    const sub = 'sub' in over ? over.sub : subSel;
    const marca = 'marca' in over ? over.marca : marcaSel;
    const foto = 'foto' in over ? over.foto : soloFoto ? '1' : '';
    const o = 'orden' in over ? over.orden : orden;
    if (sub) sp.set('sub', sub);
    if (marca) sp.set('marca', marca);
    if (foto) sp.set('foto', foto);
    if (o && o !== ordenDefecto) sp.set('orden', o);
    // cambiar un filtro u orden vuelve a la página 1; sólo la paginación pasa ?pagina=
    if (over.pagina > 1) sp.set('pagina', String(over.pagina));
    const s = sp.toString();
    return s ? `${base}?${s}` : base;
  };
  const opcion = (activa) => ({ fontWeight: activa ? 700 : 400, color: activa ? 'var(--brand-ink)' : undefined });

  return (
    <>
      {/* En celular: categorías y marcas como chips deslizables */}
      {categorias.length ? (
        <div className="chiprow" aria-label="Categorías">
          <span className="chiprow__k">Categorías</span>
          {categorias.map((c) => (
            <a className="chip-lnk" key={c.href} href={c.href} data-on={c.on ? 'true' : undefined} aria-current={c.on ? 'page' : undefined}>
              {c.nombre}
            </a>
          ))}
        </div>
      ) : null}
      {marcasDisp.length ? (
        <div className="chiprow" aria-label="Marcas">
          <span className="chiprow__k">Marcas</span>
          <a className="chip-lnk" href={qp({ marca: '' })} data-on={marcaSel ? undefined : 'true'}>Todas</a>
          {marcasDisp.map((m) => {
            const sm = slugify(m);
            return (
              <a className="chip-lnk" key={sm} href={qp({ marca: marcaSel === sm ? '' : sm })} data-on={marcaSel === sm ? 'true' : undefined}>
                {m}
              </a>
            );
          })}
        </div>
      ) : null}

      <div className="catgrid">
        <div className="filters">
          <FiltrosMovil activos={filtrosActivos} resultados={lista.length}>
            <div className="fpanel">
              {vistaFamilia ? (
                <div className="fgroup">
                  <h4>Subcategoría</h4>
                  <a className="fopt" href={qp({ sub: '' })} style={opcion(!subSel)}>
                    Todas <span className="n">{todos.length}</span>
                  </a>
                  {subcats.map((s) => (
                    <a key={s.slug} className="fopt" href={qp({ sub: subSel === s.slug ? '' : s.slug })} style={opcion(subSel === s.slug)}>
                      {s.nombre} <span className="n">{subCount[s.slug] || 0}</span>
                    </a>
                  ))}
                </div>
              ) : null}
              <div className="fgroup">
                <h4>Marca</h4>
                <a className="fopt" href={qp({ marca: '' })} style={opcion(!marcaSel)}>
                  Todas <span className="n">{todos.length}</span>
                </a>
                {marcasDisp.map((m) => {
                  const s = slugify(m);
                  return (
                    <a className="fopt" key={s} href={qp({ marca: marcaSel === s ? '' : s })} style={opcion(marcaSel === s)}>
                      {m} <span className="n">{marcaCount[m]}</span>
                    </a>
                  );
                })}
              </div>
              <div className="fgroup">
                <h4>Foto</h4>
                <a className="fopt" href={qp({ foto: soloFoto ? '' : '1' })} style={{ fontWeight: soloFoto ? 700 : 400 }}>
                  {soloFoto ? '☑' : '☐'} Sólo con foto
                </a>
              </div>
            </div>
          </FiltrosMovil>
        </div>

        <div id="productos">
          <div className="toolbar">
            <span className="res">
              {pag.paginas > 1 ? `${pag.desde}–${pag.hasta} de ` : ''}
              {lista.length.toLocaleString('es-AR')}
              {lista.length !== todos.length ? ` (de ${todos.length.toLocaleString('es-AR')})` : ''} productos
              {pag.paginas > 1 ? ` · página ${pag.pagina} de ${pag.paginas}` : ''}
            </span>
            <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              {vistaFamilia ? (
                <a className="fmini" style={{ width: 'auto', padding: '6px 10px' }} href={qp({ orden: 'categoria' })} data-on={orden === 'categoria'}>Categoría</a>
              ) : null}
              <a className="fmini" style={{ width: 'auto', padding: '6px 10px' }} href={qp({ orden: 'codigo' })} data-on={orden === 'codigo'}>Código</a>
              <a className="fmini" style={{ width: 'auto', padding: '6px 10px' }} href={qp({ orden: 'nombre' })} data-on={orden === 'nombre'}>Nombre</a>
            </span>
          </div>

          {lista.length ? (
            <div className="pgrid">
              {pag.items.map((p) => (
                <ProductoCard key={p.codigo} p={p} subcategoria={vistaFamilia ? nombreSub.get(p.subSlug) || p.subLabel : null} />
              ))}
            </div>
          ) : (
            <div className="empty">Ningún producto coincide con los filtros.</div>
          )}

          <Paginacion pagina={pag.pagina} paginas={pag.paginas} href={(n) => qp({ pagina: n })} />
          {nav && pag.pagina === pag.paginas ? (
            <NavCategorias variante="final" anterior={nav.anterior} siguiente={nav.siguiente} tipo={tipoNav} />
          ) : null}
        </div>
      </div>
    </>
  );
}
