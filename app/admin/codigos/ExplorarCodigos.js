'use client';

import { useMemo, useState } from 'react';
import { RUBROS, SUBRUBROS, PRODUCTOS, decodificarCodigo } from '../../../lib/codigoLogbelts';

export default function ExplorarCodigos({ productos }) {
  const [buscar, setBuscar] = useState('');
  const [rubro, setRubro] = useState('');
  const [subrubro, setSubrubro] = useState('');
  const [producto, setProducto] = useState('');

  const dec = useMemo(() => (buscar.trim() ? decodificarCodigo(buscar.trim()) : null), [buscar]);

  const tablaSubrubro = rubro ? SUBRUBROS[rubro] : null;

  const filtrados = useMemo(() => {
    if (!rubro && !producto) return [];
    return productos
      .filter((p) => {
        if (p.codigo.length !== 7) return false;
        if (rubro && p.codigo[0] !== String(rubro)) return false;
        if (subrubro && p.codigo[1] !== String(subrubro)) return false;
        if (producto && p.codigo.slice(2, 4) !== producto) return false;
        return true;
      })
      .slice(0, 100);
  }, [productos, rubro, subrubro, producto]);

  return (
    <div>
      <div className="cod-explorar-box">
        <label>Decodificar un código</label>
        <input
          value={buscar}
          onChange={(e) => setBuscar(e.target.value.replace(/\D/g, '').slice(0, 7))}
          placeholder="Ej: 2102090"
          maxLength={7}
        />
        {dec ? (
          dec.valido || dec.codigo?.length === 7 ? (
            <div className="cod-gen-prop" style={{ marginTop: 10 }}>
              {dec.rubroNombre ? <span className="cod-tag">Rubro {dec.rubro} · {dec.rubroNombre}</span> : null}
              {dec.subrubroNombre ? <span className="cod-tag">Subrubro {dec.subrubro} · {dec.subrubroNombre}</span> : null}
              {dec.productoNombre ? <span className="cod-tag">Tipo {dec.producto} · {dec.productoNombre}</span> : null}
              {dec.codigo?.length === 7 ? <span className="cod-tag">Variante {dec.item}</span> : null}
              {dec.errores?.length ? <p className="cod-lectura-warn">{dec.errores.join(' ')}</p> : null}
            </div>
          ) : (
            <p className="cod-lectura-warn">{dec.errores.join(' ')}</p>
          )
        ) : null}
      </div>

      <div className="cod-explorar-box">
        <label>Buscar productos por estructura</label>
        <div className="cod-gen-row">
          <select value={rubro} onChange={(e) => { setRubro(e.target.value); setSubrubro(''); setProducto(''); }}>
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
        {filtrados.length ? (
          <table className="admtable" style={{ marginTop: 12 }}>
            <thead><tr><th>Código</th><th>Nombre</th></tr></thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.codigo}>
                  <td className="cod">{p.codigo}</td>
                  <td><a href={`/admin/productos/${encodeURIComponent(p.codigo)}`}>{p.nombre || '(sin nombre)'}</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (rubro || producto) ? (
          <p className="sub" style={{ marginTop: 10 }}>No hay productos que coincidan con esa combinación.</p>
        ) : null}
      </div>
    </div>
  );
}
