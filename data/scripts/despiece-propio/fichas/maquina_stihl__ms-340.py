# Despiece de la Stihl MS 340. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Stihl MS 340'
ARCHIVO = 'stihl-ms340.json'
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
    (1, 'Tapa del filtro y carcasa', '2207016', ['2207016', '2220182'], celda(0, 0), A(650, 270), {'comp': 0.12}),
    (2, 'Carburador', '2202848', ['2202848'], celda(1, 0), A(480, 500), {'comp': 0.12}),
    (3, 'Codo y brida de admisión', '2220070', ['2220070'], celda(2, 0), A(440, 520), {'comp': 0.12}),
    (4, 'Varilla del cebador', '2220137', ['2220137'], celda(3, 0), A(385, 545), {'comp': 0.12}),
    (5, 'Cigüeñal', '2222047', ['2222047'], celda(4, 0), A(700, 620), {'comp': 0.12}),
    (6, 'Escape', '2203403', ['2203403'], celda(5, 0), A(1060, 420), {'comp': 0.12}),
    (7, 'Manubrio', '2220124', ['2220124'], celda(6, 0), A(900, 300), {'comp': 0.12}),
    (8, 'Sinfín de la bomba de aceite', '2219043', ['2219043'], celda(7, 0), A(1015, 780), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 1 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
