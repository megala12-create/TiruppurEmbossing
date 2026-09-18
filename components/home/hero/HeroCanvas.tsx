"use client";

import { useEffect, useRef } from "react";

/**
 * Signature hero material - a single-pass WebGL fragment shader (no Three.js,
 * no model downloads). It renders a woven textile surface with an embossed,
 * logo-derived triangular relief. As the visitor scrolls, brand-coloured ink
 * floods the relief, gains silicone-like gloss and a transfer-film sheen passes
 * across the surface.
 *
 * Loaded via dynamic import on desktop only; paused when off-screen or when the
 * tab is hidden; resolution adapts if frames are slow.
 */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uScroll;
uniform float uIntro;
uniform vec2 uMouse;

const vec3 TEALD  = vec3(0.004, 0.455, 0.525);
const vec3 TEAL   = vec3(0.000, 0.553, 0.608);
const vec3 AMBER  = vec3(0.984, 0.690, 0.235);
const vec3 ORANGE = vec3(0.969, 0.494, 0.118);
const vec3 RED    = vec3(0.784, 0.110, 0.141);
const vec3 MAROON = vec3(0.561, 0.125, 0.173);

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}
float sdTri(vec2 p, float r) {
  const float k = 1.7320508;
  p.x = abs(p.x) - r;
  p.y = p.y + r / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
  p.x -= clamp(p.x, -2.0 * r, 0.0);
  return -length(p) * sign(p.y);
}
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

vec3 palette(float t) {
  t = clamp(t, 0.0, 1.0) * 5.0;
  if (t < 1.0) return mix(TEALD, TEAL, t);
  if (t < 2.0) return mix(TEAL, AMBER, t - 1.0);
  if (t < 3.0) return mix(AMBER, ORANGE, t - 2.0);
  if (t < 4.0) return mix(ORANGE, RED, t - 3.0);
  return mix(RED, MAROON, t - 4.0);
}

float weave(vec2 p) {
  vec2 f = fract(p), c = floor(p);
  float checker = mod(c.x + c.y, 2.0);
  float warp = pow(sin(3.14159 * f.x), 0.7) * (0.6 + 0.4 * sin(3.14159 * f.y));
  float weft = pow(sin(3.14159 * f.y), 0.7) * (0.6 + 0.4 * sin(3.14159 * f.x));
  return mix(warp, weft, checker);
}

// Relief mask for a point (0..1), shared by height + shading.
float relief(vec2 p, float aspect) {
  vec2 c = vec2(aspect * 0.5 - 0.62, -0.02);
  vec2 q = p - c;
  q *= 1.0 - uScroll * 0.28;
  q = rot(0.05 * sin(uTime * 0.15) + uMouse.x * 0.04) * q;
  float d = sdTri(q, 0.36);
  float rings = abs(fract(d * 16.0 - uTime * 0.04) - 0.5);
  float band = smoothstep(0.3, 0.14, rings);
  float region = smoothstep(0.2, -0.02, d) * smoothstep(-0.34, -0.2, d);
  return band * region;
}

