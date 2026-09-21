'use client';

import '../catalogo-extra.css';
import { useMemo, useState } from 'react';

/**
 * Marca -> modelo -> /maquinas/[marca]/[modelo]. `datos` viene de datosSelector() (lib/maquinas.js).
 * Con despiece: lleva directo al despiece de la máquina (hay que elegir el modelo).
 */
export default function SelectorMaquina({ datos = [], oscuro = false, despiece = false }) {
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const modelos = useMemo(() => datos.find((d) => d.s === marca)?.mods || [], [datos, marca]);

  function ir(e) {
    e.preventDefault();
    if (!marca || (despiece && !modelo)) return;
    if (despiece) window.location.href = `/maquinas/${marca}/${modelo}#despiece`;
    else window.location.href = modelo ? `/maquinas/${marca}/${modelo}` : `/maquinas/${marca}`;
  }

  return (
    <form className={'selector-maquina' + (oscuro ? ' selector-maquina--oscuro' : '')} onSubmit={ir}>
      <label>
        Marca
        <select value={marca} onChange={(e) => { setMarca(e.target.value); setModelo(''); }}>
          <option value="">Elegí la marca</option>
          {datos.map((d) => <option key={d.s} value={d.s}>{d.m} ({d.mods.length})</option>)}
        </select>
      </label>
      <label>
        Modelo
        <select value={modelo} onChange={(e) => setModelo(e.target.value)} disabled={!marca}>
          <option value="">{!marca ? 'Primero la marca' : despiece ? 'Elegí el modelo' : 'Todos los modelos'}</option>
          {modelos.map(([nombre, slug, n]) => (
            <option key={slug} value={slug}>{despiece ? nombre : `${nombre} · ${n} repuesto${n === 1 ? '' : 's'}`}</option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={!marca || (despiece && !modelo)}>{despiece ? 'Ver despiece' : 'Ver repuestos'}</button>
    </form>
  );
}
