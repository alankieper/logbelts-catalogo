import { notFound } from 'next/navigation';
import AdminHeader from '../../AdminHeader';
import { guardarProducto, alternarOculto, quitarMediaProducto } from '../../productoActions';
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
  const videoSrc = mediaSrc(p.video, 'videos');

  return (
    <>
      <AdminHeader activo="productos" />
      <main className="adm">
        <div className="wrap">
          <a className="backlink" href="/admin/productos">← Volver a la lista</a>
          <h1>{p.codigo}</h1>
          <p className="sub">
            Origen: {p.origen} · página {p.pagina || '—'} · fuente descripción: {p.fuente_desc || '—'}
            {p.editado_en ? ` · editado ${new Date(p.editado_en).toLocaleString('es-AR')}` : ''}
          </p>

          {ok ? <div className="ok-msg">Cambios guardados.</div> : null}
          {err ? <div className="err-msg">{err}</div> : null}

          <div style={{ display: 'grid', gap: 28, gridTemplateColumns: '240px 1fr', alignItems: 'start' }}>
            <div className="media-col">
              <div className="gmain" style={{ maxWidth: 240, borderRadius: 12 }}>
                {fotoSrc ? <img src={fotoSrc} alt="" /> : <span className="noimg">sin foto</span>}
              </div>

              {videoSrc ? (
                <video className="media-video" src={videoSrc} controls preload="metadata" />
              ) : null}

              <SubirMedia codigo={p.codigo} />

              <div className="media-acc">
                {p.foto ? (
                  <form action={quitarMediaProducto}>
                    <input type="hidden" name="codigo" value={p.codigo} />
                    <input type="hidden" name="campo" value="foto" />
                    <button type="submit" className="media-del">Quitar foto</button>
                  </form>
                ) : null}
                {p.video ? (
                  <form action={quitarMediaProducto}>
                    <input type="hidden" name="codigo" value={p.codigo} />
                    <input type="hidden" name="campo" value="video" />
                    <button type="submit" className="media-del">Quitar video</button>
                  </form>
                ) : null}
              </div>

              <p className="gcap" style={{ marginTop: 4 }}>
                {p.foto ? `foto: ${/^https?:/.test(p.foto) ? 'subida' : p.foto} (${p.foto_confianza || '—'})` : 'sin foto'}
                {p.video ? ' · con video' : ''}
              </p>
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
