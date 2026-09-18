"""
Procedural material studies for Tiruppur Embossing.

These are ILLUSTRATIVE, generated visuals (abstract print/material textures).
They are NOT photographs of client work or client machinery and are labelled
as such in the UI. Replace them with client photography when available
(see data/portfolio.ts and data/services.ts).

Usage:  python scripts/generate-visuals.py
Requires: numpy, Pillow (with WebP support)
"""

from __future__ import annotations

import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "assets"


def hx(h: str) -> np.ndarray:
    h = h.lstrip("#")
    return np.array([int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)], dtype=np.float32)


C = {
    "maroon": hx("#8F202C"),
    "red": hx("#C81C24"),
    "orange": hx("#F77E1E"),
    "amber": hx("#FBB03C"),
    "tealdeep": hx("#017486"),
    "teal": hx("#008D9B"),
    "ink": hx("#0A0A0B"),
    "char": hx("#1D1D20"),
    "graphite": hx("#2A2A2E"),
    "bone": hx("#E9E4DC"),
    "gold": hx("#D9A441"),
}
BRAND = [C["tealdeep"], C["teal"], C["amber"], C["orange"], C["red"], C["maroon"]]


# ---------------------------------------------------------------- utilities
def box_blur(a: np.ndarray, r: int) -> np.ndarray:
    r = int(r)
    if r < 1:
        return a
    pad = np.pad(a, ((r + 1, r), (0, 0)), mode="edge")
    c = np.cumsum(pad, axis=0)
    a = (c[2 * r + 1 :] - c[: -2 * r - 1]) / (2 * r + 1)
    pad = np.pad(a, ((0, 0), (r + 1, r)), mode="edge")
    c = np.cumsum(pad, axis=1)
    return (c[:, 2 * r + 1 :] - c[:, : -2 * r - 1]) / (2 * r + 1)


def blur(a: np.ndarray, r: float) -> np.ndarray:
    k = max(1, int(round(r / 1.7)))
    for _ in range(3):
        a = box_blur(a, k)
    return a


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def value_noise(h, w, cell, rng):
    gh, gw = h // cell + 3, w // cell + 3
    g = rng.random((gh, gw)).astype(np.float32)
    im = Image.fromarray(g, mode="F").resize((gw * cell, gh * cell), Image.BICUBIC)
    return np.asarray(im, dtype=np.float32)[:h, :w]


def fbm(h, w, cell, rng, octaves=4):
    out = np.zeros((h, w), np.float32)
    amp, tot = 1.0, 0.0
    for _ in range(octaves):
        out += value_noise(h, w, max(2, cell), rng) * amp
        tot += amp
        amp *= 0.5
        cell //= 2
    return out / tot


def grid(h, w):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    return x, y


