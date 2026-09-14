// Contenido de la web institucional (portada, nosotros, contacto, etc.).
// Editar acá para cambiar textos, links y PDFs. El catálogo vive en /productos.

const PDF = id => `https://www.logbelts.com/_files/ugd/8d7a71_${id}.pdf`;
export const img = nombre => `/img/8d7a71_${nombre}.webp`;

export const CATALOGO = '/productos';
const familia = slug => `/f/${slug}`;
export const CATALOGO_COMPLETO = PDF('15f724528a8f4742bcc477bbdaf4e634');

export const NAV = [
  { href: '/', label: 'Inicio' },
  { href: CATALOGO, label: 'Catálogo', destacado: true },
  { href: '/lanzamientos', label: 'Lanzamientos' },
  { href: '/tutoriales', label: 'Tutoriales' },
  { href: '/distribuidores', label: 'Portal Distribuidores' },
  { href: '/acerca-de', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
];

export const CONTACTO = {
  direccion: 'Marcelo T de Alvear 445 5B, CABA (CP1058)',
  telefono: '11 6114-2012',
  email: 'info@logbelts.com.ar',
  dias: 'Lunes a Viernes',
  horario: '8:00 a 17:00 hs',
  whatsapp: 'https://wa.me/5491161142012',
};

export const whatsappCon = texto => `${CONTACTO.whatsapp}?text=${encodeURIComponent(texto)}`;

export const PORTAL_DISTRIBUIDORES = 'http://logbelts.duckdns.org:81/b2b/#/login/';

// Portada: las 4 líneas principales. La cantidad de productos se toma del catálogo.
export const LINEAS = [
  { titulo: 'Motosierras', sub: 'Cadenas, espadas, bujías', slug: 'motosierras', img: img('3053a3dfe66042cfbf667dfdc2deb356') },
  { titulo: 'Minitractores', sub: 'Correas, cuchillas, poleas', slug: 'minitractores', img: img('c252b8689df74155b771ecb4ebf63341') },
  { titulo: 'Desmalezadoras', sub: 'Cabezales, bobinas, pistones', slug: 'desmalezadoras', img: img('0ea4dfdffc344ec98ded31acc7430d49') },
  { titulo: 'Motores 4T', sub: 'Filtros, válvulas, cilindros', slug: 'motores-4t-y-generadores', img: img('7aeb8e5ee0ff4436ace6992297fc62ba') },
].map(l => ({ ...l, href: familia(l.slug) }));

// Portada: grilla de categorías con foto
export const CATEGORIAS_HOME = [
  { titulo: 'Desmalezadoras', img: img('8fc5e178d29e4e4e8f912b2271169aa3'), href: familia('desmalezadoras') },
  { titulo: 'Minitractores', img: img('bd9502054f2246b8b862b55f0cfcebee'), href: familia('minitractores') },
  { titulo: 'Motosierras', img: img('f53ce12100794e5cb52362a02f0228dd'), href: familia('motosierras') },
  { titulo: 'Carburación', img: img('defc35805c9a40a5a5e3ec0edc6fdabe'), href: familia('carburacion') },
  { titulo: 'Sistemas de arranque', img: img('2ee278ec81b94044bf26e84cfbff1b23'), href: familia('sistemas-de-arranque') },
  { titulo: 'Juntas y encendido', img: img('08736441f3544a1e81e96c70d1c268cf'), href: familia('juntas-de-motor') },
  { titulo: 'Hidrolavadora y motobomba', img: img('f049f1598be54c9e97f178236de248e0'), href: familia('hidrolavadora-y-motobomba') },
  { titulo: 'Motores 4T y generadores', img: img('859b4b51d86043499a4486b99e2df350'), href: familia('motores-4t-y-generadores') },
];

// Catálogos en PDF (/descargas)
export const CATALOGOS_PDF = [
  { titulo: 'Minitractores', img: img('c252b8689df74155b771ecb4ebf63341'), href: familia('minitractores'), pdf: PDF('37c9005577af4a47bd7de1eb257ea28e') },
  { titulo: 'Desmalezadoras', img: img('2bd6d5b3abc648bf9ad91a67182f2b85'), href: familia('desmalezadoras'), pdf: PDF('5948d1f4c51e4f7585966ae35e7cf4a6') },
  { titulo: 'Motosierras', img: img('3053a3dfe66042cfbf667dfdc2deb356'), href: familia('motosierras'), pdf: PDF('3550dd2351644e07bed9564ce40a2c22') },
  { titulo: 'Carburación', img: img('c13d4c2a2daf4808bdaff4a36abbfe4c'), href: familia('carburacion'), pdf: PDF('0ad0e7410ea44ce39900a5d2ba530b8c') },
  { titulo: 'Sistemas de arranque', img: img('6d87302122824611a6687aecb3e71278'), href: familia('sistemas-de-arranque'), pdf: PDF('88d0ca9ab48b4b6ba8f2a23b81d5eac4') },
  { titulo: 'Juntas de motor y encendido', img: img('95dc783e26fa4bb197cf0669719b8164'), href: familia('juntas-de-motor'), pdf: PDF('453a4b8b0dc14a9bb7da82096f7b3987') },
  { titulo: 'Hidrolavadora y motobomba', img: img('f049f1598be54c9e97f178236de248e0'), href: familia('hidrolavadora-y-motobomba'), pdf: PDF('e528609dc758438db6f4315cfc5fe3bc') },
  { titulo: 'Motores 4T y generadores', img: img('5fb567e2862f4522bd302a8848fcb387'), href: familia('motores-4t-y-generadores'), pdf: PDF('420fe3641e124c49a4276e08726f2eda') },
  { titulo: 'Máquinas corta césped', img: img('16899f9d79d749028ce659748bbf4844'), href: familia('maquinas-de-cortar-cesped'), pdf: PDF('258d385fd2674a788fe1c75791500e3e') },
  { titulo: 'Repuestos universales', sub: 'Desmalezadoras y motosierras', img: img('8b15160aa85841398d74987250344eaa'), href: familia('repuestos-universales'), pdf: PDF('87a6e161807c4f12bec438a6f32ec182') },
];

export const TUTORIALES = [
  'Carburador a gas parte 1',
  'Carburador a gas parte 2',
  'Carburador a gas parte 3',
  'Cambio de bujia desmalezadora',
  'Cabezal automatico',
  'Tipos de tanza',
  'Tipos de cuchilla mini tractor',
  'Cuchilla vs tanza',
  'Proteccion',
  'Correcto uso de desmalezadora',
  'Cargar cabezal',
  'Guardado de desmalezadora',
  'Tipos de correas',
  '3 tips para tu motosierra',
];

// Condiciones comerciales (/distribuidores). Los puntos con texto null no se muestran:
// completar compra mínima, formas de pago y envíos con los datos reales.
export const CONDICIONES = [
  { titulo: 'Venta mayorista', texto: 'Vendemos exclusivamente a comercios, talleres y distribuidores.' },
  { titulo: 'Cómo se pide', texto: 'Por WhatsApp con tu vendedor, desde el catálogo online (lista de pedido o pedido rápido) o en el portal B2B.' },
  { titulo: 'Precios y disponibilidad', texto: 'Te los confirma tu vendedor en cada pedido.' },
  { titulo: 'Atención', texto: 'Lunes a viernes de 8 a 17 hs, por WhatsApp, teléfono o email.' },
  { titulo: 'Compra mínima', texto: null },
  { titulo: 'Formas de pago', texto: null },
  { titulo: 'Envíos', texto: null },
];

export const LANZAMIENTOS = [
  { titulo: 'Motor 4 tiempos', modelo: 'LB 170V' },
  { titulo: 'Sopladora', modelo: 'LB 260 S' },
];
