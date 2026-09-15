// Estado del pedido y datos del visitante guardados en el navegador (sin precios: los cotiza el vendedor).
import { logEvento } from './Registrar';
import { telefonoWhatsApp } from '../../lib/telefono';

export const WA_GENERAL = '5491161142012';
const K_PEDIDO = 'lb_pedido';
const K_HISTORIAL = 'lb_pedidos_hist';
const K_FAVORITOS = 'lb_favoritos';
const K_VENDEDOR = 'lb_vendedor';
const K_PROVINCIA = 'lb_provincia';

const leerJSON = (clave, def) => {
  try { return JSON.parse(localStorage.getItem(clave) || 'null') ?? def; } catch { return def; }
};
const guardarJSON = (clave, valor, evento) => {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch {}
  if (evento) window.dispatchEvent(new Event(evento));
};

// ---- Pedido actual ----
export const leerPedido = () => leerJSON(K_PEDIDO, []).map(x => ({ ...x, cant: Math.max(1, Number(x.cant) || 1) }));
export const guardarPedidoLocal = lista => guardarJSON(K_PEDIDO, lista, 'lb-pedido-cambio');

export function agregarAlPedido(items) {
  const lista = leerPedido();
  for (const it of items) {
    const previo = lista.find(x => x.codigo === it.codigo);
    if (previo) previo.cant = Math.min(9999, previo.cant + (Number(it.cant) || 1));
    else lista.push({ codigo: it.codigo, nombre: it.nombre || it.codigo, cant: Math.max(1, Number(it.cant) || 1) });
  }
  guardarPedidoLocal(lista);
  return lista;
}

// ---- Vendedor asignado (lo devuelve el alta de contacto o /api/vendedor) ----
export const leerVendedor = () => leerJSON(K_VENDEDOR, null);
export function guardarVendedor(vendedor) {
  if (vendedor && vendedor.nombre) guardarJSON(K_VENDEDOR, { nombre: vendedor.nombre, telefono: vendedor.telefono || null }, 'lb-vendedor-cambio');
  else if (vendedor === null) {
    try { localStorage.removeItem(K_VENDEDOR); } catch {}
    window.dispatchEvent(new Event('lb-vendedor-cambio'));
  }
}
export function numeroWhatsApp() {
  return telefonoWhatsApp(leerVendedor()?.telefono) || WA_GENERAL;
}

// ---- Provincia elegida por el visitante (para derivar al vendedor de la zona) ----
export const leerProvincia = () => leerJSON(K_PROVINCIA, null);
export const guardarProvincia = provincia => guardarJSON(K_PROVINCIA, provincia || null, 'lb-vendedor-cambio');

/** Link de WhatsApp con el vendedor guardado, o el general si no hay. */
export const linkWhatsApp = (texto, numero = numeroWhatsApp()) =>
  `https://wa.me/${numero}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`;

// ---- Envío por WhatsApp + registro ----
export function textoPedido(items) {
  const lineas = items.map(x => `- ${x.cant > 1 ? `${x.cant} x ` : ''}${x.codigo} · ${x.nombre}`).join('\n');
  return `Hola, quiero hacer este pedido (Catálogo Logbelts):\n${lineas}`;
}

export function enviarPedido(items, origen = 'lista') {
  if (!items.length) return;
  logEvento({ tipo: 'lista_envio', n: items.length, meta: { codigos: items.map(x => x.codigo), origen } });
  try {
    fetch('/api/pedido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, origen, provincia: leerProvincia() }),
      keepalive: true,
    });
  } catch {}
  const historial = leerJSON(K_HISTORIAL, []);
  historial.unshift({ fecha: new Date().toISOString(), items });
  guardarJSON(K_HISTORIAL, historial.slice(0, 30), 'lb-historial-cambio');
  window.open(`https://wa.me/${numeroWhatsApp()}?text=${encodeURIComponent(textoPedido(items))}`, '_blank', 'noopener');
}

export const leerHistorial = () => leerJSON(K_HISTORIAL, []);

// ---- Favoritos ----
export const leerFavoritos = () => leerJSON(K_FAVORITOS, []);
export const guardarFavoritos = lista => guardarJSON(K_FAVORITOS, lista, 'lb-favoritos-cambio');

// ---- Descarga de listas (CSV que abre Excel) ----
export function descargarCSV(nombreArchivo, filas) {
  const csv = filas.map(f => f.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
