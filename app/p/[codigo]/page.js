import { notFound } from 'next/navigation';
import CatalogoHeader from '../../components/CatalogoHeader';
import ProductoCard from '../../components/ProductoCard';
import { getProducto, getRelacionados, getVecinos, getFamilia, slugify } from '../../../lib/catalogo';
import { despiecesDeProducto } from '../../../lib/despieces';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const p = await getProducto(decodeURIComponent(params.codigo));
  if (!p) return { title: 'Producto no encontrado — Catálogo Logbelts' };
  return {
    title: `${p.codigo} · ${p.nombre || p.clave_producto || 'Producto'} — Catálogo Logbelts`,
    description: p.descripcion || undefined,
  };
}

export default async function ProductoPage({ params }) {
  const codigo = decodeURIComponent(params.codigo);
  const p = await getProducto(codigo);
  if (!p) notFound();

  const fam = await getFamilia(p.familiaSlug);
  const sub = fam?.subcats.find((s) => s.slug === p.subSlug);
  const rel = await getRelacionados(codigo, 4);
  const { prev, next } = await getVecinos(codigo);
  const desp = await despiecesDeProducto(codigo, p.compatibilidad);

  const derivada = p.fuente_desc && p.fuente_desc.startsWith('derivada');
  const marcas = new Set([...(p.marcas || [])]);
  const catUrl = fam && sub ? `/c/${fam.slug}/${sub.slug}` : '/';

  const specs = [];
  if (p.ubicacion) specs.push(['Ubicación', p.ubicacion]);
  if (p.medidas && p.medidas.length) specs.push(['Medidas', p.medidas.join(' · ')]);
  if (p.ref_interna && p.ref_interna.length) specs.push(['Ref. interna', p.ref_interna.join(' · ')]);
  if (p.clave_producto) specs.push(['Tipo (clave)', p.clave_producto]);

  return (
    <>
      <CatalogoHeader />
      <main className="cat">
        <div className="wrap">
          <a className="backlink" href={catUrl}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            Volver a {sub ? sub.nombre : 'inicio'}
          </a>
          <nav className="crumb">
            <a href="/">Inicio</a>
            <span className="sep">/</span>
            {fam ? (<><a href={`/f/${fam.slug}`}>{fam.nombre}</a><span className="sep">/</span></>) : null}
            {fam && sub ? (<><a href={catUrl}>{sub.nombre}</a><span className="sep">/</span></>) : null}
            <span aria-current="page">{p.codigo}</span>
          </nav>

          <div className="detail">
            <div className="gallery">
              <div className="gmain">
                {p.foto ? <img src={`/fotos/${p.foto}`} alt={p.nombre || p.codigo} /> : <span className="noimg">sin foto</span>}
              </div>
              <p className="gcap">
                {p.foto
                  ? `Foto del catálogo (confianza ${p.foto_confianza || '—'}) · pendiente de alta resolución`
                  : 'Sin foto cargada'}
              </p>
            </div>

            <div>
              <div className="dhead">
                <div className="code">Código Logbelts · {p.codigo}</div>
                <h1>{p.nombre || p.clave_producto || 'Producto'}</h1>
                <div className="badges">
                  {p.fuente_desc === 'editado' || p.fuente_desc === 'manual' ? <span className="b-ok">Revisado</span> : null}
                  {p.fuente_desc === 'texto del PDF' ? <span className="b-ok">Datos del PDF</span> : null}
                  {derivada ? <span className="b-warn">Descripción a confirmar</span> : null}
                  {p.flags && p.flags.includes('NUEVO') ? <span className="b-wash">Nuevo</span> : null}
                  {p.estado === 'sin_codigo' ? <span className="b-wash">Código a asignar</span> : null}
                </div>
              </div>

              {p.descripcion ? <p className="ddesc">{p.descripcion}</p> : <p className="muted-line">Descripción a completar.</p>}
              {derivada ? (
                <p className="muted-line">
                  Esta descripción se derivó de la clasificación del código y la sección del catálogo. Falta precisar el modelo exacto.
                </p>
              ) : null}

              {marcas.size ? (
                <div className="brandchips">
                  {[...marcas].map((m) => (
                    <a key={m} href={`/m/${slugify(m)}`}>{m}</a>
                  ))}
                </div>
              ) : null}

              {specs.length ? (
                <div className="specsheet">
                  <h3>Datos técnicos</h3>
                  {specs.map(([k, v]) => (
                    <div className="srow" key={k}><dt>{k}</dt><dd>{v}</dd></div>
                  ))}
                </div>
              ) : null}

              <div className="specsheet">
                <h3>Compatibilidad</h3>
                {p.compatibilidad ? (
                  <div className="srow"><dt>Aplicación</dt><dd>{p.compatibilidad}</dd></div>
                ) : (
                  <div className="srow"><dt>—</dt><dd className="mut">A completar</dd></div>
                )}
              </div>

              <div className="specsheet">
                <h3>Códigos originales / equivalencias</h3>
                {p.codigo_original && p.codigo_original.length ? (
                  p.codigo_original.map((o, i) => (
                    <div className="srow" key={i}><dt>OEM</dt><dd>{o}</dd></div>
                  ))
                ) : (
                  <div className="srow"><dt>—</dt><dd className="mut">A completar</dd></div>
                )}
              </div>

              {desp.oficiales.length ? (
                <div className="specsheet">
                  <h3>Manuales y despieces de la máquina</h3>
                  {desp.curados.map((c) => (
                    <div className="srow" key={c.id}>
                      <dt>{c.marca} {c.modelo}</dt>
                      <dd>
                        <a href={c.archivo ? `/despieces/${c.archivo}` : c.url} target="_blank" rel="noreferrer">
                          {c.titulo}
                        </a>
                        <span className="mut"> · {c.fuente}</span>
                      </dd>
                    </div>
                  ))}
                  {desp.oficiales.map((o, i) => (
                    <div className="srow" key={i}>
                      <dt>{o.marca} {o.modelo}</dt>
                      <dd style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                        {o.oficial ? (
                          <a href={o.oficial.url} target="_blank" rel="noreferrer">{o.oficial.label} ↗</a>
                        ) : null}
                        <a href={o.diagramas.url} target="_blank" rel="noreferrer">Diagramas de partes ↗</a>
                      </dd>
                    </div>
                  ))}
                  <div className="srow">
                    <dt>—</dt>
                    <dd className="mut" style={{ fontSize: 11.5 }}>
                      Enlaces a sitios oficiales de cada marca. Los PDF propios de Logbelts se cargan desde Administración.
                    </dd>
                  </div>
                </div>
              ) : null}

              <a
                className="cta"
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Hola, consulto por el producto ${p.codigo} — ${p.nombre || ''} (Catálogo Logbelts, pág. ${p.pagina || '—'})`
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15l-1.4 5 5.1-1.3A10 10 0 1012 2zm0 2a8 8 0 11-4.2 14.8l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 0112 4z" /></svg>
                Consultar este producto
              </a>

              <p className="dfoot">Referencia: Catálogo Logbelts 2025/26 · página {p.pagina || '—'}</p>
            </div>
          </div>

          {(prev || next) ? (
            <div className="prevnext">
              {prev ? (
                <a href={`/p/${encodeURIComponent(prev.codigo)}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                  <span>{prev.codigo} · {prev.nombre || ''}</span>
                </a>
              ) : <span />}
              {next ? (
                <a href={`/p/${encodeURIComponent(next.codigo)}`}>
                  <span>{next.codigo} · {next.nombre || ''}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
                </a>
              ) : <span />}
            </div>
          ) : null}

          {rel.length ? (
            <div className="related">
              <h2>Productos relacionados</h2>
              <div className="pgrid">
                {rel.map((r) => (
                  <ProductoCard key={r.codigo} p={r} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <footer className="cat">
        <div className="wrap">Logbelts · Catálogo · versión de trabajo</div>
      </footer>
    </>
  );
}
