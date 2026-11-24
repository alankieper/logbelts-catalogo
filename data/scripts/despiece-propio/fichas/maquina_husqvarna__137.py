# Despiece de la Husqvarna 137. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Husqvarna 137'
ARCHIVO = 'husqvarna-137.json'
BASE_IMAGEN = 'motosierra-canva.png'
ANCHO, ALTO = 1800, 968
BX, BY, BS = 325, 34, 0.36
GUIAS = 'activa'
C0, F0, CW, CH = 12, 520, 222, 214


def A(x, y):
    return (x * 1.6, y * 1.6)


def celda(col, fila, ancho=1, mx=12, my=28):
    x, y = C0 + col * CW, F0 + fila * CH
    return (x + mx, y + my, CW * ancho - 2 * mx, CH - my - 10)


PIEZAS = [
    (1, 'Interruptor de encendido', '2220199', ['2220199'], celda(0, 0), A(430, 520), {'comp': 0.12}),
    (2, 'Cilindro y pistón', '2203069', ['2203069'], celda(1, 0), A(650, 340), {'comp': 0.12}),
    (3, 'Cigüeñal', '2222054', ['2222054'], celda(2, 0), A(700, 620), {'comp': 0.12}),
    (4, 'Bobina de encendido', '2224035', ['2224035'], celda(3, 0), A(560, 520), {'comp': 0.12}),
    (5, 'Tapa de tanque', '2214040', ['2214040', '2214047'], celda(4, 0), A(215, 760), {'comp': 0.12}),
    (6, 'Sinfín de la bomba de aceite', '2219055', ['2219055', '2219090'], celda(5, 0), A(1015, 780), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 1 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
