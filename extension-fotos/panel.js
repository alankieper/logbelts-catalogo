const SITIO = 'https://logbelts-web.vercel.app';
const MODOS = {
  web: {
    lista: 'lista.json',
    pref: '',
    carpeta: 'fotos-catalogo',
    orden: 'vistos',
    motivos: {
      sin_foto: 'Sin foto',
      muy_baja: 'Muy chica (menos de 200px)',
      baja: 'Chica (200 a 399px)',
      regular: 'Regular (400 a 599px)',
    },
  },
  fisico: {
    lista: 'lista-fisico.json',
    pref: 'f_',
    carpeta: 'fotos-catalogo-fisico',
    orden: 'peor',
    motivos: {
      falta: 'Falta foto (placeholder)',
      equivocada: 'Foto de otro producto',
      provisoria: 'Foto con marca de agua o logo',
      mejorar: 'Foto a mejorar (fondo, tamaño)',
    },
  },
};
const ETIQUETA = {
  sin_foto: 'Sin foto', muy_baja: 'Muy chica', baja: 'Chica', regular: 'Regular',
  falta: 'Falta foto', equivocada: 'Foto equivocada', provisoria: 'Foto provisoria', mejorar: 'Mejorar',
  manual: 'Elegido a mano', ok: 'Foto OK', excluido: 'Excluido',
};
const MAX_FILAS = 100;

const $ = (s) => document.querySelector(s);
let MODO = 'web';
let LISTA = [];
let E = { actual: null, hechos: {}, huellas: {}, extras: [], filtro: { m: 'todos', f: 'todas', o: 'vistos' } };
let OTROS_HECHOS = {};
let BASE = []; // lista del archivo (sin los elegidos a mano)
let CATALOGO = []; // todos los productos, para la lupa

const otroModo = () => (MODO === 'web' ? 'fisico' : 'web');
const clave = (k, modo = MODO) => MODOS[modo].pref + k;
const filtroDefecto = (modo = MODO) => ({ m: 'todos', f: 'todas', o: MODOS[modo].orden });

// ---------- orden y filtro (igual que en background.js) ----------
const SEVERIDAD = { manual: -1, sin_foto: 0, muy_baja: 1, baja: 2, regular: 3, falta: 0, equivocada: 1, provisoria: 2, mejorar: 3 };
const sev = (p) => SEVERIDAD[p.m] ?? 9;
function ordenar(l, o) {
  const c = l.slice();
  if (o === 'codigo') c.sort((a, b) => a.c.localeCompare(b.c));
  else if (o === 'peor') c.sort((a, b) => sev(a) - sev(b) || a.c.localeCompare(b.c));
  else c.sort((a, b) => (b.v || 0) - (a.v || 0) || sev(a) - sev(b) || a.c.localeCompare(b.c));
  return c;
}
// los elegidos a mano con la lupa se muestran siempre, sin importar el filtro
const coincide = (p, f) => p.m === 'manual' || ((f.m === 'todos' || p.m === f.m) && (f.f === 'todas' || p.f === f.f));
const conExtras = () => [...BASE, ...(E.extras || []).filter((x) => !BASE.some((b) => b.c === x.c))];
const filtrada = () => ordenar(LISTA.filter((p) => coincide(p, E.filtro)), E.filtro.o);
const num = (n) => n.toLocaleString('es-AR');

async function leerEstado(modo) {
  const r = await chrome.storage.local.get({
    [clave('actual', modo)]: null,
    [clave('hechos', modo)]: {},
    [clave('huellas', modo)]: {},
    [clave('filtro', modo)]: filtroDefecto(modo),
    [clave('extras', modo)]: [],
  });
  return {
    extras: r[clave('extras', modo)],
    actual: r[clave('actual', modo)],
    hechos: r[clave('hechos', modo)],
    huellas: r[clave('huellas', modo)],
    filtro: { ...filtroDefecto(modo), ...r[clave('filtro', modo)] },
  };
}

async function guardarEstado(cambios) {
  Object.assign(E, cambios);
  const obj = {};
  for (const [k, v] of Object.entries(cambios)) obj[clave(k)] = v;
  await chrome.storage.local.set(obj);
  render();
}

