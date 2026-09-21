'use client';

import { useState } from 'react';
import { subirImagenDespiece } from '../actions';
import { achicarImagen } from '../achicarImagen';

/** Muestra la imagen del diagrama y permite reemplazarla (se guarda al tocar "Guardar cambios"). */
export default function CambiarImagen({ inicial }) {
  const [url, setUrl] = useState(inicial || '');
  const [estado, setEstado] = useState('');
  const [error, setError] = useState('');

  async function elegir(f) {
    if (!f) return;
    setError('');
    try {
      setEstado('Subiendo…');
      const fd = new FormData();
      fd.append('archivo', await achicarImagen(f));
      const r = await subirImagenDespiece(fd);
      if (!r.ok) throw new Error(r.error);
      setUrl(r.url);
      setEstado('Imagen nueva lista: tocá “Guardar cambios”.');
    } catch (e) {
      setEstado('');
      setError(e.message || 'No se pudo subir.');
    }
  }

  return (
    <div className="dsp-img">
      <input type="hidden" name="imagen" value={url} />
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" title="Abrir en tamaño completo">
          <img src={url} alt="Diagrama del despiece" />
        </a>
      ) : (
        <div className="dsp-sinimg dsp-sinimg--grande">Sin imagen</div>
      )}
      <label className="dsp-cambiar">
        Reemplazar imagen
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => elegir(e.target.files?.[0])} />
      </label>
      {estado ? <small className="dsp-estado" role="status">{estado}</small> : null}
      {error ? <small className="dsp-error" role="alert">{error}</small> : null}
    </div>
  );
}
