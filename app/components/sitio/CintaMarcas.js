'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from 'react';

/**
 * Cinta de marcas del catálogo; cada una lleva a sus repuestos (/m/<marca>).
 * Se mueve sola y se puede arrastrar con el mouse o el dedo (la lista está duplicada,
 * así el desplazamiento vuelve al principio sin saltos). Al arrastrar no se abre el link.
 */
export default function CintaMarcas({ marcas }) {
  const ventana = useRef(null);

  useEffect(() => {
    const el = ventana.current;
    if (!el) return undefined;

    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mitad = () => el.scrollWidth / 2;
    let arrastrando = false;
    let pausado = false;
    let ultimoX = 0;
    let recorrido = 0;
    let impulso = 0;
    let ultimoT = 0;
    let cuadro = 0;

    const normalizar = () => {
      const m = mitad();
      if (m <= 0) return;
      if (el.scrollLeft >= m) el.scrollLeft -= m;
      else if (el.scrollLeft <= 0) el.scrollLeft += m;
    };

    const paso = (t) => {
      const dt = Math.min((t - (ultimoT || t)) / 1000, 0.05);
      ultimoT = t;
      if (!arrastrando) {
        if (Math.abs(impulso) > 0.1) {
          el.scrollLeft -= impulso;
          impulso *= 0.94;
        } else if (!pausado && !reducir.matches) {
          el.scrollLeft += 42 * dt;
        }
        normalizar();
      }
      cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);

    // Arrastre con el mouse (en pantallas táctiles ya funciona el desplazamiento del navegador)
    const bajar = (e) => {
      if (e.pointerType === 'touch') return;
      arrastrando = true;
      recorrido = 0;
      impulso = 0;
      ultimoX = e.clientX;
      el.dataset.arrastrando = 'true';
      try { el.setPointerCapture(e.pointerId); } catch { /* sin puntero activo */ }
    };
    const mover = (e) => {
      if (!arrastrando) return;
      const dx = e.clientX - ultimoX;
      ultimoX = e.clientX;
      recorrido += Math.abs(dx);
      el.scrollLeft -= dx;
      impulso = dx;
      normalizar();
    };
    const soltar = (e) => {
      if (!arrastrando) return;
      arrastrando = false;
      delete el.dataset.arrastrando;
      try { el.releasePointerCapture(e.pointerId); } catch { /* ya liberado */ }
    };
    // Si arrastró, el click no debe abrir la marca
    const click = (e) => {
      if (recorrido > 6) {
        e.preventDefault();
        e.stopPropagation();
        recorrido = 0;
      }
    };

    const entrar = () => { pausado = true; };
    const salir = () => { pausado = false; };

    el.addEventListener('pointerdown', bajar);
    el.addEventListener('pointermove', mover);
    el.addEventListener('pointerup', soltar);
    el.addEventListener('pointercancel', soltar);
    el.addEventListener('click', click, true);
    el.addEventListener('pointerenter', entrar);
    el.addEventListener('pointerleave', salir);
    el.addEventListener('focusin', entrar);
    el.addEventListener('focusout', salir);

    return () => {
      cancelAnimationFrame(cuadro);
      el.removeEventListener('pointerdown', bajar);
      el.removeEventListener('pointermove', mover);
      el.removeEventListener('pointerup', soltar);
      el.removeEventListener('pointercancel', soltar);
      el.removeEventListener('click', click, true);
      el.removeEventListener('pointerenter', entrar);
      el.removeEventListener('pointerleave', salir);
      el.removeEventListener('focusin', entrar);
      el.removeEventListener('focusout', salir);
    };
  }, []);

  if (!marcas.length) return null;

  const lista = (copia) => (
    <ul className="marcas__lista" aria-hidden={copia || undefined}>
      {marcas.map((m) => (
        <li key={m.slug}>
          <a className={m.logo ? `marca marca--logo${m.claro ? ' marca--logo-oscuro' : ''}` : 'marca'} href={`/m/${m.slug}`} tabIndex={copia ? -1 : undefined} aria-label={m.logo ? `Repuestos para ${m.nombre}` : undefined} draggable="false">
            {m.logo ? <img className="marca__logo" src={m.logo} alt={m.nombre} loading="lazy" draggable="false" /> : <span className="marca__nombre">{m.nombre}</span>}
            <span className="marca__n">{m.count.toLocaleString('es-AR')} repuestos</span>
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <section className="marcas" aria-labelledby="marcas-titulo">
      <div className="contenedor marcas__cabeza">
        <p id="marcas-titulo">Repuestos compatibles con estas marcas</p>
        <a href="/#catalogo">Ver catálogo →</a>
      </div>
      <div className="marcas__ventana" ref={ventana} role="group" aria-label="Marcas compatibles, arrastrá para ver más">
        <div className="marcas__pista">
          {lista(false)}
          {lista(true)}
        </div>
      </div>
    </section>
  );
}
