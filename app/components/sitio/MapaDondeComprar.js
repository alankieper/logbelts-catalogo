'use client';

import { useEffect, useMemo, useState } from 'react';
import { MAPA_ALTO, MAPA_ANCHO, RUTAS_DIVISIONES, RUTA_ARGENTINA, proyectar } from '../../admin/metricas/mapaArgentina';

/**
 * Mapa de "Dónde comprar": cada comercio es una flecha de Logbelts sobre la Argentina.
 * Pasando el mouse (o tocando) se ve el comercio; "¿Dónde estás?" ordena por cercanía
 * y marca los 3 más cercanos.
 * distribuidores: [{ id, nombre, localidad, provincia, direccion, telefono, whatsapp, coord:[lon,lat], wa }]
 * ciudades: [[nombre, lon, lat]]
 */

// Flecha del logo, como en la marca: las dos puntas atrás (izquierda) y la punta hacia la derecha.
// La punta (0,0) cae exactamente sobre el lugar del comercio.
const FLECHA = 'M0,0 L-11.4,-4.1 L-6,-0.2 L-7.5,2.7 Z';

function km([lon1, lat1], [lon2, lat2]) {
  const r = (g) => (g * Math.PI) / 180;
  const a = Math.sin(r(lat2 - lat1) / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lon2 - lon1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

export default function MapaDondeComprar({ distribuidores, ciudades, muestra = false }) {
  const [activo, setActivo] = useState(null);
  const [origen, setOrigen] = useState(null); // { nombre, coord }
  const [provincia, setProvincia] = useState('');
  const [aviso, setAviso] = useState('');

  const conXY = useMemo(
    () => distribuidores.filter((d) => d.coord).map((d) => {
      const [x, y] = proyectar(d.coord);
      return { ...d, x, y };
    }),
    [distribuidores]
  );

  const ordenados = useMemo(() => {
    const lista = conXY.map((d) => ({ ...d, dist: origen ? km(origen.coord, d.coord) : null }));
    if (origen) return lista.sort((a, b) => a.dist - b.dist);
    return lista.sort((a, b) => (a.provincia || '').localeCompare(b.provincia || '', 'es') || a.nombre.localeCompare(b.nombre, 'es'));
  }, [conXY, origen]);

  const cercanos = origen ? new Set(ordenados.slice(0, 3).map((d) => d.id)) : new Set();
  const provincias = [...new Set(conXY.map((d) => d.provincia).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
  const visibles = provincia ? ordenados.filter((d) => d.provincia === provincia) : ordenados;
  const enMapa = activo ? conXY.find((d) => d.id === activo) : null;
  const origenXY = origen ? proyectar(origen.coord) : null;

  function elegirCiudad(nombre) {
    setAviso('');
    const c = ciudades.find((x) => x[0] === nombre);
    if (!c) { setOrigen(null); return; }
    setOrigen({ nombre: c[0], coord: [c[1], c[2]] });
    setProvincia('');
  }

  function usarUbicacion() {
    setAviso('');
    if (!navigator.geolocation) { setAviso('Tu navegador no permite usar la ubicación. Elegí tu ciudad en la lista.'); return; }
    setAviso('Buscando tu ubicación…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigen({ nombre: 'tu ubicación', coord: [pos.coords.longitude, pos.coords.latitude] });
        setProvincia('');
        setAviso('');
      },
      () => setAviso('No pudimos usar tu ubicación. Elegí tu ciudad en la lista.'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  }

  // Al entrar a "Dónde comprar" se pide la ubicación: el navegador le pregunta a la persona
  // y, si acepta, se marca enseguida el comercio más cercano.
  useEffect(() => { usarUbicacion(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fmtKm = (n) => (n < 10 ? `${n.toFixed(1)} km` : `${Math.round(n).toLocaleString('es-AR')} km`);

  return (
    <div className="mapa-dist">
      <div className="mapa-dist__mapa">
        <div className="mapa-dist__lienzo">
          <svg viewBox={`-16 -8 ${MAPA_ANCHO + 22} ${MAPA_ALTO + 16}`} role="img" aria-label={`Mapa de Argentina con ${conXY.length} comercios`}>
            <path d={RUTA_ARGENTINA} className="mapa-dist__pais" />
            {RUTAS_DIVISIONES.map((d, i) => <path key={i} d={d} className="mapa-dist__division" />)}
            {origenXY ? <circle cx={origenXY[0]} cy={origenXY[1]} r="3.4" className="mapa-dist__origen" /> : null}
            {conXY.map((d) => {
              const on = d.id === activo;
              const cerca = cercanos.has(d.id);
              const oculto = provincia && d.provincia !== provincia;
              return (
                <g
                  key={d.id}
                  transform={`translate(${d.x.toFixed(1)} ${d.y.toFixed(1)}) scale(${on ? 1.6 : cerca ? 1.3 : 1})`}
                  className={`mapa-dist__flecha${on ? ' is-on' : ''}${cerca ? ' is-cerca' : ''}${oculto ? ' is-off' : ''}`}
                  tabIndex={0}
                  role="button"
                  aria-label={`${d.nombre}, ${d.localidad || ''} ${d.provincia || ''}`}
                  onMouseEnter={() => setActivo(d.id)}
                  onMouseLeave={() => setActivo((a) => (a === d.id ? null : a))}
                  onFocus={() => setActivo(d.id)}
                  onBlur={() => setActivo((a) => (a === d.id ? null : a))}
                  onClick={() => setActivo(d.id)}
                >
                  <circle cx="-5" r="7" className="mapa-dist__toque" />
                  <path d={FLECHA} />
                </g>
              );
            })}
          </svg>
          {enMapa ? (
            <div
              className="mapa-dist__globo"
              style={{ left: `${((enMapa.x + 16) / (MAPA_ANCHO + 22)) * 100}%`, top: `${((enMapa.y + 8) / (MAPA_ALTO + 16)) * 100}%` }}
              role="status"
            >
              <strong>{enMapa.nombre}</strong>
              <span>{[enMapa.localidad, enMapa.provincia].filter(Boolean).join(', ')}</span>
              {origen ? <span className="mapa-dist__km">A {fmtKm(km(origen.coord, enMapa.coord))} de {origen.nombre}</span> : null}
            </div>
          ) : null}
        </div>
        <p className="mapa-dist__ayuda">Pasá el mouse o tocá una flecha para ver el comercio.</p>
      </div>

      <div>
        <div className="buscar-cerca">
          <label htmlFor="dc-ciudad"><strong>¿Dónde estás?</strong> Te mostramos el comercio más cercano.</label>
          <div className="buscar-cerca__fila">
            <select id="dc-ciudad" value={origen && origen.nombre !== 'tu ubicación' ? origen.nombre : ''} onChange={(e) => elegirCiudad(e.target.value)}>
              <option value="">Elegí tu ciudad</option>
              {ciudades.map((c) => <option key={c[0]} value={c[0]}>{c[0]}</option>)}
            </select>
            <button type="button" className="boton boton--borde" onClick={usarUbicacion}>Usar mi ubicación</button>
          </div>
          {aviso ? <p className="buscar-cerca__aviso" role="status">{aviso}</p> : null}
        </div>

        {origen && ordenados[0] ? (
          <div className="mas-cerca" aria-live="polite">
            <span className="mas-cerca__k">El más cercano a {origen.nombre}</span>
            <strong>{ordenados[0].nombre}</strong>
            <span>{[ordenados[0].localidad, ordenados[0].provincia].filter(Boolean).join(', ')} · {fmtKm(ordenados[0].dist)}</span>
          </div>
        ) : null}

        {!origen && provincias.length > 1 ? (
          <div className="chips-provincias" role="group" aria-label="Filtrar por provincia">
            <button type="button" aria-pressed={!provincia} onClick={() => setProvincia('')}>Todas</button>
            {provincias.map((p) => (
              <button key={p} type="button" aria-pressed={provincia === p} onClick={() => setProvincia(p)}>{p}</button>
            ))}
          </div>
        ) : null}

        <ul className="dist-lista">
          {visibles.map((d) => (
            <li
              key={d.id}
              className={`dist-item${d.id === activo ? ' is-on' : ''}${cercanos.has(d.id) ? ' is-cerca' : ''}`}
              onMouseEnter={() => setActivo(d.id)}
              onMouseLeave={() => setActivo((a) => (a === d.id ? null : a))}
            >
              <div>
                <strong>{d.nombre}</strong>
                <span>{[d.direccion, d.localidad, d.provincia].filter(Boolean).join(' · ')}</span>
                {d.dist != null ? <span className="dist-item__km">{fmtKm(d.dist)}</span> : null}
              </div>
              <div className="dist-item__acc">
                {d.telefono ? <a href={`tel:${d.telefono.replace(/[^\d+]/g, '')}`}>Llamar</a> : null}
                {d.wa ? <a href={d.wa} target="_blank" rel="noopener noreferrer">WhatsApp</a> : null}
                {muestra ? <span className="dist-item__ej">Ejemplo</span> : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
