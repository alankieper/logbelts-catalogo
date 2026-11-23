/**
 * 30 comercios INVENTADOS para mostrar cómo funciona el mapa de "Dónde comprar"
 * (se ven sólo con /donde-comprar?muestra=1). No son clientes reales: no tienen teléfono
 * ni WhatsApp para que nadie llame a un número equivocado. Cuando se carguen los
 * distribuidores reales desde el panel, el mapa usa esos.
 */
const C = [
  ['Repuestos El Ceibo', 'La Plata', 'Buenos Aires', -57.95, -34.92],
  ['Taller Motosierras del Sur', 'Mar del Plata', 'Buenos Aires', -57.56, -38.0],
  ['Jardín y Motor', 'Bahía Blanca', 'Buenos Aires', -62.27, -38.72],
  ['Agro Repuestos Pampa', 'Pergamino', 'Buenos Aires', -60.57, -33.89],
  ['Casa del Cortacésped', 'Tandil', 'Buenos Aires', -59.13, -37.32],
  ['Rural Herramientas', 'Junín', 'Buenos Aires', -60.95, -34.59],
  ['El Galpón Repuestos', 'Luján', 'Buenos Aires', -59.11, -34.57],
  ['Motores Palermo', 'Ciudad de Buenos Aires', 'CABA', -58.43, -34.58],
  ['Forestal Centro', 'Córdoba', 'Córdoba', -64.18, -31.42],
  ['Repuestos Sierras del Sur', 'Río Cuarto', 'Córdoba', -64.35, -33.12],
  ['Agrotaller Villa María', 'Villa María', 'Córdoba', -63.24, -32.41],
  ['Litoral Repuestos', 'Rosario', 'Santa Fe', -60.64, -32.95],
  ['Taller San Justo', 'Santa Fe', 'Santa Fe', -60.7, -31.63],
  ['Mundo Verde Repuestos', 'Rafaela', 'Santa Fe', -61.49, -31.25],
  ['Cuyo Motor', 'Mendoza', 'Mendoza', -68.85, -32.89],
  ['Viñedos y Jardín', 'San Rafael', 'Mendoza', -68.33, -34.62],
  ['Repuestos Zonda', 'San Juan', 'San Juan', -68.54, -31.54],
  ['Puntano Herramientas', 'San Luis', 'San Luis', -66.34, -33.3],
  ['Norte Forestal', 'Salta', 'Salta', -65.42, -24.79],
  ['Repuestos La Quebrada', 'San Salvador de Jujuy', 'Jujuy', -65.3, -24.19],
  ['Taller Aconquija', 'San Miguel de Tucumán', 'Tucumán', -65.22, -26.82],
  ['Chaco Motor', 'Resistencia', 'Chaco', -58.99, -27.45],
  ['Monte Repuestos', 'Posadas', 'Misiones', -55.9, -27.37],
  ['Selva Herramientas', 'Oberá', 'Misiones', -55.12, -27.49],
  ['Repuestos del Paraná', 'Paraná', 'Entre Ríos', -60.52, -31.73],
  ['Costa del Uruguay', 'Concordia', 'Entre Ríos', -58.02, -31.39],
  ['Valle Repuestos', 'Neuquén', 'Neuquén', -68.06, -38.95],
  ['Alto Valle Motor', 'General Roca', 'Río Negro', -67.57, -39.03],
  ['Patagonia Jardín', 'Trelew', 'Chubut', -65.31, -43.25],
  ['Austral Repuestos', 'Río Gallegos', 'Santa Cruz', -69.22, -51.62],
];

export const DISTRIBUIDORES_MUESTRA = C.map(([nombre, localidad, provincia, lng, lat], i) => ({
  id: `muestra-${i + 1}`,
  nombre,
  localidad,
  provincia,
  direccion: null,
  telefono: null,
  whatsapp: null,
  coord: [lng, lat],
  muestra: true,
}));

