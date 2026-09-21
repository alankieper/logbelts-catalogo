import { notFound } from 'next/navigation';
import '../../admin-extra.css';
import '../despieces-admin.css';
import AdminHeader from '../../AdminHeader';
import { obtenerDiagrama, diagramasDeMaquina } from '../../../../lib/despieceDiagramas';
import { maquinaPorClave } from '../../../../lib/maquinas';
import { getProducto } from '../../../../lib/catalogo';
import { guardarDespiece, borrarDespiece } from '../actions';
import CambiarImagen from './CambiarImagen';
import PiezasExtra from './PiezasExtra';
import FiltroPiezas from './FiltroPiezas';

export const dynamic = 'force-dynamic';

const foto = (p) => (p.foto ? (/^https?:\/\//.test(p.foto) ? p.foto : `/fotos/${p.foto}`) : null);
const porRef = (a, b) => String(a).localeCompare(String(b), 'es', { numeric: true });

export default async function EditarDespiece({ params, searchParams }) {
  const d = await obtenerDiagrama(decodeURIComponent(params.id));
  if (!d) notFound();
  const maquina = await maquinaPorClave(d.clave);
  const productos = maquina ? (await Promise.all(maquina.codigos.map((c) => getProducto(c)))).filter(Boolean) : [];
  const hermanos = (await diagramasDeMaquina(d.clave, { todos: true })).filter((x) => x.id !== d.id);

  const refDe = new Map((d.piezas || []).filter((x) => x.codigo).map((x) => [x.codigo, x.ref]));
  const extras = (d.piezas || []).filter((x) => !x.codigo).sort((a, b) => porRef(a.ref, b.ref));
  // los que ya tienen número primero (en orden del dibujo), después el resto por familia y nombre
  const filas = [...productos].sort((a, b) => {
    const ra = refDe.get(a.codigo), rb = refDe.get(b.codigo);
    if (ra && rb) return porRef(ra, rb);
    if (ra || rb) return ra ? -1 : 1;
    return String(a.familia || '').localeCompare(String(b.familia || ''), 'es') || String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es');
  });
  const numerados = filas.filter((p) => refDe.get(p.codigo)).length;

  return (
    <>
      <AdminHeader activo="despieces" />
      <main className="adm">
        <div className="wrap">
          <nav className="crumb" style={{ marginBottom: 10 }}>
            <a href="/admin/despieces">Despieces</a> <span className="sep">/</span> {d.marca} {d.modelo}
          </nav>
          <h1>{d.variante}</h1>
          <p className="sub">
            Despiece de la <b>{d.marca} {d.modelo}</b>
            {hermanos.length ? ` · otras variantes: ${hermanos.map((h) => h.variante).join(', ')}` : ''}
            {maquina ? (
              <> · <a href={`/maquinas/${maquina.marcaSlug}/${maquina.modeloSlug}#despiece`} target="_blank">Ver en el sitio ↗</a></>
            ) : null}
          </p>

          {searchParams?.nuevo ? (
            <div className="ok-msg">
              ¡Despiece creado! Ya se ve en el sitio. Si querés, escribí abajo el número de cada pieza en el dibujo y guardá.
            </div>
          ) : null}
          {searchParams?.ok ? <div className="ok-msg">Cambios guardados.</div> : null}
          {searchParams?.error ? <div className="err-msg">{searchParams.error}</div> : null}
          {!maquina ? (
            <div className="err-msg">
              Ningún producto tiene “{d.marca} {d.modelo}” en su campo Despiece, así que este despiece no muestra repuestos.
            </div>
          ) : null}

          <form action={guardarDespiece} className="dsp-editor">
            <input type="hidden" name="id" value={d.id} />

            <div className="dsp-editor-top">
              <CambiarImagen inicial={d.imagen} />
              <div className="dsp-datos">
                <div className="dsp-campo">
                  <label htmlFor="variante">Nombre de la variante</label>
                  <input id="variante" name="variante" defaultValue={d.variante} required />
                </div>
                <div className="dsp-campo">
                  <label htmlFor="orden">Orden de la pestaña</label>
                  <input id="orden" name="orden" type="number" defaultValue={d.orden || 0} style={{ maxWidth: 110 }} />
                  <small>Las pestañas se ordenan de menor a mayor (y después por nombre).</small>
                </div>
                <label className="dsp-check">
                  <input type="checkbox" name="publico" defaultChecked={d.publico !== false} /> Mostrar en el sitio
                </label>
              </div>
            </div>

            <section className="dsp-card">
              <h2>Repuestos de la {d.marca} {d.modelo} ({productos.length})</h2>
              <p className="mut">
                Esta lista se arma sola con los productos que tienen “{d.marca} {d.modelo}” en su campo Despiece. Escribí el
                número que tiene cada pieza en el dibujo ({numerados} con número). Los que dejes vacíos igual se muestran,
                abajo, como “otros repuestos compatibles”.
              </p>
              {productos.length > 12 ? <FiltroPiezas /> : null}
              <ul className="dsp-piezas" id="dsp-piezas">
                {filas.map((p) => (
                  <li key={p.codigo} data-texto={`${p.codigo} ${p.nombre || ''} ${p.familia || ''}`.toLowerCase()}>
                    <input
                      name={`ref_${p.codigo}`}
                      defaultValue={refDe.get(p.codigo) || ''}
                      aria-label={`Número en el dibujo de ${p.nombre || p.codigo}`}
                      placeholder="N.º"
                      inputMode="text"
                      maxLength={8}
                    />
                    {foto(p) ? <img src={foto(p)} alt="" loading="lazy" /> : <span className="dsp-sinimg" />}
                    <span className="dsp-pieza-txt">
                      <b>{p.nombre || p.clave_producto || p.codigo}</b>
                      <small>{p.codigo} · {p.familia || 'Sin familia'}</small>
                    </span>
                    <a href={`/admin/productos/${encodeURIComponent(p.codigo)}`} target="_blank" className="dsp-ir">Editar ↗</a>
                  </li>
                ))}
              </ul>
            </section>

            <section className="dsp-card">
              <h2>Piezas del dibujo que no vendés</h2>
              <p className="mut">Opcional: tornillos, tapas, etc. Se muestran con su número y nombre, sin link.</p>
              <PiezasExtra inicial={extras.map((x) => ({ ref: x.ref, nombre: x.nombre }))} />
            </section>

            <div className="dsp-guardar">
              <button className="btn dsp-btn" type="submit">Guardar cambios</button>
            </div>
          </form>

          <details className="dsp-borrar">
            <summary>Borrar este despiece</summary>
            <p>Se borra la imagen y los números de pieza. Los repuestos y la máquina no se tocan.</p>
            <form action={borrarDespiece}>
              <input type="hidden" name="id" value={d.id} />
              <button type="submit" className="mreset-btn">Sí, borrar “{d.variante}”</button>
            </form>
          </details>
        </div>
      </main>
    </>
  );
}
