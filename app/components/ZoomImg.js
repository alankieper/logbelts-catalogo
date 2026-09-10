'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Imagen del producto con zoom al pasar el mouse.
 * - Pantallas anchas (desktop, >=1100px): estilo Amazon — la imagen original
 *   queda fija, un recuadro (lupa) sigue al mouse sobre ella, y a la derecha
 *   aparece un panel flotante con la vista ampliada de esa zona.
 * - Pantallas angostas / touch: la imagen se agranda en el lugar (como antes);
 *   un toque activa/desactiva el zoom, centrado en donde se tocó.
 */
export default function ZoomImg({ src, alt, escala = 2.3 }) {
  const box = useRef(null);
  const [on, setOn] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [lens, setLens] = useState(null);
  const [conPanel, setConPanel] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1100px)');
    const actualizar = () => setConPanel(mq.matches);
    actualizar();
    mq.addEventListener('change', actualizar);
    return () => mq.removeEventListener('change', actualizar);
  }, []);

  function mover(e) {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    const p = e.touches ? e.touches[0] : e;
    const px = p.clientX - r.left;
    const py = p.clientY - r.top;

    if (conPanel) {
      const lensW = r.width / escala;
      const lensH = r.height / escala;
      const x = Math.max(0, Math.min(r.width - lensW, px - lensW / 2));
      const y = Math.max(0, Math.min(r.height - lensH, py - lensH / 2));
      setLens({ x, y, w: lensW, h: lensH, boxW: r.width, boxH: r.height });
    } else {
      const x = (px / r.width) * 100;
      const y = (py / r.height) * 100;
      setPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    }
  }

  const mostrarPanel = conPanel && on && lens;

  return (
    <div ref={box} className="zoomwrap">
      <div
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
          style={
            conPanel
              ? undefined
              : { transformOrigin: `${pos.x}% ${pos.y}%`, transform: on ? `scale(${escala})` : 'scale(1)' }
          }
        />
        {!on ? <span className="zoomhint" aria-hidden="true">🔍</span> : null}
      </div>

      {mostrarPanel ? (
        <>
          <div className="zoomlens" style={{ left: lens.x, top: lens.y, width: lens.w, height: lens.h }} />
          <div
            className="zoompanel"
            style={{
              width: lens.boxW,
              height: lens.boxH,
              backgroundImage: `url(${src})`,
              backgroundSize: `${lens.boxW * escala}px ${lens.boxH * escala}px`,
              backgroundPosition: `-${lens.x * escala}px -${lens.y * escala}px`,
            }}
          />
        </>
      ) : null}
    </div>
  );
}
