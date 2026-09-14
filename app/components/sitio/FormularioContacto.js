'use client';

import { useState } from 'react';
import { CATALOGO, whatsappCon } from '../../../lib/sitio';
import { PROVINCIAS } from '../../../lib/provincias';
import { waLink } from '../../../lib/telefono';
import { guardarVendedor } from '../pedidoStore';
import { Check, LogoWhatsApp } from './Iconos';
import { enviarContacto } from './enviarContacto';

export default function FormularioContacto() {
  const [estado, setEstado] = useState('form'); // form | enviando | listo
  const [mensaje, setMensaje] = useState('');
  const [vendedor, setVendedor] = useState(null);

  async function enviar(e) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget));
    setMensaje([
      `Hola! Soy ${d.nombre} de ${d.empresa} (${[d.localidad, d.provincia].filter(Boolean).join(', ')}).`,
      d.consulta,
      '',
      d.email && `Email: ${d.email}`,
      `WhatsApp: ${d.telefono}`,
    ].filter(l => l !== undefined && l !== false && l !== '').join('\n'));
    setEstado('enviando');
    const r = await enviarContacto({ ...d, origen: 'contacto' });
    if (r?.vendedor) { guardarVendedor(r.vendedor); setVendedor(r.vendedor); }
    setEstado('listo');
  }

  if (estado === 'listo') {
    return (
      <div className="formulario__ok" role="status">
        <Check />
        <h2>¡Gracias por escribirnos!</h2>
        <p>
          {vendedor
            ? `${vendedor.nombre} atiende tu zona y te contacta a la brevedad.`
            : 'Recibimos tu consulta y un vendedor te contacta a la brevedad.'}{' '}
          Si es urgente, mandala por WhatsApp.
        </p>
        <div className="cabecera__acciones">
          <a className="boton boton--whatsapp" href={waLink(vendedor?.telefono, mensaje) || whatsappCon(mensaje)} target="_blank" rel="noopener noreferrer"><LogoWhatsApp /> Enviar por WhatsApp</a>
          <a className="boton boton--borde" href={CATALOGO}>Ver catálogo</a>
        </div>
      </div>
    );
  }

  return (
    <form className="formulario formulario--pagina" onSubmit={enviar}>
      <div className="campo">
        <label htmlFor="empresa">Empresa o comercio *</label>
        <input id="empresa" name="empresa" autoComplete="organization" maxLength={80} required />
      </div>
      <div className="campo">
        <label htmlFor="nombre">Nombre y apellido *</label>
        <input id="nombre" name="nombre" autoComplete="name" maxLength={60} required />
      </div>
      <div className="campo">
        <label htmlFor="telefono">WhatsApp *</label>
        <input id="telefono" name="telefono" type="tel" inputMode="tel" autoComplete="tel" maxLength={30} required />
      </div>
      <div className="campo">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" maxLength={80} />
      </div>
      <div className="campo">
        <label htmlFor="localidad">Localidad *</label>
        <input id="localidad" name="localidad" autoComplete="address-level2" maxLength={60} required />
      </div>
      <div className="campo">
        <label htmlFor="provincia">Provincia *</label>
        <select id="provincia" name="provincia" required defaultValue="">
          <option value="" disabled>Elegí tu provincia</option>
          {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="campo campo--ancho">
        <label htmlFor="consulta">Consulta *</label>
        <textarea id="consulta" name="consulta" placeholder="Ej: Quiero ser distribuidor / Quiero hablar con un vendedor" maxLength={1000} required />
      </div>
      <div className="campo campo--trampa" aria-hidden="true">
        <label htmlFor="sitio_web">No completar</label>
        <input id="sitio_web" name="sitio_web" tabIndex={-1} autoComplete="off" />
      </div>
      <p className="formulario__nota">Tu consulta le llega al vendedor de tu provincia.</p>
      <div className="campo--ancho">
        <button type="submit" className="boton" disabled={estado === 'enviando'}>
          {estado === 'enviando' ? 'Enviando…' : 'Enviar consulta'}
        </button>
      </div>
    </form>
  );
}