function siguientePendiente(desde) {
  const l = filtrada();
  const i = l.findIndex((p) => p.c === desde);
  for (let k = 1; k <= l.length; k++) {
    const p = l[(i + k) % l.length];
    if (!E.hechos[p.c]) return p.c;
  }
  return null;
}

function anterior(desde) {
  const l = filtrada();
  if (!l.length) return null;
  const i = l.findIndex((p) => p.c === desde);
  return l[(i - 1 + l.length) % l.length].c;
}

function fotoActualUrl(foto) {
  if (!foto) return null;
  return /^https?:\/\//.test(foto) ? foto : `${SITIO}/fotos/${foto}`;
}

// ---------- pestañas ----------
async function cargarModo(modo) {
  MODO = MODOS[modo] ? modo : 'web';
  try {
    BASE = await (await fetch(MODOS[MODO].lista)).json();
  } catch {
    BASE = [];
  }
  E = await leerEstado(MODO);
  LISTA = conExtras();
  OTROS_HECHOS = (await chrome.storage.local.get({ [clave('hechos', otroModo())]: {} }))[clave('hechos', otroModo())];

  document.querySelectorAll('[data-modo]').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.modo === MODO)));
  $('#carpeta').textContent = `Descargas\\${MODOS[MODO].carpeta}`;

  const motivos = MODOS[MODO].motivos;
  $('#f-motivo').replaceChildren(
    new Option(`Todos (${LISTA.length})`, 'todos'),
    ...Object.entries(motivos).map(([v, t]) => new Option(`${t} (${LISTA.filter((p) => p.m === v).length})`, v)),
  );
  const familias = [...new Set(LISTA.map((p) => p.f))].sort((a, b) => String(a).localeCompare(String(b), 'es'));
  $('#f-familia').replaceChildren(
    new Option('Todas', 'todas'),
    ...familias.map((f) => new Option(`${f} (${LISTA.filter((p) => p.f === f).length})`, f)),
  );
  if (!(E.filtro.m in motivos)) E.filtro.m = 'todos';
  if (!familias.includes(E.filtro.f)) E.filtro.f = 'todas';
  $('#f-motivo').value = E.filtro.m;
  $('#f-familia').value = E.filtro.f;
  $('#f-orden').value = E.filtro.o;
  $('#q').dataset.c = '';
  $('#miniatura').dataset.c = '';
  $('#buscar').value = '';

  const valido = LISTA.some((p) => p.c === E.actual && coincide(p, E.filtro));
  if (!valido) await guardarEstado({ filtro: E.filtro, actual: siguientePendiente(null) });
  else render();
  renderNube();
}

