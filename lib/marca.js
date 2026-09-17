/**
 * IDENTIDAD DEL CLIENTE Y MÓDULOS ACTIVOS.
 *
 * Este archivo es lo ÚNICO que hay que tocar para que el mismo sistema sirva a otro negocio
 * o a otro rubro (repuestos de auto, celulares, etc.). Ver PLANTILLA.md para el paso a paso.
 * El contenido editorial de la web (textos, PDFs, categorías) vive en lib/sitio.js.
 */

export const MARCA = {
  // --- Identidad ---
  nombre: 'Logbelts',
  rubro: 'Repuestos para bosque y jardín',
  descripcionCorta: 'Venta mayorista de repuestos para motosierras, desmalezadoras, minitractores y motores.',
  lema: 'Repuestos que marcan la diferencia',
  // Logos en public/ (el claro va sobre fondo oscuro)
  logoClaro: '/logo-blanco.png',
  logoOscuro: '/logo-azul.png',

  // --- Código propio del catálogo ---
  codigo: {
    etiqueta: 'Código Logbelts',   // se muestra en fichas, buscador y pedidos
    ejemplos: '5888 · Stihl MS 250 · Husqvarna 143R',
  },

  // --- Contacto ---
  contacto: {
    direccion: 'Marcelo T de Alvear 445 5B, CABA (CP1058)',
    telefono: '11 6114-2012',
    email: 'info@logbelts.com.ar',
    dias: 'Lunes a Viernes',
    horario: '8:00 a 17:00 hs',
    whatsapp: 'https://wa.me/5491161142012',
  },
  portalB2B: 'http://logbelts.duckdns.org:81/b2b/#/login/',

  // --- Cómo se llama lo que usa el repuesto (auto, equipo, máquina…) ---
  maquinas: {
    singular: 'máquina',
    plural: 'máquinas',
    etiquetaBusqueda: 'Buscá por máquina',
  },

  // --- Módulos que se prenden o apagan según el rubro ---
  modulos: {
    maquinas: true,        // compatibilidad por marca y modelo
    despiece: true,        // links al despiece del fabricante (propio de bosque y jardín)
    guias: true,           // guías técnicas (correas, espadas y cadenas, tanza)
    dibujos: true,         // ilustraciones de línea de las piezas
    piezas3d: true,        // visor 3D de la portada
    distribuidores: true,  // portal B2B y mapa "dónde comprar"
    material: true,        // material para el comercio (placas, logos)
    tutoriales: true,
    lanzamientos: true,
    pedidoRapido: true,    // pegar códigos o subir Excel
  },
};

/** Atajo: ¿está prendido este módulo? */
export const modulo = (nombre) => MARCA.modulos[nombre] !== false;

/** "Código Logbelts" -> "código Logbelts": para meter una etiqueta dentro de una frase. */
export const enFrase = (texto) => (texto ? texto.charAt(0).toLowerCase() + texto.slice(1) : '');

/** "Logbelts" -> "logbelts": para nombres de archivo que se descargan. */
export const slugMarca = () =>
  MARCA.nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
