# Despiece de la Husqvarna 266. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Husqvarna 266'
ARCHIVO = 'husqvarna-266.json'
BASE_IMAGEN = 'motosierra-canva.png'
ANCHO, ALTO = 1800, 754
BX, BY, BS = 325, 34, 0.36
GUIAS = 'activa'
C0, F0, CW, CH = 12, 520, 222, 214


def A(x, y):
    return (x * 1.6, y * 1.6)


def celda(col, fila, ancho=1, mx=12, my=28):
    x, y = C0 + col * CW, F0 + fila * CH
    return (x + mx, y + my, CW * ancho - 2 * mx, CH - my - 10)


PIEZAS = [
    (1, 'Filtro de aire', '4307668', ['4307668'], celda(0, 0), A(650, 310), {'comp': 0.12}),
    (2, 'Carburador', '2202828', ['2202828'], celda(1, 0), A(480, 500), {'comp': 0.12}),
    (3, 'Retenes de aceite', '2227656', ['2227656'], celda(2, 0), A(730, 660), {'comp': 0.12}),
    (4, 'Bobina de encendido', '2224038', ['2224038'], celda(3, 0), A(560, 520), {'comp': 0.12}),
    (5, 'Tapa de arranque', '2215029', ['2215029', '2215030'], celda(4, 0), A(640, 720), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 0 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
