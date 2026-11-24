# Despiece dibujado por Logbelts

Así se armó el despiece de la Stihl FS 120 (public/dibujos-despiece/stihl-fs120.json):

1. `trazar.py` pasa la foto de catálogo de cada repuesto (fondo blanco) a dibujo de línea:
   contorno exterior + bordes internos, trazado con potrace. Necesita Python con numpy y opencv, y potrace.
2. `componer.py` tiene la lista de piezas (número, nombre, foto a trazar, códigos del catálogo, casilla en el
   dibujo y punto de la máquina al que apunta la guía). Traza todas al mismo grosor de línea, las ubica y escribe el JSON.
   La máquina de fondo es el contorno de desmalezadora de la portada (app/components/sitio/LineasMaquinas.js).
3. En `lib/despiecePropio.js` se agrega la máquina con su archivo.

Para otra máquina: copiar componer.py, cambiar la lista PIEZAS y los puntos de la máquina de fondo.
Los caminos de carpetas del script apuntan a la copia de trabajo donde se armó; ajustarlos antes de usarlo.
