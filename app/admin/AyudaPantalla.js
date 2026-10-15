'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AYUDA, claveAyuda } from './ayudaDatos';

const CLAVE_VISTO = 'lb_ayuda_vista';

function leerVistas() {
  try { return JSON.parse(window.localStorage.getItem(CLAVE_VISTO) || '{}'); } catch { return {}; }
}

/**
 * Botón flotante "¿Cómo se usa?" con un cuadro de ayuda de la pantalla actual:
 * para qué sirve, qué hacer paso a paso y qué cuidado tener. Los textos están en ayudaDatos.js.
 * El botón late hasta que abrís la ayuda de esa pantalla por primera vez.
 */
export default function AyudaPantalla({ activo }) {
  const ruta = usePathname();
  const clave = claveAyuda(ruta, activo);
  const ayuda = clave ? AYUDA[clave] : null;
  const [abierta, setAbierta] = useState(false);
  const [nueva, setNueva] = useState(false);
  const botonRef = useRef(null);
  const cerrarRef = useRef(null);

  useEffect(() => {
    setNueva(clave ? !leerVistas()[clave] : false);
    setAbierta(false);
  }, [clave]);

  useEffect(() => {
    if (!abierta) return undefined;
    const tecla = (e) => e.key === 'Escape' && setAbierta(false);
    document.addEventListener('keydown', tecla);
    cerrarRef.current?.focus();
    return () => document.removeEventListener('keydown', tecla);
  }, [abierta]);

  if (!ayuda) return null;

  function abrir() {
    setAbierta(true);
    if (nueva) {
      setNueva(false);
      try { window.localStorage.setItem(CLAVE_VISTO, JSON.stringify({ ...leerVistas(), [clave]: 1 })); } catch { /* sin almacenamiento: solo vale para esta visita */ }
    }
  }
  function cerrar() {
    setAbierta(false);
    botonRef.current?.focus();
  }

  return (
    <>
      <button
        ref={botonRef}
        type="button"
        className="ayuda-boton"
        data-nueva={nueva ? 'true' : undefined}
        aria-haspopup="dialog"
        aria-expanded={abierta}
        onClick={abrir}
      >
        <span className="ayuda-boton__signo" aria-hidden="true">?</span>
        <span className="ayuda-boton__txt">¿Cómo se usa?</span>
      </button>

      <div className="ayuda-fondo" data-abierta={abierta} onClick={cerrar} aria-hidden="true" />
      <aside className="ayuda-panel" data-abierta={abierta} role="dialog" aria-modal="true" aria-label={`Ayuda: ${ayuda.titulo}`} hidden={!abierta}>
        <header className="ayuda-panel__cab">
          <div>
            <small>Ayuda</small>
            <h2>{ayuda.titulo}</h2>
          </div>
          <button ref={cerrarRef} type="button" className="ayuda-panel__cerrar" onClick={cerrar} aria-label="Cerrar la ayuda">✕</button>
        </header>

        <section className="ayuda-bloque">
          <h3>Para qué sirve</h3>
          <p>{ayuda.para}</p>
        </section>

        <section className="ayuda-bloque">
          <h3>Cómo se usa, paso a paso</h3>
          <ol>
            {ayuda.pasos.map((p) => <li key={p}>{p}</li>)}
          </ol>
        </section>

        {ayuda.cuidado ? (
          <section className="ayuda-bloque ayuda-bloque--ojo">
            <h3>Tené en cuenta</h3>
            <p>{ayuda.cuidado}</p>
          </section>
        ) : null}

        <footer className="ayuda-panel__pie">
          <button type="button" className="ayuda-panel__ok" onClick={cerrar}>Entendido</button>
        </footer>
      </aside>
    </>
  );
}
