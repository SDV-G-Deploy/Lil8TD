from PIL import Image, ImageDraw
from pathlib import Path
S=4
W,H=256*S,176*S
img=Image.new('RGBA',(W,H),(0,0,0,0))
d=ImageDraw.Draw(img)

def rect(x0,y0,x1,y1,c): d.rectangle([x0*S,y0*S,x1*S-1,y1*S-1],fill=c)
def poly(points,c): d.polygon([(x*S,y*S) for x,y in points],fill=c)
def line(points,c,w=1): d.line([(x*S,y*S) for x,y in points],fill=c,width=w*S)

def grass(x,y,base,inner,accent,seed):
    rect(x,y,x+32,y+32,'#102417'); rect(x+2,y+2,x+30,y+30,base); rect(x+4,y+5,x+28,y+10,'#2b5530'); rect(x+4,y+23,x+28,y+28,'#142a19')
    for i in range(9):
        px=x+5+((seed*7+i*11)%22); py=y+6+((seed*13+i*5)%20)
        c=[inner,'#4e7037','#718743','#657542'][i%4]
        rect(px,py,px+2+(i%3),py+1,c)
    if seed%2: rect(x+20,y+19,x+25,y+21,'#8a7d60'); rect(x+21,y+18,x+24,y+19,'#b6a06a')
    if seed%3==0: rect(x+8,y+17,x+11,y+18,'#d6ac67')

def path(x,y,seed):
    rect(x,y,x+32,y+32,'#3f2a1b'); rect(x+2,y+4,x+30,y+28,'#654322'); rect(x+5,y+7,x+27,y+25,'#966634')
    rect(x+6+(seed%4),y+13,x+26,y+16,'#c58c49'); rect(x+8,y+18,x+24,y+20,'#7a4c26')
    for i in range(5):
        px=x+5+((seed*5+i*9)%21); py=y+6+((seed*3+i*7)%20)
        rect(px,py,px+2,py+1, '#dfb46c' if i%2 else '#51311d')
    for px in range(x+3+(seed%3), x+29, 8):
        rect(px,y+2,px+5,y+4,'#8a7d60'); rect(px+2,y+28,px+7,y+30,'#78694d')

def tower_base(x,y,stone,roof,trim):
    rect(x+6,y+48,x+42,y+53,'#00000088'); rect(x+10,y+34,x+38,y+48,'#1d1512'); rect(x+13,y+17,x+35,y+42,stone)
    rect(x+11,y+26,x+37,y+30,'#24242a'); rect(x+14,y+20,x+18,y+24,'#f4e7c044'); rect(x+30,y+20,x+34,y+24,'#f4e7c044')
    rect(x+9,y+10,x+39,y+18,roof); rect(x+12,y+7,x+36,y+10,trim); rect(x+13,y+18,x+35,y+20,'#ffffff22')

def tower_arrow(x,y):
    tower_base(x,y,'#5c5960','#876735','#fff1a1'); rect(x+22,y+0,x+26,y+15,'#5b4325'); rect(x+12,y+4,x+36,y+8,'#e3c85d'); rect(x+33,y+0,x+37,y+14,'#e3c85d'); rect(x+38,y+3,x+46,y+6,'#f8e9a3')

def tower_burst(x,y):
    tower_base(x,y,'#66554a','#7b321f','#ffd17b'); rect(x+5,y+5,x+14,y+12,'#2d1712'); rect(x+12,y+1,x+39,y+8,'#542518'); rect(x+35,y+3,x+44,y+7,'#261513'); rect(x+18,y+0,x+31,y+5,'#ef8d42'); poly([(x+24,y+7),(x+31,y+14),(x+24,y+21),(x+17,y+14)],'#ffd17b')

def tower_frost(x,y):
    tower_base(x,y,'#526774','#2d6e86','#dcfbff'); rect(x+21,y+0,x+27,y+18,'#214d64'); rect(x+16,y+9,x+32,y+12,'#173447'); poly([(x+24,y-2),(x+31,y+5),(x+24,y+12),(x+17,y+5)],'#8edff0'); rect(x+14,y+6,x+34,y+9,'#dcfbff')

def enemy_grunt(x,y):
    rect(x+7,y+13,x+25,y+29,'#7a5a32'); rect(x+9,y+5,x+23,y+22,'#d0b46d'); rect(x+10,y+3,x+22,y+6,'#ead18b'); rect(x+12,y+13,x+14,y+15,'#342418'); rect(x+19,y+13,x+21,y+15,'#342418'); rect(x+4,y+22,x+10,y+25,'#5b4027'); rect(x+22,y+22,x+28,y+25,'#5b4027')

def enemy_runner(x,y):
    rect(x+4,y+20,x+13,y+23,'#7c2530'); rect(x+17,y+21,x+30,y+24,'#7c2530'); rect(x+5,y+11,x+23,y+22,'#db5d5c'); rect(x+17,y+4,x+28,y+12,'#db5d5c'); rect(x+24,y+4,x+30,y+6,'#f0a06d'); rect(x+22,y+8,x+25,y+11,'#ffe6d1'); rect(x+0,y+15,x+5,y+17,'#ffd88555')

def enemy_brute(x,y):
    rect(x+4,y+14,x+28,y+30,'#46306f'); rect(x+7,y+4,x+25,y+22,'#8e6bd7'); rect(x+4,y+0,x+9,y+7,'#cdb6ff'); rect(x+23,y+0,x+28,y+7,'#cdb6ff'); rect(x+12,y+13,x+15,y+16,'#1d1132'); rect(x+18,y+13,x+21,y+16,'#1d1132'); rect(x+2,y+20,x+8,y+26,'#2c1e44'); rect(x+24,y+20,x+30,y+26,'#2c1e44')

for i in range(4): grass(i*32,0,['#18361f','#17321d','#244d2a','#1f4427'][i],'#315c2e','#d6ac67',i+1)
for i in range(4): path(128+i*32,0,i+2)
tower_arrow(0,40); tower_burst(48,40); tower_frost(96,40)
enemy_grunt(0,104); enemy_runner(32,104); enemy_brute(64,104)
# UI frame/corner pieces
rect(0,144,16,160,'#2b1d15'); rect(2,146,14,158,'#9a6c35'); poly([(8,148),(13,153),(8,158),(3,153)],'#e0c17a'); poly([(8,151),(10,153),(8,155),(6,153)],'#4b3320')
# tiny icons row
rect(24,145,40,159,'#21170f'); poly([(32,146),(38,152),(32,158),(26,152)],'#e3c85d')
rect(48,145,64,159,'#21170f'); poly([(56,146),(62,152),(56,158),(50,152)],'#ef8d42')
rect(72,145,88,159,'#21170f'); poly([(80,146),(86,152),(80,158),(74,152)],'#8edff0')
Path('assets/art-v1').mkdir(parents=True, exist_ok=True)
img.save('assets/art-v1/lil8td-art-v1.png')