def weave(h, w, p=7.0):
    x, y = grid(h, w)
    fx, fy = (x % p) / p, (y % p) / p
    warp = np.sin(np.pi * fx) ** 0.7 * (0.6 + 0.4 * np.sin(np.pi * fy))
    weft = np.sin(np.pi * fy) ** 0.7 * (0.6 + 0.4 * np.sin(np.pi * fx))
    checker = ((x // p + y // p) % 2) == 0
    return np.where(checker, warp, weft).astype(np.float32)


def knit_mesh(h, w, p=14.0):
    x, y = grid(h, w)
    xx = (x + (np.floor(y / p) % 2) * p / 2) % p - p / 2
    yy = (y % p) - p / 2
    d = np.sqrt(xx**2 + yy**2) / (p / 2)
    return smoothstep(0.35, 0.75, d).astype(np.float32)


def mask(w, h, draw_fn, ss=2):
    im = Image.new("L", (w * ss, h * ss), 0)
    draw_fn(ImageDraw.Draw(im), ss)
    im = im.resize((w, h), Image.LANCZOS)
    return np.asarray(im, dtype=np.float32) / 255.0


def tri(cx, cy, r, rot=-90):
    return [
        (cx + r * math.cos(math.radians(rot + i * 120)), cy + r * math.sin(math.radians(rot + i * 120)))
        for i in range(3)
    ]


def palette(t, stops):
    t = np.clip(t, 0, 1) * (len(stops) - 1)
    i = np.clip(np.floor(t).astype(int), 0, len(stops) - 2)
    f = (t - i)[..., None]
    s = np.stack(stops)
    return s[i] * (1 - f) + s[i + 1] * f


def fill(h, w, col):
    return np.broadcast_to(col, (h, w, 3)).astype(np.float32).copy()


def lerp(a, b, m):
    m = m[..., None] if m.ndim == 2 else m
    return a * (1 - m) + b * m


def shade(height, albedo, strength=14.0, spec=0.25, shin=30.0, ambient=0.35,
          light=(-0.55, -0.65, 0.55), rim=None):
    gy, gx = np.gradient(height)
    nx, ny, nz = -gx * strength, -gy * strength, np.ones_like(height)
    ln = np.sqrt(nx**2 + ny**2 + nz**2)
    nx, ny, nz = nx / ln, ny / ln, nz / ln
    L = np.array(light, np.float32)
    L /= np.linalg.norm(L)
    ndl = np.clip(nx * L[0] + ny * L[1] + nz * L[2], 0, 1)
    H = L + np.array([0, 0, 1], np.float32)
    H /= np.linalg.norm(H)
    ndh = np.clip(nx * H[0] + ny * H[1] + nz * H[2], 0, 1)
    spec = np.asarray(spec, np.float32)
    shin = np.asarray(shin, np.float32)
    s = (ndh**shin) * spec
    rgb = albedo * (ambient + (1 - ambient) * ndl)[..., None] * 1.08 + s[..., None] * np.array([1.0, 0.97, 0.92])
    if rim is not None:
        col, amt = rim
        R = np.array([0.6, 0.7, 0.4], np.float32)
        R /= np.linalg.norm(R)
        rd = np.clip(nx * R[0] + ny * R[1] + nz * R[2] - 0.4, 0, 1)
        rgb += (rd**2)[..., None] * col * amt
    return rgb


def vignette(rgb, amt=0.45):
    h, w, _ = rgb.shape
    x, y = grid(h, w)
    d = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2)
    return rgb * (1 - amt * smoothstep(0.55, 1.45, d))[..., None]


def finish(rgb, rng, path: Path, grain=0.018, vig=0.45, quality=80):
    h, w, _ = rgb.shape
    rgb = vignette(rgb, vig)
    rgb = rgb + (rng.random((h, w, 1)).astype(np.float32) - 0.5) * grain
    path.parent.mkdir(parents=True, exist_ok=True)
    img = Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8), "RGB")
    img.save(path, "WEBP", quality=quality, method=6)
    print(f"  {path.relative_to(ROOT)}  {path.stat().st_size // 1024} KB")


def fabric_height(h, w, rng, p=7.0):
    return weave(h, w, p) * 0.22 + fbm(h, w, 64, rng) * 0.25


# ---------------------------------------------------------------- materials
def emboss(w, h, rng, base="graphite", rim="teal", scale=1.0, motif="triangles"):
    fab = fabric_height(h, w, rng)
    cx, cy = w * 0.52, h * 0.55
    R = min(w, h) * 0.42 * scale

    def draw(d, ss):
        if motif == "triangles":
            for k in range(7):
                pts = [(x * ss, y * ss) for x, y in tri(cx, cy, R * (1 - k * 0.13))]
                d.line(pts + [pts[0]], fill=255, width=int(R * 0.05 * ss), joint="curve")
            for i, (x, y) in enumerate(tri(cx, cy, R * 0.36, 90)):
                rr = R * 0.05
                d.ellipse([(x - rr) * ss, (y - rr) * ss, (x + rr) * ss, (y + rr) * ss], fill=255)
        else:  # typographic bars
            step = h / 11
            for i in range(11):
                wid = w * (0.25 + 0.6 * abs(math.sin(i * 1.7)))
                x0 = w * 0.1
                d.rounded_rectangle([x0 * ss, (i * step + step * 0.25) * ss, (x0 + wid) * ss, (i * step + step * 0.7) * ss],
                                    radius=int(step * 0.2 * ss), fill=255)

    m = mask(w, h, draw)
    relief = smoothstep(0.05, 0.9, blur(m, 5))
    height = fab * 0.35 + relief * 1.2
    albedo = fill(h, w, C[base]) * 1.9 * (0.9 + 0.2 * fbm(h, w, 128, rng))[..., None]
    rgb = shade(height, albedo, strength=12, spec=0.1 + relief * 0.18, shin=22, ambient=0.3,
                rim=(C[rim], 0.45))
    return rgb


