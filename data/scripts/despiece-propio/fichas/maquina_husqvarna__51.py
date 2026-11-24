# Despiece de la Husqvarna 51. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Husqvarna 51'
ARCHIVO = 'husqvarna-51.json'
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
    (1, 'Filtro de aire', '4307662', ['4307662'], celda(0, 0), A(650, 310), {'comp': 0.12}),
    (2, 'Cilindro y pistón', '2203071', ['2203071'], celda(1, 0), A(650, 340), {'comp': 0.12}),
    (3, 'Cigüeñal', '2222053', ['2222053'], celda(2, 0), A(700, 620), {'comp': 0.12}),
    (4, 'Tapa de tanque', '2214040', ['2214040', '2214047'], celda(3, 0), A(215, 760), {'comp': 0.12}),
    (5, 'Sinfín de la bomba de aceite', '2219057', ['2219057'], celda(4, 0), A(1015, 780), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 0 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
