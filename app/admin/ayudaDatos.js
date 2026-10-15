/**
 * Textos de ayuda de cada pantalla del panel ("¿Cómo se usa?"), escritos en palabras simples.
 * La clave es la misma de menuDatos.js; hay claves extra para las pantallas internas
 * (producto nuevo, editar producto, ficha de cliente). Para cambiar un texto, editar acá.
 */
export const AYUDA = {
  home: {
    titulo: 'Inicio',
    para: 'Es tu página de inicio. Te muestra qué hay para hacer hoy y cómo viene el catálogo.',
    pasos: [
      'Mirá las tarjetas de arriba: las que tienen un número son cosas pendientes.',
      'Tocá una tarjeta y vas directo a resolverla.',
      'Si todas tienen el ✓ verde, hoy no hay nada urgente.',
    ],
    cuidado: 'Los números se actualizan solos cada vez que entrás a esta pantalla.',
  },
  contactos: {
    titulo: 'Consultas de clientes',
    para: 'Acá llegan los mensajes de los clientes que escribieron desde la web.',
    pasos: [
      'Las consultas nuevas aparecen primero, con el estado "Nuevo".',
      'Llamá o escribile al cliente por WhatsApp.',
      'Cambiá el estado a "Contactado", "Cliente" o "Descartado" para no perder el hilo.',
    ],
    cuidado: 'Cada consulta se le asigna sola al vendedor de la provincia del cliente.',
  },
  vendedores: {
    titulo: 'Vendedores',
    para: 'Las personas que atienden a los clientes.',
    pasos: [
      'Agregá a cada vendedor con su nombre y teléfono.',
      'Marcá en qué provincias atiende: así le llegan las consultas de esa zona.',
      'Si alguien ya no atiende, desactivalo en vez de borrarlo.',
    ],
  },
  distribuidores: {
    titulo: 'Distribuidores',
    para: 'Los negocios que aparecen en "Dónde comprar" de la web.',
    pasos: [
      'Agregá el nombre, la dirección y el teléfono del negocio.',
      'Dejalo marcado como público para que se vea en la web.',
      'Ordenalos por provincia para que los clientes encuentren el más cercano.',
    ],
  },
  metricas: {
    titulo: 'Métricas',
    para: 'Cuánta gente entra al catálogo, qué busca y qué productos mira más.',
    pasos: [
      'Elegí el período arriba (por ejemplo, últimos 30 días).',
      'Mirá las búsquedas sin resultado: son repuestos que piden los clientes y no encuentran.',
      'Tocá un cliente de la lista para ver qué buscó y qué miró.',
    ],
    cuidado: 'Conviene darle una mirada una vez por semana para ver qué se pide más.',
  },
  productos: {
    titulo: 'Productos',
    para: 'La lista de todos los repuestos del catálogo.',
    pasos: [
      'Buscá un repuesto por código, nombre o marca con el cuadro de arriba.',
      'Usá los filtros rápidos: "Sin foto", "A confirmar" u "Ocultos".',
      'Tocá un producto para cambiar su nombre, foto o descripción.',
      'Con "+ Agregar" cargás un repuesto nuevo.',
    ],
    cuidado: 'Un producto "oculto" no se ve en el catálogo, pero no se borra.',
  },
  'productos-nuevo': {
    titulo: 'Agregar un producto',
    para: 'Para cargar un repuesto nuevo en el catálogo.',
    pasos: [
      'Poné el código Logbelts. Si no sabés cuál, armalo con el generador de abajo.',
      'Completá el nombre y elegí la familia.',
      'Guardá. Después, desde la ficha del producto, subí la foto.',
    ],
    cuidado: 'El código no se puede repetir: el sistema avisa si ya existe.',
  },
  'producto-editar': {
    titulo: 'Editar un producto',
    para: 'Acá cambiás los datos de un repuesto.',
    pasos: [
      'Cambiá lo que necesites: nombre, descripción, familia, códigos originales.',
      'Subí o quitá fotos en la parte de fotos.',
      'Tocá "Guardar" al final de cada bloque para que se aplique.',
    ],
    cuidado: 'El lápiz junto al código permite cambiarlo. Hacelo con cuidado: es el número que usan los clientes para pedir.',
  },
  fotos: {
    titulo: 'Fotos pendientes',
    para: 'Fotos que mandó la extensión de Chrome "Logbelts · Fotos del catálogo" y esperan tu aprobación.',
    pasos: [
      'Mirá la foto junto al producto al que corresponde.',
      'Si está bien, tocá "Aprobar": la foto nueva reemplaza a la actual y se ve en la web.',
      'Si no sirve (borrosa, equivocada), tocá "Rechazar".',
    ],
    cuidado: 'Mientras no la apruebes, el producto sigue con la foto de antes.',
  },
  codigos: {
    titulo: 'Códigos Logbelts',
    para: 'Explica cómo se arman los códigos de 7 números de Logbelts.',
    pasos: [
      'El primer número indica el rubro; los siguientes, el subrubro, el producto y el ítem.',
      'Usá el explorador para ver ejemplos y qué significa cada parte.',
      'Al agregar un producto nuevo, el generador te propone el próximo código libre.',
    ],
  },
  oem: {
    titulo: 'Códigos originales',
    para: 'Los códigos de fábrica (OEM) de cada repuesto. Sirven para que un cliente que busca por el código de la marca encuentre tu repuesto.',
    pasos: [
      'Buscá el producto.',
      'Agregá el código original; si son varios, separalos con coma.',
      'Guardá. Desde ese momento el repuesto aparece al buscar ese código.',
    ],
  },
  categorias: {
    titulo: 'Categorías',
    para: 'Cómo se agrupan los productos (familia y subcategoría).',
    pasos: [
      'Para cambiar un nombre, escribí el nuevo y guardá.',
      'Para mover una subcategoría a otra familia, elegí la familia nueva.',
      'Los cambios se ven enseguida en el catálogo.',
    ],
    cuidado: 'Cambiar el nombre de una familia cambia el de todos sus productos juntos.',
  },
  temporada: {
    titulo: 'Temporada',
    para: 'Elegís qué productos se destacan según la época del año (césped o poda).',
    pasos: [
      'Dejalo en "Automático" y cambia solo según la fecha, o elegí una temporada a mano.',
      'Tocá "Guardar" para aplicar el cambio.',
    ],
    cuidado: 'No se borra ningún producto: solo cambia cuáles aparecen primero.',
  },
  material: {
    titulo: 'Material para distribuidores',
    para: 'Imágenes que se usan para armar placas para los distribuidores.',
    pasos: [
      'Subí las imágenes con el botón de subir.',
      'Ordenalas con las flechas y escribile un nombre a cada una.',
      'Tocá "Guardar" para que queden disponibles.',
    ],
  },
  manuales: {
    titulo: 'Manuales y despieces',
    para: 'Los manuales y despieces que se muestran en cada máquina.',
    pasos: [
      'Buscá la máquina.',
      'Agregá o corregí el enlace del manual o del despiece.',
      'Guardá para que se vea en el catálogo.',
    ],
  },
  excel: {
    titulo: 'Carga masiva (Excel)',
    para: 'Para corregir o cargar muchos productos juntos usando una planilla.',
    pasos: [
      'Bajá el Excel con los productos actuales.',
      'Editalo en tu computadora. No cambies la columna del código.',
      'Subilo de nuevo y revisá el resumen antes de confirmar.',
    ],
    cuidado: 'Para cambiar uno o dos productos es más fácil hacerlo directo en "Productos".',
  },
  importar: {
    titulo: 'Cargar catálogo PDF',
    para: 'Lee un catálogo en PDF y carga sus productos. Es una herramienta avanzada.',
    pasos: [
      'Usala solo si tenés un catálogo PDF nuevo para cargar.',
      'Revisá siempre el resultado antes de aprobarlo.',
    ],
    cuidado: 'Si tenés dudas, no sigas: consultalo antes.',
  },
  visitante: {
    titulo: 'Ficha de un cliente',
    para: 'El detalle de un cliente que entró al catálogo: qué buscó y qué productos miró.',
    pasos: [
      'Mirá qué categorías le interesan.',
      'Usá esa información para ofrecerle lo que busca cuando lo llames.',
    ],
  },
};

// Qué ayuda corresponde según la dirección de la pantalla (para las pantallas internas).
export function claveAyuda(ruta, activo) {
  const r = String(ruta || '');
  if (r.startsWith('/admin/productos/nuevo')) return 'productos-nuevo';
  if (/^\/admin\/productos\/[^/]+/.test(r)) return 'producto-editar';
  if (r.startsWith('/admin/visitantes/')) return 'visitante';
  return AYUDA[activo] ? activo : null;
}
