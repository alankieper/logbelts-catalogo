'use client';

import { useMemo, useState } from 'react';

const valores = (items, campo) => [...new Set(items.map(i => i[campo]).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), 'es', { numeric: true }));

export default function FiltroEspadas({ items }) {
  const [tipo, setTipo] = useState('');
  const [paso, setPaso] = useState('');
  const [calibre, setCalibre] = useState('');
  const [largo, setLargo] = useState('');
  const [eslabones, setEslabones] = useState('');

  const opciones = useMemo(() => ({
    paso: valores(items, 'paso'),
    calibre: valores(items, 'calibre'),
    largo: valores(items.filter(i => i.tipo === 'Espada'), 'largo'),
    eslabones: valores(items, 'eslabones'),
  }), [items]);

  const resultado = items.filter(i =>
    (!tipo || i.tipo === tipo) &&
    (!paso || i.paso === paso) &&
    (!calibre || i.calibre === calibre) &&
    (!largo || i.largo === largo) &&
    (!eslabones || String(i.eslabones) === eslabones)
  );

  const Select = ({ etiqueta, valor, setValor, lista }) => (
    <label>{etiqueta}
      <select value={valor} onChange={e => setValor(e.target.value)}>
        <option value="">Todos</option>
        {lista.map(v => <option key={v} value={v}>{v}</option>)}
      </select>
    </label>
  );

  return (
    <div className="filtro-tecnico">
      <h2 className="display">Buscador por medida</h2>
      <div className="filtro-tecnico__campos">
        <label>Tipo
          <select value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="">Espadas y cadenas</option>
            <option>Espada</option>
            <option>Cadena</option>
          </select>
        </label>
        <Select etiqueta="Paso" valor={paso} setValor={setPaso} lista={opciones.paso} />
        <Select etiqueta="Calibre" valor={calibre} setValor={setCalibre} lista={opciones.calibre} />
        <Select etiqueta="Largo de espada" valor={largo} setValor={setLargo} lista={opciones.largo} />
        <Select etiqueta="Eslabones" valor={eslabones} setValor={setEslabones} lista={opciones.eslabones.map(String)} />
      </div>

      <p className="filtro-tecnico__res" role="status">{resultado.length} producto{resultado.length === 1 ? '' : 's'}</p>
      <div className="tabla-tecnica">
        <table>
          <thead><tr><th>Código</th><th>Producto</th><th>Paso</th><th>Calibre</th><th>Largo / DL</th></tr></thead>
          <tbody>
            {resultado.map(i => (
              <tr key={i.codigo}>
                <td><a href={`/p/${i.codigo}`}><strong>{i.codigo}</strong></a></td>
                <td><a href={`/p/${i.codigo}`}>{i.nombre}</a><small>{i.tipo}{i.rollo ? ' · rollo' : ''}</small></td>
                <td>{i.paso || '—'}</td>
                <td>{i.calibre || '—'}</td>
                <td>{[i.largo, i.eslabones ? `${i.eslabones} DL` : null].filter(Boolean).join(' · ') || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="nota-sitio" style={{ textAlign: 'left' }}>
        ¿No está la medida? <a href="/buscar?q=cadena">Buscá en el catálogo</a> o pedila por WhatsApp.
      </p>
    </div>
  );
}