def silicone(w, h, rng, color="teal", base="ink", waves=11):
    fab = fabric_height(h, w, rng)
    phase = rng.random() * 6

    def draw(d, ss):
        for i in range(waves):
            y0 = h * (0.08 + i * 0.84 / (waves - 1))
            pts = []
            for xi in range(0, w + 20, 12):
                y = y0 + math.sin(xi / w * math.pi * 2.2 + phase + i * 0.35) * h * 0.06
                pts.append((xi * ss, y * ss))
            d.line(pts, fill=255, width=int(h * 0.028 * ss), joint="curve")

    m = mask(w, h, draw)
    dome = np.clip(blur(m, 6) * 1.25, 0, 1) ** 0.5
    height = fab * 0.3 * (1 - m) + dome * 1.1
    col = palette(fbm(h, w, 400, rng), [C[color] * 0.8, C[color], C[color] * 1.15])
    albedo = lerp(fill(h, w, C[base]) + 0.05, col, smoothstep(0.2, 0.6, m))
    rgb = shade(height, albedo, strength=16, spec=0.05 + dome * 0.95, shin=70, ambient=0.3)
    return rgb


def hd_dots(w, h, rng, colors=("amber", "orange"), base="ink", p=28):
    fab = fabric_height(h, w, rng)
    x, y = grid(h, w)
    tone = np.clip(0.15 + 0.85 * (x / w) * 0.7 + fbm(h, w, 300, rng) * 0.4, 0, 1)
    cx = (x % p) - p / 2
    cy = (y % p) - p / 2
    d = np.sqrt(cx**2 + cy**2)
    rad = tone * p * 0.48
    m = smoothstep(rad + 1, rad - 1, d).astype(np.float32)
    dome = np.clip(1 - (d / np.maximum(rad, 1e-3)) ** 2, 0, 1) ** 0.5 * m
    height = fab * 0.3 + dome * 1.3
    col = palette(y / h, [C[colors[0]], C[colors[1]]])
    albedo = lerp(fill(h, w, C[base]) + 0.04, col, m)
    rgb = shade(height, albedo, strength=9, spec=0.05 + dome * 0.5, shin=40, ambient=0.34)
    return rgb


def warped_field(h, w, rng, cell=260):
    x, y = grid(h, w)
    q1 = fbm(h, w, cell, rng)
    q2 = fbm(h, w, cell, rng)
    t = np.sin((x / w * 2.5 + q1 * 3.2) * math.pi) * 0.5 + np.cos((y / h * 1.8 + q2 * 3.0) * math.pi) * 0.5
    return (t * 0.5 + 0.5).astype(np.float32)


def dtf(w, h, rng, base="bone", shape="circle"):
    fab = fabric_height(h, w, rng)
    cx, cy, R = w * 0.5, h * 0.5, min(w, h) * 0.38

    def draw(d, ss):
        if shape == "circle":
            d.ellipse([(cx - R) * ss, (cy - R) * ss, (cx + R) * ss, (cy + R) * ss], fill=255)
            d.polygon([(x * ss, y * ss) for x, y in tri(cx, cy, R * 0.55, 90)], fill=0)
        else:
            d.polygon([(x * ss, y * ss) for x, y in tri(cx, cy + R * 0.2, R * 1.3)], fill=255)

    m = mask(w, h, draw)
    film = smoothstep(0.3, 0.7, blur(m, 1.5))
    field = palette(warped_field(h, w, rng), BRAND)
    height = fab * (1 - film * 0.7) * 0.5 + film * 0.25
    albedo = lerp(fill(h, w, C[base]) * (0.92 + 0.1 * fbm(h, w, 90, rng))[..., None], field, film)
    rgb = shade(height, albedo, strength=12, spec=film * 0.3, shin=22, ambient=0.5)
    return rgb


def sublimation(w, h, rng, stops=None):
    mesh = knit_mesh(h, w, 12)
    t = warped_field(h, w, rng, cell=320)
    stops = stops or [C["maroon"], C["red"], C["orange"], C["amber"], C["teal"], C["tealdeep"]]
    field = palette(t, stops)
    stripes = (np.sin((grid(h, w)[0] + grid(h, w)[1] * 0.6) / w * 40) * 0.5 + 0.5) ** 8
    field = field * (0.9 + 0.2 * stripes[..., None])
    height = mesh * 0.6 + fbm(h, w, 64, rng) * 0.1
    rgb = shade(height, field * (0.55 + 0.45 * mesh)[..., None], strength=6, spec=0.06, shin=12, ambient=0.5)
    return rgb