float heightAt(vec2 p, float aspect) {
  return weave(p * 150.0) * 0.05 + relief(p, aspect);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  float eps = 1.0 / uRes.y;

  float h  = heightAt(p, aspect);
  float hx = heightAt(p + vec2(eps, 0.0), aspect);
  float hy = heightAt(p + vec2(0.0, eps), aspect);
  vec3 n = normalize(vec3(-(hx - h) / eps * 0.012, -(hy - h) / eps * 0.012, 1.0));

  float r = relief(p, aspect);

  // Ink flood: sweeps right → left, driven by intro + scroll.
  float inkN = fbm(p * 2.2 + vec2(uTime * 0.02, -uTime * 0.015));
  float reveal = clamp(uIntro * 0.5 + uScroll * 1.1, 0.0, 1.3);
  float s = (aspect * 0.5 - p.x) / aspect + (inkN - 0.5) * 0.45;
  float ink = smoothstep(s - 0.08, s + 0.08, reveal);
  vec3 inkCol = palette(fbm(p * 1.4 + 3.1) * 1.25 - 0.1);

  vec3 base = vec3(0.955, 0.95, 0.94) * (0.96 + 0.06 * fbm(p * 6.0));
  vec3 albedo = mix(base, inkCol, clamp(ink * r * 0.95 + ink * 0.05, 0.0, 1.0));

  vec3 L = normalize(vec3(uMouse.x * 0.9 - 0.45, uMouse.y * 0.7 + 0.55, 0.75));
  float diff = max(dot(n, L), 0.0);
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  float gloss = mix(0.08, 0.9, ink * r);
  float spec = pow(max(dot(n, H), 0.0), mix(18.0, 60.0, ink * r)) * gloss;

  vec3 col = albedo * (0.5 + 0.62 * diff) + spec * vec3(1.0, 0.98, 0.95);

  // Transfer-film sheen band.
  float band = (p.x * 0.55 + p.y) - (uScroll * 2.6 - 1.0);
  col = mix(col, vec3(1.0), exp(-band * band * 40.0) * 0.18);

  // Teal edge tint for precision/technology.
  col = mix(col, TEAL, pow(max(dot(n, normalize(vec3(0.7, -0.5, 0.4))), 0.0), 3.0) * 0.3 * r * (1.0 - ink));

  // Keep the left (text) side calm and fade the edges to the white page.
  col = mix(vec3(1.0), col, mix(0.25, 1.0, smoothstep(-aspect * 0.5, aspect * 0.1, p.x)));
  col = mix(col, vec3(1.0), 0.7 * smoothstep(0.4, 1.1, length(p * vec2(0.75, 1.0))));

  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.015;
  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[hero] shader compile failed", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function HeroCanvas({ onReady }: { onReady: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = {
      res: gl.getUniformLocation(program, "uRes"),
      time: gl.getUniformLocation(program, "uTime"),
      scroll: gl.getUniformLocation(program, "uScroll"),
      intro: gl.getUniformLocation(program, "uIntro"),
      mouse: gl.getUniformLocation(program, "uMouse"),
    };

    const host = canvas.parentElement!;
    let quality = Math.min(window.devicePixelRatio || 1, 1.5);
    const MAX_PIXELS = 2_400_000;

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      let scale = quality;
      if (w * h * scale * scale > MAX_PIXELS) scale = Math.sqrt(MAX_PIXELS / (w * h));
      canvas.width = Math.max(1, Math.round(w * scale));
      canvas.height = Math.max(1, Math.round(h * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u.res, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(host);

    const start = performance.now();
    let raf = 0;
    let readySent = false;
    let slowFrames = 0;
    let last = start;

    function frame(now: number) {
      raf = 0;
      if (!visible || document.hidden) return;
      const t = (now - start) / 1000;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      const scroll = Math.min(1, Math.max(0, window.scrollY / Math.max(1, host.offsetHeight)));
      const intro = 1 - Math.pow(1 - Math.min(1, t / 2.4), 3);

      gl!.uniform1f(u.time, t);
      gl!.uniform1f(u.scroll, scroll);
      gl!.uniform1f(u.intro, intro);
      gl!.uniform2f(u.mouse, mouse.x, mouse.y);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);

      if (!readySent) {
        readySent = true;
        onReady();
      }

      // Adaptive resolution: drop quality if frames are consistently slow.
      const dt = now - last;
      last = now;
      slowFrames = dt > 28 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
      if (slowFrames > 45 && quality > 0.6) {
        quality *= 0.75;
        slowFrames = 0;
        resize();
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    const onVisibility = () => {
      if (!document.hidden && !raf) raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [onReady]);

  return <canvas ref={ref} className="absolute inset-0 block size-full" aria-hidden />;
}
