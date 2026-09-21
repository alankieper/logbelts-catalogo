/**
 * MODO DEMOSTRACIÓN del panel de métricas (/admin/metricas?demo=1).
 *
 * Genera visitas y eventos INVENTADOS, sólo para mostrar el panel en una presentación
 * cuando todavía hay pocos datos reales. NO toca la base: los datos reales se siguen
 * registrando igual y vuelven a verse apagando el modo.
 *
 * Los números salen de una semilla fija, así no cambian entre recargas.
 */

const CIUDADES = [
  ['Buenos Aires', 'AR', 0.13], ['Córdoba', 'AR', 0.1], ['Rosario', 'AR', 0.08], ['La Plata', 'AR', 0.07],
  ['Mar del Plata', 'AR', 0.06], ['Mendoza', 'AR', 0.06], ['San Miguel de Tucumán', 'AR', 0.05],
  ['Pilar', 'AR', 0.05], ['Bahía Blanca', 'AR', 0.04], ['Neuquén', 'AR', 0.04], ['Salta', 'AR', 0.04],
  ['Posadas', 'AR', 0.04], ['Santa Fe', 'AR', 0.04], ['Resistencia', 'AR', 0.03], ['Paraná', 'AR', 0.03],
  ['Comodoro Rivadavia', 'AR', 0.03], ['San Rafael', 'AR', 0.03], ['Concordia', 'AR', 0.02],
  ['Montevideo', 'UY', 0.03], ['Asunción', 'PY', 0.03],
];
const ORIGENES = [[null, 0.42], ['google.com', 0.3], ['instagram.com', 0.14], ['facebook.com', 0.07], ['wa.me', 0.07]];
const COMERCIOS = [
  'Agro Ferretería El Tala', 'Repuestos Don Pedro', 'Jardín y Motor SRL', 'Ferretería La Esquina',
  'Motosierras del Litoral', 'Agroservicios Sur', 'Casa Gómez Repuestos', 'El Taller de Marcos',
  'Verde Máquinas', 'Ferretería San Martín', 'Servicio Técnico Paraná', 'Agro Norte Repuestos',
];
const BUSQUEDAS = [
  'ms250', 'carburador stihl', 'cadena 3/8', 'cabezal de tanza', 'correa minitractor', 'fs 220',
  'piñon 325', 'filtro de aire honda gx', 'bujia', 'kit cilindro 45mm', 'arranque husqvarna',
  'espada 18', 'tanza 3mm', 'cuchilla 42', 'embrague', 'junta de cilindro', 'bobina de encendido',
];
const SIN_RESULTADO = ['stihl 038 magnum', 'tapa de tanque shindaiwa', 'repuesto motoguadaña zenoah', 'cuchilla 54 pulgadas'];

/** Generador con semilla: siempre los mismos números "al azar". */
function azar(semilla) {
  let a = semilla >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const elegir = (r, lista) => {
  let x = r();
  for (const [valor, peso] of lista) {
    x -= peso;
    if (x <= 0) return valor;
  }
  return lista[lista.length - 1][0];
};
const entre = (r, a, b) => a + Math.floor(r() * (b - a + 1));

/**
 * @param dias     rango elegido (7, 30, 90…)
 * @param codigos  códigos reales del catálogo, para que los rankings muestren productos de verdad
 */
export function datosDemo(dias = 30, codigos = []) {
  const r = azar(20260919);
  const hoy = Date.now();
  const cods = codigos.length ? codigos : ['0000000'];

  // clientes registrados de mentira (para "clientes más activos")
  const visitantes = COMERCIOS.map((nombre, i) => ({
    id: `demo-${i}`,
    empresa_nombre: nombre,
    telefono: `11 ${entre(r, 3000, 7999)}-${entre(r, 1000, 9999)}`,
    creado: new Date(hoy - entre(r, 20, 220) * 86400000).toISOString(),
  }));

  const visitas = [];
  const eventos = [];
  const cuando = (dia) => new Date(hoy - dia * 86400000 - entre(r, 0, 20) * 3600000).toISOString();

  for (let dia = dias - 1; dia >= 0; dia--) {
    const finde = new Date(hoy - dia * 86400000).getDay() % 6 === 0;
    // leve crecimiento en el período + variación día a día + menos movimiento el fin de semana
    const base = 11 + (dias - dia) * (6 / dias);
    const personas = Math.max(3, Math.round(base * (0.75 + r() * 0.6) * (finde ? 0.55 : 1)));

    for (let p = 0; p < personas; p++) {
      const ip = `demo${dia}-${p}`;
      const ciudad = elegir(r, CIUDADES.map((c) => [c, c[2]]));
      const visitanteId = r() < 0.35 ? visitantes[entre(r, 0, visitantes.length - 1)].id : null;
      const fecha = cuando(dia);
      visitas.push({
        id: `v${dia}-${p}`, ip_hash: ip, pais: ciudad[1], ciudad: ciudad[0], region: null,
        ref: elegir(r, ORIGENES), visitante_id: visitanteId, creado: fecha,
      });
      // algunas personas entran más de una vez en el día
      if (r() < 0.22) {
        visitas.push({
          id: `v${dia}-${p}b`, ip_hash: ip, pais: ciudad[1], ciudad: ciudad[0], region: null,
          ref: elegir(r, ORIGENES), visitante_id: visitanteId, creado: cuando(dia),
        });
      }
      // lo que hace esa persona
      const ev = (tipo, extra) => eventos.push({ tipo, q: null, codigo: null, n: null, meta: null, visitante_id: visitanteId, creado: fecha, ...extra });
      const busquedas = entre(r, 1, 3);
      for (let b = 0; b < busquedas; b++) {
        const vacia = r() < 0.1; // ~10% sin resultado
        ev('busqueda', vacia
          ? { q: SIN_RESULTADO[entre(r, 0, SIN_RESULTADO.length - 1)], n: 0 }
          : { q: BUSQUEDAS[entre(r, 0, BUSQUEDAS.length - 1)], n: entre(r, 1, 40) });
      }
      const vistas = entre(r, 1, 6);
      for (let v = 0; v < vistas; v++) ev('ver', { codigo: cods[entre(r, 0, cods.length - 1)] });
      if (r() < 0.14) ev('consulta', { codigo: cods[entre(r, 0, cods.length - 1)] });
      if (r() < 0.1) ev('lista_add', { codigo: cods[entre(r, 0, cods.length - 1)] });
      if (r() < 0.05) ev('lista_envio', { n: entre(r, 2, 7) });
      if (r() < 0.06) ev('favorito', { codigo: cods[entre(r, 0, cods.length - 1)] });
      if (r() < 0.08) ev('asistente', { q: BUSQUEDAS[entre(r, 0, BUSQUEDAS.length - 1)] });
      if (r() < 0.03) ev('placa', { q: COMERCIOS[entre(r, 0, COMERCIOS.length - 1)], n: entre(r, 1, 4) });
    }
  }

  return { visitas, eventos, visitantes };
}
