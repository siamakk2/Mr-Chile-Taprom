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
for name, f in PHOTOS.items():
    im = Image.open(os.path.join(SRC, f)).convert('RGB')
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