def screen(w, h, rng, base="graphite", inks=("teal", "red", "amber"), p=22):
    fab = fabric_height(h, w, rng)
    x, y = grid(h, w)
    albedo = fill(h, w, C[base]) * (0.9 + 0.2 * fbm(h, w, 90, rng))[..., None]
    height = fab * 0.5
    angles = [15, 45, 75]
    for i, (ink, ang) in enumerate(zip(inks, angles)):
        a = math.radians(ang)
        u = x * math.cos(a) + y * math.sin(a)
        v = -x * math.sin(a) + y * math.cos(a)
        du = (u % p) - p / 2
        dv = (v % p) - p / 2
        d = np.sqrt(du**2 + dv**2)
        tone = np.clip(warped_field(h, w, rng, cell=380) * 1.2 - 0.25 + i * 0.05, 0, 1)
        rad = tone * p * 0.5
        m = smoothstep(rad + 0.8, rad - 0.8, d)
        albedo = lerp(albedo, C[ink], m * 0.92)
        height = height + m * 0.18
    rgb = shade(height, albedo, strength=8, spec=0.08, shin=20, ambient=0.42)
    return rgb


def specialty(w, h, rng, base="ink"):
    fab = fabric_height(h, w, rng)
    cx, cy = w * 0.42, h * 0.55
    R = min(w, h) * 0.4

    def foil(d, ss):
        d.polygon([(x * ss, y * ss) for x, y in tri(cx, cy, R)], fill=255)
        d.polygon([(x * ss, y * ss) for x, y in tri(cx, cy + R * 0.12, R * 0.52)], fill=0)

    def flock(d, ss):
        r = R * 0.42
        d.ellipse([(w * 0.76 - r) * ss, (h * 0.34 - r) * ss, (w * 0.76 + r) * ss, (h * 0.34 + r) * ss], fill=255)

    mf = smoothstep(0.3, 0.7, blur(mask(w, h, foil), 1.2))
    ml = smoothstep(0.3, 0.7, blur(mask(w, h, flock), 2))
    x, y = grid(h, w)
    sweep = np.sin((x * 0.7 + y) / w * 7 + fbm(h, w, 200, rng) * 4) * 0.5 + 0.5
    gold = palette(sweep, [hx("#5A3A0C"), C["gold"], hx("#FFE3A3"), C["amber"], hx("#7A4E12")])
    glitter = (rng.random((h, w)) > 0.985).astype(np.float32)
    glitter = blur(glitter, 1.0) * 6
    fuzz = fbm(h, w, 4, rng, octaves=2)
    albedo = fill(h, w, C[base]) + 0.04
    albedo = lerp(albedo, gold, mf)
    albedo = lerp(albedo, C["maroon"] * (0.7 + 0.5 * fuzz)[..., None], ml)
    height = fab * 0.3 * (1 - mf) + mf * (0.3 + fbm(h, w, 6, rng, 2) * 0.1) + ml * (0.5 + fuzz * 0.3)
    rgb = shade(height, albedo, strength=10, spec=mf * 0.8, shin=45, ambient=0.3)
    rgb += (glitter * mf)[..., None] * np.array([1.0, 0.9, 0.7])
    return rgb


def transfer(w, h, rng, base="char"):
    fab = fabric_height(h, w, rng)
    albedo = fill(h, w, C[base]) * (0.9 + 0.2 * fbm(h, w, 90, rng))[..., None]
    height = fab * 0.4
    layers = [("tealdeep", 0.18, 0.2), ("red", 0.36, 0.34), ("amber", 0.54, 0.48)]
    for col, ox, oy in layers:
        def draw(d, ss, ox=ox, oy=oy):
            x0, y0 = w * ox - w * 0.05, h * oy - h * 0.08
            d.rounded_rectangle([x0 * ss, y0 * ss, (x0 + w * 0.42) * ss, (y0 + h * 0.46) * ss],
                                radius=int(h * 0.03 * ss), fill=255)
        m = smoothstep(0.3, 0.7, blur(mask(w, h, draw), 1.2))
        shadow = np.roll(np.roll(blur(m, 18), 14, 0), 10, 1)
        albedo = albedo * (1 - shadow * 0.55)[..., None]
        albedo = lerp(albedo, C[col] * (0.85 + 0.25 * fbm(h, w, 300, rng))[..., None], m * 0.94)
        height = height * (1 - m) + m * (0.35 + len(col) * 0.0)
    rgb = shade(height, albedo, strength=10, spec=0.35, shin=55, ambient=0.4)
    return rgb


