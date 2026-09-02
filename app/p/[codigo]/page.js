import { notFound } from 'next/navigation';
import CatalogoHeader from '../../components/CatalogoHeader';
import ProductoCard from '../../components/ProductoCard';
import ZoomImg from '../../components/ZoomImg';
import ConsultaCTA from '../../components/ConsultaCTA';
import BotonAgregar from '../../components/BotonAgregar';
import Registrar from '../../components/Registrar';
import { getProducto, getRelacionados, getVecinos, getFamilia, slugify } from '../../../lib/catalogo';
import { despiecesDeProducto } from '../../../lib/despieces';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const p = await getProducto(decodeURIComponent(params.codigo));
  if (!p) return { title: 'Producto no encontrado — Catálogo Logbelts' };
  const descReal = p.descripcion && !(p.fuente_desc && p.fuente_desc.startsWith('derivada'));
  return {
    title: `${p.codigo} · ${p.nombre || p.clave_producto || 'Producto'} — Catálogo Logbelts`,
    description: descReal ? p.descripcion : undefined,
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
  const tieneDesc = !!(p.descripcion && !derivada);
  const marcas = new Set([...(p.marcas || [])]);
  const catUrl = fam && sub ? `/c/${fam.slug}/${sub.slug}` : '/';

  // sólo datos reales del catálogo (nunca inventados)
  const specs = [];
  if (p.medidas && p.medidas.length) specs.push(['Medidas', p.medidas.join(' · ')]);
  if (p.ubicacion) specs.push(['Ubicación', p.ubicacion]);
  if (p.ref_interna && p.ref_interna.length) specs.push(['Ref. interna', p.ref_interna.join(' · ')]);

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
              {p.foto ? (
                <ZoomImg src={`/fotos/${p.foto}`} alt={p.nombre || p.codigo} />
              ) : (
                <div className="gmain"><span className="noimg">sin foto</span></div>
              )}
              <p className="gcap">
                {p.foto ? 'Imagen del catálogo Logbelts · pasá el mouse para ampliar' : 'Sin imagen en el catálogo'}
              </p>
            </div>

            <div>
              <div className="dhead">
                <div className="dcode">
                  <span className="dcode-k">Código Logbelts</span>
                  <span className="dcode-n">{p.codigo}</span>
                </div>
                <h1>{p.nombre || p.clave_producto || 'Producto'}</h1>
                <div className="badges">
                  {p.fuente_desc === 'editado' || p.fuente_desc === 'manual' ? <span className="b-ok">Revisado</span> : null}
                  {p.fuente_desc === 'texto del PDF' || p.fuente_desc === 'texto del PDF (OCR)' ? <span className="b-ok">Datos del catálogo</span> : null}
                  {derivada ? <span className="b-warn">Requiere revisión</span> : null}
                  {p.flags && p.flags.includes('NUEVO') ? <span className="b-wash">Nuevo</span> : null}
                  {p.estado === 'sin_codigo' ? <span className="b-wash">Código a asignar</span> : null}
                </div>
              </div>

              {marcas.size ? (
                <div className="brandchips">
                  {[...marcas].map((m) => (
                    <a key={m} href={`/m/${slugify(m)}`}>{m}</a>
                  ))}
                </div>
              ) : null}

              <div className="specsheet">
                <h3>Descripción</h3>
                <div className="srow srow-desc">
                  {tieneDesc ? (
                    <dd className="descfull">{p.descripcion}</dd>
                  ) : (
                    <dd className="revision">Requiere revisión — el catálogo no tiene una descripción específica para este código.</dd>
                  )}
                </div>
                {specs.map(([k, v]) => (
                  <div className="srow" key={k}><dt>{k}</dt><dd>{v}</dd></div>
                ))}
              </div>

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

              <div className="dacc">
                <ConsultaCTA codigo={p.codigo} nombre={p.nombre || p.clave_producto || ''} pagina={p.pagina} />
                <BotonAgregar codigo={p.codigo} nombre={p.nombre || p.clave_producto || p.codigo} />
              </div>

              <p className="dfoot">Referencia: Catálogo Logbelts 2025/26 · página {p.pagina || '—'}</p>
              <Registrar tipo="ver" codigo={p.codigo} />
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
