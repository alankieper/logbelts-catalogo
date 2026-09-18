// Guarda la foto elegida para el producto actual.
// Pestaña "Página web"      -> Descargas/fotos-catalogo/<codigo>.<ext>
// Pestaña "Catálogo físico" -> Descargas/fotos-catalogo-fisico/<codigo>.<ext>
const MIN_LADO_OK = 600;
const MODOS = {
  web: { lista: 'lista.json', carpeta: 'fotos-catalogo', pref: '', orden: 'vistos' },
  fisico: { lista: 'lista-fisico.json', carpeta: 'fotos-catalogo-fisico', pref: 'f_', orden: 'peor' },
};
const clave = (modo, k) => MODOS[modo].pref + k;
const filtroDefecto = (modo) => ({ m: 'todos', f: 'todas', o: MODOS[modo].orden });

const LISTAS = {};
async function lista(modo) {
  if (!LISTAS[modo]) {
    try {
      LISTAS[modo] = await (await fetch(chrome.runtime.getURL(MODOS[modo].lista))).json();
    } catch {
      LISTAS[modo] = [];
    }
  }
  // + los productos elegidos a mano con la lupa del panel
  const k = clave(modo, 'extras');
  const { [k]: extras } = await chrome.storage.local.get({ [k]: [] });
  const base = LISTAS[modo];
  return [...base, ...extras.filter((x) => !base.some((b) => b.c === x.c))];
}

async function estado() {
  const { modo: m } = await chrome.storage.local.get({ modo: 'web' });
  const modo = MODOS[m] ? m : 'web';
  const r = await chrome.storage.local.get({
    [clave(modo, 'actual')]: null,
    [clave(modo, 'hechos')]: {},
    [clave(modo, 'huellas')]: {},
    [clave(modo, 'filtro')]: filtroDefecto(modo),
  });
  return {
    modo,
    actual: r[clave(modo, 'actual')],
    hechos: r[clave(modo, 'hechos')],
    huellas: r[clave(modo, 'huellas')],
    filtro: { ...filtroDefecto(modo), ...r[clave(modo, 'filtro')] },
  };
}

function configurar() {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
}
chrome.runtime.onInstalled.addListener(() => {
  configurar();
  chrome.contextMenus.removeAll(() =>
    chrome.contextMenus.create({
      id: 'guardar-foto',
      title: 'Guardar foto para el producto actual',
      contexts: ['image'],
    }),
  );
});
chrome.runtime.onStartup.addListener(configurar);

// ---------- orden y filtro (igual que en panel.js) ----------
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

function siguientePendiente(todos, desde, hechos, filtro) {
  const l = ordenar(todos.filter((p) => coincide(p, filtro)), filtro.o);
  const i = l.findIndex((p) => p.c === desde);
  for (let k = 1; k <= l.length; k++) {
    const p = l[(i + k) % l.length];
    if (!hechos[p.c]) return p;
  }
  return null;
}

