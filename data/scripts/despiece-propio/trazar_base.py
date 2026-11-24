"""Traza un dibujo de línea (fondo blanco) tal cual: binariza y vectoriza con potrace.
uso: python trazar_base.py dibujo.png salida.svg  -> imprime x0 y0 ancho alto del recorte (px de la imagen)"""
import sys, subprocess, tempfile, os
import numpy as np, cv2
im = cv2.imread(sys.argv[1], cv2.IMREAD_GRAYSCALE)
neg = (im < 150).astype(np.uint8) * 255
n, lab, st, _ = cv2.connectedComponentsWithStats(neg)
for i in range(1, n):
    if st[i, cv2.CC_STAT_AREA] < 40:
        neg[lab == i] = 0
x, y, w, h = cv2.boundingRect(neg)
p = 8
x0, y0 = max(0, x - p), max(0, y - p)
rec = neg[y0:y + h + p, x0:x + w + p]
with tempfile.TemporaryDirectory() as td:
    pbm = os.path.join(td, 'a.pbm')
    cv2.imwrite(pbm, 255 - rec)
    subprocess.run(['potrace', '-s', '-t', '20', '-a', '1.0', '-O', '1.2', '-u', '5', pbm, '-o', sys.argv[2]], check=True)
print(x0, y0, rec.shape[1], rec.shape[0])
