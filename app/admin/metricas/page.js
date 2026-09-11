import AdminHeader from '../AdminHeader';
import { leerEventos, leerVisitas, leerUltimaActividadPorVisitante } from '../../../lib/eventos';
import { leerTodosRaw } from '../../../lib/catalogo';
import { leerVisitantes } from '../../../lib/visitantes';
import { gateClientesActivo } from '../../../lib/config';
import { vincularBusqueda } from '../productoActions';
import { cambiarGateClientes } from '../configActions';
import { RUTA_ARGENTINA, RUTAS_DIVISIONES, MAPA_ANCHO, MAPA_ALTO, CIUDADES_AR, proyectar, normalizarCiudad } from './mapaArgentina';

/* ---- íconos chicos para las tarjetas de KPI ---- */
const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
const IconoPersona = () => (
  <svg viewBox="0 0 24 24" {...trazo} aria-hidden="true"><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" /></svg>
);
const IconoLupa = () => (
  <svg viewBox="0 0 24 24" {...trazo} aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
const IconoWhatsapp = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.7 1.5 5.3L2 22l4.8-1.5A10 10 0 0 0 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.9.9.9-2.8-.2-.3A8 8 0 1 1 12 20z" />
    <path d="M16.6 13.9c-.3-.1-1.5-.7-1.8-.8-.2-.1-.4-.1-.6.1-.2.3-.7.8-.8 1-.2.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.6-1.9-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-1 1-1 2.3s1 2.7 1.1 2.9c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3z" />
  </svg>
);
const IconoCaja = () => (
  <svg viewBox="0 0 24 24" {...trazo} aria-hidden="true"><path d="M3 8l9-5 9 5-9 5-9-5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></svg>
);

const PAISES = {
  AR: 'Argentina', UY: 'Uruguay', CL: 'Chile', BR: 'Brasil', PY: 'Paraguay', BO: 'Bolivia',
  PE: 'Perú', CO: 'Colombia', MX: 'México', EC: 'Ecuador', VE: 'Venezuela', US: 'Estados Unidos',
  ES: 'España', DE: 'Alemania', CN: 'China',
};
const nombrePais = (c) => (c ? PAISES[c] || c : 'Desconocido');

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const RANGOS = [
  { d: 7, label: '7 días' },
  { d: 30, label: '30 días' },
  { d: 90, label: '90 días' },
];

function fmt(n) {
  return (n || 0).toLocaleString('es-AR');
}
function diaISO(d) {
  return new Date(d).toISOString().slice(0, 10);
}
function etiquetaDia(iso) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

