'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MARCA, slugMarca } from '../../../lib/marca';

const TAM = 1080;

function cargarImagen(src) {
  return new Promise((ok, mal) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = mal;
    img.src = src;
  });
}

function ajustarTexto(ctx, texto, maxAncho, tamInicial, fuente) {
  let tam = tamInicial;
  ctx.font = fuente(tam);
  while (ctx.measureText(texto).width > maxAncho && tam > 24) {
    tam -= 4;
    ctx.font = fuente(tam);
  }
  return tam;
}

export default function GeneradorPlaca({ fotos }) {
  const lienzo = useRef(null);
  const [foto, setFoto] = useState(fotos[0]?.src);
  const [titulo, setTitulo] = useState(`Repuestos ${MARCA.nombre}`);
  const [comercio, setComercio] = useState('');
  const [contacto, setContacto] = useState('');
  const [generando, setGenerando] = useState(false);

  const dibujar = useCallback(async () => {
    const canvas = lienzo.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    try { await Promise.all([document.fonts.load('italic 700 80px Dunk95'), document.fonts.load('700 40px "Aktiv Grotesk"')]); } catch {}

    const fondo = ctx.createRadialGradient(TAM * 0.3, -TAM * 0.1, 50, TAM * 0.5, TAM * 0.5, TAM);
    fondo.addColorStop(0, '#123b78');
    fondo.addColorStop(0.5, '#0a2149');
    fondo.addColorStop(1, '#071531');
    ctx.fillStyle = fondo;
    ctx.fillRect(0, 0, TAM, TAM);

    ctx.fillStyle = 'rgba(143,176,255,.18)';
    ctx.beginPath();
    ctx.arc(TAM / 2, 520, 330, 0, Math.PI * 2);
    ctx.fill();

    try {
      const logo = await cargarImagen(MARCA.logoClaro);
      const ancho = 250;
      ctx.drawImage(logo, 70, 60, ancho, (logo.height / logo.width) * ancho);
    } catch {}

    ctx.textAlign = 'right';
    ctx.fillStyle = '#8fb0ff';
    ctx.font = '700 30px "Aktiv Grotesk", sans-serif';
    ctx.fillText('VENTA DE REPUESTOS', TAM - 70, 110);

    if (foto) {
      try {
        const img = await cargarImagen(foto);
        const maxW = 780, maxH = 470;
        const escala = Math.min(maxW / img.width, maxH / img.height);
        const w = img.width * escala, h = img.height * escala;
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,.45)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 24;
        ctx.drawImage(img, (TAM - w) / 2, 520 - h / 2, w, h);
        ctx.restore();
      } catch {}
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    const tituloMayus = (titulo || '').toUpperCase();
    ajustarTexto(ctx, tituloMayus, TAM - 140, 92, t => `italic 700 ${t}px Dunk95, Impact, sans-serif`);
    ctx.fillText(tituloMayus, TAM / 2, 850);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 900, TAM, 180);
    ctx.fillStyle = '#0a2149';
    const nombre = comercio || 'Nombre de tu comercio';
    ajustarTexto(ctx, nombre, TAM - 140, 54, t => `700 ${t}px "Aktiv Grotesk", sans-serif`);
    ctx.fillText(nombre, TAM / 2, 980);
    ctx.fillStyle = '#4a505b';
    ctx.font = '400 34px "Aktiv Grotesk", sans-serif';
    ctx.fillText(contacto || 'WhatsApp · dirección · localidad', TAM / 2, 1035);
  }, [foto, titulo, comercio, contacto]);

  useEffect(() => { dibujar(); }, [dibujar]);

  function descargar() {
    setGenerando(true);
    lienzo.current.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `placa-${slugMarca()}-${(comercio || 'comercio').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setGenerando(false);
    }, 'image/png');
  }

  return (
    <div className="placa">
      <div className="placa__form">
        <fieldset>
          <legend>Producto</legend>
          <div className="placa__fotos">
            {fotos.map(f => (
              <label key={f.src} className={foto === f.src ? 'on' : ''}>
                <input type="radio" name="foto" value={f.src} checked={foto === f.src} onChange={() => setFoto(f.src)} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.src} alt={f.nombre} />
              </label>
            ))}
          </div>
        </fieldset>
        <div className="campo">
          <label htmlFor="placa-titulo">Título</label>
          <input id="placa-titulo" value={titulo} onChange={e => setTitulo(e.target.value)} maxLength={40} />
        </div>
        <div className="campo">
          <label htmlFor="placa-comercio">Nombre de tu comercio</label>
          <input id="placa-comercio" value={comercio} onChange={e => setComercio(e.target.value)} maxLength={40} placeholder="Ej: Agro Ferretería El Tala" />
        </div>
        <div className="campo">
          <label htmlFor="placa-contacto">Contacto</label>
          <input id="placa-contacto" value={contacto} onChange={e => setContacto(e.target.value)} maxLength={60} placeholder="Ej: WhatsApp 11 5555-5555 · Pilar" />
        </div>
        <button type="button" className="boton" onClick={descargar} disabled={generando}>
          {generando ? 'Generando…' : 'Descargar placa (PNG)'}
        </button>
      </div>
      <div className="placa__vista">
        <canvas ref={lienzo} width={TAM} height={TAM} role="img" aria-label="Vista previa de la placa" />
      </div>
    </div>
  );
}
