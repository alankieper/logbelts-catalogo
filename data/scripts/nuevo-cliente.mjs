#!/usr/bin/env node
/*
 * COPIA EN BLANCO — deja el proyecto listo para otro negocio.
 *
 * Vacía los datos del catálogo (productos, modelos, despieces, logos de marca) y las carpetas de
 * imágenes de public/, y deja lib/marca.js con valores de ejemplo genéricos. NO toca app/ ni el
 * resto de lib/: el sistema sigue funcionando igual, sólo que sin contenido.
 *
 * Uso:
 *   node data/scripts/nuevo-cliente.mjs --dry-run   -> muestra qué haría, sin tocar nada
 *   node data/scripts/nuevo-cliente.mjs --si        -> lo hace de verdad (no se puede deshacer)
 *
 * Ver PLANTILLA.md para el paso a paso completo de un cliente nuevo.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry-run') || args.has('-n');
const SI = args.has('--si') || args.has('--yes');

/**
 * Archivos de datos y su forma vacía correcta.
 * (Así los leen lib/catalogo.js, lib/maquinas.js, lib/despieces.js, lib/despieceLinks.js
 * y lib/logosMarcas.js: lista vacía o diccionario vacío según el caso.)
 */
const DATOS = [
  ['data/productos.json', '[]\n'],            // lib/catalogo.js -> lista de productos
  ['data/modelos.json', '[]\n'],              // resumen marca/modelo (data/scripts/extraer-modelos.mjs)
  ['data/producto-modelos.json', '{}\n'],     // lib/maquinas.js y lib/despieces.js -> { codigo: [ {marca, modelo} ] }
  ['data/despieces.json', '[]\n'],            // lib/despieces.js -> despieces curados
  ['data/despiece-links.json', '{}\n'],       // lib/despieceLinks.js -> { "Marca|MODELO": "slug" }
  ['data/marcas-logos-claros.json', '[]\n'],  // lib/logosMarcas.js -> lista de slugs
];

/** Carpetas de public/ que se vacían (quedan creadas, con un .gitkeep adentro). */
const CARPETAS = ['public/fotos', 'public/marcas', 'public/img', 'public/og', 'public/despieces'];

const MARCA_EJEMPLO = `/**
 * IDENTIDAD DEL CLIENTE Y MÓDULOS ACTIVOS.
 *
 * Este archivo es lo ÚNICO que hay que tocar para que el mismo sistema sirva a otro negocio
 * o a otro rubro (repuestos de auto, celulares, etc.). Ver PLANTILLA.md para el paso a paso.
 * El contenido editorial de la web (textos, PDFs, categorías) vive en lib/sitio.js.
 */

export const MARCA = {
  // --- Identidad ---
  nombre: 'Mi Empresa',
  rubro: 'Repuestos',
  descripcionCorta: 'Venta mayorista de repuestos.',
  lema: 'Repuestos que marcan la diferencia',
  // Logos en public/ (el claro va sobre fondo oscuro)
  logoClaro: '/logo-blanco.png',
  logoOscuro: '/logo-azul.png',

  // --- Código propio del catálogo ---
  codigo: {
    etiqueta: 'Código',            // se muestra en fichas, buscador y pedidos
    ejemplos: '1234567',
  },

  // --- Contacto ---
  contacto: {
    direccion: '',
    telefono: '',
    email: '',
    dias: '',
    horario: '',
    whatsapp: '',
  },
  portalB2B: '',

  // --- Cómo se llama lo que usa el repuesto (auto, equipo, máquina…) ---
  maquinas: {
    singular: 'máquina',
    plural: 'máquinas',
    etiquetaBusqueda: 'Buscá por máquina',
  },

  // --- Módulos que se prenden o apagan según el rubro ---
  modulos: {
    maquinas: true,        // compatibilidad por marca y modelo
    despiece: false,       // links al despiece del fabricante (propio de bosque y jardín)
    guias: false,          // guías técnicas (correas, espadas y cadenas, tanza)
    dibujos: true,         // ilustraciones de línea de las piezas
    piezas3d: true,        // visor 3D de la portada
    distribuidores: true,  // portal B2B y mapa "dónde comprar"
    material: true,        // material para el comercio (placas, logos)
    tutoriales: true,
    lanzamientos: true,
    pedidoRapido: true,    // pegar códigos o subir Excel
  },
};

/** Atajo: ¿está prendido este módulo? */
export const modulo = (nombre) => MARCA.modulos[nombre] !== false;
`;