// ---------- dibujo ----------
function render() {
  const l = filtrada();
  const hechas = l.filter((p) => E.hechos[p.c]).length;
  $('#progreso-texto').textContent = LISTA.length
    ? `${num(hechas)} de ${num(l.length)} productos con foto nueva`
    : 'No encontré la lista de este catálogo. Pedile a Claude que la genere.';
  $('#barra').style.width = l.length ? `${(hechas / l.length) * 100}%` : '0';

  const p = LISTA.find((x) => x.c === E.actual && coincide(x, E.filtro));
  $('#tarjeta').hidden = !p;
  $('#vacio').hidden = !!p || !LISTA.length;

  if (p) {
    $('#codigo').textContent = p.c;
    $('#nombre').textContent = p.b;
    const fam = $('#familia');
    fam.textContent = [p.f, p.s].filter(Boolean).filter((x, i, a) => a.indexOf(x) === i).join(' · ');
    if (p.v) {
      const v = document.createElement('span');
      v.className = 'vistas';
      v.textContent = ` · ${p.v} ${p.v === 1 ? 'visita' : 'visitas'}`;
      fam.appendChild(v);
    }
    const hecho = E.hechos[p.c];
    const badge = $('#badge');
    badge.className = 'badge m-' + (hecho ? 'hecho' : p.m);
    badge.textContent = hecho ? 'Foto nueva guardada' : (ETIQUETA[p.m] || p.m) + (p.px ? ` · ${p.px}px` : '');

    const nota = $('#nota');
    const textoNota = [p.nota, p.pag ? `Dónde: ${p.pag}` : ''].filter(Boolean).join(' · ');
    nota.hidden = !textoNota;
    nota.textContent = textoNota;

    const otras = OTROS_HECHOS[p.c]?.fotos || [];
    const otra = $('#otra');
    otra.hidden = !otras.length;
    if (otras.length) {
      const destino = MODO === 'fisico' ? 'la página web' : 'el catálogo físico';
      otra.textContent = `Ya guardaste ${otras.length === 1 ? 'una foto' : otras.length + ' fotos'} de este código para ${destino}: ${otras.map((f) => f.archivo).join(', ')} (en Descargas\\${MODOS[otroModo()].carpeta}).`;
    }

    // En "Catálogo físico" no se muestra la foto de la web: confunde (el catálogo impreso no tiene esa foto).
    // Igual queda disponible para buscar con Google Lens.
    const mini = $('#miniatura');
    const fotoWeb = fotoActualUrl(p.foto);
    const src = MODO === 'web' ? fotoWeb : null;
    const lens = $('#btn-lens');
    lens.hidden = !fotoWeb;
    $('#btn-ia').textContent = fotoWeb ? 'Google Modo IA con la foto actual' : 'Google Modo IA';
    lens.textContent = MODO === 'web' ? 'Buscar con la foto actual (Google Lens)' : 'Buscar con la foto que tiene la página web (Google Lens)';
    if (mini.dataset.c !== MODO + p.c) {
      mini.dataset.c = MODO + p.c;
      mini.replaceChildren();
      if (src) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Foto actual en la página web';
        img.title = 'Foto actual en la página web';
        mini.appendChild(img);
      } else {
        const s = document.createElement('span');
        s.textContent = MODO === 'web' ? 'Sin foto' : 'Sin foto en el catálogo';
        mini.appendChild(s);
      }
    }

    const q = $('#q');
    if (q.dataset.c !== p.c) {
      q.dataset.c = p.c;
      q.value = p.b;
      const oem = p.o || [];
      $('#oem').hidden = !oem.length;
      $('#oem-botones').replaceChildren(
        ...oem.map((codigo) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.dataset.oem = codigo;
          b.textContent = `${codigo}${p.mk ? ' · ' + p.mk : ''}`;
          b.title = `Buscar "${codigo}" en Google Imágenes`;
          return b;
        }),
      );
    }

    const fotos = hecho?.fotos || [];
    $('#guardadas').hidden = !fotos.length;
    $('#guardadas-lista').replaceChildren(
      ...fotos.map((f) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = f.pagina || f.url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = f.archivo;
        li.append(a, ` · ${f.ancho ? `${f.ancho}×${f.alto}px` : 'medida desconocida'}`);
        return li;
      }),
    );
  }

  renderLista(l);
}

function renderLista(l) {
  const q = $('#buscar').value.trim().toLowerCase();
  const filas = q ? l.filter((p) => p.c.includes(q) || p.n.toLowerCase().includes(q) || p.b.toLowerCase().includes(q) || (p.o || []).some((o) => o.toLowerCase().includes(q))) : l;
  const ul = $('#lista');
  ul.replaceChildren(
    ...filas.slice(0, MAX_FILAS).map((p) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.c = p.c;
      if (p.c === E.actual) b.setAttribute('aria-current', 'true');
      const c = document.createElement('span');
      c.className = 'codigo';
      c.textContent = p.c;
      const n = document.createElement('span');
      n.className = 'n';
      n.textContent = p.b;
      n.title = p.nota ? `${p.n} · ${p.nota}` : p.n;
      const est = document.createElement('span');
      const hecho = !!E.hechos[p.c];
      est.className = 'badge m-' + (hecho ? 'hecho' : p.m);
      est.textContent = hecho ? 'Lista' : ETIQUETA[p.m] || p.m;
      b.append(c, n, est);
      li.appendChild(b);
      return li;
    }),
  );
  $('#lista-nota').textContent = filas.length > MAX_FILAS
    ? `Mostrando ${MAX_FILAS} de ${num(filas.length)}. Buscá por código o nombre para encontrar otros.`
    : filas.length ? '' : 'No hay productos que coincidan.';
}

function urlBusqueda(motor, q) {
  const e = encodeURIComponent(q);
  switch (motor) {
    case 'google': return `https://www.google.com/search?tbm=isch&tbs=isz:l&q=${e}`;
    case 'ml': return `https://listado.mercadolibre.com.ar/${encodeURIComponent(q.replace(/\s+/g, '-'))}`;
    case 'amazon': return `https://www.amazon.com/s?k=${e}`;
    case 'ia': return `https://www.google.com/search?udm=50&q=${e}`; // udm=50 = Modo IA de Google
    default: return `https://www.google.com/search?q=${e}`;
  }
}

