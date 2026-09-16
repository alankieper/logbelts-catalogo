'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Marca data-visible cuando el dibujo entra en pantalla, para trazarlo (ver .cdib en
 * app/globals.css). Es el mismo efecto que <Dibujo> de la web, pero con clase propia del
 * catálogo y con una red de seguridad: si el navegador no informa la intersección
 * (pestaña oculta, vista previa que no pinta), el dibujo se muestra igual.
 */
export default function DibujoVisible({ as: Etiqueta = 'div', className = '', children, ...resto }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    let pendiente = true;
    let obs = null;
    let reloj = null;

    const cerca = () => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < (window.innerHeight || 0) * 0.95;
    };
    const alMover = () => { if (cerca()) mostrar(); };
    const limpiar = () => {
      if (obs) obs.disconnect();
      clearTimeout(reloj);
      window.removeEventListener('scroll', alMover);
      window.removeEventListener('resize', alMover);
    };
    function mostrar() {
      if (!pendiente) return;
      pendiente = false;
      limpiar();
      setVisible(true);
    }

    if ('IntersectionObserver' in window) {
      obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) mostrar(); }, { threshold: 0.2 });
      obs.observe(el);
    } else {
      mostrar();
      return undefined;
    }

    reloj = setTimeout(() => {
      if (!pendiente) return;
      if (cerca()) mostrar();
      else {
        window.addEventListener('scroll', alMover, { passive: true });
        window.addEventListener('resize', alMover, { passive: true });
      }
    }, 800);

    return () => { pendiente = false; limpiar(); };
  }, []);

  return (
    <Etiqueta ref={ref} className={`cdib ${className}`.trim()} data-visible={visible} {...resto}>
      {children}
    </Etiqueta>
  );
}