def stickers(w, h, rng, base="graphite"):
    albedo = fill(h, w, C[base]) * (0.85 + 0.25 * fbm(h, w, 160, rng))[..., None]
    height = fbm(h, w, 40, rng) * 0.2
    specs = [
        ("circle", 0.26, 0.32, 0.17, "teal"),
        ("tri", 0.66, 0.36, 0.22, "red"),
        ("rect", 0.38, 0.72, 0.16, "amber"),
        ("circle", 0.78, 0.74, 0.12, "orange"),
        ("rect", 0.9, 0.18, 0.08, "maroon"),
    ]
    S = min(w, h)
    for kind, fx, fy, fr, col in specs:
        cx, cy, r = w * fx, h * fy, S * fr

        def shape(d, ss, grow, kind=kind, cx=cx, cy=cy, r=r):
            rr = r + grow
            if kind == "circle":
                d.ellipse([(cx - rr) * ss, (cy - rr) * ss, (cx + rr) * ss, (cy + rr) * ss], fill=255)
            elif kind == "tri":
                d.polygon([(x * ss, y * ss) for x, y in tri(cx, cy, rr * 1.2)], fill=255)
            else:
                d.rounded_rectangle([(cx - rr * 1.3) * ss, (cy - rr * 0.8) * ss, (cx + rr * 1.3) * ss, (cy + rr * 0.8) * ss],
                                    radius=int(rr * 0.25 * ss), fill=255)

        outer = smoothstep(0.3, 0.7, blur(mask(w, h, lambda d, ss: shape(d, ss, S * 0.018)), 1))
        inner = smoothstep(0.3, 0.7, blur(mask(w, h, lambda d, ss: shape(d, ss, 0)), 1))
        shadow = np.roll(np.roll(blur(outer, 14), 12, 0), 6, 1)
        albedo = albedo * (1 - shadow * 0.6)[..., None]
        albedo = lerp(albedo, C["bone"], outer)
        x, y = grid(h, w)
        pattern = (np.sin((x + y) / 9) > 0.6).astype(np.float32) * 0.25
        albedo = lerp(albedo, C[col] * (1 - pattern)[..., None], inner)
        height = height * (1 - outer) + outer * 0.25
    return shade(height, albedo, strength=10, spec=0.3, shin=60, ambient=0.45)


def combination(w, h, rng):
    x, y = grid(h, w)
    split = smoothstep(-2, 2, x - (w * 0.58 - (y - h / 2) * 0.35))
    a = emboss(w, h, rng, base="graphite", rim="orange", scale=1.2)
    b = silicone(w, h, rng, color="teal", base="ink", waves=9)
    film = dtf(w, h, rng, base="ink", shape="tri")
    right = lerp(film, b, smoothstep(0.35, 0.6, (b.mean(axis=2) - 0.08) * 4))
    out = lerp(a, right, split)
    edge = np.exp(-((x - (w * 0.58 - (y - h / 2) * 0.35)) ** 2) / 8)
    return out + edge[..., None] * C["amber"] * 0.8


