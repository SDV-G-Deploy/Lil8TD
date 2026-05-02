from PIL import Image, ImageDraw
from pathlib import Path

S = 4
W, H = 256 * S, 176 * S
img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

def xy(v): return int(round(v * S))
def rect(x0, y0, x1, y1, c): d.rectangle([xy(x0), xy(y0), xy(x1) - 1, xy(y1) - 1], fill=c)
def poly(points, c): d.polygon([(xy(x), xy(y)) for x, y in points], fill=c)
def line(points, c, w=1): d.line([(xy(x), xy(y)) for x, y in points], fill=c, width=max(1, xy(w)))
def dot(x, y, c): rect(x, y, x + 1, y + 1, c)

INK = '#21140e'
INK2 = '#392416'
HI = '#f3d891'

# The atlas is intentionally chunky and asymmetric. It should read as drawn game art at phone size,
# not as procedural tiles with tiny noise.

def grass_tile(x, y, seed):
    bases = ['#1b3f24', '#214c28', '#183920', '#254f2d']
    mids = ['#2f6433', '#3f7138', '#365f2e', '#496d35']
    rect(x, y, x + 32, y + 32, '#0b1710')
    # irregular painted body
    poly([(x+2,y+3),(x+28,y+1),(x+31,y+10),(x+29,y+29),(x+7,y+31),(x+1,y+24)], bases[seed % 4])
    poly([(x+5,y+7),(x+20,y+4),(x+27,y+11),(x+24,y+22),(x+10,y+26),(x+4,y+18)], mids[seed % 4])
    poly([(x+3,y+22),(x+12,y+19),(x+19,y+24),(x+27,y+22),(x+30,y+29),(x+6,y+30)], '#142a19')
    # broad brush strokes, not confetti
    line([(x+4,y+11),(x+10,y+8),(x+18,y+9),(x+25,y+6)], '#6d8345', 2)
    line([(x+7,y+19),(x+13,y+16),(x+20,y+17)], '#7b8c4a', 2)
    line([(x+17,y+25),(x+24,y+22),(x+29,y+23)], '#506b36', 2)
    if seed in (0, 2):
        # chunky flower/weed clump
        rect(x+8,y+15,x+10,y+18,'#cfa55f'); rect(x+7,y+16,x+11,y+17,'#e5bd71')
        rect(x+5,y+18,x+13,y+20,'#365f2e')
    if seed in (1, 3):
        # little stone/sprout landmark for phone-scale variety
        poly([(x+19,y+18),(x+25,y+17),(x+27,y+22),(x+22,y+24)], '#8b805f')
        line([(x+20,y+18),(x+25,y+17)], '#d8bd78', 1)
    # hand outline
    line([(x+2,y+4),(x+28,y+2),(x+30,y+11),(x+29,y+29),(x+7,y+30),(x+2,y+24),(x+2,y+4)], '#102116', 1)


def path_tile(x, y, seed):
    rect(x, y, x + 32, y + 32, '#24150e')
    # dark grass/earth shoulders make path distinct and less tiled
    poly([(x+0,y+0),(x+32,y+0),(x+30,y+8),(x+24,y+11),(x+7,y+9),(x+1,y+13)], '#3b291a')
    poly([(x+0,y+32),(x+32,y+32),(x+31,y+22),(x+25,y+20),(x+7,y+22),(x+1,y+18)], '#2e1e14')
    # meandering painted road center
    wob = seed % 4
    poly([(x+4,y+9+wob),(x+14,y+6),(x+27,y+8),(x+30,y+14),(x+27,y+24),(x+15,y+26),(x+4,y+23),(x+2,y+15)], '#704622')
    poly([(x+7,y+11),(x+16,y+9),(x+25,y+11),(x+26,y+16),(x+23,y+21),(x+14,y+23),(x+7,y+20),(x+5,y+15)], '#b97535')
    poly([(x+9,y+14),(x+17,y+12),(x+24,y+14),(x+22,y+17),(x+15,y+19),(x+8,y+18)], '#d4934a')
    line([(x+6,y+22),(x+13,y+24),(x+23,y+22),(x+27,y+18)], '#4d2d18', 2)
    line([(x+8,y+11),(x+17,y+9),(x+25,y+11)], '#e3b15e', 1)
    # chunky border stones/planks
    for i, px in enumerate([4 + (seed % 3), 15, 25 - (seed % 2)]):
        c = '#8d7a55' if i != 1 else '#aa8b5b'
        poly([(x+px,y+4),(x+px+5,y+4),(x+px+6,y+7),(x+px+1,y+8)], c)
        line([(x+px+1,y+4),(x+px+5,y+4)], '#e2c77c', 1)
    for i, px in enumerate([7, 18 + (seed % 4)]):
        poly([(x+px,y+25),(x+px+7,y+24),(x+px+8,y+28),(x+px+1,y+29)], '#66523b')
    line([(x+3,y+10+wob),(x+14,y+7),(x+27,y+8),(x+30,y+14),(x+27,y+24),(x+15,y+26),(x+4,y+23),(x+2,y+15),(x+3,y+10+wob)], INK2, 1)


