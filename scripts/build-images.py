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
    'hero-patio': ('patio-wide.png', (0, 0, 1000, 392)),
    # The interior is the warmer, more inviting frame and now leads the page.
    # Cropped to a hero band: flags and the red wall up top, bar and tables below.
    'hero-taproom': ('taproom.png', (0, 120, 1000, 585)),
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
# The supplied logo is a stacked lockup (chile art above, wordmark below). At
# header height a stacked mark makes its own wordmark unreadable, so we also
# compose a horizontal lockup from the same artwork: chile left, wordmark right.
#
# The seam between the two halves is detected rather than hardcoded, so dropping
# in a redrawn logo does not require re-tuning a magic fraction.
def knock_out_background(img):
    """
    Make the white ground transparent without eating white *inside* the mark.

    A plain "every near-white pixel becomes transparent" pass deletes the head
    on the beer, which is white, and the logo then reads as a dark smudge on a
    dark page. Flood filling inward from the edges only removes white that is
    connected to the outside, so the foam and the highlights survive.
    """
    from collections import deque
    w, h = img.size
    px = img.load()
    def whiteish(p):
        r, g, b, a = p
        return a > 0 and min(r, g, b) > 205 and max(r, g, b) - min(r, g, b) < 26
    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if whiteish(px[x, y]) and not seen[y * w + x]:
                seen[y * w + x] = 1; q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if whiteish(px[x, y]) and not seen[y * w + x]:
                seen[y * w + x] = 1; q.append((x, y))
    while q:
        x, y = q.popleft()
        r, g, b, a = px[x, y]
        lo = min(r, g, b)
        # Feather the last few levels so edges do not come out jagged.
        px[x, y] = (r, g, b, 0 if lo > 228 else int((228 - lo) * 255 / 23))
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and whiteish(px[nx, ny]):
                seen[ny * w + nx] = 1; q.append((nx, ny))


def find_seam(img):
    """
    Row where the chile artwork ends and the wordmark begins.

    Anchored to colour, not to gaps: the chile, mug and stem are the only
    saturated parts of the logo, so the lowest saturated pixel marks the bottom
    of the artwork. Looking for the widest empty band instead finds the gap
    between "MR. CHILE" and "TAPROOM" and leaves the first line black.
    """
    px = img.load()
    last = 0
    for y in range(img.height):
        for x in range(0, img.width, 2):
            r, g, b, a = px[x, y]
            if a > 128 and max(r, g, b) - min(r, g, b) > 45 and max(r, g, b) > 70:
                last = y
                break
    return min(img.height - 1, last + 4)

def build_logos():
    src = Image.open(f'{SRC}/logo-source.png').convert('RGBA')
    knock_out_background(src)
    src = src.crop(src.getbbox())
    src = src.resize((900, round(src.height * 900 / src.width)), Image.LANCZOS)
    src.save(f'{OUT}/logo.png', optimize=True)

    seam = find_seam(src)
    light = src.copy(); lp = light.load()
    for y in range(seam, light.height):          # black wordmark -> masa cream
        for x in range(light.width):
            r, g, b, a = lp[x, y]
            if a and max(r, g, b) < 110:
                lp[x, y] = (242, 233, 216, a)
    light.save(f'{OUT}/logo-light.png', optimize=True)

    chile = light.crop((0, 0, light.width, seam)); chile = chile.crop(chile.getbbox())
    chile.resize((300, round(300 * chile.height / chile.width)), Image.LANCZOS) \
         .save(f'{OUT}/mark-light.png', optimize=True)
    word = light.crop((0, seam, light.width, light.height)); word = word.crop(word.getbbox())

    # Horizontal lockup, generated at 3x so it stays crisp on retina.
    H = 150
    c2 = chile.resize((round(chile.width * (H * .92) / chile.height), round(H * .92)), Image.LANCZOS)
    w2 = word.resize((round(word.width * (H * .80) / word.height), round(H * .80)), Image.LANCZOS)
    gap = 26
    lock = Image.new('RGBA', (c2.width + gap + w2.width, H), (0, 0, 0, 0))
    lock.paste(c2, (0, (H - c2.height) // 2), c2)
    lock.paste(w2, (c2.width + gap, (H - w2.height) // 2), w2)
    lock.save(f'{OUT}/logo-horizontal.png', optimize=True)
    print(f'seam at y={seam}/{src.height}  horizontal={lock.size}  mark={chile.size}')

build_logos()
