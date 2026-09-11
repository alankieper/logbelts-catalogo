import AdminHeader from '../AdminHeader';
import { leerEventos, leerVisitas, leerUltimaActividadPorVisitante } from '../../../lib/eventos';
import { leerTodosRaw } from '../../../lib/catalogo';
import { leerVisitantes } from '../../../lib/visitantes';
import { gateClientesActivo } from '../../../lib/config';
import { vincularBusqueda } from '../productoActions';
import { cambiarGateClientes } from '../configActions';

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

/* ---- barras verticales (serie por día) ---- */
function BarrasDias({ dias, series }) {
  const W = 720, H = 190, padB = 22, padL = 6, padT = 8;
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
              const y = padT + (H - padT - padB) - acc - h;
              acc += h;
              return v ? <rect key={ser.key} x={bw * 0.15} y={y} width={bw * 0.7} height={h} fill={ser.color} rx="1.5" /> : null;
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

/* ---- barras horizontales (ranking) ---- */
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
          <span className="mrank-bar"><span style={{ width: `${(f.n / max) * 100}%`, background: color }} /></span>
          <span className="mrank-n">{fmt(f.n)}</span>
        </li>
      ))}
    </ul>
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

  const kpis = [
    { t: 'Personas que lo vieron', v: personas, s: `${fmt(visitas.length)} visitas (sesiones)` },
    { t: 'Búsquedas', v: busquedas.length, s: `${sinResultado.length} sin resultado (${busquedas.length ? Math.round((sinResultado.length / busquedas.length) * 100) : 0}%)` },
    { t: 'Consultas por WhatsApp', v: consultas.length, s: 'clics en “Consultar este producto”' },
    { t: 'Pedidos enviados', v: pedidos.length, s: pedidos.length ? `${itemsPorPedido} productos promedio` : 'lista enviada por WhatsApp' },
    { t: 'Productos vistos', v: vistas.length, s: `${new Set(vistas.map((e) => e.codigo)).size} productos distintos` },
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
                      <span className="mrank-bar"><span style={{ width: '100%', background: 'var(--warn)' }} /></span>
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
                <span className="mkpi-t">{k.t}</span>
                <span className="mkpi-v">{fmt(k.v)}</span>
                <span className="mkpi-s">{k.s}</span>
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
              <Ranking filas={porOrigen} color="var(--ok)" />
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
    </>
  );
}
