'use client';

import { useState } from 'react';
import { agregarAlPedido, descargarCSV, enviarPedido } from './pedidoStore';
import { MARCA } from '../../lib/marca';

// Nombre de los archivos que se descargan (pedido-mi-empresa.csv).
const ARCHIVO = MARCA.nombre.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'catalogo';

const EJEMPLO = '5888064 x2\n754-0260 x5\n2291029 10';

export default function PedidoRapido() {
  const [texto, setTexto] = useState('');
  const [filas, setFilas] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  async function procesar(body, esArchivo) {
    setCargando(true);
    setError('');
    setAviso('');
    try {
      const r = await fetch('/api/pedido-rapido', esArchivo
        ? { method: 'POST', body }
        : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'No se pudo revisar la lista.');
      setFilas(d.filas.map((f, i) => ({ ...f, id: i, elegido: f.estado === 'ok' ? f.producto : null })));
      if (d.recortado) setAviso('Se revisaron las primeras 300 líneas.');
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  function subirArchivo(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    const form = new FormData();
    form.append('archivo', archivo);
    procesar(form, true);
    e.target.value = '';
  }

  const actualizar = (id, cambios) => setFilas((fs) => fs.map((f) => (f.id === id ? { ...f, ...cambios } : f)));
  const listos = (filas || []).filter((f) => f.elegido).map((f) => ({ codigo: f.elegido.codigo, nombre: f.elegido.nombre, cant: f.cant }));
  const cuenta = (estado) => (filas || []).filter((f) => f.estado === estado).length;

  return (
    <>
      <div className="pr-entrada">
        <div className="pr-caja">
          <h2>Pegá tu lista de códigos</h2>
          <p>Un código por línea, con la cantidad al lado. Sirven los códigos del catálogo o los códigos originales del fabricante.</p>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={EJEMPLO}
            aria-label="Lista de códigos y cantidades"
            spellCheck={false}
          />
          <div className="pr-acc">
            <button type="button" className="pr-btn" disabled={!texto.trim() || cargando} onClick={() => procesar({ texto })}>
              {cargando ? 'Revisando…' : 'Revisar códigos'}
            </button>
            <button type="button" className="pr-btn ghost" onClick={() => setTexto(EJEMPLO)}>Ver ejemplo</button>
          </div>
        </div>

        <div className="pr-caja">
          <h2>O subí un Excel</h2>
          <p>Con una columna “Código” y otra “Cantidad” (también sirve CSV). Máximo 2 MB.</p>
          <label className="pr-file" style={{ position: 'relative' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M4 20h16" /></svg>
            <b>Elegir archivo</b>
            <span>.xlsx, .xls o .csv</span>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={subirArchivo} disabled={cargando} />
          </label>
          <div className="pr-acc">
            <button type="button" className="pr-btn ghost" onClick={() => descargarCSV(`plantilla-pedido-${ARCHIVO}.csv`, [['Código', 'Cantidad'], ['5888064', '2'], ['754-0260', '5']])}>
              Descargar plantilla
            </button>
          </div>
        </div>
      </div>

      {error ? <p className="err-msg" style={{ marginTop: 16 }}>{error}</p> : null}
      {aviso ? <p className="note">{aviso}</p> : null}

      {filas ? (
        <div className="pr-res">
          <div className="pr-resumen">
            <span className="est ok">{cuenta('ok')} encontrados</span>
            <span className="est dudoso">{cuenta('dudoso')} para confirmar</span>
            <span className="est no">{cuenta('no_encontrado')} sin coincidencia</span>
          </div>

          <table className="pr-tabla">
            <thead>
              <tr><th>Estado</th><th>Tu línea</th><th>Producto</th><th>Cant.</th><th /></tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.id}>
                  <td>
                    {f.elegido ? <span className="est ok">OK</span> : f.estado === 'dudoso' ? <span className="est dudoso">Elegí</span> : <span className="est no">No está</span>}
                  </td>
                  <td className="entrada">{f.entrada}</td>
                  <td>
                    {f.estado === 'ok' && f.producto ? (
                      <a className="prod" href={`/p/${encodeURIComponent(f.producto.codigo)}`} target="_blank" rel="noreferrer">
                        {f.producto.foto ? <img src={f.producto.foto} alt="" loading="lazy" /> : null}
                        <span><b>{f.producto.codigo}</b>{f.producto.nombre}</span>
                      </a>
                    ) : f.estado === 'dudoso' ? (
                      <div className="opc">
                        {f.opciones.map((o) => (
                          <label key={o.codigo}>
                            <input
                              type="radio"
                              name={`opc-${f.id}`}
                              checked={f.elegido?.codigo === o.codigo}
                              onChange={() => actualizar(f.id, { elegido: o })}
                            />
                            <span><b>{o.codigo}</b> {o.nombre}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <span className="mut">No lo encontramos. Lo podés dejar en el mensaje para tu vendedor.</span>
                    )}
                  </td>
                  <td>
                    <span className="pedido-cant">
                      <input
                        type="number"
                        min="1"
                        max="9999"
                        value={f.cant}
                        onChange={(e) => actualizar(f.id, { cant: Math.min(9999, Math.max(1, Math.trunc(Number(e.target.value) || 1))) })}
                        aria-label={`Cantidad para ${f.entrada}`}
                        style={{ width: 56 }}
                      />
                    </span>
                  </td>
                  <td>
                    <button type="button" className="quitar" onClick={() => setFilas((fs) => fs.filter((x) => x.id !== f.id))} aria-label={`Quitar ${f.entrada}`}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pr-acc" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="pr-btn"
              disabled={!listos.length}
              onClick={() => { agregarAlPedido(listos); setAviso(`Se agregaron ${listos.length} productos a tu pedido (botón “Pedido”).`); }}
            >
              Agregar {listos.length} al pedido
            </button>
            <button
              type="button"
              className="pr-btn wa"
              disabled={!listos.length}
              onClick={() => {
                const faltantes = filas.filter((f) => !f.elegido).map((f) => ({ codigo: f.entrada, nombre: '(no encontrado en el catálogo)', cant: f.cant }));
                enviarPedido([...listos, ...faltantes], 'rapido');
              }}
            >
              Enviar a mi vendedor por WhatsApp
            </button>
            <button
              type="button"
              className="pr-btn ghost"
              disabled={!filas.length}
              onClick={() => descargarCSV(`pedido-${ARCHIVO}.csv`, [
                [MARCA.codigo.etiqueta, 'Producto', 'Cantidad', 'Línea original', 'Estado'],
                ...filas.map((f) => [f.elegido?.codigo || '', f.elegido?.nombre || '', f.cant, f.entrada, f.elegido ? 'OK' : 'Sin coincidencia']),
              ])}
            >
              Descargar revisión
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
