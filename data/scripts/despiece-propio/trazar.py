"""Traza una foto de producto (fondo blanco) a dibujo de linea: contorno exterior + bordes internos.
uso: python trazar.py foto.jpg salida.svg [umbral_canny_bajo] [umbral_alto]
Devuelve un SVG con un solo <path> relleno (las lineas son areas finas), viewBox ajustado al objeto.
"""
import sys, subprocess, tempfile, os, re
import numpy as np, cv2

src, out = sys.argv[1], sys.argv[2]
lo = int(sys.argv[3]) if len(sys.argv) > 3 else 40
hi = int(sys.argv[4]) if len(sys.argv) > 4 else 110
grosor = int(sys.argv[5]) if len(sys.argv) > 5 else 3
lado = int(sys.argv[6]) if len(sys.argv) > 6 else 900
min_area = int(sys.argv[7]) if len(sys.argv) > 7 else 60
comp = float(sys.argv[8]) if len(sys.argv) > 8 else 0.04

im = cv2.imread(src, cv2.IMREAD_UNCHANGED)
if im.ndim == 3 and im.shape[2] == 4:  # png con transparencia -> fondo blanco
    a = im[:, :, 3:4] / 255.0
    im = (im[:, :, :3] * a + 255 * (1 - a)).astype(np.uint8)
if im.ndim == 2:
    im = cv2.cvtColor(im, cv2.COLOR_GRAY2BGR)
# trabajar a 900 px de lado mayor
h, w = im.shape[:2]
k = lado / max(h, w)
im = cv2.resize(im, (int(w * k), int(h * k)), interpolation=cv2.INTER_CUBIC)
im = cv2.copyMakeBorder(im, 20, 20, 20, 20, cv2.BORDER_CONSTANT, value=(255, 255, 255))

hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
gris = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
# objeto = lo que no es casi blanco
obj = ((gris < 238) | (hsv[:, :, 1] > 35)).astype(np.uint8) * 255
obj = cv2.morphologyEx(obj, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
# quedarse con componentes grandes (saca textos y sombras chicas)
n, lab, st, _ = cv2.connectedComponentsWithStats(obj)
area_max = st[1:, cv2.CC_STAT_AREA].max() if n > 1 else 0
mask = np.zeros_like(obj)
for i in range(1, n):
    if st[i, cv2.CC_STAT_AREA] >= area_max * comp:
        mask[lab == i] = 255
# rellenar huecos interiores para el contorno exterior
cont, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
lleno = np.zeros_like(mask)
cv2.drawContours(lleno, cont, -1, 255, -1)

# bordes internos
suave = cv2.bilateralFilter(im, 9, 60, 60)
bordes = cv2.Canny(cv2.cvtColor(suave, cv2.COLOR_BGR2GRAY), lo, hi)
interior = cv2.erode(lleno, np.ones((9, 9), np.uint8))
bordes[interior == 0] = 0
# contorno exterior como linea
borde_ext = cv2.morphologyEx(lleno, cv2.MORPH_GRADIENT, np.ones((3, 3), np.uint8))
lineas = cv2.bitwise_or(bordes, borde_ext)
lineas = cv2.dilate(lineas, np.ones((grosor, grosor), np.uint8))
# sacar pedacitos sueltos
n, lab, st, _ = cv2.connectedComponentsWithStats(lineas)
limpio = np.zeros_like(lineas)
for i in range(1, n):
    if st[i, cv2.CC_STAT_AREA] >= min_area:
        limpio[lab == i] = 255

x, y, ww, hh = cv2.boundingRect(lleno)
pad = 6
x0, y0 = max(0, x - pad), max(0, y - pad)
rec = limpio[y0:y + hh + pad, x0:x + ww + pad]
with tempfile.TemporaryDirectory() as td:
    pbm = os.path.join(td, 'a.pbm')
    cv2.imwrite(pbm, 255 - rec)
    subprocess.run(['potrace', '-s', '-t', '25', '-a', '1.1', '-O', '1.5', '-u', '5', pbm, '-o', os.path.join(td, 'a.svg')], check=True)
    svg = open(os.path.join(td, 'a.svg')).read()
open(out, 'w').write(svg)
print(out, rec.shape[1], rec.shape[0])