/* ---- barras verticales (serie por día), animadas: arrancan en 0 y crecen al cargar ---- */
function BarrasDias({ dias, series }) {
  const W = 720, H = 190, padB = 22, padL = 6, padT = 8;
  const base = padT + (H - padT - padB);
  const max = Math.max(1, ...dias.map((k) => series.reduce((s, ser) => s + (ser.data[k] || 0), 0)));
  const bw = (W - padL * 2) / dias.length;
  const paso = Math.ceil(dias.length / 12);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mchart" role="img" aria-label="Actividad por día">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={padL} x2={W - padL} y1={padT + (H - padT - padB) * (1 - f)} y2={padT + (H - padT - padB) * (1 - f)} className="grid" />
      ))}
      {dias.map((k, i) => {
        let acc = 0;
        return (
          <g key={k} transform={`translate(${padL + i * bw},0)`}>
            {series.map((ser) => {
              const v = ser.data[k] || 0;
              const h = ((H - padT - padB) * v) / max;
              const y = base - acc - h;
              acc += h;
              if (!v) return null;
              return (
                <rect
                  key={ser.key}
                  className="mbar"
                  data-final-h={h.toFixed(2)}
                  data-final-y={y.toFixed(2)}
                  x={bw * 0.15} y={base} width={bw * 0.7} height={0}
                  fill={ser.color} rx="1.5"
                >
                  <title>{`${ser.label}: ${v} · ${etiquetaDia(k)}`}</title>
                </rect>
              );
            })}
            {i % paso === 0 ? (
              <text x={bw / 2} y={H - 7} textAnchor="middle" className="axis">{etiquetaDia(k)}</text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

/* ---- barras horizontales (ranking), animadas: arrancan en 0 y crecen al cargar ---- */
function Ranking({ filas, color = 'var(--brand-ink)', href }) {
  const max = Math.max(1, ...filas.map((f) => f.n));
  if (!filas.length) return <p className="mut">Sin datos todavía.</p>;
  return (
    <ul className="mrank">
      {filas.map((f, i) => (
        <li key={f.k + i}>
          <span className="mrank-lbl">
            {href ? <a href={href(f)}>{f.label}</a> : f.label}
          </span>
          <span className="mrank-bar">
            <span className="bar-fill" data-final-w={((f.n / max) * 100).toFixed(1)} style={{ width: '0%', background: color }} />
          </span>
          <span className="mrank-n">{fmt(f.n)}</span>
        </li>
      ))}
    </ul>
  );
}

/* ---- gráfico de torta: mezcla de tipos de actividad, animado (crece el arco) ---- */
function Donut({ segmentos, size = 148, grosor = 20 }) {
  const total = segmentos.reduce((s, x) => s + x.v, 0);
  const r = (size - grosor) / 2;
  const c = 2 * Math.PI * r;
  if (!total) return <p className="mut">Sin datos todavía.</p>;
  let acc = 0;
  const arcos = segmentos.filter((s) => s.v > 0).map((s) => {
    const frac = s.v / total;
    const len = frac * c;
    const offset = -acc;
    acc += len;
    return { ...s, len, offset };
  });
  return (
    <div className="mdonut-row">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="mdonut-svg" role="img" aria-label="Mezcla de actividad">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={grosor} />
        {arcos.map((a) => (
          <circle
            key={a.label}
            className="mdonut-seg"
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={a.color} strokeWidth={grosor}
            strokeDasharray={`0 ${c.toFixed(2)}`}
            data-final-dash={`${a.len.toFixed(2)} ${(c - a.len).toFixed(2)}`}
            strokeDashoffset={a.offset.toFixed(2)}
          >
            <title>{`${a.label}: ${fmt(a.v)}`}</title>
          </circle>
        ))}
        <g className="mdonut-total">
          <text x={size / 2} y={size / 2 - 4} textAnchor="middle"><tspan className="n">{fmt(total)}</tspan></text>
          <text x={size / 2} y={size / 2 + 13} textAnchor="middle"><tspan className="l">eventos</tspan></text>
        </g>
      </svg>
      <ul className="mdonut-legend">
        {segmentos.map((s) => (
          <li key={s.label}><i style={{ background: s.color }} />{s.label}<b>{fmt(s.v)}</b></li>
        ))}
      </ul>
    </div>
  );
}

/* ---- mapa de Argentina con pines por ciudad, animado (crecen los pines) ---- */
function MapaArgentina({ ciudades }) {
  const pines = ciudades
    .map((c) => {
      const coords = CIUDADES_AR[normalizarCiudad(c.nombre)];
      if (!coords) return null;
      const [x, y] = proyectar(coords);
      return { ...c, x, y };
    })
    .filter(Boolean);
  const maxN = Math.max(1, ...pines.map((p) => p.n));
  if (!pines.length) return <p className="mut">Todavía no hay suficientes visitas de Argentina para ubicar en el mapa.</p>;
  return (
    <svg viewBox={`0 0 ${MAPA_ANCHO} ${MAPA_ALTO}`} width={MAPA_ANCHO} height={MAPA_ALTO} className="mmap-svg" role="img" aria-label="Mapa de Argentina con ciudades de origen">
      <defs>
        <clipPath id="mmap-recorte"><path d={RUTA_ARGENTINA} /></clipPath>
      </defs>
      <path d={RUTA_ARGENTINA} className="mmap-pais" />
      <g clipPath="url(#mmap-recorte)">
        {RUTAS_DIVISIONES.map((d, i) => <path key={i} d={d} className="mmap-division" />)}
      </g>
      {pines.map((p) => (
        <circle
          key={p.nombre}
          className="mmap-pin"
          cx={p.x} cy={p.y} r="0"
          data-final-r={Math.min(9, 3.5 + Math.sqrt(p.n / maxN) * 6).toFixed(1)}
        >
          <title>{`${p.nombre}: ${p.n}`}</title>
        </circle>
      ))}
    </svg>
  );
}

/* ---- rosa de los vientos: de dónde llegó la gente, en pétalos en vez de barras ---- */
function RosaVientos({ filas }) {
  const COLORES = ['var(--brand-ink)', 'var(--ok)', 'var(--warn)', 'var(--accent2)'];
  if (!filas.length) return <p className="mut">Sin datos todavía.</p>;
  const SZ = 190, cx = SZ / 2, cy = SZ / 2, R = 72;
  const maxN = Math.max(...filas.map((f) => f.n));
  const n = filas.length;
  const petalo = (r, a0, a1) => {
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const grande = a1 - a0 > Math.PI ? 1 : 0;
    return `M${cx.toFixed(1)},${cy.toFixed(1)} L${x0.toFixed(1)},${y0.toFixed(1)} A${r.toFixed(1)},${r.toFixed(1)} 0 ${grande} 1 ${x1.toFixed(1)},${y1.toFixed(1)} Z`;
  };
  return (
    <div className="mrose-row">
      <svg viewBox={`0 0 ${SZ} ${SZ}`} width={SZ} height={SZ} className="mrose-svg" role="img" aria-label="De dónde llegó la gente">
        <circle cx={cx} cy={cy} r={R} className="mrose-ring" />
        <circle cx={cx} cy={cy} r={R * 0.5} className="mrose-ring" />
        {filas.map((f, i) => {
          const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
          const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
          const rf = Math.max(10, R * Math.sqrt(f.n / maxN));
          return (
            <path
              key={f.k}
              className="mrose-petal"
              d={petalo(1, a0, a1)}
              data-final-d={petalo(rf, a0, a1)}
              fill={COLORES[i % COLORES.length]}
            >
              <title>{`${f.label}: ${fmt(f.n)}`}</title>
            </path>
          );
        })}
      </svg>
      <ul className="mdonut-legend">
        {filas.map((f, i) => (
          <li key={f.k}><i style={{ background: COLORES[i % COLORES.length] }} />{f.label}<b>{fmt(f.n)}</b></li>
        ))}
      </ul>
    </div>
  );
}

export default async function Metricas({ searchParams }) {
  const dias = RANGOS.some((r) => String(r.d) === searchParams?.d) ? Number(searchParams.d) : 30;
  const [eventos, visitas, productos, visitantes, gateActivo, ultimaActividad] = await Promise.all([
    leerEventos(dias), leerVisitas(dias), leerTodosRaw(), leerVisitantes(), gateClientesActivo(), leerUltimaActividadPorVisitante(),
  ]);
  const nombre = new Map(productos.map((p) => [p.codigo, p.nombre || p.clave_producto || p.codigo]));
  const errGate = searchParams?.errGate === '1';

  const por = (t) => eventos.filter((e) => e.tipo === t);
  const busquedas = por('busqueda');
  const consultas = por('consulta');
  const vistas = por('ver');
  const pedidos = por('lista_envio');
  const adds = por('lista_add');
  const sinResultado = busquedas.filter((e) => (e.n || 0) === 0);

  // serie por día
  const listaDias = [];
  for (let i = dias - 1; i >= 0; i--) listaDias.push(diaISO(Date.now() - i * 86400000));
  const cuenta = (arr) => {
    const m = {};
    for (const e of arr) { const k = diaISO(e.creado); m[k] = (m[k] || 0) + 1; }
    return m;
  };
  const series = [
    { key: 'busq', label: 'Búsquedas', color: 'var(--brand-ink)', data: cuenta(busquedas) },
    { key: 'cons', label: 'Consultas', color: 'var(--ok)', data: cuenta(consultas) },
    { key: 'ped', label: 'Pedidos', color: 'var(--warn)', data: cuenta(pedidos) },
  ];

  const rank = (arr, keyFn, labelFn, limit = 12) => {
    const m = new Map();
    for (const e of arr) {
      const k = keyFn(e);
      if (!k) continue;
      m.set(k, (m.get(k) || 0) + 1);
    }
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([k, n]) => ({ k, n, label: labelFn(k) }));
  };

  const topConsultados = rank([...consultas, ...adds], (e) => e.codigo, (c) => `${c} · ${nombre.get(c) || 'producto'}`);
  const topVistos = rank(vistas, (e) => e.codigo, (c) => `${c} · ${nombre.get(c) || 'producto'}`);
  const topBusquedas = rank(busquedas, (e) => (e.q || '').toLowerCase().trim(), (q) => q, 15);
  const topSinResultado = rank(sinResultado, (e) => (e.q || '').toLowerCase().trim(), (q) => q, 15);
  const itemsPorPedido = pedidos.length ? Math.round((pedidos.reduce((s, e) => s + (e.n || 0), 0) / pedidos.length) * 10) / 10 : 0;

  // ---- visitantes (login clientes: empresa/nombre + teléfono) ----
  const visitanteInfo = new Map(visitantes.map((v) => [v.id, v]));
  const topVisitantes = rank(
    eventos.filter((e) => e.visitante_id && visitanteInfo.has(e.visitante_id)),
    (e) => e.visitante_id,
    (id) => {
      const v = visitanteInfo.get(id);
      return `${v.empresa_nombre} · ${v.telefono}`;
    },
    15
  );

  // ---- alerta: clientes que dejaron de entrar (15+ días sin actividad) ----
  const UMBRAL_INACTIVO_DIAS = 15;
  const ahoraMs = Date.now();
  const inactivos = visitantes
    .map((v) => {
      const ultima = ultimaActividad.get(v.id);
      if (!ultima) return null;
      const diasSinEntrar = Math.floor((ahoraMs - new Date(ultima).getTime()) / 86400000);
      return diasSinEntrar >= UMBRAL_INACTIVO_DIAS ? { ...v, ultima, diasSinEntrar } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.diasSinEntrar - a.diasSinEntrar)
    .slice(0, 20);

  // ---- visitas ----
  const personas = new Set(visitas.map((v) => v.ip_hash).filter(Boolean)).size;
  const personasPorDia = {};
  for (const v of visitas) {
    const d = diaISO(v.creado);
    (personasPorDia[d] = personasPorDia[d] || new Set()).add(v.ip_hash || v.id);
  }
  const seriePersonas = [{ key: 'per', label: 'Personas', color: 'var(--brand-ink)', data: Object.fromEntries(Object.entries(personasPorDia).map(([d, s]) => [d, s.size])) }];
  const rankPersonas = (keyFn, labelFn, limit = 12) => {
    const m = new Map();
    for (const v of visitas) {
      const k = keyFn(v) ?? '—';
      if (!m.has(k)) m.set(k, new Set());
      m.get(k).add(v.ip_hash || v.id);
    }
    return [...m.entries()].map(([k, s]) => ({ k, n: s.size, label: labelFn(k) })).sort((a, b) => b.n - a.n).slice(0, limit);
  };
  const porPais = rankPersonas((v) => v.pais, (c) => nombrePais(c), 10);
  const porCiudad = rankPersonas((v) => (v.ciudad ? `${v.ciudad}${v.pais ? ', ' + v.pais : ''}` : null), (c) => (c === '—' ? 'Ciudad desconocida' : c), 12);
  const porOrigen = rankPersonas((v) => v.ref, (r) => (r === '—' ? 'Directo / guardado' : r), 12);

  // ---- ciudades de Argentina, para ubicar en el mapa ----
  const ciudadesArgMap = new Map();
  for (const v of visitas) {
    if (!v.ciudad || v.pais !== 'AR') continue;
    const key = normalizarCiudad(v.ciudad);
    if (!ciudadesArgMap.has(key)) ciudadesArgMap.set(key, { nombre: v.ciudad, ids: new Set() });
    ciudadesArgMap.get(key).ids.add(v.ip_hash || v.id);
  }
  const ciudadesMapa = [...ciudadesArgMap.values()].map((c) => ({ nombre: c.nombre, n: c.ids.size }));

  const kpis = [
    { t: 'Personas que lo vieron', v: personas, s: `${fmt(visitas.length)} visitas (sesiones)`, icon: <IconoPersona />, tono: 'brand' },
    { t: 'Búsquedas', v: busquedas.length, s: `${sinResultado.length} sin resultado (${busquedas.length ? Math.round((sinResultado.length / busquedas.length) * 100) : 0}%)`, icon: <IconoLupa />, tono: 'accent2' },
    { t: 'Consultas por WhatsApp', v: consultas.length, s: 'clics en “Consultar este producto”', icon: <IconoWhatsapp />, tono: 'wpp' },
    { t: 'Pedidos enviados', v: pedidos.length, s: pedidos.length ? `${itemsPorPedido} productos promedio` : 'lista enviada por WhatsApp', icon: <IconoCaja />, tono: 'warn' },
    { t: 'Productos vistos', v: vistas.length, s: `${new Set(vistas.map((e) => e.codigo)).size} productos distintos`, icon: '👀', tono: 'ojos' },
  ];

  const hayDatos = eventos.length > 0 || visitas.length > 0;

  return (
    <>
      <AdminHeader activo="metricas" />
      <main className="adm">
        <div className="wrap">
          <div className="mtop">
            <h1>Métricas</h1>
            <div className="mrange">
              {RANGOS.map((r) => (
                <a key={r.d} href={`/admin/metricas?d=${r.d}`} data-on={r.d === dias ? 'true' : undefined}>{r.label}</a>
              ))}
            </div>
          </div>

          <section className="mcard mgate">
            <div className="mgate-txt">
              <h2>Login clientes</h2>
              <p className="mut">
                {gateActivo
                  ? 'Prendido: para ver el catálogo hay que completar empresa/nombre y teléfono (una sola vez por navegador).'
                  : 'Apagado: cualquiera puede ver el catálogo sin completar nada.'}
                {' '}{fmt(visitantes.length)} clientes registrados hasta ahora.
              </p>
              {errGate ? <p className="acceso-err" style={{ margin: '6px 0 0' }}>No se pudo guardar el cambio, probá de nuevo.</p> : null}
            </div>
            <form action={cambiarGateClientes}>
              <input type="hidden" name="activo" value={gateActivo ? '0' : '1'} />
              <input type="hidden" name="d" value={String(dias)} />
              <button type="submit" className={gateActivo ? 'mgate-btn on' : 'mgate-btn'}>
                {gateActivo ? 'Apagar' : 'Prender'}
              </button>
            </form>
          </section>

          {inactivos.length ? (
            <section className="mcard mgate" style={{ borderColor: 'var(--warn)', alignItems: 'flex-start' }}>
              <div className="mgate-txt">
                <h2>⚠ Clientes que dejaron de entrar</h2>
                <p className="mut">Hace {UMBRAL_INACTIVO_DIAS} días o más que no tienen actividad. Puede ser buen momento para escribirles.</p>
                <ul className="mrank" style={{ marginTop: 10 }}>
                  {inactivos.map((v) => (
                    <li key={v.id}>
                      <span className="mrank-lbl"><a href={`/admin/visitantes/${v.id}`}>{v.empresa_nombre} · {v.telefono}</a></span>
                      <span className="mrank-bar"><span className="bar-fill" data-final-w="100" style={{ width: '0%', background: 'var(--warn)' }} /></span>
                      <span className="mrank-n">{v.diasSinEntrar}d</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}

          {!hayDatos ? (
            <div className="ok-msg" style={{ background: 'var(--surface-2)', color: 'var(--ink-soft)' }}>
              Todavía no hay eventos registrados en este rango. Se van acumulando a medida que la gente usa el catálogo
              (búsquedas, consultas y pedidos). Si recién aplicaste la migración, esperá a que entren las primeras visitas.
            </div>
          ) : null}

          <div className="mkpis">
            {kpis.map((k) => (
              <div className="mkpi" key={k.t}>
                <span className={`mkpi-ic mkpi-ic-${k.tono}`}>{k.icon}</span>
                <div className="mkpi-txt">
                  <span className="mkpi-t">{k.t}</span>
                  <span className="mkpi-v">{fmt(k.v)}</span>
                  <span className="mkpi-s">{k.s}</span>
                </div>
              </div>
            ))}
          </div>

          <section className="mcard">
            <h2>Personas por día</h2>
            <p className="mut">Cada persona (por IP) se cuenta una vez por día, aunque haya entrado varias veces.</p>
            <BarrasDias dias={listaDias} series={seriePersonas} />
          </section>

          <div className="mcols">
            <section className="mcard">
              <h2>Mezcla de actividad</h2>
              <p className="mut">De qué está hecho todo lo que pasó en este rango.</p>
              <Donut
                segmentos={[
                  { label: 'Búsquedas', v: busquedas.length, color: 'var(--brand-ink)' },
                  { label: 'Productos vistos', v: vistas.length, color: 'var(--ok)' },
                  { label: 'Consultas WhatsApp', v: consultas.length, color: 'var(--accent2)' },
                  { label: 'Pedidos enviados', v: pedidos.length, color: 'var(--warn)' },
                ]}
              />
            </section>
            <section className="mcard">
              <h2>Mapa de dónde entran</h2>
              <p className="mut">Ciudades de Argentina detectadas por IP, con más peso donde hay más visitas.</p>
              <MapaArgentina ciudades={ciudadesMapa} />
            </section>
          </div>

          <div className="mcols">
            <section className="mcard">
              <h2>Desde qué país</h2>
              <Ranking filas={porPais} />
            </section>
            <section className="mcard">
              <h2>Desde qué ciudad</h2>
              <Ranking filas={porCiudad} />
            </section>
            <section className="mcard">
              <h2>Cómo llegaron</h2>
              <p className="mut">Sitio de origen. “Directo / guardado” = escribieron la dirección o la tienen guardada.</p>
              <RosaVientos filas={porOrigen} />
            </section>
            <section className="mcard">
              <h2>Actividad por día</h2>
              <div className="mlegend">
                {series.map((s) => <span key={s.key}><i style={{ background: s.color }} />{s.label}</span>)}
              </div>
              <BarrasDias dias={listaDias} series={series} />
            </section>
          </div>

          <div className="mcols">
            <section className="mcard">
              <h2>Búsquedas sin resultado</h2>
              <p className="mut">Lo que la gente busca y no encuentra. Poné el código del producto al que corresponde y queda vinculado (la próxima vez lo va a encontrar).</p>
              {topSinResultado.length ? (
                <ul className="mvinc">
                  {topSinResultado.map((f) => (
                    <li key={f.k}>
                      <a className="mvinc-q" href={`/buscar?q=${encodeURIComponent(f.k)}`} target="_blank" rel="noreferrer">{f.label}</a>
                      <span className="mvinc-n">{fmt(f.n)}×</span>
                      <form action={vincularBusqueda} className="mvinc-f">
                        <input type="hidden" name="termino" value={f.k} />
                        <input type="hidden" name="d" value={String(dias)} />
                        <input name="codigo" placeholder="código" inputMode="numeric" />
                        <button type="submit">Vincular</button>
                      </form>
                    </li>
                  ))}
                </ul>
              ) : <p className="mut">Sin datos todavía.</p>}
            </section>

            <section className="mcard">
              <h2>Búsquedas más frecuentes</h2>
              <Ranking filas={topBusquedas} href={(f) => `/buscar?q=${encodeURIComponent(f.k)}`} />
            </section>

            <section className="mcard">
              <h2>Productos más consultados</h2>
              <p className="mut">Consultas por WhatsApp + agregados al pedido.</p>
              <Ranking filas={topConsultados} color="var(--ok)" href={(f) => `/admin/productos/${encodeURIComponent(f.k)}`} />
            </section>

            <section className="mcard">
              <h2>Productos más vistos</h2>
              <Ranking filas={topVistos} href={(f) => `/admin/productos/${encodeURIComponent(f.k)}`} />
            </section>

            <section className="mcard">
              <h2>Clientes más activos</h2>
              <p className="mut">Quién completó el acceso y qué tan activo estuvo en este rango. Hace clic para ver el detalle (qué buscó, qué vio).</p>
              <Ranking filas={topVisitantes} color="var(--ok)" href={(f) => `/admin/visitantes/${encodeURIComponent(f.k)}`} />
            </section>
          </div>

          <p className="mut" style={{ marginTop: 20 }}>
            Rango: últimos {dias} días · {fmt(visitas.length)} visitas · {fmt(eventos.length)} eventos.
            Las personas se cuentan por IP (la IP no se guarda, se guarda un código).
          </p>
        </div>
      </main>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){
            function activar(root){
              root.querySelectorAll('.bar-fill[data-final-w]').forEach(function(el,i){
                setTimeout(function(){ el.style.width = el.getAttribute('data-final-w') + '%'; }, 26 + i * 16);
              });
              root.querySelectorAll('rect.mbar[data-final-h]').forEach(function(el,i){
                setTimeout(function(){
                  el.setAttribute('height', el.getAttribute('data-final-h'));
                  el.setAttribute('y', el.getAttribute('data-final-y'));
                }, 26 + i * 4);
              });
              root.querySelectorAll('.mdonut-seg[data-final-dash]').forEach(function(el,i){
                setTimeout(function(){ el.setAttribute('stroke-dasharray', el.getAttribute('data-final-dash')); }, 156 + i * 182);
              });
              root.querySelectorAll('.mrose-petal[data-final-d]').forEach(function(el,i){
                setTimeout(function(){ el.setAttribute('d', el.getAttribute('data-final-d')); }, 26 + i * 117);
              });
              root.querySelectorAll('.mmap-pin[data-final-r]').forEach(function(el,i){
                setTimeout(function(){ el.setAttribute('r', el.getAttribute('data-final-r')); }, 104 + i * 91);
              });
            }
            function conectar(){
              var tarjetas = document.querySelectorAll('.mcard, .mgate');
              if (!('IntersectionObserver' in window)) { tarjetas.forEach(function(t){ activar(t); }); return; }
              var vistos = new WeakSet();
              var obs = new IntersectionObserver(function(entries){
                entries.forEach(function(entry){
                  if (entry.isIntersecting && !vistos.has(entry.target)) {
                    vistos.add(entry.target);
                    activar(entry.target);
                    obs.unobserve(entry.target);
                  }
                });
              }, { threshold: 0.15 });
              tarjetas.forEach(function(t){ obs.observe(t); });
            }
            if (document.readyState === 'complete') conectar();
            else window.addEventListener('load', conectar);
          })();`,
        }}
      />
    </>
  );
}