/** Ciudades para "¿Dónde estás?" y para ubicar a la persona: [nombre, lon, lat, provincia]. */
export const CIUDADES_BUSCADOR = [
  ['Ciudad de Buenos Aires', -58.42, -34.61, 'CABA'], ['La Plata', -57.95, -34.92, 'Buenos Aires'], ['Mar del Plata', -57.56, -38.0, 'Buenos Aires'],
  ['Bahía Blanca', -62.27, -38.72, 'Buenos Aires'], ['Tandil', -59.13, -37.32, 'Buenos Aires'], ['Pergamino', -60.57, -33.89, 'Buenos Aires'], ['Junín', -60.95, -34.59, 'Buenos Aires'],
  ['Olavarría', -60.32, -36.89, 'Buenos Aires'], ['Azul', -59.86, -36.78, 'Buenos Aires'], ['San Nicolás', -60.22, -33.33, 'Buenos Aires'], ['Zárate', -59.03, -34.1, 'Buenos Aires'],
  ['Córdoba', -64.18, -31.42, 'Córdoba'], ['Río Cuarto', -64.35, -33.12, 'Córdoba'], ['Villa María', -63.24, -32.41, 'Córdoba'], ['San Francisco', -62.08, -31.43, 'Córdoba'],
  ['Villa Carlos Paz', -64.5, -31.42, 'Córdoba'], ['Rosario', -60.64, -32.95, 'Santa Fe'], ['Santa Fe', -60.7, -31.63, 'Santa Fe'], ['Rafaela', -61.49, -31.25, 'Santa Fe'],
  ['Venado Tuerto', -61.97, -33.75, 'Santa Fe'], ['Reconquista', -59.65, -29.15, 'Santa Fe'], ['Paraná', -60.52, -31.73, 'Entre Ríos'], ['Concordia', -58.02, -31.39, 'Entre Ríos'],
  ['Gualeguaychú', -58.51, -33.01, 'Entre Ríos'], ['Corrientes', -58.83, -27.47, 'Corrientes'], ['Posadas', -55.9, -27.37, 'Misiones'], ['Oberá', -55.12, -27.49, 'Misiones'],
  ['Resistencia', -58.99, -27.45, 'Chaco'], ['Formosa', -58.18, -26.18, 'Formosa'], ['Mendoza', -68.85, -32.89, 'Mendoza'], ['San Rafael', -68.33, -34.62, 'Mendoza'],
  ['San Juan', -68.54, -31.54, 'San Juan'], ['San Luis', -66.34, -33.3, 'San Luis'], ['Villa Mercedes', -65.46, -33.68, 'San Luis'], ['La Rioja', -66.85, -29.41, 'La Rioja'],
  ['Catamarca', -65.78, -28.47, 'Catamarca'], ['San Miguel de Tucumán', -65.22, -26.82, 'Tucumán'], ['Santiago del Estero', -64.26, -27.8, 'Santiago del Estero'],
  ['Salta', -65.42, -24.79, 'Salta'], ['San Salvador de Jujuy', -65.3, -24.19, 'Jujuy'], ['Santa Rosa', -64.29, -36.62, 'La Pampa'],
  ['Neuquén', -68.06, -38.95, 'Neuquén'], ['General Roca', -67.57, -39.03, 'Río Negro'], ['Bariloche', -71.31, -41.13, 'Río Negro'], ['Viedma', -63.0, -40.81, 'Río Negro'],
  ['Trelew', -65.31, -43.25, 'Chubut'], ['Comodoro Rivadavia', -67.48, -45.86, 'Chubut'], ['Río Gallegos', -69.22, -51.62, 'Santa Cruz'], ['Ushuaia', -68.3, -54.8, 'Tierra del Fuego'],
].sort((a, b) => a[0].localeCompare(b[0], 'es'));

/** Ciudad más cercana a unas coordenadas [lon, lat] (para saber la provincia de quien escribe). */
export function ciudadMasCercana([lon, lat]) {
  const r = (g) => (g * Math.PI) / 180;
  let mejor = null;
  let min = Infinity;
  for (const c of CIUDADES_BUSCADOR) {
    const a = Math.sin(r(c[2] - lat) / 2) ** 2 + Math.cos(r(lat)) * Math.cos(r(c[2])) * Math.sin(r(c[1] - lon) / 2) ** 2;
    if (a < min) { min = a; mejor = c; }
  }
  return mejor ? { nombre: mejor[0], provincia: mejor[3] } : null;
}