// ---------------------------------------------------------------- utilidades

const rel = (p) => path.relative(RAIZ, p).split(path.sep).join('/');
const log = (txt) => console.log(`${DRY ? '[simulado] ' : ''}${txt}`);

function escribir(destino, contenido, detalle) {
  const abs = path.join(RAIZ, destino);
  if (!DRY) {
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, contenido, 'utf8');
  }
  log(`${destino} -> ${detalle}`);
}

function vaciarCarpeta(carpeta) {
  const abs = path.join(RAIZ, carpeta);
  let entradas = [];
  try {
    entradas = fs.readdirSync(abs).filter((n) => n !== '.gitkeep');
  } catch {
    log(`${carpeta} -> no existía, se crea vacía`);
    if (!DRY) fs.mkdirSync(abs, { recursive: true });
  }
  if (entradas.length) {
    log(`${carpeta} -> se borran ${entradas.length} archivo(s)`);
    if (!DRY) {
      for (const n of entradas) fs.rmSync(path.join(abs, n), { recursive: true, force: true });
    }
  } else {
    log(`${carpeta} -> ya estaba vacía`);
  }
  if (!DRY) {
    fs.mkdirSync(abs, { recursive: true });
    fs.writeFileSync(path.join(abs, '.gitkeep'), '', 'utf8');
  }
  log(`${carpeta}/.gitkeep -> creado`);
}

// ---------------------------------------------------------------- ejecución

console.log('');
console.log('== COPIA EN BLANCO ==');
console.log(`Proyecto: ${rel(RAIZ) || RAIZ}`);
console.log('');

if (!DRY && !SI) {
  console.error('Esto BORRA todos los datos del catálogo y las imágenes de public/. No se puede deshacer.');
  console.error('');
  console.error('  Para ver qué haría:   node data/scripts/nuevo-cliente.mjs --dry-run');
  console.error('  Para hacerlo:         node data/scripts/nuevo-cliente.mjs --si');
  console.error('');
  process.exit(1);
}

console.log('1) Datos del catálogo');
for (const [archivo, vacio] of DATOS) {
  const abs = path.join(RAIZ, archivo);
  let antes = 'no existía';
  try {
    antes = `${(fs.statSync(abs).size / 1024).toFixed(0)} KB`;
  } catch {}
  escribir(archivo, vacio, `${vacio.trim()} (antes: ${antes})`);
}

console.log('');
console.log('2) Imágenes de public/');
for (const carpeta of CARPETAS) vaciarCarpeta(carpeta);

console.log('');
console.log('3) Identidad');
escribir('lib/marca.js', MARCA_EJEMPLO, 'valores de ejemplo ("Mi Empresa", contacto vacío, despiece y guías apagados)');

console.log('');
console.log('== LISTO ==');
if (DRY) console.log('(No se tocó nada: fue una simulación. Repetilo con --si para hacerlo de verdad.)');
console.log('');
console.log('Lo que sigue (está explicado en PLANTILLA.md):');
console.log('  1. Editá lib/marca.js: nombre, rubro, contacto, WhatsApp y qué módulos deja prendidos.');
console.log('  2. Poné los logos del cliente en public/ (logo-blanco.png y logo-azul.png).');
console.log('  3. Revisá los textos de la web en lib/sitio.js.');
console.log('  4. Entrá a /admin/excel, bajá la planilla, cargá los productos y volvé a subirla.');
console.log('  5. Subí las fotos de los productos a public/fotos (o desde el admin).');
console.log('  6. Creá el proyecto en Vercel y, si vas a usar base de datos, el proyecto en Supabase.');
console.log('');
