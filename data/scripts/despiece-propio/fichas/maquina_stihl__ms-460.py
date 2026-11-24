# Despiece de la Stihl MS 460. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Stihl MS 460'
ARCHIVO = 'stihl-ms460.json'
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
    (1, 'Carburador', '2202849', ['2202849'], celda(0, 0), A(480, 500), {'comp': 0.12}),
    (2, 'Cilindro y pistón', '2203058', ['2203058'], celda(1, 0), A(650, 340), {'comp': 0.12}),
    (3, 'Pistón y aros', '2204044', ['2204044'], celda(2, 0), A(660, 370), {'comp': 0.12}),
    (4, 'Juntas', '2210063', ['2210063'], celda(3, 0), A(1000, 460), {'comp': 0.12}),
    (5, 'Mangueras', '2221617', ['2221617'], celda(4, 0), A(410, 610), {'comp': 0.12}),
    (6, 'Válvulas de venteo y descompresión', '2201007', ['2201007'], celda(5, 0), A(600, 330), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 1 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
