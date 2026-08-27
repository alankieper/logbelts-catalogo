import { notFound } from 'next/navigation';
import AdminHeader from '../../AdminHeader';
import { guardarProducto, alternarOculto } from '../../productoActions';
import { obtener } from '../../../../lib/catalogoStore';
import { getFamilias } from '../../../../lib/catalogo';

export const dynamic = 'force-dynamic';

export default async function EditarProducto({ params, searchParams }) {
  const codigo = decodeURIComponent(params.codigo);
  const p = await obtener(codigo);
  if (!p) notFound();
  const familias = (await getFamilias()).map((f) => f.nombre);
  const ok = searchParams?.ok === '1';

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

          <div style={{ display: 'grid', gap: 28, gridTemplateColumns: '220px 1fr', alignItems: 'start' }}>
            <div>
              <div className="gmain" style={{ maxWidth: 220, borderRadius: 12 }}>
                {p.foto ? <img src={`/fotos/${p.foto}`} alt="" /> : <span className="noimg">sin foto</span>}
              </div>
              <p className="gcap">
                {p.foto ? `foto: ${p.foto} (${p.foto_confianza || '—'})` : 'sin foto'}
              </p>
              <p style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
                Para cambiar la foto: copiá el archivo a <code>public/fotos/</code> con el nombre <code>{p.codigo}.jpg</code> y poné ese nombre en el campo “Foto”.
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
