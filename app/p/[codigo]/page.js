import { notFound } from 'next/navigation';
import CatalogoHeader from '../../components/CatalogoHeader';
import ProductoCard from '../../components/ProductoCard';
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
              <div className="gmain">
                {p.foto ? <img src={`/fotos/${p.foto}`} alt={p.nombre || p.codigo} /> : <span className="noimg">sin foto</span>}
              </div>
              <p className="gcap">
                {p.foto ? 'Imagen del catálogo Logbelts' : 'Sin imagen en el catálogo'}
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

              <a
                className="cta"
                href={`https://wa.me/5491161142012?text=${encodeURIComponent(
                  `Hola, consulto por el producto ${p.codigo} — ${p.nombre || ''} (Catálogo Logbelts, pág. ${p.pagina || '—'})`
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.437-9.884 9.888-9.884a9.82 9.82 0 016.988 2.898 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" /></svg>
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
