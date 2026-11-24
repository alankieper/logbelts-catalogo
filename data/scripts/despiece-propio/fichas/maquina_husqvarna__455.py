# Despiece de la Husqvarna 455. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Husqvarna 455'
ARCHIVO = 'husqvarna-455.json'
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
    (1, 'Filtro de aire', '4307664', ['4307664'], celda(0, 0), A(650, 310), {'comp': 0.12}),
    (2, 'Carburador', '2202866', ['2202866'], celda(1, 0), A(480, 500), {'comp': 0.12}),
    (3, 'Bobina de encendido', '2224037', ['2224037', '2224040'], celda(2, 0), A(560, 520), {'comp': 0.12}),
    (4, 'Tapa de tanque', '2214046', ['2214046'], celda(3, 0), A(215, 760), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 0 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
