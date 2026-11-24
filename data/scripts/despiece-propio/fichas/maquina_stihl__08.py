# Despiece de la Stihl 08. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Stihl 08'
ARCHIVO = 'stihl-08.json'
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
    (1, 'Kit de juntas y membranas del carburador', '2209215', ['2209215'], celda(0, 0), A(470, 525), {'comp': 0.12}),
    (2, 'Carburador', '2102810', ['2102810', '2202810'], celda(1, 0), A(480, 500), {'comp': 0.12}),
    (3, 'Cilindro y pistón', '2203040', ['2203040'], celda(2, 0), A(650, 340), {'comp': 0.12}),
    (4, 'Embrague y campana', '2212083', ['2212083'], celda(3, 0), A(1010, 700), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 0 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
