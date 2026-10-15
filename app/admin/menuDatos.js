/**
 * Mapa del panel de administración: qué botones hay, en qué grupo y con qué ícono.
 * Es lo único que hay que tocar para agregar, renombrar o mover un botón de la barra lateral.
 * `clave` es el mismo valor que cada pantalla le pasa a <AdminHeader activo="...">.
 */

// Íconos de 24x24 dibujados con trazo (se pintan con el color del texto).
export const ICONOS = {
  inicio: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  consultas: 'M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1z',
  vendedores: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  distribuidores: 'M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  metricas: 'M4 20V10 M10 20V4 M16 20v-7 M22 20H2',
  productos: 'M21 8l-9-5-9 5v8l9 5 9-5z M3 8l9 5 9-5 M12 13v8',
  fotos: 'M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  codigos: 'M5 9h14 M5 15h14 M10 4L8 20 M16 4l-2 16',
  oem: 'M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z M7.5 7.5h.01',
  categorias: 'M3 6a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',
  temporada: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4',
  material: 'M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 20',
  manuales: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z M4 19.5V21h16',
  excel: 'M3 5h18v14H3z M3 10h18 M3 15h18 M9 5v14',
  importar: 'M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z M14 3v5h5 M12 17v-6 M9.5 13.5L12 11l2.5 2.5',
  externo: 'M14 4h6v6 M20 4l-9 9 M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  salir: 'M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4 M16 17l5-5-5-5 M21 12H9',
  flecha: 'M6 9l6 6 6-6',
  menu: 'M4 7h16 M4 12h16 M4 17h16',
  cerrar: 'M6 6l12 12 M18 6L6 18',
};

export const GRUPOS = [
  {
    id: 'inicio',
    titulo: null, // el primero va suelto, sin título
    items: [
      { clave: 'home', href: '/admin', nombre: 'Inicio', icono: 'inicio', ayuda: 'Un resumen y lo que conviene hacer hoy' },
    ],
  },
  {
    id: 'clientes',
    titulo: 'Clientes y ventas',
    items: [
      { clave: 'contactos', href: '/admin/contactos', nombre: 'Consultas de clientes', icono: 'consultas', ayuda: 'Mensajes que dejan los clientes desde la web' },
      { clave: 'vendedores', href: '/admin/vendedores', nombre: 'Vendedores', icono: 'vendedores', ayuda: 'Quién atiende cada provincia' },
      { clave: 'distribuidores', href: '/admin/distribuidores', nombre: 'Distribuidores', icono: 'distribuidores', ayuda: 'Los negocios de "Dónde comprar"' },
      { clave: 'metricas', href: '/admin/metricas', nombre: 'Métricas', icono: 'metricas', ayuda: 'Cuánta gente entra y qué busca' },
    ],
  },
  {
    id: 'productos',
    titulo: 'Productos',
    items: [
      { clave: 'productos', href: '/admin/productos', nombre: 'Productos', icono: 'productos', ayuda: 'Ver, buscar y editar los repuestos' },
      { clave: 'fotos', href: '/admin/fotos-pendientes', nombre: 'Fotos pendientes', icono: 'fotos', ayuda: 'Fotos esperando que las revises', aviso: true },
      { clave: 'codigos', href: '/admin/codigos', nombre: 'Códigos Logbelts', icono: 'codigos', ayuda: 'Cómo se arman los códigos propios' },
      { clave: 'oem', href: '/admin/oem', nombre: 'Códigos originales', icono: 'oem', ayuda: 'Los códigos de fábrica (OEM) de cada repuesto' },
      { clave: 'categorias', href: '/admin/categorias', nombre: 'Categorías', icono: 'categorias', ayuda: 'Cómo se agrupan los productos' },
    ],
  },
  {
    id: 'web',
    titulo: 'La web',
    items: [
      { clave: 'temporada', href: '/admin/temporada', nombre: 'Temporada', icono: 'temporada', ayuda: 'Qué se destaca según la época del año' },
      { clave: 'material', href: '/admin/material', nombre: 'Material para distribuidores', icono: 'material', ayuda: 'Imágenes para armar placas' },
      { clave: 'manuales', href: '/admin/manuales', nombre: 'Manuales y despieces', icono: 'manuales', ayuda: 'Manuales y despieces por máquina' },
    ],
  },
  {
    id: 'carga',
    titulo: 'Carga de datos',
    nota: 'avanzado',
    plegado: true, // arranca cerrado para no asustar; se abre solo si estás en una de sus pantallas
    items: [
      { clave: 'excel', href: '/admin/excel', nombre: 'Carga masiva (Excel)', icono: 'excel', ayuda: 'Bajar, editar y subir muchos productos juntos' },
      { clave: 'importar', href: '/admin/importar', nombre: 'Cargar catálogo PDF', icono: 'importar', ayuda: 'Leer un catálogo en PDF y cargarlo' },
    ],
  },
];
