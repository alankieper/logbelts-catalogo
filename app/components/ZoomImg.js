'use client';

import { useRef, useState } from 'react';

/**
 * Imagen del producto con zoom automático al pasar el mouse.
 * En touch: un toque activa/desactiva el zoom (centrado en donde se tocó).
 */
export default function ZoomImg({ src, alt, escala = 2.3 }) {
  const box = useRef(null);
  const [on, setOn] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  function mover(e) {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    const p = e.touches ? e.touches[0] : e;
    const x = ((p.clientX - r.left) / r.width) * 100;
    const y = ((p.clientY - r.top) / r.height) * 100;
    setPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }

  return (
    <div
      ref={box}
      className="gmain zoomable"
      onMouseEnter={() => setOn(true)}
      onMouseLeave={() => setOn(false)}
      onMouseMove={mover}
      onTouchStart={(e) => { mover(e); setOn((v) => !v); }}
      onTouchMove={(e) => { if (on) { e.preventDefault(); mover(e); } }}
      role="img"
      aria-label={alt}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={{ transformOrigin: `${pos.x}% ${pos.y}%`, transform: on ? `scale(${escala})` : 'scale(1)' }}
      />
      {!on ? <span className="zoomhint" aria-hidden="true">🔍</span> : null}
    </div>
  );
}