// ---------- bajar y medir imágenes ----------
// Versiones en tamaño original de URLs conocidas (Amazon, Mercado Libre, WordPress, Shopify).
function variantes(url) {
  const v = [];
  if (/media-amazon\.com|ssl-images-amazon\.com/.test(url)) v.push(url.replace(/\._[^/]+?_\.(jpe?g|png|webp)/i, '.$1'));
  if (/mlstatic\.com/.test(url)) v.push(url.replace(/-[A-Z]\.(jpe?g|png|webp)(\?.*)?$/i, '-F.$1'));
  v.push(url.replace(/-\d{2,4}x\d{2,4}(\.(jpe?g|png|webp))(\?.*)?$/i, '$1'));
  v.push(url.replace(/_\d{2,4}x\d{0,4}(\.(jpe?g|png|webp))/i, '$1'));
  v.push(url);
  return v;
}

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'image/gif': 'gif' };
function extDe(tipo, url) {
  if (EXT[tipo]) return EXT[tipo];
  const m = url.match(/\.(jpe?g|png|webp|avif|gif)(\?|#|$)/i);
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'jpg';
}

async function probarSinCache(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const tipo = (res.headers.get('content-type') || blob.type || '').split(';')[0].trim();
    if (!tipo.startsWith('image/') || blob.size < 1500) return null;
    let ancho = 0;
    let alto = 0;
    try {
      const bmp = await createImageBitmap(blob);
      ancho = bmp.width;
      alto = bmp.height;
      bmp.close();
    } catch {}
    const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
    const huella = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
    return { url, ext: extDe(tipo, url), ancho, alto, bytes: blob.size, huella };
  } catch {
    return null;
  }
}

const CACHE = new Map();
async function probar(url) {
  if (CACHE.has(url)) return CACHE.get(url);
  const r = await probarSinCache(url);
  CACHE.set(url, r);
  if (CACHE.size > 300) CACHE.delete(CACHE.keys().next().value);
  return r;
}

async function mejorDe(candidatos) {
  const urls = [...new Set((candidatos || []).filter(Boolean).flatMap(variantes))].slice(0, 8);
  const ok = (await Promise.all(urls.map(probar))).filter(Boolean);
  if (!ok.length) return null;
  return ok.sort((a, b) => b.ancho * b.alto - a.ancho * a.alto || b.bytes - a.bytes)[0];
}

const esChica = (m) => {
  const lado = Math.max(m.ancho, m.alto);
  return lado > 0 && lado < MIN_LADO_OK;
};

// ---------- búsqueda automática del siguiente producto ----------
const SITIO = 'https://logbelts-web.vercel.app';
const fotoUrl = (foto) => (!foto ? null : /^https?:\/\//.test(foto) ? foto : `${SITIO}/fotos/${foto}`);

// ---------- subir a la web (bandeja "Fotos pendientes" del admin de logbelts-web) ----------
// Deja la foto como la deja el importador: cuadrada (máx. 1000px), fondo blanco, centrada con margen, JPG.
async function procesarFoto(url) {
  const blob = await (await fetch(url)).blob();
  const bmp = await createImageBitmap(blob);
  const mayor = Math.max(bmp.width, bmp.height);
  const lado = Math.min(1000, Math.round(mayor / 0.88));
  const escala = Math.min(1, (lado * 0.88) / mayor);
  const w = Math.round(bmp.width * escala);
  const h = Math.round(bmp.height * escala);
  const lienzo = new OffscreenCanvas(lado, lado);
  const ctx = lienzo.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, lado, lado);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bmp, Math.round((lado - w) / 2), Math.round((lado - h) / 2), w, h);
  bmp.close();
  return { blob: await lienzo.convertToBlob({ type: 'image/jpeg', quality: 0.88 }), lado };
}

