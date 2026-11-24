# Despiece de la Stihl MS 341. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Stihl MS 341'
ARCHIVO = 'stihl-ms341.json'
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
    (1, 'Tapa del filtro y carcasa', '2207017', ['2207017', '2220183'], celda(0, 0), A(650, 270), {'comp': 0.12}),
    (2, 'Filtro de aire', '2207057', ['2207057'], celda(1, 0), A(650, 310), {'comp': 0.12}),
    (3, 'Cigüeñal', '2222048', ['2222048'], celda(2, 0), A(700, 620), {'comp': 0.12}),
    (4, 'Escape', '2203017', ['2203017'], celda(3, 0), A(1060, 420), {'comp': 0.12}),
    (5, 'Tanque de combustible', '2214061', ['2214061'], celda(4, 0), A(210, 800), {'comp': 0.12}),
    (6, 'Mangueras', '2221617', ['2221617'], celda(5, 0), A(410, 610), {'comp': 0.12}),
    (7, 'Tapa de arranque', '2215084', ['2215084'], celda(6, 0), A(640, 720), {'comp': 0.12}),
    (8, 'Silentblocks', '2220096', ['2220096'], celda(7, 0), A(330, 590), {'comp': 0.12}),
    (9, 'Manubrio', '2220125', ['2220125'], celda(0, 1), A(900, 300), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 1 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
