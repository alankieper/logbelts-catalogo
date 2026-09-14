'use client';

import { useState } from 'react';

const plano = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

export default function ListaModelos({ marcaSlug, modelos }) {
  const [filtro, setFiltro] = useState('');
  const f = plano(filtro);
  const visibles = f ? modelos.filter((m) => plano(m.modelo).includes(f)) : modelos;

  return (
    <>
      <input
        className="filtro-modelos"
        type="search"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        placeholder="Filtrar modelo (ej: 250, 143R, GX160)"
        aria-label="Filtrar modelos"
      />
      {visibles.length ? (
        <ul className="lista-modelos">
          {visibles.map((m) => (
            <li key={m.slug}>
              <a href={`/maquinas/${marcaSlug}/${m.slug}`}>
                {m.modelo}
                <span className="n">{m.n}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="lead" style={{ marginTop: 14 }}>No hay modelos que coincidan con “{filtro}”.</p>
      )}
    </>
  );
}
