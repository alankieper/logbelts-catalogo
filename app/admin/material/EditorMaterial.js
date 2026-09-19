'use client';

import { useState } from 'react';
import { subirImagenMaterial, guardarMaterial, restablecerMaterial } from './actions';

/**
 * Lista editable de imágenes del generador de placas: agregar (subir), renombrar,
 * ordenar y quitar. Los cambios se guardan con "Guardar cambios".
 */
export default function EditorMaterial({ inicial }) {
  const [fotos, setFotos] = useState(inicial);
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [estado, setEstado] = useState(''); // '' | subiendo | guardando
  const [msg, setMsg] = useState(null); // { ok, texto }
  const [cambios, setCambios] = useState(false);

  const cambiar = (nuevas) => { setFotos(nuevas); setCambios(true); setMsg(null); };
  const mover = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= fotos.length) return;
    const n = fotos.slice();
    [n[i], n[j]] = [n[j], n[i]];
    cambiar(n);
  };

  async function subir(e) {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;
    setEstado('subiendo'); setMsg(null);
    const fd = new FormData();
    fd.set('archivo', archivo);
    const r = await subirImagenMaterial(fd);
    setEstado('');
    if (!r?.ok) { setMsg({ ok: false, texto: r?.error || 'No se pudo subir.' }); return; }
    const nombre = nombreNuevo.trim() || archivo.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ');
    cambiar([...fotos, { src: r.url, nombre }]);
    setNombreNuevo('');
    setMsg({ ok: true, texto: 'Imagen subida. Tocá "Guardar cambios" para publicarla.' });
  }

  async function guardar() {
    setEstado('guardando');
    const r = await guardarMaterial(fotos);
    setEstado('');
    if (r?.ok) { setCambios(false); setMsg({ ok: true, texto: '¡Listo! Ya se ven en /material.' }); }
    else setMsg({ ok: false, texto: r?.error || 'No se pudo guardar.' });
  }

  async function restablecer() {
    if (!window.confirm('¿Volver a las imágenes originales? Se quitan las que agregaste (no se borran del almacenamiento).')) return;
    setEstado('guardando');
    const r = await restablecerMaterial();
    setEstado('');
    if (r?.ok) window.location.reload();
    else setMsg({ ok: false, texto: r?.error || 'No se pudo restablecer.' });
  }

  return (
    <div className="mat">
      <section className="mcard mat-subir">
        <h2>Agregar imagen</h2>
        <div className="mat-subir__fila">
          <label className="mat-campo">
            Nombre (opcional)
            <input value={nombreNuevo} onChange={(e) => setNombreNuevo(e.target.value)} maxLength={60} placeholder="Ej: Cortacésped a nafta" />
          </label>
          <label className={estado === 'subiendo' ? 'mat-boton mat-boton--ocupado' : 'mat-boton'}>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={subir} disabled={!!estado} />
            {estado === 'subiendo' ? 'Subiendo…' : '+ Elegir imagen'}
          </label>
        </div>
      </section>

      {msg ? <div className={msg.ok ? 'ok-msg' : 'err-msg'} role="status">{msg.texto}</div> : null}

      <div className="mat-grilla">
        {fotos.map((f, i) => (
          <article key={f.src} className="mat-item">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.src} alt="" />
            <input
              aria-label="Nombre"
              value={f.nombre}
              maxLength={60}
              onChange={(e) => cambiar(fotos.map((x, k) => (k === i ? { ...x, nombre: e.target.value } : x)))}
            />
            <div className="mat-item__acc">
              <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Mover antes">←</button>
              <button type="button" onClick={() => mover(i, 1)} disabled={i === fotos.length - 1} aria-label="Mover después">→</button>
              <button type="button" className="mat-quitar" onClick={() => cambiar(fotos.filter((_, k) => k !== i))}>Quitar</button>
            </div>
          </article>
        ))}
      </div>

      <div className="mat-pie">
        <button type="button" className="temp-guardar" onClick={guardar} disabled={!cambios || !!estado}>
          {estado === 'guardando' ? 'Guardando…' : 'Guardar cambios'}
        </button>
        <button type="button" className="mat-reset" onClick={restablecer} disabled={!!estado}>Volver a las originales</button>
        {cambios ? <span className="mat-aviso">Hay cambios sin guardar</span> : null}
      </div>
    </div>
  );
}
