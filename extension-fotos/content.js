// Alt + clic sobre cualquier foto de la página -> se guarda para el producto actual.
// Shift + Alt + clic -> la guarda aunque ya se haya usado para otro producto.
(() => {
  if (window.__lbFotos) return;
  window.__lbFotos = true;

  // "Google Modo IA con la foto actual": el panel abre Lens con la foto (Google la muestra como búsqueda udm=26)
  // y acá se pasa esa misma búsqueda al Modo IA (udm=50). Sólo si el pedido vino del panel en el último minuto.
  if (/(^|\.)google\.[a-z.]+$/.test(location.hostname) && location.pathname === '/search') {
    chrome.storage.local.get({ iaConFoto: 0 }).then(({ iaConFoto }) => {
      const url = new URL(location.href);
      if (!iaConFoto || Date.now() - iaConFoto > 60000 || url.searchParams.get('udm') !== '26') return;
      chrome.storage.local.set({ iaConFoto: 0 });
      const pestanaIA = document.querySelector('a[href*="udm=50"]');
      if (pestanaIA) {
        location.href = pestanaIA.href;
        return;
      }
      url.searchParams.set('udm', '50');
      location.replace(url.toString());
    });
  }

  const MARCA = '#2f52a8';
  const COLORES = { ok: '#067647', alerta: '#b54708', error: '#b42318', info: MARCA };
  const Z = '2147483647';

  // ---------- encontrar la foto bajo el mouse ----------
  const fondo = (el) => {
    const bg = getComputedStyle(el).backgroundImage;
    const m = bg && bg !== 'none' && bg.match(/url\(["']?(.+?)["']?\)/);
    return m ? m[1] : null;
  };

  function fotoEn(x, y) {
    for (const el of document.elementsFromPoint(x, y)) {
      if (el.id === 'lb-fotos-marco' || el.id === 'lb-fotos-aviso' || el.closest('#lb-fotos-marco')) continue;
      if (el.tagName === 'IMG') return el;
      if (el.tagName === 'PICTURE' && el.querySelector('img')) return el.querySelector('img');
      if (el.tagName === 'VIDEO' && el.poster) return el;
      if (fondo(el)) return el;
    }
    return null;
  }

  const abs = (u) => {
    try {
      return new URL(u, location.href).href;
    } catch {
      return null;
    }
  };

  async function aDataUrl(blobUrl) {
    try {
      const blob = await (await fetch(blobUrl)).blob();
      return await new Promise((ok) => {
        const r = new FileReader();
        r.onload = () => ok(r.result);
        r.onerror = () => ok(null);
        r.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  async function candidatos(el) {
    const c = [];
    if (el.tagName === 'IMG') {
      const link = el.closest('a[href]');
      if (link && /\.(jpe?g|png|webp|avif)(\?|$)/i.test(link.href)) c.push(link.href);
      c.push(el.getAttribute('data-old-hires')); // Amazon
      const dinamica = el.getAttribute('data-a-dynamic-image'); // Amazon
      if (dinamica) {
        try {
          Object.entries(JSON.parse(dinamica))
            .sort((a, b) => b[1][0] * b[1][1] - a[1][0] * a[1][1])
            .forEach(([u]) => c.push(u));
        } catch {}
      }
      for (const a of ['data-zoom', 'data-zoom-image', 'data-large', 'data-full', 'data-original', 'data-src', 'data-lazy-src']) {
        c.push(el.getAttribute(a));
      }
      const pic = el.closest('picture');
      const sets = [el.getAttribute('srcset'), el.getAttribute('data-srcset'), ...(pic ? [...pic.querySelectorAll('source')].map((s) => s.srcset) : [])];
      for (const s of sets.filter(Boolean)) {
        s.split(',')
          .map((x) => x.trim().split(/\s+/))
          .map(([u, d]) => [u, parseFloat(d) || 0])
          .sort((a, b) => b[1] - a[1])
          .forEach(([u]) => c.push(u));
      }
      c.push(el.currentSrc || el.src);
    } else if (el.tagName === 'VIDEO') {
      c.push(el.poster);
    } else {
      c.push(fondo(el));
    }

    const salida = [];
    for (const u of c.filter(Boolean)) {
      if (u.startsWith('blob:')) {
        const d = await aDataUrl(u);
        if (d) salida.push(d);
      } else {
        const a = abs(u);
        if (a) salida.push(a);
      }
    }
    return [...new Set(salida)];
  }

  // ---------- marco + medida sobre la foto mientras mantenés Alt ----------
  let marco = null;
  let etiqueta = null;
  let medido = null;
  let tMedir = null;

  function crearMarco() {
    marco = document.createElement('div');
    marco.id = 'lb-fotos-marco';
    Object.assign(marco.style, {
      position: 'fixed', pointerEvents: 'none', zIndex: Z, border: `3px solid ${MARCA}`,
      borderRadius: '4px', boxShadow: '0 0 0 9999px rgba(15,23,42,.18)', transition: 'left 80ms ease-out, top 80ms ease-out, width 80ms ease-out, height 80ms ease-out',
    });
    etiqueta = document.createElement('div');
    Object.assign(etiqueta.style, {
      position: 'absolute', left: '-3px', padding: '3px 8px', borderRadius: '4px', whiteSpace: 'nowrap',
      color: '#fff', font: '600 12px/1.3 system-ui, -apple-system, Segoe UI, sans-serif',
    });
    marco.appendChild(etiqueta);
    document.documentElement.appendChild(marco);
  }

  function ponerEtiqueta(texto, tipo) {
    etiqueta.textContent = texto;
    etiqueta.style.background = COLORES[tipo];
    marco.style.borderColor = COLORES[tipo];
  }

  function describir(r) {
    if (r === undefined) return ['Recargá la página (F5)', 'error'];
    if (!r) return ['No se puede bajar esta imagen', 'error'];
    const medida = r.ancho ? `${r.ancho}×${r.alto}px` : 'Medida desconocida';
    if (r.mismo) return [`${medida} · ya guardada para este producto`, 'info'];
    if (r.duplicado) return [`${medida} · ya usada para ${r.duplicado}`, 'alerta'];
    if (r.chica) return [`${medida} · chica`, 'alerta'];
    return [r.ancho ? `${medida} · buena` : medida, r.ancho ? 'ok' : 'info'];
  }

  function mostrarMarco(el) {
    if (!el) return ocultarMarco();
    if (!marco) crearMarco();
    const r = el.getBoundingClientRect();
    Object.assign(marco.style, { display: 'block', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    if (r.top < 30) {
      etiqueta.style.top = '4px';
      etiqueta.style.left = '4px';
    } else {
      etiqueta.style.top = '-27px';
      etiqueta.style.left = '-3px';
    }
    if (medido === el) return;
    medido = el;
    ponerEtiqueta('Midiendo…', 'info');
    clearTimeout(tMedir);
    tMedir = setTimeout(async () => {
      const cand = await candidatos(el);
      let r;
      try {
        r = await chrome.runtime.sendMessage({ tipo: 'medir', candidatos: cand });
      } catch {
        r = undefined;
      }
      if (medido === el) ponerEtiqueta(...describir(r));
    }, 180);
  }

  function ocultarMarco() {
    if (marco) marco.style.display = 'none';
    medido = null;
    clearTimeout(tMedir);
  }

  let pendiente = false;
  addEventListener('mousemove', (e) => {
    if (!e.altKey) return marco?.style.display === 'block' && ocultarMarco();
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => {
      pendiente = false;
      mostrarMarco(fotoEn(e.clientX, e.clientY));
    });
  }, { passive: true });
  addEventListener('keyup', (e) => e.key === 'Alt' && ocultarMarco());
  addEventListener('blur', ocultarMarco);
  addEventListener('scroll', ocultarMarco, { passive: true });

  // ---------- aviso en pantalla ----------
  let aviso = null;
  let timer = null;
  function avisar(titulo, detalle, tipo) {
    if (!aviso) {
      aviso = document.createElement('div');
      aviso.id = 'lb-fotos-aviso';
      aviso.setAttribute('role', 'status');
      Object.assign(aviso.style, {
        position: 'fixed', top: '16px', right: '16px', zIndex: Z, maxWidth: '340px', padding: '12px 14px',
        background: '#fff', color: '#101828', borderRadius: '10px', borderLeft: '5px solid',
        boxShadow: '0 10px 30px rgba(16,24,40,.22)', font: '14px/1.4 system-ui, -apple-system, Segoe UI, sans-serif',
      });
      document.documentElement.appendChild(aviso);
    }
    aviso.style.borderLeftColor = COLORES[tipo] || MARCA;
    aviso.replaceChildren();
    const t = document.createElement('div');
    t.textContent = titulo;
    t.style.fontWeight = '600';
    aviso.appendChild(t);
    if (detalle) {
      const d = document.createElement('div');
      d.textContent = detalle;
      d.style.cssText = 'margin-top:2px;color:#475467;font-size:13px';
      aviso.appendChild(d);
    }
    aviso.style.display = 'block';
    clearTimeout(timer);
    timer = setTimeout(() => (aviso.style.display = 'none'), tipo === 'info' ? 15000 : 5000);
  }

  function mostrarResultado(r) {
    if (!r) return avisar('No se pudo guardar', 'Recargá la página y probá de nuevo.', 'error');
    if (!r.ok) return avisar(r.duplicado ? 'Foto repetida' : 'No se pudo guardar', r.error, r.duplicado ? 'alerta' : 'error');
    const medida = r.ancho ? `${r.ancho}×${r.alto}px` : 'medida desconocida';
    if (r.chica) {
      return avisar(`Guardada ${r.archivo}, pero es chica (${medida})`, 'Sigo en este producto: si encontrás una mejor, Alt + clic de nuevo.', 'alerta');
    }
    const detalle = [
      r.avisoNube,
      r.siguiente ? `Siguiente: ${r.siguiente}${r.auto ? ' · abriendo la búsqueda…' : ''}` : 'No quedan productos pendientes con este filtro.',
    ]
      .filter(Boolean)
      .join(' · ');
    const titulo = r.nube ? `✓ Subida a la web para aprobar · ${medida}` : `✓ Guardada ${r.archivo} · ${medida}`;
    avisar(titulo, detalle, r.avisoNube ? 'alerta' : 'ok');
  }

  // ---------- Alt + clic ----------
  const conAlt = (e) => e.altKey && e.button === 0 && !e.ctrlKey && !e.metaKey;

  addEventListener('mousedown', (e) => {
    if (conAlt(e) && fotoEn(e.clientX, e.clientY)) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);

  addEventListener('click', async (e) => {
    if (!conAlt(e)) return;
    const el = fotoEn(e.clientX, e.clientY);
    if (!el) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    ocultarMarco();
    avisar('Guardando foto…', null, 'info');
    try {
      const r = await chrome.runtime.sendMessage({
        tipo: 'guardar',
        candidatos: await candidatos(el),
        pagina: location.href,
        forzar: e.shiftKey,
      });
      mostrarResultado(r);
    } catch {
      avisar('La extensión se actualizó', 'Recargá esta página (F5) y probá de nuevo.', 'error');
    }
  }, true);

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.tipo === 'resultado') mostrarResultado(msg.r);
  });
})();
