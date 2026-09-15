'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PROVINCIAS } from '../../lib/provincias';
import { telefonoWhatsApp } from '../../lib/telefono';
import { guardarProvincia, guardarVendedor, leerProvincia, leerVendedor, linkWhatsApp, WA_GENERAL } from './pedidoStore';
import '../whatsapp-vendedor.css';

/**
 * Botón de WhatsApp que deriva al vendedor de la zona.
 * Si el navegador ya tiene provincia o vendedor guardado, abre WhatsApp directo;
 * si no, pregunta la provincia (el link final es un <a href> ya armado, así el navegador no lo bloquea).
 */
export default function BotonWhatsAppVendedor({ texto = '', className = '', children, ariaLabel, title, alAbrir }) {
  const [href, setHref] = useState(() => linkWhatsApp(texto, WA_GENERAL));
  const [abierto, setAbierto] = useState(false);
  const [provincia, setProvincia] = useState('');
  const [vendedor, setVendedor] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const boton = useRef(null);
  const dialogo = useRef(null);
  const select = useRef(null);

  // Link con el vendedor guardado (se actualiza si cambia en otra pestaña o componente)
  useEffect(() => {
    const sync = () => setHref(linkWhatsApp(texto));
    sync();
    window.addEventListener('lb-vendedor-cambio', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('lb-vendedor-cambio', sync);
      window.removeEventListener('storage', sync);
    };
  }, [texto]);

  // Foco adentro del diálogo, Esc cierra, Tab no se escapa
  useEffect(() => {
    if (!abierto) return;
    select.current?.focus();
    const tecla = e => {
      if (e.key === 'Escape') { e.preventDefault(); cerrar(); return; }
      if (e.key !== 'Tab' || !dialogo.current) return;
      const focos = [...dialogo.current.querySelectorAll('button, select, a[href]')].filter(el => !el.disabled);
      if (!focos.length) return;
      const primero = focos[0], ultimo = focos[focos.length - 1];
      if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [abierto]);

  function cerrar() {
    setAbierto(false);
    boton.current?.focus();
  }

  function click(e) {
    e.stopPropagation();
    if (leerProvincia() || leerVendedor()) {
      e.currentTarget.href = linkWhatsApp(texto); // por si cambió justo antes
      alAbrir?.();
      return;
    }
    e.preventDefault();
    setProvincia('');
    setVendedor(null);
    setAbierto(true);
  }

  async function elegir(valor) {
    setProvincia(valor);
    setVendedor(null);
    if (!valor) return;
    setBuscando(true);
    let v = null;
    try {
      const r = await (await fetch(`/api/vendedor?provincia=${encodeURIComponent(valor)}`)).json();
      v = r?.vendedor || null;
    } catch {}
    guardarProvincia(valor);
    guardarVendedor(v);
    setVendedor(v);
    setBuscando(false);
  }

  const numero = telefonoWhatsApp(vendedor?.telefono) || WA_GENERAL;
  const listo = provincia && !buscando;

  return (
    <>
      <a ref={boton} className={className} href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel} title={title} onClick={click}>
        {children}
      </a>

      {abierto ? createPortal(
        <div className="lbwa-fondo" onMouseDown={e => { if (e.target === e.currentTarget) cerrar(); }}>
          <div ref={dialogo} className="lbwa-dialogo" role="dialog" aria-modal="true" aria-labelledby="lbwa-titulo" aria-describedby="lbwa-ayuda">
            <button type="button" className="lbwa-cerrar" onClick={cerrar} aria-label="Cerrar">✕</button>
            <h2 id="lbwa-titulo" className="lbwa-titulo">¿Desde qué provincia nos escribís?</h2>
            <p id="lbwa-ayuda" className="lbwa-ayuda">Así te atiende el vendedor de tu zona.</p>
            <label className="lbwa-label" htmlFor="lbwa-provincia">Provincia</label>
            <select id="lbwa-provincia" ref={select} className="lbwa-select" value={provincia} onChange={e => elegir(e.target.value)}>
              <option value="">Elegí tu provincia</option>
              {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <p className="lbwa-estado" role="status" aria-live="polite">
              {buscando ? 'Buscando al vendedor de tu zona…' : vendedor?.nombre ? <>Te atiende <b>{vendedor.nombre}</b></> : provincia ? 'Te atiende nuestro equipo de ventas.' : ''}
            </p>

            <a
              className="lbwa-abrir"
              href={listo ? linkWhatsApp(texto, numero) : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!listo}
              onClick={e => { if (!listo) { e.preventDefault(); return; } alAbrir?.(); setAbierto(false); }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.83 9.83 0 0 0 12.04 2Zm4.52 11.99c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" /></svg>
              Abrir WhatsApp
            </a>
            <a className="lbwa-seguir" href={linkWhatsApp(texto, WA_GENERAL)} target="_blank" rel="noopener noreferrer" onClick={() => { alAbrir?.(); setAbierto(false); }}>
              Seguir sin elegir
            </a>
          </div>
        </div>,
        document.body
      ) : null}
    </>
  );
}
