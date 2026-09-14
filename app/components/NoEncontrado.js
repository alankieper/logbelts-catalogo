'use client';

import { useState } from 'react';
import { PROVINCIAS } from '../../lib/provincias';
import { waLink } from '../../lib/telefono';
import { guardarVendedor, WA_GENERAL } from './pedidoStore';

/**
 * "¿No encontrás el repuesto? Pedilo": deja el contacto con lo que busca (queda en /admin/contactos
 * asignado al vendedor de la zona) y ofrece seguir por WhatsApp.
 */
export default function NoEncontrado({ q = '', origen = 'busqueda', titulo, texto, prefijo }) {
  const [estado, setEstado] = useState('form'); // form | enviando | listo
  const [resultado, setResultado] = useState(null);
  const detalleInicial = prefijo ?? (q ? `Busco: ${q}` : '');

  async function enviar(e) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget));
    setEstado('enviando');
    let r = null;
    try {
      r = await (await fetch('/api/sitio/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...d, origen, meta: q ? { q } : null }),
      })).json();
    } catch {}
    if (r?.vendedor) guardarVendedor(r.vendedor);
    setResultado({ vendedor: r?.vendedor || null, consulta: d.consulta, nombre: d.nombre });
    setEstado('listo');
  }

  if (estado === 'listo') {
    const mensaje = `Hola, soy ${resultado.nombre}. ${resultado.consulta}`;
    const wa = waLink(resultado.vendedor?.telefono, mensaje) || `https://wa.me/${WA_GENERAL}?text=${encodeURIComponent(mensaje)}`;
    return (
      <div className="solicitud" role="status">
        <div className="ok">
          <b>¡Listo! Ya lo estamos buscando.</b>
          <p>
            {resultado.vendedor
              ? `${resultado.vendedor.nombre} te va a contactar por WhatsApp.`
              : 'Un vendedor te va a contactar por WhatsApp.'}{' '}
            Si es urgente, escribinos ahora.
          </p>
          <a className="cta" href={wa} target="_blank" rel="noreferrer">Escribir por WhatsApp</a>
        </div>
      </div>
    );
  }

  return (
    <div className="solicitud">
      <h2>{titulo || '¿No encontrás el repuesto? Pedilo y te lo buscamos'}</h2>
      <p>{texto || 'Muchos repuestos todavía no están cargados en el catálogo. Contanos qué necesitás y te respondemos.'}</p>
      <form onSubmit={enviar}>
        <label>
          Nombre o comercio *
          <input name="nombre" autoComplete="organization" maxLength={80} required />
        </label>
        <label>
          WhatsApp *
          <input name="telefono" type="tel" inputMode="tel" autoComplete="tel" maxLength={30} required />
        </label>
        <label className="full">
          Provincia
          <select name="provincia" defaultValue="">
            <option value="">Elegí tu provincia</option>
            {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label className="full">
          ¿Qué repuesto necesitás? *
          <textarea name="consulta" defaultValue={detalleInicial} maxLength={1000} required placeholder="Máquina, modelo, código original, medida, cantidad…" />
        </label>
        <span className="trampa" aria-hidden="true">
          <label>No completar <input name="sitio_web" tabIndex={-1} autoComplete="off" /></label>
        </span>
        <button type="submit" className="full" disabled={estado === 'enviando'}>
          {estado === 'enviando' ? 'Enviando…' : 'Pedir el repuesto'}
        </button>
      </form>
    </div>
  );
}
