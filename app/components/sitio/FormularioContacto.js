'use client';

import { useState } from 'react';
import { CATALOGO, whatsappCon } from '../../../lib/sitio';
import { Check, LogoWhatsApp } from './Iconos';
import { enviarContacto } from './enviarContacto';

export default function FormularioContacto() {
  const [estado, setEstado] = useState('form'); // form | enviando | listo
  const [mensaje, setMensaje] = useState('');

  async function enviar(e) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget));
    setMensaje([
      `Hola! Soy ${d.nombre} de ${d.empresa} (${d.localidad}).`,
      d.consulta,
      '',
      d.email && `Email: ${d.email}`,
      `WhatsApp: ${d.telefono}`,
    ].filter(l => l !== undefined && l !== false).join('\n'));
    setEstado('enviando');
    await enviarContacto({ ...d, origen: 'contacto' });
    setEstado('listo');
  }

  if (estado === 'listo') {
    return (
      <div className="formulario__ok" role="status">
        <Check />
        <h2>¡Gracias por escribirnos!</h2>
        <p>Recibimos tu consulta y un vendedor te contacta a la brevedad. Si es urgente, mandala por WhatsApp.</p>
        <div className="cabecera__acciones">
          <a className="boton boton--whatsapp" href={whatsappCon(mensaje)} target="_blank" rel="noopener noreferrer"><LogoWhatsApp /> Enviar por WhatsApp</a>
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
      <div className="campo campo--ancho">
        <label htmlFor="localidad">Localidad y provincia *</label>
        <input id="localidad" name="localidad" autoComplete="address-level2" maxLength={60} required />
      </div>
      <div className="campo campo--ancho">
        <label htmlFor="consulta">Consulta *</label>
        <textarea id="consulta" name="consulta" placeholder="Ej: Quiero ser distribuidor / Quiero hablar con un vendedor" maxLength={1000} required />
      </div>
      <div className="campo campo--trampa" aria-hidden="true">
        <label htmlFor="sitio_web">No completar</label>
        <input id="sitio_web" name="sitio_web" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="campo--ancho">
        <button type="submit" className="boton" disabled={estado === 'enviando'}>
          {estado === 'enviando' ? 'Enviando…' : 'Enviar consulta'}
        </button>
      </div>
    </form>
  );
}
