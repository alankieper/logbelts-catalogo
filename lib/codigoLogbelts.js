/**
 * Esquema de códigos Logbelts: [RUBRO][SUBRUBRO][PRODUCTO][ITEM] = 7 dígitos.
 * Pos 1 = rubro, pos 2 = subrubro (según el rubro), pos 3-4 = tipo de parte
 * (tabla compartida por todos los rubros), pos 5-7 = variante secuencial.
 *
 * El rubro 5 no está definido en la planilla original del cliente ("5-9 =
 * Otros rubros"); se completa acá como "Correas y accesorios" porque en el
 * catálogo real TODOS los códigos 5xxxxxx son correas de kevlar de
 * Minitractores (358 de 358) — es la única lectura consistente con los datos.
 * No es puramente decorativo: sin esto, el decodificador mostraría "rubro
 * desconocido" para 358 productos reales.
 */

export const RUBROS = {
  1: 'Minitractores / 2 Tiempos',
  2: 'Máquinas 2 Tiempos',
  3: 'Cortadora de Césped',
  4: 'Máquinas 4 Tiempos',
  5: 'Correas y accesorios',
};

export const SUBRUBROS = {
  2: { 1: 'Desmalezadora', 2: 'Motosierra', 3: 'Sopladora', 4: 'Fumigador', 5: 'Corta Cerco', 6: 'Hovadora', 7: 'Generador', 9: 'Universales' },
  4: { 1: 'Desmalezadora', 2: 'Motosierra', 3: 'Motor General', 4: 'Hidrolavadora', 5: 'Compresor', 7: 'Generadores', 8: 'Motobombas', 9: 'Universal' },
  3: { 1: 'Minitractor De Empuje' },
};

export const PRODUCTOS = {
  '01': 'Partes Carburador', '02': 'Carburador Completo', '03': 'Kit Cilindros', '04': 'Kit Pistón',
  '05': 'Aros', '06': 'Filtro Comb', '07': 'Filtro Aire', '08': 'Filtro Aceite', '09': 'Juntas Carburador',
  '10': 'Juntas Motor', '11': 'Bombines', '12': 'Embragues/Campanas/Resortes/Tornillos', '13': 'Caja de Engranaje',
  '14': 'Tanques Combustible', '15': 'Tapas de Arranque', '16': 'Tanza', '17': 'Cabezales Porta Tanza',
  '18': 'Bujías', '19': 'Bomba de Aceite', '20': 'Partes Varias', '21': 'Mangueras', '22': 'Cigüeñal',
  '23': 'Llave de Paso', '24': 'Bobina de Ignición', '25': 'Cables', '27': 'Retén', '90': 'Espadas', '91': 'Cadenas',
};

/** Decodifica un código de 7 dígitos según el esquema. No requiere datos externos. */
export function decodificarCodigo(codigo) {
  const cod = String(codigo || '').trim();
  const errores = [];
  if (!/^\d{7}$/.test(cod)) {
    return { codigo: cod, valido: false, errores: ['El código debe tener exactamente 7 dígitos.'] };
  }
  const rubro = Number(cod[0]);
  const subrubro = Number(cod[1]);
  const producto = cod.slice(2, 4);
  const item = cod.slice(4, 7);

  const rubroNombre = RUBROS[rubro];
  if (!rubroNombre) errores.push(`Rubro ${rubro} no está definido en la tabla.`);

  const tablaSubrubro = SUBRUBROS[rubro];
  let subrubroNombre;
  if (!tablaSubrubro) subrubroNombre = null; // rubro sin tabla de subrubros (1, 5) — no es un error
  else if (!tablaSubrubro[subrubro]) { subrubroNombre = null; errores.push(`Subrubro ${subrubro} no está definido para el rubro ${rubro}.`); }
  else subrubroNombre = tablaSubrubro[subrubro];

  const productoNombre = PRODUCTOS[producto];
  if (!productoNombre) errores.push(`Tipo de parte "${producto}" no está definido en la tabla.`);

  const descripcion = productoNombre
    ? `${productoNombre}${subrubroNombre ? ' para ' + subrubroNombre : ''}${rubroNombre ? ' (' + rubroNombre + ')' : ''} · variante ${item}`
    : null;

  return {
    codigo: cod, rubro, rubroNombre: rubroNombre || null, subrubro, subrubroNombre: subrubroNombre || null,
    producto, productoNombre: productoNombre || null, item, descripcion,
    valido: errores.length === 0, errores,
  };
}

/** Valida formato + (opcional) que no choque con códigos ya existentes. */
export function validarCodigo(codigo, codigosExistentes = []) {
  const d = decodificarCodigo(codigo);
  const errores = [...d.errores];
  if (d.codigo && codigosExistentes.includes(d.codigo)) errores.push('Ya existe un producto con este código.');
  return { valido: errores.length === 0, errores };
}

/** Siguiente ítem (001-999) libre para un rubro+subrubro+producto, mirando los códigos ya usados. */
export function siguienteItem(codigosExistentes, rubro, subrubro, producto) {
  const prefijo = String(rubro) + String(subrubro) + String(producto).padStart(2, '0');
  let max = 0;
  for (const c of codigosExistentes) {
    if (c.length === 7 && c.startsWith(prefijo)) {
      const it = Number(c.slice(4, 7));
      if (it > max) max = it;
    }
  }
  return Math.min(max + 1, 999);
}

export function armarCodigo(rubro, subrubro, producto, item) {
  return String(rubro) + String(subrubro) + String(producto).padStart(2, '0') + String(item).padStart(3, '0');
}
