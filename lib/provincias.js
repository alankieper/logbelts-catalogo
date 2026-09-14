// Provincias argentinas (para formularios, asignación de vendedores por zona y el mapa).

export const PROVINCIAS = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos',
  'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro',
  'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán',
];

// Coordenadas aproximadas de cada capital ([lon, lat]); se usan en el mapa cuando la ciudad no es conocida.
export const CAPITALES = {
  'Buenos Aires': [-57.95, -34.92], CABA: [-58.42, -34.61], Catamarca: [-65.78, -28.47],
  Chaco: [-59.05, -27.45], Chubut: [-65.1, -43.3], 'Córdoba': [-64.18, -31.42],
  Corrientes: [-58.83, -27.47], 'Entre Ríos': [-60.53, -31.73], Formosa: [-58.18, -26.18],
  Jujuy: [-65.3, -24.19], 'La Pampa': [-64.29, -36.62], 'La Rioja': [-66.85, -29.41],
  Mendoza: [-68.85, -32.89], Misiones: [-55.9, -27.37], 'Neuquén': [-68.06, -38.95],
  'Río Negro': [-63.0, -40.81], Salta: [-65.42, -24.79], 'San Juan': [-68.54, -31.54],
  'San Luis': [-66.34, -33.3], 'Santa Cruz': [-69.22, -51.62], 'Santa Fe': [-60.7, -31.63],
  'Santiago del Estero': [-64.26, -27.8], 'Tierra del Fuego': [-68.3, -54.8], 'Tucumán': [-65.22, -26.82],
};

const sinAcentos = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const ALIAS = {
  caba: 'CABA', 'capital federal': 'CABA', 'ciudad de buenos aires': 'CABA',
  'ciudad autonoma de buenos aires': 'CABA', 'bs as': 'Buenos Aires', bsas: 'Buenos Aires',
  'provincia de buenos aires': 'Buenos Aires', 'pcia de buenos aires': 'Buenos Aires',
  tdf: 'Tierra del Fuego', 'santiago': 'Santiago del Estero',
};

/** Devuelve el nombre canónico de la provincia, o null si no se reconoce. */
export function normalizarProvincia(valor) {
  const v = sinAcentos(valor).replace(/\./g, '');
  if (!v) return null;
  if (ALIAS[v]) return ALIAS[v];
  return PROVINCIAS.find(p => sinAcentos(p) === v) || null;
}
