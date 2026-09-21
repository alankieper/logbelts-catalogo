'use client';

import { useState } from 'react';
import { subirImagenDespiece, crearDespiece } from './actions';
import { achicarImagen } from './achicarImagen';

// "Stihl FS-55" -> "stihlfs55"; sin la marca: "fs55"
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const sinMarca = (t) => t.replace(/^\S+(\s+Mac)?\s+/, '');

/** Busca la máquina escrita, aunque no tenga la marca o esté escrita distinto ("fs55" = "Stihl FS 55"). */
function buscar(maquinas, texto) {
  const q = norm(texto);
  if (!q) return null;
  const exacta = maquinas.find((m) => norm(m.t) === q);
  if (exacta) return exacta;
  const porModelo = maquinas.filter((m) => norm(sinMarca(m.t)) === q);
  return porModelo.length === 1 ? porModelo[0] : null;
}

/** Formulario de alta: máquina (de la lista) + nombre de la variante + imagen del diagrama. */
export default function NuevoDespiece({ maquinas }) {
  const [maquina, setMaquina] = useState('');
  const [variante, setVariante] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [vista, setVista] = useState(null);
  const [estado, setEstado] = useState('');
  const [error, setError] = useState('');
  const ocupado = !!estado;

  const existe = buscar(maquinas, maquina);

  function elegirMaquina(v) {
    setMaquina(v);
    const m = buscar(maquinas, v);
    // propone el modelo como nombre de la variante ("Stihl FS 55" -> "FS 55"), se puede cambiar
    if (m && !variante) setVariante(sinMarca(m.t));
  }

  function elegirArchivo(f) {
    setArchivo(f || null);
    if (vista) URL.revokeObjectURL(vista);
    setVista(f ? URL.createObjectURL(f) : null);
  }

  async function enviar(e) {
    e.preventDefault();
    setError('');
    if (!existe) return setError('Elegí una máquina de la lista.');
    if (!variante.trim()) return setError('Escribí el nombre de la variante.');
    if (!archivo) return setError('Elegí la imagen del diagrama.');
    try {
      setEstado('Preparando la imagen…');
      const chica = await achicarImagen(archivo);
      setEstado('Subiendo la imagen…');
      const fd = new FormData();
      fd.append('archivo', chica);
      const sub = await subirImagenDespiece(fd);
      if (!sub.ok) throw new Error(sub.error);
      setEstado('Guardando…');
      const r = await crearDespiece({ maquina: existe.t, variante, imagen: sub.url });
      if (!r.ok) throw new Error(r.error);
      setEstado('¡Listo! Abriendo el despiece…');
      window.location.href = `/admin/despieces/${encodeURIComponent(r.id)}?nuevo=1`;
    } catch (err) {
      setEstado('');
      setError(err.message || 'No se pudo guardar.');
    }
  }

  return (
    <form className="dsp-nuevo" onSubmit={enviar}>
      <div className="dsp-campo">
        <label htmlFor="dsp-maq">1. Máquina</label>
        <input
          id="dsp-maq"
          list="dsp-maquinas"
          value={maquina}
          onChange={(e) => elegirMaquina(e.target.value)}
          placeholder="Escribí y elegí: Stihl FS 55"
          autoComplete="off"
          disabled={ocupado}
        />
        <datalist id="dsp-maquinas">
          {maquinas.map((m) => (
            <option key={m.t} value={m.t}>{`${m.n} ${m.n === 1 ? 'repuesto' : 'repuestos'}`}</option>
          ))}
        </datalist>
        <small>
          {existe
            ? `✓ ${existe.t}: ${existe.n} ${existe.n === 1 ? 'repuesto vinculado' : 'repuestos vinculados'}.`
            : 'Sólo máquinas que ya existen (salen del campo Despiece de los productos).'}
        </small>
      </div>

      <div className="dsp-campo">
        <label htmlFor="dsp-var">2. Nombre de esta variante</label>
        <input id="dsp-var" value={variante} onChange={(e) => setVariante(e.target.value)} placeholder="FS 55 R" disabled={ocupado} />
        <small>Es la pestaña que se ve en el sitio. No crea una máquina nueva.</small>
      </div>

      <div className="dsp-campo">
        <label htmlFor="dsp-img">3. Imagen del diagrama</label>
        <input id="dsp-img" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => elegirArchivo(e.target.files?.[0])} disabled={ocupado} />
        {vista ? <img className="dsp-vista" src={vista} alt="Vista previa del diagrama" /> : null}
      </div>

      {error ? <div className="err-msg" role="alert">{error}</div> : null}
      <button className="btn dsp-btn" type="submit" disabled={ocupado}>
        {estado || 'Crear despiece'}
      </button>
    </form>
  );
}
