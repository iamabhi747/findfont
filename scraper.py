import json
import requests
from PIL import Image
from io import BytesIO
from base64 import b64encode
from random import randrange
from hashlib import sha256
from pathlib import Path
import string
import random

base_font_img_url = 'https://see.fontimg.com/api/renderfont4/{}/{}/{}/fontdemo.png'
STD_HEIGHT = 50
CANVAS_HEIGHT = 224
STD_WIDTH = 224
IMGS_PER_SIZE = 1

def random_int(s, e):
    if s == e: return s
    return randrange(s, e)

def get_font_img(font_id, text, r="fs", h=130, w=200, fs=65, fgc="#000000", bgc="#FFFFFF", t=0):
    config = {"r":r,"h":h,"w":w,"fs":fs,"fgc":fgc,"bgc":bgc,"t":t}
    text   = b64encode(text.encode()).decode()
    config = b64encode(json.dumps(config).encode()).decode()
    res = requests.get(base_font_img_url.format(font_id, config, text)).content
    img = Image.open(BytesIO(res))
    return img

def gen_img_varities(out_dir, base_name, img:Image.Image):
    Path(out_dir).mkdir(parents=True, exist_ok=True)
    # resize img to std size (preserver acpect ratio)
    img = img.resize((int(img.width*(STD_HEIGHT/img.height)), STD_HEIGHT))
    canvas = Image.new('RGB', (STD_WIDTH, CANVAS_HEIGHT), (255, 255, 255))
    sizes = [1]
    for i, size in enumerate(sizes):
        for j in range(IMGS_PER_SIZE):
            # top = random_int(0,  STD_HEIGHT - int(img.height*size))
            # left = random_int(0, STD_WIDTH  - int(img.width*size))
            top = 0
            left = 0
            canvas.paste(img.resize((int(img.width*size), int(img.height*size))), (left, top))
            canvas.save(f"{out_dir}/{base_name}{str(i*IMGS_PER_SIZE+j+1).zfill(4)}.png")
            canvas = Image.new('RGB', (STD_WIDTH, CANVAS_HEIGHT), (255, 255, 255))


def gen_dataset(fonts_json_file, text_json_file, output_dir):
    with open(fonts_json_file) as f:
        fonts = json.load(f)['fonts']
    with open(text_json_file) as f:
        texts = json.load(f)['texts']
    for font in fonts:
        c = 0
        for text in texts:
            img = get_font_img(font["id"], text)
            hsh = sha256(text.encode()).hexdigest()[:8]
            gen_img_varities(f"{output_dir}/{font["id"]}", hsh, img)
            c += 1
            if c % 10 == 0: print(f"Font {font['id']} - {c*3} images done")


def gen_random_text_json(input_file, output_file, num_texts, txt_len=10):
    with open(input_file) as f:
        textlines = f.readlines()
    texts = []
    for i in range(num_texts):
        t = ''
        while len(t) < 200:
            t += ' ' + random.choice(textlines).strip().replace('?', '.')
        texts.append(t)
    with open(output_file, 'w') as f:
        json.dump({"texts": texts}, f)
    

gen_random_text_json('data/shake.txt', 'data/rtext.json', 600)
gen_random_text_json('data/shake.txt', 'data/testtext.json', 100)

# gen_dataset('data/fonts.json', 'data/rtext.json', 'dataset/train')
# gen_dataset('data/fonts.json', 'data/testtext.json', 'dataset/test')

# img = get_font_img('rg9Rx', 'hHJyynyeTUJa')
# img = img.resize((int(img.width*(STD_HEIGHT/img.height)), STD_HEIGHT))
# canvas = Image.new('RGB', (STD_WIDTH, CANVAS_HEIGHT), (255, 255, 255))
# canvas.paste(img.resize((img.width, img.height)), (0,0))
# canvas.save('test.png')

# MGJlOWJhZTJlZjJiNDFjNmIzMjBlODc4ZTdhYjc1NzUub3Rm
# NDJmZTY1NDYxZmZiNDM5MWE3YmQyNjFkZTJlNWVhMzcudHRm