async function subirALaWeb(urlFoto, codigo, pagina, token) {
  try {
    const { blob, lado } = await procesarFoto(urlFoto);
    const fd = new FormData();
    fd.set('foto', blob, `${codigo}.jpg`);
    fd.set('codigo', codigo);
    fd.set('origen', urlFoto.startsWith('data:') ? '' : urlFoto);
    fd.set('pagina', pagina || '');
    fd.set('lado', String(lado));
    const res = await fetch(`${SITIO}/api/extension/fotos`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    const j = await res.json().catch(() => ({}));
    if (res.status === 401) {
      await chrome.storage.local.remove('nubeToken');
      return { ok: false, error: 'La conexión con la web venció. Conectala de nuevo en el panel (Destino de las fotos).' };
    }
    if (!res.ok || !j.ok) return { ok: false, error: j.error || `La web respondió con error ${res.status}.` };
    return { ok: true, nombre: j.nombre, lado };
  } catch (err) {
    return { ok: false, error: 'No se pudo subir a la web: ' + err.message };
  }
}

async function conectarWeb(password) {
  try {
    const res = await fetch(`${SITIO}/api/extension/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j.token) return { ok: false, error: j.error || `La web respondió con error ${res.status}.` };
    await chrome.storage.local.set({ nubeToken: j.token });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: 'No me pude conectar con la web: ' + err.message };
  }
}

// igual que urlBusqueda() de panel.js
function urlBusqueda(motor, q) {
  const e = encodeURIComponent(q);
  switch (motor) {
    case 'google': return `https://www.google.com/search?tbm=isch&tbs=isz:l&q=${e}`;
    case 'ml': return `https://listado.mercadolibre.com.ar/${encodeURIComponent(q.replace(/\s+/g, '-'))}`;
    case 'amazon': return `https://www.amazon.com/s?k=${e}`;
    case 'ia': return `https://www.google.com/search?udm=50&q=${e}`;
    default: return `https://www.google.com/search?q=${e}`;
  }
}

// Después de guardar, abre la búsqueda del siguiente producto en la misma pestaña.
// Modo IA con foto: se abre Lens con la foto y content.js la pasa al Modo IA.
async function buscarSiguiente(tabId, prod, motor) {
  if (!tabId || !prod || motor === 'no') return;
  const foto = fotoUrl(prod.foto);
  let url;
  if (motor === 'ia' && foto) {
    await chrome.storage.local.set({ iaConFoto: Date.now() });
    url = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(foto)}`;
  } else {
    url = urlBusqueda(motor, prod.b);
  }
  // un momento para que se vea el aviso de "Guardada" antes de cambiar de página
  setTimeout(() => chrome.tabs.update(tabId, { url }).catch(() => {}), 1500);
}

// ---------- acciones ----------
async function medir(candidatos) {
  const [e, m] = await Promise.all([estado(), mejorDe(candidatos)]);
  if (!m) return null;
  const usado = e.huellas[m.huella] || null;
  return {
    ancho: m.ancho,
    alto: m.alto,
    chica: esChica(m),
    duplicado: usado && usado !== e.actual ? usado : null,
    mismo: usado === e.actual,
  };
}

async function guardar(candidatos, pagina, forzar, tabId) {
  const e = await estado();
  const todos = await lista(e.modo);
  const prod = todos.find((p) => p.c === e.actual);
  if (!prod) return { ok: false, error: 'Abrí el panel y elegí un producto antes de guardar.' };

  const mejor = await mejorDe(candidatos);
  if (!mejor) return { ok: false, error: 'No pude bajar esa imagen. Abrila más grande y probá de nuevo.' };

  const usado = e.huellas[mejor.huella];
  if (usado === prod.c) return { ok: false, error: 'Esa foto ya está guardada para este producto.' };
  if (usado && !forzar) {
    const otro = todos.find((p) => p.c === usado);
    return {
      ok: false,
      duplicado: true,
      error: `Ya la guardaste para ${usado}${otro ? ' · ' + otro.b : ''}. Si igual la querés, Shift + Alt + clic.`,
    };
  }

  const carpeta = MODOS[e.modo].carpeta;
  const previas = e.hechos[prod.c]?.fotos || [];
  let archivo = `${prod.c}${previas.length ? '-' + (previas.length + 1) : ''}.${mejor.ext}`;
  let destinoTexto = `${carpeta}/${archivo}`;
  let nube = false;
  let avisoNube = null;
  // Pestaña "Página web": por defecto sube a la bandeja de aprobación de logbelts-web.
  const { destino, nubeToken } = await chrome.storage.local.get({ destino: 'nube', nubeToken: null });
  if (e.modo === 'web' && destino === 'nube' && nubeToken) {
    const r = await subirALaWeb(mejor.url, prod.c, pagina, nubeToken);
    if (!r.ok) return { ok: false, error: r.error };
    archivo = r.nombre;
    destinoTexto = 'la web (pendiente de aprobar)';
    nube = true;
  } else {
    if (e.modo === 'web' && destino === 'nube') avisoNube = 'No estás conectado a la web: la guardé en la PC.';
    try {
      await chrome.downloads.download({
        url: mejor.url,
        filename: `${carpeta}/${archivo}`,
        conflictAction: 'overwrite',
        saveAs: false,
      });
    } catch (err) {
      return { ok: false, error: 'Chrome no pudo guardar el archivo: ' + err.message };
    }
  }

  const chica = esChica(mejor);
  const foto = { archivo, url: mejor.url, pagina, ancho: mejor.ancho, alto: mejor.alto, huella: mejor.huella, fecha: new Date().toISOString() };
  const hechos = { ...e.hechos, [prod.c]: { fotos: [...previas, foto] } };
  const huellas = { ...e.huellas, [mejor.huella]: prod.c };
  // Si la foto es chica no avanzamos: así podés buscar una mejor para el mismo producto.
  const sig = chica ? prod : siguientePendiente(todos, prod.c, hechos, e.filtro);
  await chrome.storage.local.set({
    [clave(e.modo, 'hechos')]: hechos,
    [clave(e.modo, 'huellas')]: huellas,
    [clave(e.modo, 'actual')]: sig ? sig.c : prod.c,
  });

  const { autoBusqueda } = await chrome.storage.local.get({ autoBusqueda: 'ia' });
  const auto = !chica && sig && sig.c !== prod.c && autoBusqueda !== 'no';
  if (auto) buscarSiguiente(tabId, sig, autoBusqueda);

  return {
    ok: true,
    auto,
    modo: e.modo,
    codigo: prod.c,
    nombre: prod.b,
    archivo: destinoTexto,
    nube,
    avisoNube,
    ancho: mejor.ancho,
    alto: mejor.alto,
    chica,
    siguiente: chica ? null : sig?.b || null,
  };
}

chrome.runtime.onMessage.addListener((msg, sender, responder) => {
  if (msg?.tipo === 'guardar') {
    guardar(msg.candidatos, msg.pagina, !!msg.forzar, sender.tab?.id).then(responder);
    return true;
  }
  if (msg?.tipo === 'medir') {
    medir(msg.candidatos).then(responder);
    return true;
  }
  if (msg?.tipo === 'conectar') {
    conectarWeb(msg.password).then(responder);
    return true;
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'guardar-foto' || !tab?.id) return;
  const r = await guardar([info.srcUrl], info.pageUrl, true, tab.id);
  chrome.tabs.sendMessage(tab.id, { tipo: 'resultado', r }).catch(() => {});
});
