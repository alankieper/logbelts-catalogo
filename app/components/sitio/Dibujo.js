'use client';

import { useEffect, useRef, useState } from 'react';

/** Marca data-visible cuando entra en pantalla, para animar los trazos de las ilustraciones (.dibujo en sitio.css). */
export default function Dibujo({ as: Etiqueta = 'div', className = '', children, ...resto }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setVisible(true); return; }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Etiqueta ref={ref} className={`dibujo ${className}`} data-visible={visible} {...resto}>
      {children}
    </Etiqueta>
  );
}