def placement(w, h, rng):
    fab = fabric_height(h, w, rng, p=6)
    albedo = fill(h, w, C["ink"]) + 0.03
    cx = w / 2
    top = h * 0.12
    sw = min(w, h) * 0.9
    body = [
        (cx - sw * 0.14, top), (cx - sw * 0.36, top + sw * 0.08), (cx - sw * 0.52, top + sw * 0.3),
        (cx - sw * 0.4, top + sw * 0.38), (cx - sw * 0.3, top + sw * 0.28), (cx - sw * 0.3, top + sw * 0.86),
        (cx + sw * 0.3, top + sw * 0.86), (cx + sw * 0.3, top + sw * 0.28), (cx + sw * 0.4, top + sw * 0.38),
        (cx + sw * 0.52, top + sw * 0.3), (cx + sw * 0.36, top + sw * 0.08), (cx + sw * 0.14, top),
    ]

    def tee(d, ss):
        d.polygon([(px * ss, py * ss) for px, py in body], fill=255)
        r = sw * 0.12
        d.pieslice([(cx - r) * ss, (top - r * 0.7) * ss, (cx + r) * ss, (top + r * 0.7) * ss], 0, 180, fill=0)

    m = smoothstep(0.3, 0.7, blur(mask(w, h, tee), 1.5))
    albedo = lerp(albedo, C["graphite"] * 1.4, m)
    height = fab * 0.35 * m + m * 0.4

    def marks(d, ss):
        boxes = [
            (cx + sw * 0.08, top + sw * 0.2, sw * 0.12, sw * 0.1),   # left chest (wearer)
            (cx - sw * 0.17, top + sw * 0.36, sw * 0.34, sw * 0.26),  # front/centre
            (cx - sw * 0.45, top + sw * 0.21, sw * 0.08, sw * 0.08),  # sleeve
            (cx - sw * 0.2, top + sw * 0.72, sw * 0.12, sw * 0.08),   # bottom
        ]
        for bx, by, bw, bh in boxes:
            dash = int(8 * ss)
            for i in range(0, int(bw * ss), dash * 2):
                d.line([(bx * ss + i, by * ss), (bx * ss + i + dash, by * ss)], fill=255, width=int(2.5 * ss))
                d.line([(bx * ss + i, (by + bh) * ss), (bx * ss + i + dash, (by + bh) * ss)], fill=255, width=int(2.5 * ss))
            for i in range(0, int(bh * ss), dash * 2):
                d.line([(bx * ss, by * ss + i), (bx * ss, by * ss + i + dash)], fill=255, width=int(2.5 * ss))
                d.line([((bx + bw) * ss, by * ss + i), ((bx + bw) * ss, by * ss + i + dash)], fill=255, width=int(2.5 * ss))
            mx, my = bx + bw / 2, by + bh / 2
            d.ellipse([(mx - 5) * ss, (my - 5) * ss, (mx + 5) * ss, (my + 5) * ss], fill=255)

    mk = mask(w, h, marks)
    rgb = shade(height, albedo, strength=8, spec=0.05, shin=12, ambient=0.4)
    rgb = lerp(rgb, C["amber"], mk)
    return rgb


def hero_poster(w, h, rng):
    """Static fallback for the WebGL hero: embossed surface revealing ink layers."""
    fab = fabric_height(h, w, rng)
    x, y = grid(h, w)
    cx, cy = w * 0.62, h * 0.5
    R = min(w, h) * 0.55

    def draw(d, ss):
        for k in range(9):
            pts = [(px * ss, py * ss) for px, py in tri(cx, cy, R * (1 - k * 0.1))]
            d.line(pts + [pts[0]], fill=255, width=int(R * 0.03 * ss), joint="curve")

    m = mask(w, h, draw)
    relief = smoothstep(0.05, 0.9, blur(m, 4))
    ink_t = warped_field(h, w, rng, cell=420)
    reveal = smoothstep(0.35, 0.75, x / w + (ink_t - 0.5) * 0.5)
    ink = palette(ink_t, BRAND)
    albedo = lerp(fill(h, w, C["char"]) * 0.8, ink * 0.95, reveal * relief)
    height = fab * 0.3 + relief
    rgb = shade(height, albedo, strength=10, spec=0.08 + relief * reveal * 0.6, shin=40, ambient=0.25,
                rim=(C["teal"], 0.25))
    return rgb


def hero_poster_light(w, h, rng):
    """Light-theme hero fallback: white embossed fabric with brand ink flooding the relief."""
    fab = fabric_height(h, w, rng)
    x, y = grid(h, w)
    cx, cy = w * 0.64, h * 0.5
    R = min(w, h) * 0.55

    def draw(d, ss):
        for k in range(9):
            pts = [(px * ss, py * ss) for px, py in tri(cx, cy, R * (1 - k * 0.1))]
            d.line(pts + [pts[0]], fill=255, width=int(R * 0.03 * ss), joint="curve")

    m = mask(w, h, draw)
    relief = smoothstep(0.05, 0.9, blur(m, 4))
    ink_t = warped_field(h, w, rng, cell=420)
    reveal = smoothstep(0.3, 0.7, x / w + (ink_t - 0.5) * 0.5)
    ink = palette(ink_t, BRAND)
    base = fill(h, w, hx("#F4F2EE")) * (0.97 + 0.05 * fbm(h, w, 90, rng))[..., None]
    albedo = lerp(base, ink, reveal * relief * 0.95)
    height = fab * 0.25 + relief
    rgb = shade(height, albedo, strength=9, spec=0.1 + relief * reveal * 0.5, shin=40, ambient=0.55)
    # fade the edges and the text side to the white page
    d = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2)
    fade = np.maximum(smoothstep(0.75, 1.5, d), 1 - smoothstep(0.0, 0.55, x / w)) * 0.85
    return lerp(np.clip(rgb, 0, 1), np.ones(3, np.float32), fade)


