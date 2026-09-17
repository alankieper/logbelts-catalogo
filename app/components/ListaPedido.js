'use client';

import { useEffect, useState } from 'react';
import { enviarPedido, guardarPedidoLocal, leerPedido, leerVendedor } from './pedidoStore';
import { modulo } from '../../lib/marca';

const HAY_PEDIDO_RAPIDO = modulo('pedidoRapido');

export default function ListaPedido() {
  const [lista, setLista] = useState([]);
  const [vendedor, setVendedor] = useState(null);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const sync = () => { setLista(leerPedido()); setVendedor(leerVendedor()); };
    sync();
    window.addEventListener('lb-pedido-cambio', sync);
    window.addEventListener('lb-vendedor-cambio', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('lb-pedido-cambio', sync);
      window.removeEventListener('lb-vendedor-cambio', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const unidades = lista.reduce((acc, x) => acc + x.cant, 0);

  function quitar(codigo) {
    guardarPedidoLocal(lista.filter((x) => x.codigo !== codigo));
  }
  function cambiarCant(codigo, cant) {
    const n = Math.min(9999, Math.max(1, Math.trunc(Number(cant) || 1)));
    guardarPedidoLocal(lista.map((x) => (x.codigo === codigo ? { ...x, cant: n } : x)));
  }
  function vaciar() {
    guardarPedidoLocal([]);
    setAbierto(false);
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
            <b>Tu pedido{lista.length ? ` · ${unidades} u.` : ''}</b>
            <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar">✕</button>
          </div>
          <p className="pedido-links">
            {HAY_PEDIDO_RAPIDO ? <a href="/pedido-rapido">Pedido rápido por códigos</a> : null}
            <a href="/mi-cuenta">Mis pedidos</a>
          </p>

          {lista.length ? (
            <>
              <ul className="pedido-items">
                {lista.map((x) => (
                  <li key={x.codigo}>
                    <a href={`/p/${encodeURIComponent(x.codigo)}`}>
                      <span className="cod">{x.codigo}</span>
                      <span className="nm">{x.nombre}</span>
                    </a>
                    <span className="pedido-cant">
                      <button type="button" onClick={() => cambiarCant(x.codigo, x.cant - 1)} aria-label={`Restar una unidad de ${x.codigo}`}>−</button>
                      <input
                        type="number"
                        min="1"
                        max="9999"
                        value={x.cant}
                        onChange={(e) => cambiarCant(x.codigo, e.target.value)}
                        aria-label={`Cantidad de ${x.codigo}`}
                      />
                      <button type="button" onClick={() => cambiarCant(x.codigo, x.cant + 1)} aria-label={`Sumar una unidad de ${x.codigo}`}>+</button>
                    </span>
                    <button type="button" onClick={() => quitar(x.codigo)} aria-label={`Quitar ${x.codigo}`}>✕</button>
                  </li>
                ))}
              </ul>
              <p className="pedido-nota">Venta únicamente por mayor. Tu vendedor te confirma precios y disponibilidad.</p>
              {vendedor ? <p className="pedido-dest">Se envía a tu vendedor: <b>{vendedor.nombre}</b></p> : null}
              <div className="pedido-acc">
                <button type="button" className="pedido-vaciar" onClick={vaciar}>Vaciar</button>
                <button type="button" className="pedido-enviar" onClick={() => enviarPedido(lista, 'lista')}>
                  Enviar por WhatsApp ({lista.length})
                </button>
              </div>
            </>
          ) : (
            <p className="pedido-vacio">
              Todavía no agregaste productos. Usá <b>“+ Agregar al pedido”</b> en cada producto
              {HAY_PEDIDO_RAPIDO ? <>, o cargá una lista de códigos en <a href="/pedido-rapido">Pedido rápido</a></> : null}.
            </p>
          )}
        </div>
      ) : null}
    </>
  );
}
