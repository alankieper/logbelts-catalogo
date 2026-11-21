/**
 * Vista previa de nombres nuevos para el catálogo (regla: categoría en singular + nombre limpio,
 * repuestos chinos con máquina y cilindrada). NO modifica nada: genera data/nombres-propuestos.xlsx.
 *
 * Uso:  node data/scripts/preview-nombres.mjs
 */
import fs from 'fs';
import XLSX from 'xlsx';
import { textoBusqueda } from './generar-lista-extension.mjs';

const prods = JSON.parse(fs.readFileSync('data/productos.json', 'utf8'));
// Excluidos a pedido: correas y cuchillas de mini tractor, aros de pistón.
const excluido = (p) =>
  (p.familia === 'Minitractores' && /CORREAS|CUCHILLA/i.test(p.subcategoria || '')) || /^aros$/i.test(p.subcategoria || '');

const filas = [];
let iguales = 0;
for (const p of prods) {
  if (p.oculto || p.descontinuado || excluido(p)) continue;
  const actual = String(p.nombre || '').trim();
  const nuevo = textoBusqueda(p);
  if (nuevo === actual) {
    iguales++;
    continue;
  }
  filas.push({
    codigo: p.codigo,
    familia: p.familia,
    subcategoria: p.subcategoria,
    nombre_actual: actual,
    nombre_nuevo: nuevo,
    aprobar: 'si',
  });
}

const ws = XLSX.utils.json_to_sheet(filas);
ws['!cols'] = [{ wch: 10 }, { wch: 22 }, { wch: 24 }, { wch: 55 }, { wch: 60 }, { wch: 8 }];
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Nombres');
XLSX.writeFile(wb, 'data/nombres-propuestos.xlsx');

console.log(`Revisados: ${filas.length + iguales} · cambian: ${filas.length} · quedan igual: ${iguales}`);
console.log('Archivo: data/nombres-propuestos.xlsx');

let semilla = 11;
const azar = () => (semilla = (semilla * 9301 + 49297) % 233280) / 233280;
for (let i = 0; i < 18 && filas.length; i++) {
  const f = filas[Math.floor(azar() * filas.length)];
  console.log(`${f.codigo}  ${f.nombre_actual}\n        -> ${f.nombre_nuevo}`);
}
const largos = filas.filter((f) => f.nombre_nuevo.length > 70);
console.log(`\nNombres de más de 70 caracteres: ${largos.length}`, largos.slice(0, 4).map((f) => f.nombre_nuevo));
