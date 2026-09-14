'use client';

import { useMemo, useState } from 'react';

const plano = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function FiltroCorreas({ correas }) {
  const [marca, setMarca] = useState('');
  const [uso, setUso] = useState('');
  const [ancho, setAncho] = useState('');
  const [largo, setLargo] = useState('');
  const [unidad, setUnidad] = useState('pulg');
  const [texto, setTexto] = useState('');
  const [limite, setLimite] = useState(40);

  const marcas = useMemo(() => [...new Set(correas.flatMap(c => c.marcas))].sort(), [correas]);
  const anchos = useMemo(() => [...new Set(correas.map(c => c.ancho).filter(Boolean))].sort(), [correas]);

  const resultado = useMemo(() => {
    const t = plano(texto);
    const objetivo = parseFloat(String(largo).replace(',', '.'));
    const objetivoMm = Number.isFinite(objetivo) ? (unidad === 'pulg' ? objetivo * 25.4 : objetivo) : null;
    let lista = correas.filter(c =>
      (!marca || c.marcas.includes(marca)) &&
      (!uso || c.uso === uso) &&
      (!ancho || c.ancho === ancho) &&
      (!t || plano(`${c.codigo} ${c.nombre} ${c.oem.join(' ')}`).includes(t))
    );
    if (objetivoMm) {
      lista = lista
        .filter(c => c.largoMm && Math.abs(c.largoMm - objetivoMm) <= Math.max(40, objetivoMm * 0.03))
        .sort((a, b) => Math.abs(a.largoMm - objetivoMm) - Math.abs(b.largoMm - objetivoMm));
    }
    return lista;
  }, [correas, marca, uso, ancho, largo, unidad, texto]);

  return (
    <div className="filtro-tecnico">
      <h2 className="display">Buscador de correas</h2>
      <div className="filtro-tecnico__campos">
        <label>Largo aproximado
          <span className="filtro-tecnico__unidad">
            <input value={largo} onChange={e => setLargo(e.target.value)} inputMode="decimal" placeholder={unidad === 'pulg' ? 'Ej: 105' : 'Ej: 2670'} />
            <select value={unidad} onChange={e => setUnidad(e.target.value)} aria-label="Unidad">
              <option value="pulg">pulg.</option>
              <option value="mm">mm</option>
            </select>
          </span>
        </label>
        <label>Ancho
          <select value={ancho} onChange={e => setAncho(e.target.value)}>
            <option value="">Todos</option>
            {anchos.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <label>Uso
          <select value={uso} onChange={e => setUso(e.target.value)}>
            <option value="">Todos</option>
            <option>Plataforma de corte</option>
            <option>Transmisión / tracción</option>
            <option>Otra</option>
          </select>
        </label>
        <label>Marca de la máquina
          <select value={marca} onChange={e => setMarca(e.target.value)}>
            <option value="">Todas</option>
            {marcas.map(m => <option key={m}>{m}</option>)}
          </select>
        </label>
        <label className="filtro-tecnico__ancho">Código original o texto
          <input value={texto} onChange={e => setTexto(e.target.value)} placeholder="Ej: 754-0260, Cub Cadet LT 42" />
        </label>
      </div>

      <p className="filtro-tecnico__res" role="status">{resultado.length} correa{resultado.length === 1 ? '' : 's'}</p>
      <div className="tabla-tecnica">
        <table>
          <thead><tr><th>Código</th><th>Correa</th><th>Largo</th><th>Ancho</th></tr></thead>
          <tbody>
            {resultado.slice(0, limite).map(c => (
              <tr key={c.codigo}>
                <td><a href={`/p/${c.codigo}`}><strong>{c.codigo}</strong></a></td>
                <td><a href={`/p/${c.codigo}`}>{c.nombre}</a>{c.marcas.length ? <small>{c.marcas.slice(0, 4).join(' · ')}</small> : null}</td>
                <td>{c.largoMm ? <>{c.largoPulg}&quot;<small>{c.largoMm} mm</small></> : '—'}</td>
                <td>{c.ancho || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {resultado.length > limite ? (
        <button type="button" className="boton boton--borde" style={{ marginTop: 14 }} onClick={() => setLimite(l => l + 40)}>Ver más</button>
      ) : null}
    </div>
  );
}
