import { notFound } from 'next/navigation';
import AdminHeader from '../../AdminHeader';
import { guardarProducto, alternarOculto, quitarMediaProducto, quitarMediaGaleria, promoverPortada, cambiarCodigoProducto } from '../../productoActions';
import { obtener } from '../../../../lib/catalogoStore';
import { getFamilias } from '../../../../lib/catalogo';
import SubirMedia from '../../../components/SubirMedia';

export const dynamic = 'force-dynamic';

const mediaSrc = (v, carpeta) => (v ? (/^https?:\/\//.test(v) ? v : `/${carpeta}/${v}`) : null);

export default async function EditarProducto({ params, searchParams }) {
  const codigo = decodeURIComponent(params.codigo);
  const p = await obtener(codigo);
  if (!p) notFound();
  const familias = (await getFamilias()).map((f) => f.nombre);
  const ok = searchParams?.ok === '1';
  const err = searchParams?.err;
  const fotoSrc = mediaSrc(p.foto, 'fotos');
  const galeria = (p.galeria || []).map((v) => mediaSrc(v, 'fotos'));
  const videos = (p.videos || []).map((v) => mediaSrc(v, 'videos'));

  return (
    <>
      <AdminHeader activo="productos" />
      <main className="adm">
        <div className="wrap">
          <a className="backlink" href="/admin/productos">← Volver a la lista</a>
          <div className="cod-row">
            <h1>{p.codigo}</h1>
            <details className="cod-edit">
              <summary title="Editar código Logbelts">✏️</summary>
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

          <div style={{ display: 'grid', gap: 28, gridTemplateColumns: '280px 1fr', alignItems: 'start' }}>
            <div className="media-col">
              <p className="media-label">Portada</p>
              <div className="gmain" style={{ maxWidth: 240, borderRadius: 12 }}>
                {fotoSrc ? <img src={fotoSrc} alt="" /> : <span className="noimg">sin foto</span>}
              </div>
              {p.foto ? (
                <form action={quitarMediaProducto} className="media-acc">
                  <input type="hidden" name="codigo" value={p.codigo} />
                  <button type="submit" className="media-del">Quitar foto de portada</button>
                </form>
              ) : null}
              <p className="gcap" style={{ marginTop: 4 }}>
                {p.foto ? `foto: ${/^https?:/.test(p.foto) ? 'subida' : p.foto} (${p.foto_confianza || '—'})` : 'sin foto'}
              </p>

              {galeria.length ? (
                <>
                  <p className="media-label">Galería ({galeria.length})</p>
                  <div className="media-grid">
                    {galeria.map((src, i) => {
                      const original = p.galeria[i];
                      return (
                        <div className="media-thumb" key={original}>
                          <img src={src} alt="" />
                          <div className="media-thumb-acc">
                            <form action={promoverPortada}>
                              <input type="hidden" name="codigo" value={p.codigo} />
                              <input type="hidden" name="url" value={original} />
                              <button type="submit" title="Usar como portada">Portada</button>
                            </form>
                            <form action={quitarMediaGaleria}>
                              <input type="hidden" name="codigo" value={p.codigo} />
                              <input type="hidden" name="tipo" value="galeria" />
                              <input type="hidden" name="url" value={original} />
                              <button type="submit" title="Quitar">✕</button>
                            </form>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : null}

              {videos.length ? (
                <>
                  <p className="media-label">Videos ({videos.length})</p>
                  {videos.map((src, i) => {
                    const original = p.videos[i];
                    return (
                      <div className="media-thumb media-thumb-video" key={original}>
                        <video className="media-video" src={src} controls preload="metadata" />
                        <form action={quitarMediaGaleria}>
                          <input type="hidden" name="codigo" value={p.codigo} />
                          <input type="hidden" name="tipo" value="video" />
                          <input type="hidden" name="url" value={original} />
                          <button type="submit" className="media-del">Quitar video</button>
                        </form>
                      </div>
                    );
                  })}
                </>
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
            <button className="danger" type="submit" style={{ border: '1px solid #f0d3d3', borderRadius: 9, padding: '10px 16px', background: '#fff', color: '#b3261e', fontWeight: 700, cursor: 'pointer' }}>
              {p.oculto ? 'Volver a mostrar en el catálogo' : 'Ocultar del catálogo'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
