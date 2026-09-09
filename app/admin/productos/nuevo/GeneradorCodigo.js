'use client';

import { useMemo, useRef, useState } from 'react';
import { RUBROS, SUBRUBROS, PRODUCTOS, siguienteItem, armarCodigo } from '../../../../lib/codigoLogbelts';

export default function GeneradorCodigo({ codigos }) {
  const [rubro, setRubro] = useState('');
  const [subrubro, setSubrubro] = useState('');
  const [producto, setProducto] = useState('');
  const inputRef = useRef(null);

  const tablaSubrubro = rubro ? SUBRUBROS[rubro] : null;

  const propuesta = useMemo(() => {
    if (!rubro || !producto) return null;
    if (tablaSubrubro && !subrubro) return null;
    const sr = subrubro || '0';
    const item = siguienteItem(codigos, rubro, sr, producto);
    return armarCodigo(rubro, sr, producto, item);
  }, [rubro, subrubro, producto, codigos, tablaSubrubro]);

  return (
    <div className="cod-gen">
      <label>Código Logbelts *</label>
      <input ref={inputRef} name="codigo" required placeholder="Ej: 5888090" maxLength={7} />

      <p className="cod-gen-label">¿No sabés qué código poner? Armalo acá:</p>
      <div className="cod-gen-row">
        <select value={rubro} onChange={(e) => { setRubro(e.target.value); setSubrubro(''); }}>
          <option value="">Rubro…</option>
          {Object.entries(RUBROS).map(([k, v]) => <option key={k} value={k}>{k} · {v}</option>)}
        </select>
        {tablaSubrubro ? (
          <select value={subrubro} onChange={(e) => setSubrubro(e.target.value)}>
            <option value="">Subrubro…</option>
            {Object.entries(tablaSubrubro).map(([k, v]) => <option key={k} value={k}>{k} · {v}</option>)}
          </select>
        ) : null}
        <select value={producto} onChange={(e) => setProducto(e.target.value)}>
          <option value="">Tipo de parte…</option>
          {Object.entries(PRODUCTOS).map(([k, v]) => <option key={k} value={k}>{k} · {v}</option>)}
        </select>
      </div>
      {propuesta ? (
        <div className="cod-gen-prop">
          Código propuesto: <b>{propuesta}</b>
          <button type="button" onClick={() => { if (inputRef.current) inputRef.current.value = propuesta; }}>
            Usar este código
          </button>
        </div>
      ) : null}
    </div>
  );
}
