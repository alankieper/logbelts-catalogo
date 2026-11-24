# Despiece de la Stihl MS 260. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Stihl MS 260'
ARCHIVO = 'stihl-ms260.json'
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
    (1, 'Carburador', '2202858', ['2202858', '2202861'], celda(0, 0), A(480, 500), {'comp': 0.12}),
    (2, 'Cilindro y pistón', '2203045', ['2203045', '2203086'], celda(1, 0), A(650, 340), {'comp': 0.12}),
    (3, 'Pistón y aros', '2204036', ['2204036'], celda(2, 0), A(660, 370), {'comp': 0.12}),
    (4, 'Juntas', '2210072', ['2210072'], celda(3, 0), A(1000, 460), {'comp': 0.12}),
    (5, 'Mangueras', '2221616', ['2221616', '2921019'], celda(4, 0), A(410, 610), {'comp': 0.12}),
    (6, 'Traba giratoria', '2220191', ['2220191'], celda(5, 0), A(520, 465), {'comp': 0.12, 'lo': 25, 'hi': 70}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 1 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
