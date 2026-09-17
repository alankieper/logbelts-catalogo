'use client';

import { useEffect, useState } from 'react';
import { waLink } from '../../lib/telefono';
import { MARCA } from '../../lib/marca';
import {
  agregarAlPedido, descargarCSV, guardarFavoritos, guardarPedidoLocal,
  leerFavoritos, leerHistorial, leerVendedor, WA_GENERAL,
} from './pedidoStore';

const ARCHIVO = MARCA.nombre.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'catalogo';

const fecha = (iso) => new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function MiCuenta() {
  const [listo, setListo] = useState(false);
  const [favoritos, setFavoritos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [vendedor, setVendedor] = useState(null);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    const sync = () => {
      setFavoritos(leerFavoritos());
      setHistorial(leerHistorial());
      setVendedor(leerVendedor());
      setListo(true);
    };
    sync();
    for (const ev of ['lb-favoritos-cambio', 'lb-historial-cambio', 'lb-vendedor-cambio', 'storage']) window.addEventListener(ev, sync);
    return () => { for (const ev of ['lb-favoritos-cambio', 'lb-historial-cambio', 'lb-vendedor-cambio', 'storage']) window.removeEventListener(ev, sync); };
  }, []);

  if (!listo) return null;

  const waVendedor = waLink(vendedor?.telefono, `Hola, te escribo desde el catálogo ${MARCA.nombre}.`) || `https://wa.me/${WA_GENERAL}`;

  return (
    <div className="mc-grid">
      <div className="mc-caja">
        <h2>Tu vendedor</h2>
        {vendedor ? (
          <>
            <p style={{ margin: '0 0 12px' }}><b>{vendedor.nombre}</b> atiende tu zona y te cotiza precios y disponibilidad.</p>
            <a className="cta" href={waVendedor} target="_blank" rel="noreferrer">Escribirle por WhatsApp</a>
          </>
        ) : (
          <>
            <p style={{ margin: '0 0 12px', fontSize: 13.5, color: 'var(--ink-soft)' }}>
              Dejanos tus datos y te asignamos el vendedor de tu zona. Los pedidos le llegan directo.
            </p>
            <a className="pr-btn" href="/contacto">Registrarme</a>
          </>
        )}
        <p className="mc-nota">Favoritos e historial se guardan en este dispositivo y navegador.</p>
      </div>

      <div style={{ display: 'grid', gap: 18 }}>
        <div className="mc-caja">
          <h2>Favoritos <small>{favoritos.length} producto{favoritos.length === 1 ? '' : 's'}</small></h2>
          {favoritos.length ? (
            <>
              <ul className="mc-lista">
                {favoritos.map((x) => (
                  <li key={x.codigo}>
                    <a href={`/p/${encodeURIComponent(x.codigo)}`}>
                      <span className="cod">{x.codigo}</span>
                      <span className="nm">{x.nombre}</span>
                    </a>
                    <button type="button" className="pr-btn ghost" style={{ minHeight: 36, padding: '0 12px' }} onClick={() => { agregarAlPedido([{ ...x, cant: 1 }]); setAviso(`${x.codigo} agregado al pedido.`); }}>
                      + Pedido
                    </button>
                    <button type="button" className="quitar" style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--ink-faint)' }} onClick={() => guardarFavoritos(favoritos.filter((f) => f.codigo !== x.codigo))} aria-label={`Quitar ${x.codigo} de favoritos`}>✕</button>
                  </li>
                ))}
              </ul>
              <div className="pr-acc">
                <button type="button" className="pr-btn" onClick={() => { agregarAlPedido(favoritos.map((f) => ({ ...f, cant: 1 }))); setAviso('Favoritos agregados al pedido.'); }}>
                  Agregar todos al pedido
                </button>
                <button type="button" className="pr-btn ghost" onClick={() => descargarCSV(`favoritos-${ARCHIVO}.csv`, [['Código', 'Producto'], ...favoritos.map((f) => [f.codigo, f.nombre])])}>
                  Descargar lista
                </button>
              </div>
            </>
          ) : (
            <p className="mc-vacio">Tocá el corazón en cualquier producto para guardarlo acá y tenerlo a mano.</p>
          )}
        </div>

        <div className="mc-caja">
          <h2>Pedidos enviados <small>últimos {historial.length}</small></h2>
          {historial.length ? historial.map((h, i) => (
            <div className="mc-pedido" key={h.fecha + i}>
              <div className="cab">
                <b>{fecha(h.fecha)} · {h.items.length} producto{h.items.length === 1 ? '' : 's'}</b>
                <span className="pr-acc" style={{ marginTop: 0 }}>
                  <button type="button" className="pr-btn" style={{ minHeight: 36 }} onClick={() => { guardarPedidoLocal(h.items); setAviso('Pedido cargado de nuevo: revisalo en el botón “Pedido”.'); }}>
                    Repetir
                  </button>
                  <button type="button" className="pr-btn ghost" style={{ minHeight: 36 }} onClick={() => descargarCSV(`pedido-${h.fecha.slice(0, 10)}.csv`, [['Código', 'Producto', 'Cantidad'], ...h.items.map((x) => [x.codigo, x.nombre, x.cant || 1])])}>
                    Descargar
                  </button>
                </span>
              </div>
              <p className="items">{h.items.slice(0, 6).map((x) => `${x.cant > 1 ? `${x.cant}×` : ''}${x.codigo}`).join(' · ')}{h.items.length > 6 ? ` y ${h.items.length - 6} más` : ''}</p>
            </div>
          )) : (
            <p className="mc-vacio">Cuando envíes un pedido por WhatsApp va a quedar acá para repetirlo con un toque.</p>
          )}
        </div>
        {aviso ? <p className="ok-msg" role="status">{aviso}</p> : null}
      </div>
    </div>
  );
}
