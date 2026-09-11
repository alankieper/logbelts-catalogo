/**
 * Contorno real de Argentina (continente + Tierra del Fuego, datos públicos
 * de johan/world.geo.json) + tabla de coordenadas de ciudades, para dibujar
 * un mapa chico en SVG con pines donde entró gente al catálogo. Los puntos
 * del borde son geografía real (simplificada); las coordenadas de ciudades
 * son aproximadas, pero usan la MISMA proyección, así que los pines caen en
 * el lugar relativo correcto dentro de la silueta.
 */

// Continente (incluye el extremo sur patagónico, sin Tierra del Fuego).
const BORDE_CONTINENTE = [[-64.96,-22.08],[-64.38,-22.8],[-63.99,-21.99],[-62.85,-22.03],[-62.69,-22.25],[-60.85,-23.88],[-60.03,-24.03],[-58.81,-24.77],[-57.78,-25.16],[-57.63,-25.6],[-58.62,-27.12],[-57.61,-27.4],[-56.49,-27.55],[-55.7,-27.39],[-54.79,-26.62],[-54.63,-25.74],[-54.13,-25.55],[-53.63,-26.12],[-53.65,-26.92],[-54.49,-27.47],[-55.16,-27.88],[-56.29,-28.85],[-57.63,-30.22],[-57.87,-31.02],[-58.14,-32.04],[-58.13,-33.04],[-58.35,-33.26],[-58.43,-33.91],[-58.5,-34.43],[-57.23,-35.29],[-57.36,-35.98],[-56.74,-36.41],[-56.79,-36.9],[-57.75,-38.18],[-59.23,-38.72],[-61.24,-38.93],[-62.34,-38.83],[-62.13,-39.42],[-62.33,-40.17],[-62.15,-40.68],[-62.75,-41.03],[-63.77,-41.17],[-64.73,-40.8],[-65.12,-41.06],[-64.98,-42.06],[-64.3,-42.36],[-63.76,-42.04],[-63.46,-42.56],[-64.38,-42.87],[-65.18,-43.5],[-65.33,-44.5],[-65.57,-45.04],[-66.51,-45.04],[-67.29,-45.55],[-67.58,-46.3],[-66.6,-47.03],[-65.64,-47.24],[-65.99,-48.13],[-67.17,-48.7],[-67.82,-49.87],[-68.73,-50.26],[-69.14,-50.73],[-68.82,-51.77],[-68.15,-52.35],[-68.57,-52.3],[-69.5,-52.14],[-71.91,-52.01],[-72.33,-51.43],[-72.31,-50.68],[-72.98,-50.74],[-73.33,-50.38],[-73.42,-49.32],[-72.65,-48.88],[-72.33,-48.24],[-72.45,-47.74],[-71.92,-46.88],[-71.55,-45.56],[-71.66,-44.97],[-71.22,-44.78],[-71.33,-44.41],[-71.79,-44.21],[-71.46,-43.79],[-71.92,-43.41],[-72.15,-42.25],[-71.75,-42.05],[-71.92,-40.83],[-71.68,-39.81],[-71.41,-38.92],[-70.81,-38.55],[-71.12,-37.58],[-71.12,-36.66],[-70.36,-36.01],[-70.39,-35.17],[-69.82,-34.19],[-69.81,-33.27],[-70.07,-33.09],[-70.54,-31.37],[-69.92,-30.34],[-70.01,-29.37],[-69.66,-28.46],[-69,-27.52],[-68.3,-26.9],[-68.59,-26.51],[-68.39,-26.19],[-68.42,-24.52],[-67.33,-24.03],[-66.99,-22.99],[-67.11,-22.74],[-66.27,-21.83],[-64.96,-22.08]];

// Tierra del Fuego (polígono aparte, separado por el estrecho de Magallanes).
const BORDE_TDF = [[-65.5,-55.2],[-66.45,-55.25],[-66.96,-54.9],[-67.56,-54.87],[-68.63,-54.87],[-68.63,-52.64],[-68.25,-53.1],[-67.75,-53.85],[-66.45,-54.45],[-65.05,-54.7],[-65.5,-55.2]];

const BORDE_ARG = [...BORDE_CONTINENTE, ...BORDE_TDF];

// Líneas internas simplificadas (no son límites provinciales exactos, son una
// aproximación prolija para que el mapa se vea "dividido" en regiones en vez
// de una silueta lisa — igual espíritu que el mapa con provincias que pasó
// el cliente, pero manteniendo el mismo sistema de proyección de los pines).
const DIVISIONES = [
  [[-62.0, -39.2], [-66.0, -39.5], [-70.3, -39.7]], // arranque de la Patagonia (río Colorado)
  [[-68.2, -27.3], [-64.5, -27.2], [-59.7, -27.0]], // sur del NOA
  [[-68.4, -30.3], [-67.4, -32.8], [-66.9, -35.3]], // este de Cuyo
  [[-62.3, -33.6], [-61.2, -35.6], [-59.8, -37.8]], // borde de Buenos Aires
  [[-58.5, -27.5], [-58.6, -30.8], [-58.9, -33.6]], // Paraná / Mesopotamia
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

function anillo(puntos) {
  return puntos.map(proyectar)
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ') + ' Z';
}
// Dos subtrazos separados (continente + Tierra del Fuego) en un mismo path,
// para no dibujar una línea recta uniendo un extremo con el otro.
export const RUTA_ARGENTINA = anillo(BORDE_CONTINENTE) + ' ' + anillo(BORDE_TDF);

export const RUTAS_DIVISIONES = DIVISIONES.map((linea) =>
  linea.map(proyectar)
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ')
);

export function normalizarCiudad(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}
