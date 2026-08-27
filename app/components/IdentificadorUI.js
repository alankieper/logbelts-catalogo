'use client';

import { useState, useRef } from 'react';

async function achicar(file, max = 1024, calidad = 0.85) {
  const dataUrl = await new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = dataUrl;
  });
  let { width: w, height: h } = img;
  if (w > max || h > max) {
    const r = Math.min(max / w, max / h);
    w = Math.round(w * r);
    h = Math.round(h * r);
  }
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  c.getContext('2d').drawImage(img, 0, 0, w, h);
  const blob = await new Promise((res) => c.toBlob(res, 'image/jpeg', calidad));
  return { blob, preview: c.toDataURL('image/jpeg', 0.7) };
}

function agregarConsulta(codigo) {
  try {
    const c = JSON.parse(localStorage.getItem('lb_consulta') || '{}');
    c[codigo] = (c[codigo] || 0) + 1;
    localStorage.setItem('lb_consulta', JSON.stringify(c));
  } catch (e) {}
}

export default function IdentificadorUI() {
  const [preview, setPreview] = useState(null);
  const [estado, setEstado] = useState('inicio'); // inicio | analizando | listo | error
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [added, setAdded] = useState({});
  const inputRef = useRef();

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setData(null);
    setEstado('analizando');
    try {
      const { blob, preview } = await achicar(file);
      setPreview(preview);
      const fd = new FormData();
      fd.set('foto', blob, 'foto.jpg');
      const r = await fetch('/api/identificar', { method: 'POST', body: fd });
      const j = await r.json();
      if (!j.ok) {
        setError(j.error || 'No se pudo analizar la foto.');
        setEstado('error');
        return;
      }
      setData(j);
      setEstado('listo');
    } catch (err) {
      setError('Error al procesar la foto: ' + (err.message || err));
      setEstado('error');
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="idbox">
        {preview ? (
          <img src={preview} alt="Tu foto" className="idprev" />
        ) : (
          <div className="idph">
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="6" width="18" height="14" rx="2" />
              <circle cx="12" cy="13" r="4" />
              <path d="M8 6l1.5-2h5L16 6" />
            </svg>
            <p>Sacá o subí una foto del repuesto</p>
          </div>
        )}
        <button className="idbtn" type="button" onClick={() => inputRef.current?.click()} disabled={estado === 'analizando'}>
          {estado === 'analizando' ? 'Analizando…' : preview ? 'Probar con otra foto' : 'Elegir / sacar foto'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFile}
          style={{ display: 'none' }}
        />
      </div>

      {estado === 'analizando' ? (
        <p className="idmsg">La IA está mirando la pieza y comparándola con el catálogo. Tarda entre 10 y 30 segundos…</p>
      ) : null}

      {estado === 'error' ? <div className="err-msg">{error}</div> : null}

      {estado === 'listo' && data ? (
        <>
          {data.info ? (
            <p className="iddet">
              Detectamos: <b>{data.info.tipo || '—'}</b>
              {data.info.marcas?.length ? <> · marca: {data.info.marcas.join(', ')}</> : null}
              {data.info.medida ? <> · {data.info.medida}</> : null}
              {data.info.textos?.length ? <> · números en la pieza: {data.info.textos.join(', ')}</> : null}
            </p>
          ) : null}

          {data.resultados?.length ? (
            <div className="idres">
              {data.resultados.map((r) => (
                <div className="idcard" key={r.codigo}>
                  <a className="idth" href={`/p/${encodeURIComponent(r.codigo)}`}>
                    {r.producto.foto ? (
                      <img src={`/fotos/${r.producto.foto}`} alt="" />
                    ) : (
                      <span className="no">sin foto</span>
                    )}
                  </a>
                  <div className="idinfo">
                    <div className="idconf">
                      <span
                        className="bar"
                        style={{
                          width: Math.max(6, Math.min(100, r.confianza)) + '%',
                          background: r.confianza >= 60 ? 'var(--ok)' : r.confianza >= 30 ? 'var(--warn)' : 'var(--rule-strong)',
                        }}
                      />
                      <b>{r.confianza}%</b>
                    </div>
                    <a className="idcode" href={`/p/${encodeURIComponent(r.codigo)}`}>{r.codigo}</a>
                    <div className="idname">{r.producto.nombre || r.producto.clave_producto}</div>
                    {r.motivo ? <div className="idwhy">{r.motivo}</div> : null}
                    <div className="idacts">
                      <a href={`/p/${encodeURIComponent(r.codigo)}`}>Ver ficha</a>
                      <button
                        type="button"
                        onClick={() => {
                          agregarConsulta(r.codigo);
                          setAdded((a) => ({ ...a, [r.codigo]: true }));
                        }}
                      >
                        {added[r.codigo] ? '✓ En la consulta' : '+ Agregar a la consulta'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <p className="idmsg">
                ¿Ninguno es? Probá con otra foto (más cerca, con buena luz, mostrando la parte que se rompió) o
                <a href="/buscar"> buscá por marca y modelo</a>.
              </p>
            </div>
          ) : (
            <div className="empty">
              No encontramos un candidato claro. Probá otra foto más nítida, o buscá por marca y modelo de la máquina.
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
