# Despiece de la Stihl MS 036. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Stihl MS 036'
ARCHIVO = 'stihl-ms036.json'
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
    (1, 'Kit de juntas y membranas del carburador', '2209025', ['2209025'], celda(0, 0), A(470, 525), {'comp': 0.12}),
    (2, 'Cigüeñal', '2222036', ['2222036'], celda(1, 0), A(700, 620), {'comp': 0.12}),
    (3, 'Sinfín de la bomba de aceite', '2220145', ['2220145'], celda(2, 0), A(1015, 780), {'comp': 0.12}),
    (4, 'Embrague y campana', '2212038', ['2212038'], celda(3, 0), A(1010, 700), {'comp': 0.12}),
    (5, 'Garra de apoyo', '2220081', ['2220081'], celda(4, 0), A(1105, 560), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 0 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
