'use client';

import { useEffect, useState } from 'react';
import { logEvento } from './Registrar';

const KEY = 'lb_pedido';
const WA = '5491161142012';

function leer() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function guardar(lista) {
  try { localStorage.setItem(KEY, JSON.stringify(lista)); } catch {}
  window.dispatchEvent(new Event('lb-pedido-cambio'));
}

export default function ListaPedido() {
  const [lista, setLista] = useState([]);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const sync = () => setLista(leer());
    sync();
    window.addEventListener('lb-pedido-cambio', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('lb-pedido-cambio', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  function quitar(codigo) {
    guardar(lista.filter((x) => x.codigo !== codigo));
  }
  function vaciar() {
    guardar([]);
    setAbierto(false);
  }
  function enviar() {
    if (!lista.length) return;
    const lineas = lista.map((x) => `- ${x.codigo} · ${x.nombre}`).join('\n');
    const texto = `Hola, quiero consultar por estos productos (Catálogo Logbelts):\n${lineas}`;
    logEvento({ tipo: 'lista_envio', n: lista.length, meta: { codigos: lista.map((x) => x.codigo) } });
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
  }

  return (
    <>
      <button
        type="button"
        className="pedido-fab"
        onClick={() => setAbierto((v) => !v)}
        aria-label={`Pedido: ${lista.length} producto${lista.length === 1 ? '' : 's'}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M6 6h15l-1.5 9h-12z" /><circle cx="9" cy="20" r="1.6" /><circle cx="18" cy="20" r="1.6" /><path d="M6 6 5 3H2" />
        </svg>
        <span>Pedido</span>
        {lista.length ? <span className="pedido-badge">{lista.length}</span> : null}
      </button>

      {abierto ? (
        <div className="pedido-panel" role="dialog" aria-label="Lista de pedido">
          <div className="pedido-head">
            <b>Tu pedido</b>
            <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar">✕</button>
          </div>

          {lista.length ? (
            <>
              <ul className="pedido-items">
                {lista.map((x) => (
                  <li key={x.codigo}>
                    <a href={`/p/${encodeURIComponent(x.codigo)}`}>
                      <span className="cod">{x.codigo}</span>
                      <span className="nm">{x.nombre}</span>
                    </a>
                    <button type="button" onClick={() => quitar(x.codigo)} aria-label={`Quitar ${x.codigo}`}>✕</button>
                  </li>
                ))}
              </ul>
              <p className="pedido-nota">Recordá que vendemos únicamente por mayor.</p>
              <div className="pedido-acc">
                <button type="button" className="pedido-vaciar" onClick={vaciar}>Vaciar</button>
                <button type="button" className="pedido-enviar" onClick={enviar}>
                  Enviar por WhatsApp ({lista.length})
                </button>
              </div>
            </>
          ) : (
            <p className="pedido-vacio">
              Todavía no agregaste productos. Usá <b>“+ Agregar al pedido”</b> en cada producto y después
              mandás toda la consulta junta.
            </p>
          )}
        </div>
      ) : null}
    </>
  );
}
