/**
 * Silueta simplificada de Argentina + tabla de coordenadas de ciudades, para
 * dibujar un mapa chico en SVG con pines donde entró gente al catálogo.
 * No es un mapa de precisión (no hace falta para un panel de 200px) — los
 * puntos del borde y las coordenadas de ciudades son aproximados, pero usan
 * la MISMA proyección, así que los pines caen en el lugar relativo correcto
 * dentro de la silueta.
 */

// Borde de Argentina simplificado, [longitud, latitud], sentido horario desde el norte.
const BORDE_ARG = [
  [-64.5, -22.0], [-62.3, -22.0], [-60.0, -23.2], [-57.6, -25.4], [-54.6, -25.6],
  [-56.0, -27.3], [-58.0, -27.5], [-58.6, -30.0], [-58.4, -32.0], [-58.0, -34.0],
  [-57.5, -34.5], [-57.0, -36.0], [-57.5, -38.0], [-59.5, -39.0], [-62.0, -40.5],
  [-64.0, -42.5], [-65.5, -45.0], [-67.0, -47.5], [-66.5, -50.3], [-68.5, -52.5],
  [-68.3, -54.5], [-68.6, -54.9], [-70.0, -52.5], [-72.3, -50.5], [-72.0, -47.0],
  [-71.8, -44.0], [-71.5, -41.5], [-71.2, -38.5], [-70.5, -36.0], [-70.0, -33.0],
  [-69.8, -30.0], [-69.0, -27.0], [-68.0, -24.5], [-66.0, -22.3], [-64.5, -22.0],
];

// Ciudades más habituales para un cliente mayorista argentino (nombre normalizado -> [lon, lat]).
export const CIUDADES_AR = {
  'buenos aires': [-58.42, -34.61], 'ciudad autonoma de buenos aires': [-58.42, -34.61],
  'la plata': [-57.95, -34.92], 'mar del plata': [-57.56, -38.0],
  'cordoba': [-64.18, -31.42], 'rosario': [-60.64, -32.95], 'mendoza': [-68.85, -32.89],
  'san miguel de tucuman': [-65.22, -26.82], 'tucuman': [-65.22, -26.82], 'salta': [-65.42, -24.79],
  'santa fe': [-60.7, -31.63], 'san juan': [-68.54, -31.54], 'resistencia': [-59.05, -27.45],
  'neuquen': [-68.06, -38.95], 'posadas': [-55.9, -27.37], 'bahia blanca': [-62.28, -38.72],
  'parana': [-60.53, -31.73], 'formosa': [-58.18, -26.18], 'san luis': [-66.34, -33.3],
  'catamarca': [-65.78, -28.47], 'san fernando del valle de catamarca': [-65.78, -28.47],
  'la rioja': [-66.86, -29.41], 'rio cuarto': [-64.35, -33.13],
  'comodoro rivadavia': [-67.5, -45.86], 'san rafael': [-68.33, -34.62], 'tandil': [-59.13, -37.32],
  'olavarria': [-60.34, -36.89], 'pergamino': [-60.57, -33.9], 'san nicolas': [-60.22, -33.34],
  'san nicolas de los arroyos': [-60.22, -33.34],
  'zarate': [-59.03, -34.1], 'campana': [-58.96, -34.16], 'junin': [-60.94, -34.58],
  'chivilcoy': [-60.02, -34.9], 'lujan': [-59.11, -34.57], 'mercedes': [-59.43, -34.65],
  'trancas': [-65.28, -26.24], 'rio gallegos': [-69.22, -51.62], 'ushuaia': [-68.3, -54.8],
  'santa rosa': [-64.29, -36.62], 'viedma': [-63.0, -40.81], 'concordia': [-58.02, -31.39],
  'gualeguaychu': [-58.51, -33.01], 'san salvador de jujuy': [-65.3, -24.19], 'jujuy': [-65.3, -24.19],
  'santiago del estero': [-64.27, -27.78], 'corrientes': [-58.83, -27.47], 'azul': [-59.86, -36.78],
  'necochea': [-58.74, -38.55], 'pinamar': [-56.86, -37.11], 'lomas de zamora': [-58.4, -34.76],
  'quilmes': [-58.25, -34.72], 'moron': [-58.62, -34.65], 'san isidro': [-58.51, -34.47],
  'tigre': [-58.58, -34.42], 'avellaneda': [-58.37, -34.66], 'berazategui': [-58.21, -34.77],
  'general roca': [-67.58, -39.03], 'cipolletti': [-67.99, -38.94], 'rawson': [-65.1, -43.3],
  'trelew': [-65.31, -43.25], 'puerto madryn': [-65.03, -42.77], 'venado tuerto': [-61.97, -33.75],
  'rafaela': [-61.49, -31.25], 'goya': [-59.26, -29.14], 'esquel': [-71.32, -42.91],
  'bariloche': [-71.31, -41.13], 'san carlos de bariloche': [-71.31, -41.13],
};

const COS_LAT = Math.cos((-38 * Math.PI) / 180); // compresión este-oeste a la latitud media del país
const xs = BORDE_ARG.map(([lon]) => lon * COS_LAT);
const ys = BORDE_ARG.map(([, lat]) => lat);
const BBOX = { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };

export const MAPA_ALTO = 230;
export const MAPA_ANCHO = Math.round(MAPA_ALTO * ((BBOX.maxX - BBOX.minX) / (BBOX.maxY - BBOX.minY)));

/** [lon, lat] -> [x, y] en el viewBox del mapa. */
export function proyectar([lon, lat]) {
  const x = lon * COS_LAT;
  const y = lat;
  return [
    ((x - BBOX.minX) / (BBOX.maxX - BBOX.minX)) * MAPA_ANCHO,
    ((BBOX.maxY - y) / (BBOX.maxY - BBOX.minY)) * MAPA_ALTO,
  ];
}

export const RUTA_ARGENTINA = BORDE_ARG.map(proyectar)
  .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
  .join(' ') + ' Z';

export function normalizarCiudad(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}
