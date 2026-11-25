import { notFound } from 'next/navigation';
import AdminHeader from '../../AdminHeader';
import { guardarProducto, alternarOculto, quitarMediaProducto, quitarMediaGaleria, promoverPortada, cambiarCodigoProducto } from '../../productoActions';
import { obtener } from '../../../../lib/catalogoStore';
import { getFamilias } from '../../../../lib/catalogo';
import { decodificarCodigo } from '../../../../lib/codigoLogbelts';
import SubirMedia from '../../../components/SubirMedia';
import EditorFoto from '../../../components/EditorFoto';
import { MARCA } from '../../../../lib/marca';
import { despieceDe, listarMaquinas, maquinasDeProducto } from '../../../../lib/maquinas';

export const dynamic = 'force-dynamic';

// `version` evita que el navegador muestre la foto vieja después de editarla (mismo nombre de archivo)
const mediaSrc = (v, carpeta, version) =>
  (v ? (/^https?:\/\//.test(v) ? v : `/${carpeta}/${v}${version ? `?v=${encodeURIComponent(version)}` : ''}`) : null);

export default async function EditarProducto({ params, searchParams }) {
  const codigo = decodeURIComponent(params.codigo);
  const p = await obtener(codigo);
  if (!p) notFound();
  const familias = (await getFamilias()).map((f) => f.nombre);
  const ok = searchParams?.ok === '1';
  const err = searchParams?.err;
  const fotoSrc = mediaSrc(p.foto, 'fotos', p.editado_en);
  const galeria = (p.galeria || []).map((v) => mediaSrc(v, 'fotos', p.editado_en));
  const videos = (p.videos || []).map((v) => mediaSrc(v, 'videos'));
  const dec = decodificarCodigo(p.codigo);
  // Campo "Despiece": máquinas del producto. Si la base todavía no tiene la columna, se muestra
  // la carga inicial sin poder guardarla (ver supabase/despieces-para-pegar.sql).
  const despieceEditable = Array.isArray(p.despiece);
  const [maquinasTodas, maquinasProducto] = await Promise.all([listarMaquinas(), maquinasDeProducto(p.codigo)]);

  return (
    <>
      <AdminHeader activo="productos" />
      <main className="adm">
        <div className="wrap">
          <a className="backlink" href="/admin/productos">← Volver a la lista</a>
          <div className="cod-row">
            <h1>{p.codigo}</h1>
            <details className="cod-edit">
              <summary title={`Editar ${MARCA.codigo.etiqueta.toLowerCase()}`}>✏️</summary>
              <form action={cambiarCodigoProducto}>
                <input type="hidden" name="codigoViejo" value={p.codigo} />
                <input name="codigoNuevo" defaultValue={p.codigo} maxLength={7} />
                <button type="submit">Guardar código</button>
              </form>
            </details>
          </div>
          <p className="sub">
            Origen: {p.origen} · página {p.pagina || '—'} · fuente descripción: {p.fuente_desc || '—'}
            {p.editado_en ? ` · editado ${new Date(p.editado_en).toLocaleString('es-AR')}` : ''}
          </p>

          {ok ? <div className="ok-msg">Cambios guardados.</div> : null}
          {err ? <div className="err-msg">{err}</div> : null}

          <div className="cod-lectura">
            <p className="cod-lectura-title">Lectura del código <a href="/admin/codigos" className="cod-lectura-link">(ver tabla completa)</a></p>
            {dec.rubroNombre ? <span className="cod-tag">Rubro {dec.rubro} · {dec.rubroNombre}</span> : null}
            {dec.subrubroNombre ? <span className="cod-tag">Subrubro {dec.subrubro} · {dec.subrubroNombre}</span> : null}
            {dec.productoNombre ? <span className="cod-tag">Tipo {dec.producto} · {dec.productoNombre}</span> : null}
            {dec.item ? <span className="cod-tag">Variante {dec.item}</span> : null}
            {dec.errores.length ? (
              <p className="cod-lectura-warn">
                Este código no coincide del todo con el esquema estándar (no afecta al producto): {dec.errores.join(' ')}
              </p>
            ) : null}
          </div>

          <div className="prod-edit-grid">
            <div className="media-col">
              <section className="mp-card">
                <header className="mp-head">
                  <h2 className="mp-titulo">Foto de portada</h2>
                  <span className="mp-nota">{p.foto ? (/^https?:/.test(p.foto) ? 'subida' : p.foto) : 'sin foto'}</span>
                </header>
                <div className="mp-portada">
                  {fotoSrc ? <img src={fotoSrc} alt={`Portada de ${p.codigo}`} /> : (
                    <span className="mp-vacio">
                      <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" /></svg>
                      Todavía no tiene foto
                    </span>
                  )}
                </div>
                {p.foto ? (
                  <div className="mp-acc">
                    <EditorFoto codigo={p.codigo} src={fotoSrc} original={p.foto} etiqueta="Recortar · rotar · espejar" />
                    <form action={quitarMediaProducto}>
                      <input type="hidden" name="codigo" value={p.codigo} />
                      <button type="submit" className="mp-quitar" title="Quitar foto de portada" aria-label="Quitar foto de portada">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        Quitar
                      </button>
                    </form>
                  </div>
                ) : null}
              </section>

              {galeria.length ? (
                <section className="mp-card">
                  <header className="mp-head">
                    <h2 className="mp-titulo">Más fotos</h2>
                    <span className="mp-nota">{galeria.length} {galeria.length === 1 ? 'foto' : 'fotos'}</span>
                  </header>
                  <div className="mp-galeria">
                    {galeria.map((src, i) => {
                      const original = p.galeria[i];
                      return (
                        <div className="mp-item" key={original}>
                          <div className="mp-item-img"><img src={src} alt={`Foto ${i + 2} de ${p.codigo}`} loading="lazy" /></div>
                          <div className="mp-item-acc">
                            <EditorFoto codigo={p.codigo} src={src} original={original} etiqueta="Editar" />
                            <form action={promoverPortada}>
                              <input type="hidden" name="codigo" value={p.codigo} />
                              <input type="hidden" name="url" value={original} />
                              <button type="submit" className="mp-btn" title="Usar como foto de portada">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" /></svg>
                                Portada
                              </button>
                            </form>
                            <form action={quitarMediaGaleria}>
                              <input type="hidden" name="codigo" value={p.codigo} />
                              <input type="hidden" name="tipo" value="galeria" />
                              <input type="hidden" name="url" value={original} />
                              <button type="submit" className="mp-btn mp-btn--quitar" title="Quitar esta foto" aria-label="Quitar esta foto">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                              </button>
                            </form>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {videos.length ? (
                <section className="mp-card">
                  <header className="mp-head">
                    <h2 className="mp-titulo">Videos</h2>
                    <span className="mp-nota">{videos.length}</span>
                  </header>
                  {videos.map((src, i) => {
                    const original = p.videos[i];
                    return (
                      <div className="mp-video" key={original}>
                        <video className="media-video" src={src} controls preload="metadata" />
                        <form action={quitarMediaGaleria}>
                          <input type="hidden" name="codigo" value={p.codigo} />
                          <input type="hidden" name="tipo" value="video" />
                          <input type="hidden" name="url" value={original} />
                          <button type="submit" className="mp-quitar">Quitar video</button>
                        </form>
                      </div>
                    );
                  })}
                </section>
              ) : null}

              <SubirMedia codigo={p.codigo} />
            </div>

            <form action={guardarProducto} className="form-grid">
              <input type="hidden" name="codigo" value={p.codigo} />

              <div>
                <label>Nombre</label>
                <input name="nombre" defaultValue={p.nombre || ''} />
              </div>
              <div>
                <label>Descripción</label>
                <textarea name="descripcion" defaultValue={p.descripcion || ''} />
              </div>

              <div className="row2">
                <div>
                  <label>Familia</label>
                  <input name="familia" defaultValue={p.familia || ''} list="familias" />
                  <datalist id="familias">
                    {familias.map((f) => <option key={f} value={f} />)}
                  </datalist>
                </div>
                <div>
                  <label>Subcategoría</label>
                  <input name="subcategoria" defaultValue={p.subcategoria || ''} />
                </div>
              </div>

              <div className="row2">
                <div>
                  <label>Marcas (separadas por coma)</label>
                  <input name="marcas" defaultValue={(p.marcas || []).join(', ')} />
                </div>
                <div>
                  <label>Códigos originales (coma o salto de línea)</label>
                  <input name="codigo_original" defaultValue={(p.codigo_original || []).join(', ')} />
                </div>
              </div>

              <div>
                <label>Compatibilidad (para qué máquina/modelo)</label>
                <textarea name="compatibilidad" defaultValue={p.compatibilidad || ''} />
              </div>

              <div>
                <label htmlFor="despiece">Despiece: máquinas de este repuesto (separadas por coma)</label>
                <input
                  id="despiece"
                  name={despieceEditable ? 'despiece' : undefined}
                  defaultValue={despieceDe(p).join(', ')}
                  list="maquinas-despiece"
                  placeholder="Stihl FS 38, Stihl FS 55"
                  disabled={!despieceEditable}
                />
                <datalist id="maquinas-despiece">
                  {maquinasTodas.map((m) => <option key={m.clave} value={m.texto} />)}
                </datalist>
                <p style={{ fontSize: 12, color: 'var(--ink-faint)', margin: '5px 0 0', lineHeight: 1.45 }}>
                  {despieceEditable
                    ? 'Con estos nombres el repuesto aparece en la página y en el despiece de cada máquina. No importan mayúsculas, espacios ni guiones (FS55 = FS 55).'
                    : 'Para poder editarlo falta actualizar la base de datos (archivo supabase/despieces-para-pegar.sql).'}
                  {maquinasProducto.length ? (
                    <>
                      {' '}Ver:{' '}
                      {maquinasProducto.map((m, i) => (
                        <span key={m.clave}>
                          {i ? ', ' : ''}
                          <a href={`/maquinas/${m.marcaSlug}/${m.modeloSlug}`} target="_blank">{m.marca} {m.modelo}</a>
                        </span>
                      ))}
                    </>
                  ) : null}
                </p>
              </div>

              <div className="row2">
                <div>
                  <label>Ubicación</label>
                  <input name="ubicacion" defaultValue={p.ubicacion || ''} />
                </div>
                <div>
                  <label>Medidas (separadas por coma)</label>
                  <input name="medidas" defaultValue={(p.medidas || []).join(', ')} />
                </div>
              </div>

              <div className="form-actions">
                <button className="save" type="submit">Guardar</button>
                <a className="cancel" href={`/p/${encodeURIComponent(p.codigo)}`} target="_blank">Ver en el catálogo</a>
              </div>
            </form>
          </div>

          <form action={alternarOculto} style={{ marginTop: 24 }}>
            <input type="hidden" name="codigo" value={p.codigo} />
            <button className="danger" type="submit" style={{ border: '1px solid var(--peligro-borde, #f0d3d3)', borderRadius: 9, padding: '10px 16px', background: 'var(--surface-peligro, #fff)', color: 'var(--peligro, #b3261e)', fontWeight: 700, cursor: 'pointer' }}>
              {p.oculto ? 'Volver a mostrar en el catálogo' : 'Ocultar del catálogo'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