# ---------------------------------------------------------------- outputs
def main():
    only = sys.argv[1] if len(sys.argv) > 1 else ""
    rng = np.random.default_rng(20260917)
    W, H = 1600, 1200

    print("services/")
    services = {
        "emboss-printing": lambda: emboss(W, H, rng),
        "silicone-hd-printing": lambda: silicone(W, H, rng),
        "hd-printing": lambda: hd_dots(W, H, rng),
        "dtf-printing": lambda: dtf(W, H, rng),
        "sublimation-printing": lambda: sublimation(W, H, rng),
        "screen-printing": lambda: screen(W, H, rng),
        "specialty-printing": lambda: specialty(W, H, rng),
        "heat-transfer": lambda: transfer(W, H, rng),
        "sticker-printing": lambda: stickers(W, H, rng),
        "combination-printing": lambda: combination(W, H, rng),
        "placement-printing": lambda: placement(W, H, rng),
    }
    for slug, fn in services.items():
        if only not in slug:
            continue
        finish(fn(), rng, OUT / "services" / f"{slug}.webp")

    if only in "hero-poster":
        print("hero/")
        finish(hero_poster_light(1600, 1000, rng), rng, OUT / "hero" / "material-poster-light.webp", vig=0.0, grain=0.01)
        finish(hero_poster_light(900, 1200, rng), rng, OUT / "hero" / "material-poster-light-mobile.webp", vig=0.0, grain=0.01)

    print("portfolio/")
    P, L, S = (1000, 1250), (1200, 900), (1100, 1100)
    portfolio = {
        "emboss-tonal-geometry": (P, lambda w, h: emboss(w, h, rng, base="graphite", rim="amber")),
        "emboss-typographic-relief": (L, lambda w, h: emboss(w, h, rng, base="char", rim="red", motif="bars")),
        "silicone-teal-wave": (S, lambda w, h: silicone(w, h, rng, color="teal", waves=9)),
        "silicone-amber-lines": (P, lambda w, h: silicone(w, h, rng, color="orange", waves=14)),
        "hd-halftone-gradient": (L, lambda w, h: hd_dots(w, h, rng, colors=("teal", "tealdeep"), p=24)),
        "hd-raised-dots": (S, lambda w, h: hd_dots(w, h, rng, colors=("red", "maroon"), p=34)),
        "dtf-full-colour-emblem": (P, lambda w, h: dtf(w, h, rng, base="bone", shape="tri")),
        "dtf-dark-garment": (L, lambda w, h: dtf(w, h, rng, base="ink", shape="circle")),
        "sublimation-aop-flow": (P, lambda w, h: sublimation(w, h, rng)),
        "sublimation-sportswear-mesh": (L, lambda w, h: sublimation(w, h, rng, stops=[C["tealdeep"], C["teal"], C["bone"], C["amber"]])),
        "screen-cmyk-halftone": (S, lambda w, h: screen(w, h, rng)),
        "screen-two-colour": (P, lambda w, h: screen(w, h, rng, base="bone", inks=("maroon", "tealdeep", "maroon"))),
        "specialty-foil-flock": (L, lambda w, h: specialty(w, h, rng)),
        "transfer-layered-film": (S, lambda w, h: transfer(w, h, rng)),
        "sticker-die-cut-set": (L, lambda w, h: stickers(w, h, rng)),
        "combination-emboss-silicone": (P, lambda w, h: combination(w, h, rng)),
    }
    for slug, ((w, h), fn) in portfolio.items():
        if only not in slug:
            continue
        finish(fn(w, h), rng, OUT / "portfolio" / f"{slug}.webp")


if __name__ == "__main__":
    main()