def tower_base(x, y, stone, roof, trim):
    # exaggerated toy-soldier tower base, intentionally crooked
    poly([(x+5,y+50),(x+43,y+49),(x+47,y+54),(x+8,y+55)], '#00000080')
    poly([(x+8,y+35),(x+40,y+34),(x+43,y+48),(x+6,y+50)], '#1a100c')
    poly([(x+10,y+17),(x+36,y+14),(x+40,y+43),(x+12,y+45)], stone)
    line([(x+10,y+17),(x+36,y+14),(x+40,y+43),(x+12,y+45),(x+10,y+17)], INK, 2)
    rect(x+15,y+22,x+20,y+26,'#f2ddb055'); rect(x+29,y+20,x+34,y+24,'#f2ddb055')
    line([(x+13,y+31),(x+38,y+29)], '#26232a', 3)
    poly([(x+6,y+10),(x+39,y+7),(x+43,y+17),(x+8,y+20)], roof)
    line([(x+6,y+10),(x+39,y+7),(x+43,y+17),(x+8,y+20),(x+6,y+10)], INK, 2)
    line([(x+10,y+9),(x+36,y+6)], trim, 3)
    line([(x+13,y+18),(x+36,y+16)], '#ffffff33', 1)


def tower_arrow(x, y):
    tower_base(x, y, '#666166', '#7b5a2e', '#ffe680')
    # giant bow silhouette + banner makes it unmistakable
    line([(x+23,y+16),(x+25,y+1)], '#4b321d', 3)
    line([(x+13,y+6),(x+22,y+1),(x+34,y+5)], '#f0cf54', 3)
    line([(x+13,y+6),(x+21,y+10),(x+34,y+5)], '#7e5a24', 1)
    poly([(x+34,y+0),(x+46,y+4),(x+36,y+8)], '#f8eaa1')
    rect(x+8,y+1,x+12,y+11,'#b9472e'); line([(x+8,y+1),(x+12,y+1),(x+12,y+11)], INK, 1)


def tower_burst(x, y):
    tower_base(x, y, '#6b584c', '#82371e', '#ffd179')
    # squat cannon/cauldron with bright ember mouth
    poly([(x+7,y+4),(x+36,y+0),(x+43,y+7),(x+12,y+13)], '#4b2517')
    line([(x+7,y+4),(x+36,y+0),(x+43,y+7),(x+12,y+13),(x+7,y+4)], INK, 2)
    rect(x+34,y+3,x+46,y+8,'#1b1110')
    poly([(x+18,y+3),(x+30,y+1),(x+32,y+10),(x+17,y+12)], '#ef8d42')
    poly([(x+24,y+9),(x+32,y+16),(x+24,y+24),(x+16,y+16)], '#ffd179')
    poly([(x+24,y+12),(x+28,y+16),(x+24,y+20),(x+20,y+16)], '#ff6f2d')


def tower_frost(x, y):
    tower_base(x, y, '#526b77', '#245e78', '#dffcff')
    # tall icy obelisk/crown
    poly([(x+23,y-4),(x+34,y+8),(x+27,y+22),(x+15,y+11)], '#8ee6f6')
    poly([(x+23,y-1),(x+28,y+8),(x+24,y+18),(x+18,y+10)], '#dffcff')
    line([(x+23,y-4),(x+34,y+8),(x+27,y+22),(x+15,y+11),(x+23,y-4)], '#12384c', 2)
    line([(x+11,y+11),(x+37,y+8)], '#dffcff', 3)
    line([(x+23,y+0),(x+24,y+19)], '#ffffff88', 1)


