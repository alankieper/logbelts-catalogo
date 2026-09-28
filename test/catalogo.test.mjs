import test from 'node:test';
import assert from 'node:assert/strict';

import { slugify } from '../lib/slug.js';
import { claveTexto, slugTexto, formatoModelo, parsearMaquina, listaDespiece } from '../lib/maquinaNombre.js';

/**
 * Pruebas del catálogo: direcciones de las páginas y vínculo máquina–repuesto.
 *
 * Por qué importan: si `slugify` cambia, cambian TODAS las direcciones del sitio y se
 * rompen los links que ya están en Google. Y si cambia la comparación de nombres de
 * máquina, un repuesto deja de aparecer en la máquina que le corresponde.
 */

test('las direcciones salen sin tildes, sin eñes y sin símbolos', () => {
  assert.equal(slugify('Motosierras'), 'motosierras');
  assert.equal(slugify('Espadas y Cadenas'), 'espadas-y-cadenas');
  assert.equal(slugify('Carburación'), 'carburacion');
  assert.equal(slugify('  Juntas  de   Motor '), 'juntas-de-motor');
  assert.equal(slugify('Hidrolavadora / Motobomba'), 'hidrolavadora-motobomba');
});

test('la misma categoría escrita distinto da la misma dirección', () => {
  assert.equal(slugify('MOTOSIERRAS'), slugify('motosierras'));
  assert.equal(slugify('Minitractores'), slugify('minitractores'));
});

test('nombres de máquina escritos distinto se reconocen como el mismo', () => {
  const formas = ['Stihl FS 55', 'STIHL FS-55', 'stihl fs55', 'Stihl  FS  55'];
  const claves = formas.map((f) => parsearMaquina(f).clave);
  assert.equal(new Set(claves).size, 1, 'las cuatro formas tienen que dar la misma clave');
  assert.equal(claves[0], 'stihl|fs55');
});

test('si no dice la marca, se deduce del modelo', () => {
  const m = parsearMaquina('FS 160');
  assert.equal(m.marca, 'Stihl');
  assert.equal(m.clave, 'stihl|fs160');
});

test('las variantes FS 55, FS 55 R y FS 55 T son máquinas distintas', () => {
  const a = parsearMaquina('Stihl FS 55').clave;
  const b = parsearMaquina('Stihl FS 55 R').clave;
  const c = parsearMaquina('Stihl FS 55 T').clave;
  assert.equal(new Set([a, b, c]).size, 3);
});

test('un texto sin modelo no cuenta como máquina', () => {
  assert.equal(parsearMaquina('Stihl'), null);
  assert.equal(parsearMaquina(''), null);
  assert.equal(parsearMaquina(null), null);
  assert.equal(parsearMaquina('   '), null);
});

test('el modelo se muestra siempre igual', () => {
  assert.equal(formatoModelo('fs-55'), 'FS 55');
  assert.equal(formatoModelo('ms.250'), 'MS 250');
  assert.equal(formatoModelo('  ms 250  '), 'MS 250');
});

test('la comparación ignora mayúsculas, tildes y separadores', () => {
  assert.equal(claveTexto('MS-250'), claveTexto('ms 250'));
  assert.equal(claveTexto('MS250'), claveTexto('ms.250'));
  assert.equal(slugTexto('Stihl'), 'stihl');
});

test('el campo Despiece acepta varias máquinas separadas de cualquier forma', () => {
  assert.deepEqual(listaDespiece('Stihl FS 55, Stihl FS 55 R'), ['Stihl FS 55', 'Stihl FS 55 R']);
  assert.deepEqual(listaDespiece('Stihl MS 250; Stihl MS 170'), ['Stihl MS 250', 'Stihl MS 170']);
  assert.deepEqual(listaDespiece(['Stihl FS 55', 'Stihl FS 55']), ['Stihl FS 55'], 'no repite');
  assert.deepEqual(listaDespiece(''), []);
  assert.deepEqual(listaDespiece(null), []);
});
