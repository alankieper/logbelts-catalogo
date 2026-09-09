'use client';

import { useState } from 'react';
import ZoomImg from './ZoomImg';

/**
 * Foto principal con zoom + tira de miniaturas cuando el producto tiene más
 * de una foto. `fotos` = array de URLs, la primera es la portada.
 */
export default function Galeria({ fotos, alt }) {
  const [activo, setActivo] = useState(0);
  const lista = fotos.filter(Boolean);
  if (!lista.length) return <div className="gmain"><span className="noimg">sin foto</span></div>;

  return (
    <>
      <ZoomImg src={lista[Math.min(activo, lista.length - 1)]} alt={alt} />
      {lista.length > 1 ? (
        <div className="gthumbs">
          {lista.map((src, i) => (
            <button
              key={src + i}
              type="button"
              className={`gthumb${i === activo ? ' activo' : ''}`}
              onClick={() => setActivo(i)}
              aria-label={`Ver foto ${i + 1}`}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}