def enemy_grunt(x, y):
    # tan soldier with shield and horned cap
    poly([(x+7,y+15),(x+25,y+13),(x+27,y+29),(x+6,y+30)], '#6b4c2b')
    poly([(x+9,y+6),(x+23,y+5),(x+25,y+20),(x+8,y+22)], '#d5b96e')
    line([(x+9,y+6),(x+23,y+5),(x+25,y+20),(x+8,y+22),(x+9,y+6)], INK, 1)
    poly([(x+8,y+2),(x+24,y+3),(x+21,y+7),(x+11,y+7)], '#f0d990')
    rect(x+12,y+13,x+15,y+16,'#2f2118'); rect(x+19,y+12,x+22,y+15,'#2f2118')
    poly([(x+2,y+17),(x+10,y+18),(x+10,y+27),(x+3,y+25)], '#8b6a38')
    line([(x+3,y+17),(x+10,y+18),(x+10,y+27)], '#e4c87a', 1)
    rect(x+22,y+21,x+31,y+25,'#4c331f')


def enemy_runner(x, y):
    # red scarf/fox-like runner with long readable motion shape
    poly([(x+2,y+20),(x+13,y+16),(x+28,y+19),(x+31,y+24),(x+12,y+24)], '#762231')
    poly([(x+6,y+11),(x+22,y+8),(x+29,y+14),(x+22,y+22),(x+7,y+20)], '#de5753')
    poly([(x+20,y+3),(x+30,y+7),(x+25,y+12)], '#f07a57')
    line([(x+6,y+11),(x+22,y+8),(x+29,y+14),(x+22,y+22),(x+7,y+20),(x+6,y+11)], INK, 1)
    rect(x+23,y+10,x+26,y+13,'#ffe6d1')
    line([(x+0,y+15),(x+7,y+14),(x+14,y+15)], '#ffd88588', 2)
    rect(x+5,y+24,x+13,y+27,'#3d1720'); rect(x+20,y+23,x+29,y+26,'#3d1720')


def enemy_brute(x, y):
    # big purple ogre, huge head/arms/horns
    poly([(x+3,y+15),(x+29,y+13),(x+31,y+30),(x+2,y+31)], '#3e2864')
    poly([(x+6,y+5),(x+26,y+4),(x+29,y+21),(x+5,y+23)], '#8e6bd7')
    line([(x+6,y+5),(x+26,y+4),(x+29,y+21),(x+5,y+23),(x+6,y+5)], '#1b102d', 2)
    poly([(x+3,y+1),(x+10,y+6),(x+7,y+10)], '#d6c4ff')
    poly([(x+29,y+1),(x+22,y+6),(x+25,y+10)], '#d6c4ff')
    rect(x+12,y+13,x+16,y+17,'#1d1132'); rect(x+20,y+12,x+24,y+16,'#1d1132')
    rect(x+3,y+20,x+10,y+28,'#2b1b47'); rect(x+24,y+19,x+31,y+27,'#2b1b47')
    line([(x+11,y+20),(x+23,y+19)], '#cdb6ff', 1)


for i in range(4): grass_tile(i * 32, 0, i)
for i in range(4): path_tile(128 + i * 32, 0, i + 1)
tower_arrow(0, 40); tower_burst(48, 40); tower_frost(96, 40)
enemy_grunt(0, 104); enemy_runner(32, 104); enemy_brute(64, 104)
# UI ornaments / icon row
rect(0,144,16,160,'#1e130e')
poly([(8,144),(16,152),(8,160),(0,152)], '#a97938')
line([(8,146),(14,152),(8,158),(2,152),(8,146)], '#f0d28a', 1)
poly([(8,149),(11,153),(8,157),(5,153)], '#4a2e1d')
rect(24,145,40,159,'#1b110d'); poly([(26,152),(33,146),(38,153),(31,158)], '#e3c85d'); line([(26,152),(33,146),(38,153)], '#fff1a1', 1)
rect(48,145,64,159,'#1b110d'); poly([(50,154),(56,146),(63,153),(56,159)], '#ef8d42'); poly([(55,151),(59,153),(56,157),(53,153)], '#ffd179')
rect(72,145,88,159,'#1b110d'); poly([(80,145),(87,153),(80,160),(73,153)], '#8edff0'); line([(80,147),(80,158)], '#e6ffff', 1)

out = Path('assets/art-handdrawn')
out.mkdir(parents=True, exist_ok=True)
img.save(out / 'lil8td-handdrawn-v1.png')
print(out / 'lil8td-handdrawn-v1.png')
