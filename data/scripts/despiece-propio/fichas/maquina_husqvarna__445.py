# Despiece de la Husqvarna 445. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Husqvarna 445'
ARCHIVO = 'husqvarna-445.json'
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
    (1, 'Carburador', '2202870', ['2202870'], celda(0, 0), A(480, 500), {'comp': 0.12}),
    (2, 'Cigüeñal', '2222040', ['2222040'], celda(1, 0), A(700, 620), {'comp': 0.12}),
    (3, 'Bobina de encendido', '2224040', ['2224040'], celda(2, 0), A(560, 520), {'comp': 0.12}),
    (4, 'Mangueras', '2921028', ['2921028'], celda(3, 0), A(410, 610), {'comp': 0.12}),
    (5, 'Tapa de arranque', '2215035', ['2215035', '2215070'], celda(4, 0), A(640, 720), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 0 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
