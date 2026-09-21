'use client';

import { useState } from 'react';

/** Filas de piezas sin repuesto (número + nombre), con agregar y quitar. */
export default function PiezasExtra({ inicial }) {
  const [filas, setFilas] = useState(() => (inicial.length ? inicial : []).map((x, i) => ({ ...x, k: i })));
  const agregar = () => setFilas((f) => [...f, { ref: '', nombre: '', k: Date.now() }]);
  const quitar = (k) => setFilas((f) => f.filter((x) => x.k !== k));

  return (
    <div className="dsp-extra">
      {filas.map((x) => (
        <div key={x.k} className="dsp-extra-fila">
          <input name="extra_ref" defaultValue={x.ref} placeholder="N.º" aria-label="Número en el dibujo" maxLength={8} />
          <input name="extra_nombre" defaultValue={x.nombre} placeholder="Nombre de la pieza (ej. Tornillo M5)" aria-label="Nombre de la pieza" />
          <button type="button" onClick={() => quitar(x.k)} aria-label="Quitar esta pieza">✕</button>
        </div>
      ))}
      <button type="button" className="dsp-agregar" onClick={agregar}>+ Agregar pieza</button>
    </div>
  );
}