async function abrir(url) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id && !/^chrome(-extension)?:/.test(tab.url || '')) chrome.tabs.update(tab.id, { url });
  else chrome.tabs.create({ url });
}

function csv(v) {
  const s = String(v ?? '');
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function exportar() {
  const porCodigo = new Map(LISTA.map((p) => [p.c, p]));
  const filas = [['codigo', 'nombre', 'familia', 'problema_anterior', 'nota', 'archivo', 'ancho', 'alto', 'url_imagen', 'pagina', 'fecha']];
  for (const [c, h] of Object.entries(E.hechos)) {
    const p = porCodigo.get(c) || {};
    for (const f of h.fotos) filas.push([c, p.n, p.f, ETIQUETA[p.m] || p.m, p.nota, f.archivo, f.ancho, f.alto, f.url, f.pagina, f.fecha]);
  }
  const texto = '﻿' + filas.map((r) => r.map(csv).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([texto], { type: 'text/csv;charset=utf-8' }));
  await chrome.downloads.download({ url, filename: `${MODOS[MODO].carpeta}/registro-fotos.csv`, conflictAction: 'overwrite', saveAs: false });
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// ---------- destino: subir a la web (logbelts-web) o descargar a la PC ----------
async function renderNube() {
  const { destino, nubeToken } = await chrome.storage.local.get({ destino: 'nube', nubeToken: null });
  const quiereNube = destino === 'nube';
  $('#nube').hidden = MODO !== 'web';
  $('#destino').value = destino;
  $('#nube-login').hidden = !quiereNube || !!nubeToken;
  $('#nube-estado').hidden = !quiereNube || !nubeToken;
  $('#carpeta').textContent =
    MODO === 'web' && quiereNube && nubeToken ? 'la bandeja "Fotos pendientes" del admin de la web' : `Descargas\\${MODOS[MODO].carpeta}`;
}

// ---------- lupa: buscar en todo el catálogo ----------
const normalizar = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function buscarEnCatalogo(texto) {
  const q = normalizar(texto).trim();
  if (!q) return [];
  const palabras = q.split(/\s+/);
  const enLista = new Map(LISTA.map((p) => [p.c, p]));
  // pendientes de la lista actual primero (pueden no estar en el catálogo web, ej. catálogo físico)
  const fuente = [...LISTA, ...CATALOGO.filter((p) => !enLista.has(p.c))];
  const res = [];
  for (const p of fuente) {
    const texto = normalizar(`${p.c} ${p.n} ${p.b}`);
    const porCodigo = p.c.startsWith(q);
    if (porCodigo || palabras.every((w) => texto.includes(w))) res.push({ p: enLista.get(p.c) || p, pendiente: enLista.has(p.c), porCodigo });
  }
  res.sort((a, b) => Number(b.porCodigo) - Number(a.porCodigo) || Number(b.pendiente) - Number(a.pendiente));
  return res.slice(0, 20);
}

function renderLupa() {
  const ul = $('#lupa-res');
  const texto = $('#lupa').value;
  if (!texto.trim()) {
    ul.hidden = true;
    return;
  }
  const res = buscarEnCatalogo(texto);
  ul.hidden = false;
  if (!res.length) {
    const li = document.createElement('li');
    li.className = 'vacia';
    li.textContent = 'No encontré ningún artículo con ese código o nombre.';
    ul.replaceChildren(li);
    return;
  }
  ul.replaceChildren(
    ...res.map(({ p, pendiente }) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.c = p.c;
      const c = document.createElement('span');
      c.className = 'codigo';
      c.textContent = p.c;
      const n = document.createElement('span');
      n.className = 'n';
      n.textContent = p.b;
      n.title = p.n;
      const est = document.createElement('span');
      const hecho = !!E.hechos[p.c];
      const m = hecho ? 'hecho' : p.m;
      est.className = 'badge m-' + m;
      est.textContent = hecho ? 'Lista' : (ETIQUETA[p.m] || p.m) + (!pendiente && p.m === 'ok' && p.px ? ` · ${p.px}px` : '');
      b.append(c, n, est);
      li.appendChild(b);
      return li;
    }),
  );
}

// Elegir un artículo de la lupa: si está en la lista va directo; si no, se agrega como "Elegido a mano".
async function elegir(codigo) {
  $('#lupa').value = '';
  $('#lupa-res').hidden = true;
  const enLista = LISTA.find((p) => p.c === codigo);
  if (enLista) {
    const filtro = coincide(enLista, E.filtro) ? E.filtro : { ...E.filtro, m: 'todos', f: 'todas' };
    if (filtro !== E.filtro) {
      $('#f-motivo').value = 'todos';
      $('#f-familia').value = 'todas';
    }
    await guardarEstado({ filtro, actual: codigo });
    return;
  }
  const p = CATALOGO.find((x) => x.c === codigo);
  if (!p) return;
  const extra = {
    c: p.c, n: p.n, b: p.b, f: p.f, s: p.s, foto: p.foto, px: p.px,
    m: 'manual', v: 0, o: [], mk: null,
    nota: `Elegido a mano con la lupa${p.m === 'ok' && p.px ? ` (hoy tiene foto de ${p.px}px)` : ''}.`,
  };
  const extras = [...(E.extras || []).filter((x) => x.c !== codigo), extra];
  E.extras = extras;
  LISTA = conExtras();
  await guardarEstado({ extras, actual: codigo });
}

// ---------- eventos ----------
async function init() {
  document.querySelectorAll('[data-modo]').forEach((t) =>
    t.addEventListener('click', async () => {
      if (t.dataset.modo === MODO) return;
      await chrome.storage.local.set({ modo: t.dataset.modo });
      await cargarModo(t.dataset.modo);
    }),
  );

  const cambiarFiltro = async () => {
    const filtro = { m: $('#f-motivo').value, f: $('#f-familia').value, o: $('#f-orden').value };
    E.filtro = filtro;
    const sigue = LISTA.some((p) => p.c === E.actual && coincide(p, filtro));
    await guardarEstado({ filtro, actual: sigue ? E.actual : siguientePendiente(null) });
  };
  $('#f-motivo').addEventListener('change', cambiarFiltro);
  $('#f-familia').addEventListener('change', cambiarFiltro);
  $('#f-orden').addEventListener('change', async () => {
    E.filtro = { ...E.filtro, o: $('#f-orden').value };
    await guardarEstado({ filtro: E.filtro, actual: siguientePendiente(null) });
  });

  document.querySelectorAll('[data-motor]').forEach((b) =>
    b.addEventListener('click', async () => {
      if (b.dataset.motor === 'ia') {
        const p = LISTA.find((x) => x.c === E.actual);
        const foto = fotoActualUrl(p?.foto);
        if (foto) {
          // Se abre Lens con la foto y content.js pasa esa búsqueda al Modo IA apenas carga.
          await chrome.storage.local.set({ iaConFoto: Date.now() });
          abrir(`https://lens.google.com/uploadbyurl?url=${encodeURIComponent(foto)}`);
        } else {
          const q = $('#q').value.trim();
          if (q) abrir(urlBusqueda('ia', q));
        }
        return;
      }
      if (b.dataset.motor === 'lens') {
        const p = LISTA.find((x) => x.c === E.actual);
        const foto = fotoActualUrl(p?.foto);
        if (foto) abrir(`https://lens.google.com/uploadbyurl?url=${encodeURIComponent(foto)}`);
        return;
      }
      const q = $('#q').value.trim();
      if (q) abrir(urlBusqueda(b.dataset.motor, q));
    }),
  );
  $('#oem-botones').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-oem]');
    if (b) abrir(urlBusqueda('google', `"${b.dataset.oem}"`));
  });
  $('#q').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) abrir(urlBusqueda('google', e.target.value.trim()));
  });

  $('#saltar').addEventListener('click', () => guardarEstado({ actual: siguientePendiente(E.actual) || E.actual }));
  $('#anterior').addEventListener('click', () => guardarEstado({ actual: anterior(E.actual) }));
  $('#lista').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-c]');
    if (b) guardarEstado({ actual: b.dataset.c });
  });
  $('#buscar').addEventListener('input', () => renderLista(filtrada()));

  $('#desmarcar').addEventListener('click', () => {
    const hechos = { ...E.hechos };
    delete hechos[E.actual];
    const huellas = Object.fromEntries(Object.entries(E.huellas).filter(([, c]) => c !== E.actual));
    guardarEstado({ hechos, huellas });
  });

  $('#exportar').addEventListener('click', exportar);

  let confirmar = null;
  $('#reiniciar').addEventListener('click', async (e) => {
    const b = e.currentTarget;
    if (!confirmar) {
      b.textContent = '¿Seguro? Clic de nuevo';
      confirmar = setTimeout(() => {
        b.textContent = 'Reiniciar progreso';
        confirmar = null;
      }, 4000);
      return;
    }
    clearTimeout(confirmar);
    confirmar = null;
    b.textContent = 'Reiniciar progreso';
    E.hechos = {};
    await guardarEstado({ hechos: {}, huellas: {}, actual: siguientePendiente(null) });
  });

  chrome.storage.onChanged.addListener((cambios, area) => {
    if (area !== 'local') return;
    if (cambios.modo?.newValue && cambios.modo.newValue !== MODO) {
      cargarModo(cambios.modo.newValue);
      return;
    }
    let cambio = false;
    for (const k of ['actual', 'hechos', 'huellas', 'filtro', 'extras']) {
      if (clave(k) in cambios) {
        const vacio = k === 'filtro' ? filtroDefecto() : k === 'actual' ? null : k === 'extras' ? [] : {};
        E[k] = cambios[clave(k)].newValue ?? vacio;
        if (k === 'extras') LISTA = conExtras();
        cambio = true;
      }
    }
    if (clave('hechos', otroModo()) in cambios) {
      OTROS_HECHOS = cambios[clave('hechos', otroModo())].newValue || {};
      cambio = true;
    }
    E.filtro = { ...filtroDefecto(), ...E.filtro };
    if (cambio) render();
  });

  // destino de las fotos
  $('#destino').addEventListener('change', async (e) => {
    await chrome.storage.local.set({ destino: e.target.value });
    renderNube();
  });
  const conectar = async () => {
    const pass = $('#nube-pass').value;
    if (!pass) return;
    $('#nube-msg').textContent = 'Conectando…';
    const r = await chrome.runtime.sendMessage({ tipo: 'conectar', password: pass });
    $('#nube-pass').value = '';
    $('#nube-msg').textContent = r?.ok ? '' : r?.error || 'No se pudo conectar.';
    renderNube();
  };
  $('#nube-entrar').addEventListener('click', conectar);
  $('#nube-pass').addEventListener('keydown', (e) => e.key === 'Enter' && conectar());
  $('#nube-salir').addEventListener('click', async () => {
    await chrome.storage.local.remove('nubeToken');
    renderNube();
  });
  chrome.storage.onChanged.addListener((cambios, area) => {
    if (area === 'local' && ('nubeToken' in cambios || 'destino' in cambios)) renderNube();
  });

  // ayuda "?"
  $('#btn-ayuda').addEventListener('click', (e) => {
    const abierta = e.currentTarget.getAttribute('aria-expanded') === 'true';
    e.currentTarget.setAttribute('aria-expanded', String(!abierta));
    $('#ayuda').hidden = abierta;
  });

  // lupa
  try {
    CATALOGO = await (await fetch('catalogo.json')).json();
  } catch {
    CATALOGO = [];
  }
  let tLupa = null;
  $('#lupa').addEventListener('input', () => {
    clearTimeout(tLupa);
    tLupa = setTimeout(renderLupa, 120);
  });
  $('#lupa').addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.target.value = '';
      $('#lupa-res').hidden = true;
    }
    if (e.key === 'Enter') {
      const primero = $('#lupa-res button[data-c]');
      if (primero) elegir(primero.dataset.c);
    }
  });
  $('#lupa-res').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-c]');
    if (b) elegir(b.dataset.c);
  });

  const { autoBusqueda } = await chrome.storage.local.get({ autoBusqueda: 'ia' });
  $('#auto-busqueda').value = autoBusqueda;
  $('#auto-busqueda').addEventListener('change', (e) => chrome.storage.local.set({ autoBusqueda: e.target.value }));

  const { modo } = await chrome.storage.local.get({ modo: 'web' });
  await cargarModo(modo);
}

init();
