import AdminHeader from '../../AdminHeader';
import { crearProducto } from '../../productoActions';
import { getFamilias } from '../../../../lib/catalogo';

export const dynamic = 'force-dynamic';

export default function NuevoProducto({ searchParams }) {
  const familias = getFamilias().map((f) => f.nombre);
  const err = searchParams?.err;

  return (
    <>
      <AdminHeader activo="productos" />
      <main className="adm">
        <div className="wrap">
          <a className="backlink" href="/admin/productos">← Volver a la lista</a>
          <h1>Agregar producto</h1>
          <p className="sub">Carga manual. El código Logbelts es obligatorio y no se puede repetir.</p>

          {err ? <div className="err-msg">{err}</div> : null}

          <form action={crearProducto} className="form-grid">
            <div className="row2">
              <div>
                <label>Código Logbelts *</label>
                <input name="codigo" required placeholder="Ej: 5888090" />
              </div>
              <div>
                <label>Foto (archivo en public/fotos/)</label>
                <input name="foto" placeholder="Ej: 5888090.jpg" />
              </div>
            </div>
            <div>
              <label>Nombre</label>
              <input name="nombre" />
            </div>
            <div>
              <label>Descripción</label>
              <textarea name="descripcion" />
            </div>
            <div className="row2">
              <div>
                <label>Familia</label>
                <input name="familia" list="familias" />
                <datalist id="familias">{familias.map((f) => <option key={f} value={f} />)}</datalist>
              </div>
              <div>
                <label>Subcategoría</label>
                <input name="subcategoria" />
              </div>
            </div>
            <div className="row2">
              <div>
                <label>Marcas (coma)</label>
                <input name="marcas" />
              </div>
              <div>
                <label>Códigos originales (coma)</label>
                <input name="codigo_original" />
              </div>
            </div>
            <div>
              <label>Compatibilidad</label>
              <textarea name="compatibilidad" />
            </div>
            <div className="row2">
              <div>
                <label>Ubicación</label>
                <input name="ubicacion" />
              </div>
              <div>
                <label>Medidas (coma)</label>
                <input name="medidas" />
              </div>
            </div>
            <div className="form-actions">
              <button className="save" type="submit">Crear producto</button>
              <a className="cancel" href="/admin/productos">Cancelar</a>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
