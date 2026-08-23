#!/usr/bin/env python3
"""
Regenerate static/img from the originals in scripts/originals/.

Writes each photo at every width that does NOT require upscaling, in WebP and
JPEG, plus a manifest.json the site build reads so markup can never reference a
size that was not produced. Run this only when the source photos change.
"""
import json, os, sys
from PIL import Image

SRC, OUT = 'scripts/originals', 'static/img'
os.makedirs(OUT, exist_ok=True)
TARGET_WIDTHS = [640, 1000, 1280, 1920]

# Some frames need a crop before they earn a place. 'hero-patio' trims the
# right edge and the foreground off the wide patio shot, which removes a wheelie
# bin and a stretch of gravel and leaves the string lights, tables and oaks.
CROPS = {
    'hero-patio': ('patio-wide.png', (0, 0, 742, 452)),
}

PHOTOS = {
    'patio-wide':  'patio-wide.png',
    'patio-dusk':  'patio-dusk.png',
    'taproom':     'taproom.png',
    'patio-tacos': 'patio-tacos.png',
    'tacos-beer':  'tacos-beer.png',
}
FLYERS = {'cumbia-rosa': 'flyer-cumbia-rosa.png',
          'sonidero': 'flyer-sonidero.png',
          'cumbia-giveaway': 'flyer-cumbia-giveaway.png'}

manifest = {}
sources = {n: Image.open(os.path.join(SRC, f)).convert('RGB') for n, f in PHOTOS.items()}
for n, (f, box) in CROPS.items():
    sources[n] = Image.open(os.path.join(SRC, f)).convert('RGB').crop(box)

for name, im in sources.items():
    # Never upscale: a 1000px original stays 1000px.
    widths = [w for w in TARGET_WIDTHS if w <= im.width] or [im.width]
    for w in widths:
        r = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        r.save(f'{OUT}/{name}-{w}.jpg', 'JPEG', quality=76, optimize=True, progressive=True)
        r.save(f'{OUT}/{name}-{w}.webp', 'WEBP', quality=72, method=6)
    manifest[name] = {'widths': widths, 'w': im.width, 'h': im.height}


for name, f in FLYERS.items():
    im = Image.open(os.path.join(SRC, f)).convert('RGB')
    w = min(900, im.width)
    r = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    r.save(f'{OUT}/flyer-{name}.jpg', 'JPEG', quality=80, optimize=True, progressive=True)
    r.save(f'{OUT}/flyer-{name}.webp', 'WEBP', quality=76, method=6)
    manifest[f'flyer-{name}'] = {'widths': [w], 'w': w, 'h': r.height}

json.dump(manifest, open(f'{OUT}/manifest.json', 'w'), indent=2, sort_keys=True)
print(json.dumps(manifest, indent=2, sort_keys=True))

# --- logo lockups -------------------------------------------------------------
# The supplied logo is a stacked lockup (chile above, wordmark below) with a
# ~1.6:1 ratio. At header height that makes the wordmark unreadable, so we also
# compose a horizontal lockup from the same artwork: chile left, wordmark right.
def build_logos():
    src = Image.open(f'{SRC}/logo-source.png').convert('RGBA')
    px = src.load()
    w, h = src.size
    for y in range(h):                      # key out the near-white background
        for x in range(w):
            r, g, b, a = px[x, y]
            lo, hi = min(r, g, b), max(r, g, b)
            if lo > 228 and hi - lo < 18:
                px[x, y] = (r, g, b, 0)
            elif lo > 200 and hi - lo < 22:
                px[x, y] = (r, g, b, int((228 - lo) * 255 / 28))
    src = src.crop(src.getbbox())
    src = src.resize((560, round(src.height * 560 / src.width)), Image.LANCZOS)
    src.save(f'{OUT}/logo.png', optimize=True)

    split = int(src.height * 0.66)          # chile art above, wordmark below
    light = src.copy(); lp = light.load()
    for y in range(split, light.height):    # black wordmark -> masa cream
        for x in range(light.width):
            r, g, b, a = lp[x, y]
            if a and max(r, g, b) < 110:
                lp[x, y] = (242, 233, 216, a)
    light.save(f'{OUT}/logo-light.png', optimize=True)

    chile = light.crop((0, 0, light.width, int(light.height * 0.63)))
    chile = chile.crop(chile.getbbox())
    chile.resize((240, round(240 * chile.height / chile.width)), Image.LANCZOS) \
         .save(f'{OUT}/mark-light.png', optimize=True)

    word = light.crop((0, split, light.width, light.height))
    word = word.crop(word.getbbox())

    # Horizontal lockup at 3x for retina; CSS renders it around 38px tall.
    WH = 114                                 # lockup height
    ch = round(WH * 0.86)
    c2 = chile.resize((round(chile.width * ch / chile.height), ch), Image.LANCZOS)
    ww = round(word.width * (WH * 0.80) / word.height)
    w2 = word.resize((ww, round(WH * 0.80)), Image.LANCZOS)
    gap = 22
    lock = Image.new('RGBA', (c2.width + gap + w2.width, WH), (0, 0, 0, 0))
    lock.paste(c2, (0, (WH - c2.height) // 2), c2)
    lock.paste(w2, (c2.width + gap, (WH - w2.height) // 2), w2)
    lock.save(f'{OUT}/logo-horizontal.png', optimize=True)
    print('logo-horizontal', lock.size, ' mark', chile.size, ' stacked', src.size)

build_logos()
