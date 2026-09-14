'use client';

import '../catalogo-extra.css';
import { useEffect, useRef, useState } from 'react';
import { numeroWhatsApp } from './pedidoStore';

const CLAVE = 'lb_asistente';
const SUGERENCIAS = ['Carburador para Stihl MS 250', 'Correa de plataforma Cub Cadet 42"', '¿Qué equivale al 754-0260?'];

export default function Asistente() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [pensando, setPensando] = useState(false);
  const lista = useRef(null);
  const entrada = useRef(null);

  useEffect(() => {
    try { setMensajes(JSON.parse(sessionStorage.getItem(CLAVE) || '[]')); } catch {}
  }, []);
  useEffect(() => {
    try { sessionStorage.setItem(CLAVE, JSON.stringify(mensajes.slice(-30))); } catch {}
    lista.current?.scrollTo({ top: lista.current.scrollHeight, behavior: 'smooth' });
  }, [mensajes, pensando]);
  useEffect(() => {
    if (!abierto) return;
    entrada.current?.focus();
    const onKey = (e) => e.key === 'Escape' && setAbierto(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [abierto]);

  async function preguntar(consulta) {
    const q = consulta.trim();
    if (!q || pensando) return;
    const nuevos = [...mensajes, { role: 'user', content: q }];
    setMensajes(nuevos);
    setTexto('');
    setPensando(true);
    try {
      const r = await fetch('/api/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensajes: nuevos.map(({ role, content }) => ({ role, content })) }),
      });
      const d = await r.json();
      setMensajes((m) => [...m, d.ok
        ? { role: 'assistant', content: d.texto, productos: d.productos }
        : { role: 'assistant', content: d.error || 'No pude responder ahora. Escribinos por WhatsApp.', error: true }]);
    } catch {
      setMensajes((m) => [...m, { role: 'assistant', content: 'Se cortó la conexión. Probá de nuevo.', error: true }]);
    } finally {
      setPensando(false);
    }
  }

  if (!abierto) {
    return (
      <button type="button" className="asis-fab" onClick={() => setAbierto(true)} aria-label="Abrir asistente de repuestos">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12a8 8 0 0 1-11.8 7L4 20l1.1-4.6A8 8 0 1 1 21 12Z" /><path d="M8.5 11h.01M12 11h.01M15.5 11h.01" />
        </svg>
        <span>¿Qué repuesto buscás?</span>
      </button>
    );
  }

  const ultimaPregunta = [...mensajes].reverse().find((m) => m.role === 'user')?.content || '';
  const wa = `https://wa.me/${numeroWhatsApp()}?text=${encodeURIComponent(`Hola, consulto por: ${ultimaPregunta}`)}`;

  return (
    <div className="asis-panel" role="dialog" aria-label="Asistente de repuestos">
      <div className="asis-cab">
        <b>Asistente de repuestos<small>Busca en el catálogo Logbelts</small></b>
        {mensajes.length ? <button type="button" onClick={() => setMensajes([])} aria-label="Empezar de nuevo" title="Empezar de nuevo">↺</button> : null}
        <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar asistente">✕</button>
      </div>

      <div className="asis-msgs" ref={lista} aria-live="polite">
        {!mensajes.length ? (
          <>
            <div className="asis-msg assistant">
              Hola 👋 Contame qué repuesto necesitás: la máquina y el modelo, un código original o una medida, y lo busco en el catálogo.
            </div>
            <div className="asis-sugerencias">
              {SUGERENCIAS.map((s) => <button type="button" key={s} onClick={() => preguntar(s)}>{s}</button>)}
            </div>
          </>
        ) : null}
        {mensajes.map((m, i) => (
          <div key={i} className={`asis-msg ${m.role}`}>
            {m.content}
            {m.productos?.length ? (
              <div className="asis-prods">
                {m.productos.map((p) => (
                  <a key={p.codigo} href={`/p/${encodeURIComponent(p.codigo)}`}>
                    {p.foto ? <img src={p.foto} alt="" loading="lazy" /> : null}
                    <span><b>{p.codigo}</b>{p.nombre}</span>
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        {pensando ? <div className="asis-escribiendo">Buscando en el catálogo…</div> : null}
      </div>

      <form className="asis-form" onSubmit={(e) => { e.preventDefault(); preguntar(texto); }}>
        <input
          ref={entrada}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ej: cabezal para desmalezadora Oleo Mac"
          maxLength={500}
          aria-label="Escribí tu consulta"
        />
        <button type="submit" disabled={!texto.trim() || pensando}>Enviar</button>
      </form>
      <p className="asis-pie">
        Respuestas automáticas con IA sobre el catálogo; confirmá con tu vendedor. Precios y stock:{' '}
        <a href={wa} target="_blank" rel="noreferrer">WhatsApp</a>
      </p>
    </div>
  );
}
