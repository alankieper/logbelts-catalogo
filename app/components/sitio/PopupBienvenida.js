'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CATALOGO, whatsappCon } from '../../../lib/sitio';
import { MARCA } from '../../../lib/marca';
import { PROVINCIAS } from '../../../lib/provincias';
import { waLink } from '../../../lib/telefono';
import { guardarVendedor } from '../pedidoStore';
import { Cerrar, Check, LogoWhatsApp } from './Iconos';
import { enviarContacto } from './enviarContacto';

const CLAVE = 'lb_popup';
const DIAS_SIN_MOSTRAR = 7;
const DEMORA_MS = 1200;

function leer() {
  try { return JSON.parse(localStorage.getItem(CLAVE) || 'null'); } catch { return null; }
}
function guardar(valor) {
  try { localStorage.setItem(CLAVE, JSON.stringify(valor)); } catch {}
}

// Popup de bienvenida para captar distribuidores (B2B).
// No aparece si ya dejó sus datos (acá o en el acceso al catálogo); si lo cierran, vuelve a los 7 días.
export default function PopupBienvenida() {
  const [abierto, setAbierto] = useState(false);
  const [estado, setEstado] = useState('form'); // form | enviando | listo
  const [datos, setDatos] = useState(null);
  const [vendedor, setVendedor] = useState(null);
  const caja = useRef(null);
  const focoPrevio = useRef(null);

  useEffect(() => {
    if (document.cookie.includes('lb_visitante=')) return;
    const previo = leer();
    if (previo?.enviado) return;
    if (previo?.cerrado && Date.now() - previo.cerrado < DIAS_SIN_MOSTRAR * 864e5) return;
    const t = setTimeout(() => {
      focoPrevio.current = document.activeElement;
      setAbierto(true);
    }, DEMORA_MS);
    return () => clearTimeout(t);
  }, []);

  const cerrar = useCallback(() => {
    if (estado !== 'listo') guardar({ cerrado: Date.now() });
    setAbierto(false);
    focoPrevio.current?.focus?.();
  }, [estado]);

  useEffect(() => {
    if (!abierto) return;
    const el = caja.current;
    el?.querySelector('input:not([tabindex="-1"]), a, button:not(.popup__cerrar)')?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKey(e) {
      if (e.key === 'Escape') cerrar();
      if (e.key !== 'Tab' || !el) return;
      const foco = [...el.querySelectorAll('button, a[href], input:not([tabindex="-1"]), select')];
      const primero = foco[0], ultimo = foco[foco.length - 1];
      if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [abierto, cerrar]);

  async function enviar(e) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget));
    setDatos(d);
    setEstado('enviando');
    const r = await enviarContacto({ ...d, origen: 'popup', consulta: 'Quiero ser distribuidor' });
    if (r?.vendedor) { guardarVendedor(r.vendedor); setVendedor(r.vendedor); }
    guardar({ enviado: Date.now() });
    setEstado('listo');
  }

  if (!abierto) return null;

  const mensajeWA = datos
    ? `Hola! Quiero ser distribuidor ${MARCA.nombre}.\n\nEmpresa: ${datos.empresa}\nNombre: ${datos.nombre}\nWhatsApp: ${datos.telefono}\nZona: ${[datos.localidad, datos.provincia].filter(Boolean).join(', ')}`
    : '';
  const linkWA = waLink(vendedor?.telefono, mensajeWA) || whatsappCon(mensajeWA);

  return (
    <div className="popup" onMouseDown={e => e.target === e.currentTarget && cerrar()}>
      <div ref={caja} className="popup__caja" role="dialog" aria-modal="true" aria-labelledby="popup-titulo">
        <button type="button" className="popup__cerrar" onClick={cerrar} aria-label="Cerrar">
          <Cerrar />
        </button>

        <div className="popup__arte" aria-hidden="true">
          <span className="popup__sello">Venta mayorista</span>
          <Image className="popup__a3" src="/img/recorte-desmalezadora.webp" alt="" width={929} height={467} sizes="190px" />
          <Image className="popup__a1" src="/img/recorte-minitractor.webp" alt="" width={616} height={470} sizes="220px" priority />
          <Image className="popup__a2" src="/img/recorte-motosierra.webp" alt="" width={708} height={257} sizes="190px" />
        </div>

        <div className="popup__cuerpo">
          {estado === 'listo' ? (
            <div className="popup__ok" role="status">
              <Check />
              <h2 id="popup-titulo" className="display popup__titulo">¡Gracias!</h2>
              <p className="popup__texto">
                {vendedor
                  ? `${vendedor.nombre} atiende tu zona y te va a contactar. Si querés adelantarte, escribile por WhatsApp.`
                  : 'Recibimos tus datos y un vendedor te va a contactar. Si querés adelantarte, escribinos por WhatsApp.'}
              </p>
              <a className="boton boton--claro boton--ancho" href={CATALOGO}>Ver catálogo</a>
              <a className="boton boton--whatsapp boton--ancho" href={linkWA} target="_blank" rel="noopener noreferrer"><LogoWhatsApp /> Escribir por WhatsApp</a>
              <button type="button" className="popup__secundario" onClick={cerrar}>Cerrar</button>
            </div>
          ) : (
            <>
              <h2 id="popup-titulo" className="display popup__titulo">Sumá {MARCA.nombre} <em>a tu negocio</em></h2>
              <p className="popup__texto">Repuestos para motosierras, desmalezadoras, minitractores y motores. Registrate y el vendedor de tu zona te contacta.</p>

              <form className="formulario" onSubmit={enviar}>
                <div className="campo">
                  <label htmlFor="pp-empresa">Empresa o comercio</label>
                  <input id="pp-empresa" name="empresa" placeholder="Empresa o comercio" autoComplete="organization" maxLength={80} required />
                </div>
                <div className="campo">
                  <label htmlFor="pp-nombre">Nombre</label>
                  <input id="pp-nombre" name="nombre" placeholder="Tu nombre" autoComplete="name" maxLength={60} required />
                </div>
                <div className="campo">
                  <label htmlFor="pp-telefono">WhatsApp</label>
                  <input id="pp-telefono" name="telefono" type="tel" inputMode="tel" placeholder="WhatsApp (ej: 11 5555-5555)" autoComplete="tel" maxLength={30} required />
                </div>
                <div className="popup__fila">
                  <div className="campo">
                    <label htmlFor="pp-localidad">Localidad</label>
                    <input id="pp-localidad" name="localidad" placeholder="Localidad" autoComplete="address-level2" maxLength={60} required />
                  </div>
                  <div className="campo">
                    <label htmlFor="pp-provincia">Provincia</label>
                    <select id="pp-provincia" name="provincia" required defaultValue="">
                      <option value="" disabled>Provincia</option>
                      {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="campo campo--trampa" aria-hidden="true">
                  <label htmlFor="pp-web">No completar</label>
                  <input id="pp-web" name="sitio_web" tabIndex={-1} autoComplete="off" />
                </div>
                <button type="submit" className="boton boton--claro boton--ancho" disabled={estado === 'enviando'}>
                  {estado === 'enviando' ? 'Enviando…' : 'Quiero ser distribuidor'}
                </button>
              </form>

              <a className="popup__secundario" href={CATALOGO}>Solo quiero ver el catálogo</a>
              <p className="popup__legal">Venta exclusiva a comercios y talleres.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
