# Despiece dibujado por Logbelts

Así se armó el despiece de la Stihl FS 120 (public/dibujos-despiece/stihl-fs120.json):

1. `trazar.py` pasa la foto de catálogo de cada repuesto (fondo blanco) a dibujo de línea:
   contorno exterior + bordes internos, trazado con potrace. Necesita Python con numpy y opencv, y potrace.
2. `componer.py maquina_xxx.py` lee la ficha de la máquina (`maquina_ms170.py` es el ejemplo): la lista de piezas (número, nombre, foto a trazar, códigos del catálogo, casilla en el
   dibujo y punto de la máquina al que apunta la guía). Traza todas al mismo grosor de línea, las ubica y escribe el JSON.
   La máquina de fondo es el contorno de desmalezadora de la portada (app/components/sitio/LineasMaquinas.js).
3. En `lib/despiecePropio.js` se agrega la máquina con su archivo.

Para otra máquina: copiar maquina_ms170.py, cambiar la lista PIEZAS, la grilla y los puntos de la máquina de fondo.
Ajustes por pieza: lo/hi (cuántos bordes internos), comp (sacar pedazos sueltos), recorte (usar parte de la foto),
invertir (foto sobre fondo negro).
Los caminos de carpetas del script apuntan a la copia de trabajo donde se armó; ajustarlos antes de usarlo.

La motosierra de fondo de la MS 170 es un dibujo de línea generado en Canva (motosierra-canva.png, sin marca),
pasado a vector con `trazar_base.py`. En la ficha va como BASE_IMAGEN.

## Todas las motosierras (generar.py)
`generar.py moto <clave> ...` arma la ficha de cada máquina sola: clasifica los repuestos por tipo de pieza
(carburador, cilindro, cadena…), junta los del mismo tipo en una pieza, elige la foto y ubica el punto en la
motosierra de fondo. Las fichas quedan en `fichas/`. Después se corre `componer.py fichas/maquina_xxx.py`.
Los ajustes de trazado probados a mano por foto están en AJUSTES dentro de generar.py.

Desmalezadoras: `generar.py desma <clave> ...` (usa el contorno de la FS 120 y pone las piezas al costado y debajo).
