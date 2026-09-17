'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Buscar } from './Iconos';
import '../../buscador-sugerencias.css';

/**
 * Buscador con sugerencias mientras se escribe (combobox accesible).
 *
 * Lo usan el panel de la lupa del encabezado y el buscador de la portada: los dos
 * comparten este componente y sólo cambian las clases del formulario, para no tocar
 * los estilos que ya tienen en app/sitio.css.
 *
 * Sin JavaScript sigue siendo un formulario común que envía a /buscar.
 */

const ESPERA = 200; // ms de debounce
const MINIMO = 2; // letras para empezar a sugerir

const OCULTO = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' };

export default function BuscadorSugerencias({
  id = 'buscador-q',
  formClase,
  filaClase,
  etiqueta = 'Buscar en el catálogo',
  etiquetaClase,
  etiquetaOculta = false,
  placeholder = '',
  defaultValue = '',
  botonTexto = 'Buscar',
  botonClase = 'boton',
  ancho,
  enfocar = false,
  onCerrar,
}) {
  const router = useRouter();
  const unico = useId().replace(/:/g, '');
  const listaId = `bsug-lista-${unico}`;
  const opId = (i) => `bsug-op-${unico}-${i}`;

  const [valor, setValor] = useState(defaultValue);
  const [datos, setDatos] = useState(null);
  const [abierta, setAbierta] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [activo, setActivo] = useState(-1);

  const caja = useRef(null);
  const campo = useRef(null);
  const aborto = useRef(null);
  const cache = useRef(new Map());
  const tecleado = useRef(false);

  // Foco cuando el panel de la lupa se abre.
  useEffect(() => {
    if (enfocar) campo.current?.focus();
  }, [enfocar]);

  // Consulta con debounce + cancelación de la anterior.
  useEffect(() => {
    if (!tecleado.current) return undefined;
    const t = valor.trim();
    if (t.length < MINIMO) {
      aborto.current?.abort();
      setDatos(null);
      setAbierta(false);
      setCargando(false);
      return undefined;
    }
    const guardado = cache.current.get(t);
    if (guardado) {
      setDatos(guardado);
      setAbierta(true);
      setActivo(-1);
      setCargando(false);
      return undefined;
    }
    setCargando(true);
    const reloj = setTimeout(() => {
      aborto.current?.abort();
      const ac = new AbortController();
      aborto.current = ac;
      fetch(`/api/buscar?q=${encodeURIComponent(t)}`, { signal: ac.signal })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          if (ac.signal.aborted || !j) return;
          if (cache.current.size > 40) cache.current.clear();
          cache.current.set(t, j);
          setDatos(j);
          setAbierta(true);
          setActivo(-1);
          setCargando(false);
        })
        .catch(() => {
          if (!ac.signal.aborted) setCargando(false);
        });
    }, ESPERA);
    return () => clearTimeout(reloj);
  }, [valor]);

  useEffect(() => () => aborto.current?.abort(), []);

  // Clic afuera: cerrar la lista (el panel del encabezado se cierra solo).
  useEffect(() => {
    if (!abierta) return undefined;
    const afuera = (e) => {
      if (caja.current && !caja.current.contains(e.target)) setAbierta(false);
    };
    document.addEventListener('mousedown', afuera);
    return () => document.removeEventListener('mousedown', afuera);
  }, [abierta]);

  const resultados = datos?.resultados || [];
  const total = datos?.total || 0;
  const sugerencias = datos?.sugerencias || [];
  const hrefTodos = `/buscar?q=${encodeURIComponent(valor.trim())}`;
  // La última fila ("Ver todos los resultados") también se puede elegir con las flechas.
  const opciones = [...resultados.map((r) => r.href), hrefTodos];
  const hayLista = abierta && valor.trim().length >= MINIMO;

  function ir(href, e) {
    if (e && (e.metaKey || e.ctrlKey || e.button === 1)) {
      window.open(href, '_blank', 'noopener');
      return;
    }
    setAbierta(false);
    router.push(href);
  }

  function alTeclear(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!hayLista || !opciones.length) return;
      e.preventDefault();
      const n = opciones.length;
      setActivo((a) => {
        if (e.key === 'ArrowDown') return a + 1 >= n ? 0 : a + 1;
        return a - 1 < 0 ? n - 1 : a - 1;
      });
      return;
    }
    if (e.key === 'Enter') {
      if (hayLista && activo >= 0 && opciones[activo]) {
        e.preventDefault();
        ir(opciones[activo], e);
      }
      return; // si no hay opción elegida, el formulario se envía normalmente
    }
    if (e.key === 'Escape') {
      if (hayLista) {
        // Primera vez cierra las sugerencias; recién después el panel del encabezado.
        e.preventDefault();
        e.stopPropagation();
        setAbierta(false);
        setActivo(-1);
      } else if (onCerrar) {
        onCerrar();
      }
      return;
    }
    if (e.key === 'Home' || e.key === 'End') setActivo(-1);
  }

  const campoInput = (
    <>
      <input
        ref={campo}
        id={id}
        name="q"
        type="search"
        value={valor}
        onChange={(e) => {
          tecleado.current = true;
          setValor(e.target.value);
        }}
        onKeyDown={alTeclear}
        onFocus={() => {
          if (datos && valor.trim().length >= MINIMO) setAbierta(true);
        }}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={hayLista}
        aria-controls={listaId}
        aria-autocomplete="list"
        aria-activedescendant={hayLista && activo >= 0 ? opId(activo) : undefined}
      />
      <button type="submit" className={botonClase}>
        <Buscar /> <span>{botonTexto}</span>
      </button>
    </>
  );

  return (
    <div
      className="bsug"
      ref={caja}
      style={ancho ? { '--bsug-ancho': `${ancho}px` } : undefined}
      data-cargando={cargando ? '1' : undefined}
    >
      <form className={formClase} action="/buscar" method="get" role="search">
        {etiqueta ? (
          <label htmlFor={id} className={etiquetaClase} style={etiquetaOculta ? OCULTO : undefined}>
            {etiqueta}
          </label>
        ) : null}
        {filaClase ? <div className={filaClase}>{campoInput}</div> : campoInput}
      </form>

      {hayLista ? (
        <div className="bsug__panel">
          <ul className="bsug__lista" id={listaId} role="listbox" aria-label="Sugerencias del catálogo">
            {resultados.map((r, i) => (
              <li
                key={r.codigo}
                id={opId(i)}
                role="option"
                aria-selected={i === activo}
                className={`bsug__op${i === activo ? ' es-activa' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActivo(i)}
                onClick={(e) => ir(r.href, e)}
              >
                <span className="bsug__foto">
                  {r.foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.foto} alt="" width="44" height="44" loading="lazy" decoding="async" />
                  ) : (
                    <span className="bsug__sinfoto" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                        <circle cx="12" cy="12" r="8" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </span>
                  )}
                </span>
                <span className="bsug__txt">
                  <span className="bsug__codigo">{r.codigo}</span>
                  <span className="bsug__nombre">{r.nombre}</span>
                </span>
                {r.marca ? <span className="bsug__marca">{r.marca}</span> : null}
              </li>
            ))}

            {!resultados.length ? (
              <li className="bsug__nada" role="presentation">
                Sin resultados para <b>{valor.trim()}</b>.
                {sugerencias.length ? (
                  <span className="bsug__chips">
                    <span className="bsug__chips-t">Probá con:</span>
                    {sugerencias.map((s) => (
                      <a key={s.href} href={s.href} className="bsug__chip" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.preventDefault(); ir(s.href, e); }}>
                        {s.nombre}
                      </a>
                    ))}
                  </span>
                ) : null}
              </li>
            ) : null}

            <li
              id={opId(resultados.length)}
              role="option"
              aria-selected={activo === resultados.length}
              className={`bsug__op bsug__todos${activo === resultados.length ? ' es-activa' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActivo(resultados.length)}
              onClick={(e) => ir(hrefTodos, e)}
            >
              {total > resultados.length
                ? `Ver todos los resultados (${total.toLocaleString('es-AR')})`
                : total
                  ? 'Ver todos los resultados'
                  : 'Pedinos este repuesto'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </li>
          </ul>
        </div>
      ) : null}

      <span className="bsug__vivo" role="status" aria-live="polite">
        {hayLista ? `${total} ${total === 1 ? 'resultado' : 'resultados'} para ${valor.trim()}` : ''}
      </span>
    </div>
  );
}
