// Hero scene: Noor's animated character (a video with a separate alpha matte) stands on a
// floating lavender island. When she opens her laptop, light bursts from the screen and
// glossy 3D tiles (HTML, CSS, JS, React…) and little code cards fly out and orbit around her —
// passing in front of and behind her with real depth. Plain WebGL2, no libraries.

import { perspective, lookAt, mul, translate, rotX, rotY, rotZ, scale, lerp, normalize } from './math';
import * as props from './props';
import { TECH, SNIPPETS, drawAtlas } from './techItems';
import { VIDEO } from './videoMeta';

/* ─────────────── shaders ─────────────── */
const LIT_VS = `#version 300 es
in vec3 aPos; in vec3 aNormal; in vec4 aColor;
uniform mat4 uProj, uView, uModel;
out vec3 vN; out vec3 vW; out vec4 vC;
void main(){
  vec4 w = uModel * vec4(aPos, 1.0);
  vW = w.xyz; vN = mat3(uModel) * aNormal; vC = aColor;
  gl_Position = uProj * uView * w;
}`;
const LIT_FS = `#version 300 es
precision highp float;
in vec3 vN; in vec3 vW; in vec4 vC;
uniform vec3 uCam; uniform float uAlpha;
out vec4 o;
void main(){
  vec3 N = normalize(vN); vec3 V = normalize(uCam - vW);
  if (dot(N, V) < 0.0) N = -N;
  vec3 L = normalize(vec3(-0.45, 0.85, 0.6));
  float soft = smoothstep(0.08, 0.92, clamp((dot(N, L) + 0.4) / 1.4, 0.0, 1.0));
  vec3 hemi = mix(vec3(0.78, 0.88, 0.9), vec3(0.98, 0.96, 1.0), N.y * 0.5 + 0.5);
  vec3 col = vC.rgb * (hemi * 0.6 + vec3(1.0, 0.97, 0.93) * soft * 0.52);
  float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  col += rim * vec3(0.86, 0.8, 1.0) * 0.26;
  if (vC.a > 2.5) col = vC.rgb * 1.04 + rim * 0.08;
  float d = length(uCam - vW);
  col = mix(col, vec3(0.95, 0.93, 0.97), smoothstep(7.5, 12.0, d) * 0.7);
  o = vec4(col * uAlpha, uAlpha);
}`;

const TILE_VS = `#version 300 es
in vec3 aPos; in vec3 aNormal; in vec2 aUV; in float aFace;
uniform mat4 uProj, uView, uModel;
out vec3 vN; out vec3 vW; out vec2 vUV; out float vFace;
void main(){
  vec4 w = uModel * vec4(aPos, 1.0);
  vW = w.xyz; vN = mat3(uModel) * aNormal; vUV = aUV; vFace = aFace;
  gl_Position = uProj * uView * w;
}`;
const TILE_FS = `#version 300 es
precision highp float;
in vec3 vN; in vec3 vW; in vec2 vUV; in float vFace;
uniform sampler2D uAtlas; uniform vec4 uCell; uniform vec3 uCam, uEdge; uniform float uAlpha, uTime, uShine;
out vec4 o;
void main(){
  vec3 N = normalize(vN); vec3 V = normalize(uCam - vW);
  vec3 L = normalize(vec3(-0.4, 0.8, 0.7));
  float diff = clamp((dot(N, L) + 0.5) / 1.5, 0.0, 1.0);
  float rim = pow(1.0 - abs(dot(N, V)), 2.5);
  vec3 col;
  float a = 1.0;
  if (vFace > 0.5) {
    vec4 t = texture(uAtlas, mix(uCell.xy, uCell.zw, vUV));
    if (t.a < 0.04) discard;
    col = t.rgb / max(t.a, 0.001);
    a = t.a;
    // a glossy light sweep across the face
    float sweep = smoothstep(0.12, 0.0, abs(vUV.x + vUV.y * 0.6 - fract(uTime * 0.18 + uShine) * 2.6 + 0.4));
    col += sweep * 0.35;
    col *= 0.86 + diff * 0.2;
  } else {
    col = uEdge * (0.75 + diff * 0.35);
  }
  col += rim * vec3(0.9, 0.85, 1.0) * 0.35;
  float al = a * uAlpha;
  o = vec4(col * al, al);
}`;

const VID_VS = `#version 300 es
in vec2 aPos;
uniform mat4 uProj, uView, uModel;
out vec2 vUV;
void main(){ vUV = aPos + 0.5; gl_Position = uProj * uView * uModel * vec4(aPos, 0.0, 1.0); }`;
const VID_FS = `#version 300 es
precision highp float;
in vec2 vUV;
uniform sampler2D uVid; uniform float uSplit, uAlphaOff, uOpacity, uDepthPass;
out vec4 o;
void main(){
  float v = 1.0 - vUV.y;
  vec3 col = texture(uVid, vec2(vUV.x, v * uSplit)).rgb;
  float a = texture(uVid, vec2(vUV.x, uAlphaOff + v * uSplit)).r;
  a = smoothstep(0.06, 0.9, a) * uOpacity;
  if (uDepthPass > 0.5) { if (a < 0.55) discard; o = vec4(0.0); return; }
  if (a < 0.003) discard;
  o = vec4(col * a, a);
}`;

const FX_VS = `#version 300 es
in vec2 aPos;
uniform mat4 uProj, uView, uModel;
out vec2 vQ;
void main(){ vQ = aPos; gl_Position = uProj * uView * uModel * vec4(aPos, 0.0, 1.0); }`;
const FX_FS = `#version 300 es
precision highp float;
in vec2 vQ;
uniform vec3 uColor; uniform float uAlpha; uniform int uMode;
out vec4 o;
void main(){
  float a;
  if (uMode == 0) { a = pow(max(0.0, 1.0 - length(vQ) * 2.0), 2.2); }            // soft glow
  else if (uMode == 2) { float r = length(vQ) * 2.0; a = exp(-pow((r - 0.86) / 0.05, 2.0)) + exp(-pow((r - 0.7) / 0.12, 2.0)) * 0.25; } // shock ring
  else { a = smoothstep(0.5, 0.0, abs(vQ.y)) * smoothstep(0.5, -0.1, vQ.x) * smoothstep(-0.5, -0.35, vQ.x); } // light ray
  a *= uAlpha;
  o = vec4(uColor * a, a);
}`;

const PT_VS = `#version 300 es
in vec3 aPos; in vec3 aVel; in float aSeed;
uniform mat4 uProj, uView; uniform float uT, uPR, uStream; uniform vec3 uOrigin;
out float vA; out float vSeed;
void main(){
  float t = uT;
  vec3 p;
  if (uStream > 0.5) {
    // little motes drifting up from the screen while she types
    float y = mod(t * (0.25 + aSeed * 0.25) + aSeed * 7.0, 1.9);
    p = uOrigin + vec3(aVel.x * 0.12 * y + sin(t * 1.3 + aSeed * 30.0) * 0.06, y, aVel.z * 0.08 * y);
    vA = sin(3.14159 * y / 1.9) * 0.75;
  } else {
    p = uOrigin + aVel * (1.0 - exp(-t * 2.2)) / 2.2 + vec3(0.0, -0.08 * t * t, 0.0) + aPos;
    vA = clamp(1.0 - t / (1.1 + aSeed * 0.9), 0.0, 1.0);
  }
  vec4 mv = uView * vec4(p, 1.0);
  gl_Position = uProj * mv;
  gl_PointSize = uPR * (3.0 + aSeed * 7.0) * (5.0 / -mv.z) * (uStream > 0.5 ? 0.6 : 1.0);
  vSeed = aSeed;
}`;
const PT_FS = `#version 300 es
precision highp float;
in float vA; in float vSeed;
out vec4 o;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  vec3 c = vSeed < 0.33 ? vec3(0.73, 0.67, 0.86) : vSeed < 0.66 ? vec3(0.71, 0.85, 0.86) : vec3(1.0, 0.92, 0.78);
  float a = pow(1.0 - d * 2.0, 1.5) * vA;
  o = vec4(c * a, a);
}`;

/* ─────────────── helpers ─────────────── */
function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}
function program(gl, vs, fs, attrs) {
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  attrs.forEach((a, i) => gl.bindAttribLocation(p, i, a));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const u = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const { name } = gl.getActiveUniform(p, i);
    u[name] = gl.getUniformLocation(p, name);
  }
  return { p, u };
}
function vao(gl, arrays, indices) {
  const v = gl.createVertexArray();
  gl.bindVertexArray(v);
  const bufs = arrays.map(([data, size], loc) => {
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    return b;
  });
  let count = arrays[0][0].length / arrays[0][1];
  if (indices) {
    const ib = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    bufs.push(ib);
    count = indices.length;
  }
  gl.bindVertexArray(null);
  return { vao: v, count, bufs, indexed: !!indices };
}

/** Rounded-rectangle slab: front face carries the atlas UVs; sides get the edge colour. */
function roundedSlab(w, h, d, r, seg = 6) {
  const outline = [];
  const corners = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, Math.PI / 2], [-w / 2 + r, -h / 2 + r, Math.PI], [w / 2 - r, -h / 2 + r, Math.PI * 1.5]];
  corners.forEach(([cx, cy, a0]) => {
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (i / seg) * (Math.PI / 2);
      outline.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  });
  const pos = [], nor = [], uv = [], face = [], idx = [];
  const push = (p, n, t, f) => {
    pos.push(...p); nor.push(...n); uv.push(...t); face.push(f);
    return pos.length / 3 - 1;
  };
  [1, -1].forEach((s) => {
    const z = (s * d) / 2;
    const c = push([0, 0, z], [0, 0, s], [0.5, 0.5], s > 0 ? 1 : 0);
    const ring = outline.map(([x, y]) => push([x, y, z], [0, 0, s], [x / w + 0.5, 0.5 - y / h], s > 0 ? 1 : 0));
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i], b = ring[(i + 1) % ring.length];
      if (s > 0) idx.push(c, a, b);
      else idx.push(c, b, a);
    }
  });
  for (let i = 0; i < outline.length; i++) {
    const [x0, y0] = outline[i];
    const [x1, y1] = outline[(i + 1) % outline.length];
    const n = normalize([y1 - y0, -(x1 - x0), 0]);
    const nn = [-n[0], -n[1], 0];
    const a = push([x0, y0, d / 2], nn, [0, 0], 0);
    const b = push([x1, y1, d / 2], nn, [0, 0], 0);
    const c2 = push([x1, y1, -d / 2], nn, [0, 0], 0);
    const e = push([x0, y0, -d / 2], nn, [0, 0], 0);
    idx.push(a, b, c2, a, c2, e);
  }
  return { pos: new Float32Array(pos), nor: new Float32Array(nor), uv: new Float32Array(uv), face: new Float32Array(face), idx: new Uint32Array(idx) };
}

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
const easeOutBack = (x) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);
const hexRGB = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

function rng(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

/* ─────────────── scene ─────────────── */
export default class HeroScene {
  constructor(canvas, video, { lite = false, reducedMotion = false } = {}) {
    const gl = canvas.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: true });
    if (!gl) throw new Error('WebGL2 unavailable');
    this.gl = gl;
    this.canvas = canvas;
    this.video = video;
    this.lite = lite;
    this.reduced = reducedMotion;
    this.pointer = { x: 0, y: 0 };
    this.cam = { x: 0, y: 0 };
    this.start = performance.now();
    this.openedAt = reducedMotion ? -100 : null; // seconds (scene clock) when the laptop opened
    this.closing = null;

    this.lit = program(gl, LIT_VS, LIT_FS, ['aPos', 'aNormal', 'aColor']);
    this.tile = program(gl, TILE_VS, TILE_FS, ['aPos', 'aNormal', 'aUV', 'aFace']);
    this.vid = program(gl, VID_VS, VID_FS, ['aPos']);
    this.fx = program(gl, FX_VS, FX_FS, ['aPos']);
    this.pt = program(gl, PT_VS, PT_FS, ['aPos', 'aVel', 'aSeed']);

    // meshes
    const up = (g) => vao(gl, [[g.positions, 3], [g.normals, 3], [g.colors, 4]], g.indices);
    this.m = {
      island: up(props.island({ detail: lite ? 0.6 : 1 })),
      sprig: up(props.lavenderSprig()),
      sprigTall: up(props.lavenderSprig({ height: 0.55, buds: 11 })),
      flowers: props.flowerColors.map(([p, c]) => up(props.flower(p, c))),
      sparkle: up(props.sparkle()),
      quad: vao(gl, [[new Float32Array([-0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5]), 2]]),
    };
    const disc = props.disc();
    this.m.disc = vao(gl, [[disc.positions, 3]], disc.indices);
    const tileG = roundedSlab(0.42, 0.42, 0.07, 0.09);
    this.m.tile = vao(gl, [[tileG.pos, 3], [tileG.nor, 3], [tileG.uv, 2], [tileG.face, 1]], tileG.idx);
    const cardG = roundedSlab(0.9, 0.45, 0.035, 0.07);
    this.m.card = vao(gl, [[cardG.pos, 3], [cardG.nor, 3], [cardG.uv, 2], [cardG.face, 1]], cardG.idx);

    // burst particles
    const r = rng(11);
    const N = lite ? 70 : 140;
    const pp = [], pv = [], ps = [];
    for (let i = 0; i < N; i++) {
      const a = r() * Math.PI * 2, b = (r() - 0.3) * Math.PI;
      const sp = 1.2 + r() * 2.6;
      pp.push((r() - 0.5) * 0.1, (r() - 0.5) * 0.1, 0);
      pv.push(Math.cos(a) * Math.cos(b) * sp, Math.abs(Math.sin(b)) * sp * 0.9 + 0.4, Math.sin(a) * Math.cos(b) * sp * 0.6);
      ps.push(r());
    }
    this.m.burst = vao(gl, [[new Float32Array(pp), 3], [new Float32Array(pv), 3], [new Float32Array(ps), 1]]);

    // textures
    this.vidTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.vidTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    this.hasFrame = false;

    const atlas = drawAtlas(lite ? 0.75 : 1);
    this.cells = atlas.cells;
    this.atlasTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.atlasTex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.canvas);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    const aniso = gl.getExtension('EXT_texture_filter_anisotropic');
    if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 4);

    this.layout();
    this.resize();
  }

  layout() {
    const r = rng(5);
    // character quad in world units: feet at y = 0
    this.charH = 3.15;
    this.charW = this.charH * (VIDEO.width / VIDEO.colorHeight);
    this.feetPad = VIDEO.feetPad * this.charH; // transparent rows under her feet

    // orbiting items
    const snippets = this.lite ? SNIPPETS.slice(0, 2) : SNIPPETS;
    const tiles = TECH.map((t, i) => ({ kind: 'tile', cell: this.cells[i], edge: hexRGB(t.to), featured: !!t.featured, label: t.label }));
    const cards = snippets.map((s, i) => ({ kind: 'card', cell: this.cells[TECH.length + i], edge: hexRGB(s.tint) }));
    const featured = tiles.filter((t) => t.featured);
    const rest = [...tiles.filter((t) => !t.featured), ...cards];
    // React & Claude get their own spots beside her head, swaying on short arcs
    this.items = featured.map((it, i) => ({
      ...it,
      arc: true,
      delay: 0.05 + i * 0.12,
      phase: i === 0 ? Math.PI + 0.25 : -0.25,
      amp: 0.32,
      radius: 1.38,
      height: 2.75 + i * 0.12,
      speed: 0.45 + i * 0.1,
      bob: r() * 6.28,
      spin: (r() - 0.5) * 0.8,
      tilt: (r() - 0.5) * 0.3,
      s: 1.3,
    }));
    // everything else orbits below her shoulders, spread over two rings
    const n = rest.length;
    rest.forEach((it, i) => {
      const ring = i % 2;
      this.items.push({
        ...it,
        delay: 0.3 + i * 0.09,
        phase: (i / n) * Math.PI * 2 + r() * 0.25,
        radius: [1.15, 1.5][ring] + r() * 0.08,
        height: 0.55 + ((i * 0.618) % 1) * 1.6,
        speed: (0.15 + r() * 0.06) * (ring ? -1 : 1),
        bob: r() * 6.28,
        spin: (r() - 0.5) * 0.8,
        tilt: (r() - 0.5) * 0.5,
        s: it.kind === 'card' ? 0.8 + r() * 0.08 : 0.82 + r() * 0.2,
      });
    });

    this.sprigs = [
      [-0.78, 0.3, 'sprigTall'], [-0.86, 0.05, 'sprig'], [-0.62, 0.52, 'sprig'], [-0.5, 0.66, 'sprig'],
      [0.78, 0.28, 'sprig'], [0.88, 0.0, 'sprigTall'], [0.66, -0.48, 'sprig'], [-0.32, -0.72, 'sprigTall'],
      [0.26, -0.76, 'sprig'], [0.55, 0.62, 'sprig'], [-0.7, -0.4, 'sprig'],
    ].map(([x, z, k]) => ({ x, z, k, ry: r() * 6.28, tilt: (r() - 0.5) * 0.3, s: 0.85 + r() * 0.4 }));
    this.flowers = [[-1.9, 3.3, -1.2], [2.0, 3.05, -1.0], [-2.1, 0.5, 0.4], [2.15, 0.8, 0.2]].map((p, i) => ({ p, k: i % 4, ph: r() * 6.28, s: 0.9 + r() * 0.5 }));
    this.sparkles = [[-1.6, 3.6, -0.5], [1.7, 3.6, -0.6], [-2.3, 1.9, -0.8], [2.4, 2.1, -0.8], [0.3, 3.9, -1.2]].map((p) => ({ p, ph: r() * 6.28, s: 0.5 + r() * 0.6 }));
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, this.lite ? 1.5 : 2);
    const { clientWidth: w, clientHeight: h } = this.canvas;
    this.canvas.width = Math.max(1, Math.round(w * dpr));
    this.canvas.height = Math.max(1, Math.round(h * dpr));
    this.dpr = dpr;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.aspect = w / Math.max(1, h);
    const narrow = this.aspect < 0.95;
    this.baseEye = narrow ? [0, 1.85, 8.3] : [0, 1.8, 7.8];
    this.target = [0, 1.55, 0];
    this.proj = perspective(narrow ? 0.54 : 0.5, this.aspect, 0.1, 50);
  }

  setPointer(x, y) {
    this.pointer.x = Math.max(-1, Math.min(1, x));
    this.pointer.y = Math.max(-1, Math.min(1, y));
  }

  /** start the item show again (used by "watch again") */
  reset() {
    if (this.openedAt != null) this.closing = this.clock();
    this.openedAt = null;
  }

  clock() {
    return (performance.now() - this.start) / 1000;
  }

  uploadVideo() {
    const v = this.video;
    if (!v || v.readyState < 2) return;
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.vidTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v);
    this.hasFrame = true;
  }

  /** world position of the laptop screen at the moment it opens */
  laptopPoint() {
    const [u, v] = VIDEO.laptop; // fraction of the colour frame (0..1, from top-left)
    return [(u - 0.5) * this.charW, this.charH * (1 - v) - this.feetPad, 0.12];
  }

  itemPos(it, t, since) {
    const a = it.arc ? it.phase + Math.sin(t * it.speed + it.bob) * it.amp : it.phase + t * it.speed;
    const orbit = [Math.cos(a) * it.radius, it.height + Math.sin(t * 0.9 + it.bob) * 0.09, Math.sin(a) * it.radius * 0.62];
    const k = clamp01((since - it.delay) / 1.25);
    if (k >= 1) return { p: orbit, k: 1 };
    const e = easeOutCubic(k);
    const L = this.laptopPoint();
    const ctrl = [L[0] + (orbit[0] - L[0]) * 0.3, Math.max(L[1], orbit[1]) + 0.9, L[2] + 0.9];
    const q = (x0, x1, x2) => (1 - e) * (1 - e) * x0 + 2 * (1 - e) * e * x1 + e * e * x2;
    return { p: [q(L[0], ctrl[0], orbit[0]), q(L[1], ctrl[1], orbit[1]), q(L[2], ctrl[2], orbit[2])], k };
  }

  render(now = performance.now()) {
    const gl = this.gl;
    const t = this.reduced ? 30 : (now - this.start) / 1000;
    const dt = Math.min(0.1, Math.max(0, (now - (this.last || now)) / 1000));
    this.last = now;
    if (this.hasVideoChanged()) this.uploadVideo();

    // the laptop opens at VIDEO.openAt seconds into the clip
    const vt = this.video ? this.video.currentTime : 99;
    if (this.openedAt == null && !this.reduced && vt >= VIDEO.openAt && vt < VIDEO.openAt + 2.5) this.openedAt = t;
    const since = this.openedAt == null ? -1 : t - this.openedAt;

    // gentle camera parallax toward the cursor
    const k = this.reduced ? 1 : 1 - Math.exp(-dt * 2.5);
    this.cam.x = lerp(this.cam.x, this.pointer.x * 0.9, k);
    this.cam.y = lerp(this.cam.y, -this.pointer.y * 0.45, k);
    const eye = [this.baseEye[0] + this.cam.x, this.baseEye[1] + this.cam.y, this.baseEye[2]];
    this.eye = eye;
    this.view = lookAt(eye, this.target);

    const floatY = this.reduced ? 0 : Math.sin(t * 0.8) * 0.04;
    const world = translate(0, floatY, 0);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    /* island + decor */
    const L = this.lit;
    gl.useProgram(L.p);
    gl.uniformMatrix4fv(L.u.uProj, false, this.proj);
    gl.uniformMatrix4fv(L.u.uView, false, this.view);
    gl.uniform3fv(L.u.uCam, eye);
    gl.uniform1f(L.u.uAlpha, 1);
    gl.depthMask(true);
    const islandM = mul(world, translate(0, -0.02, 0), scale(1.15, 1, 1.15));
    this.drawEl(L, this.m.island, islandM);
    this.sprigs.forEach((s, i) => {
      const sway = this.reduced ? 0 : Math.sin(t * 1.2 + i) * 0.06;
      this.drawEl(L, this.m[s.k], mul(islandM, translate(s.x, -0.01, s.z * 0.92), rotY(s.ry), rotZ(s.tilt + sway), scale(s.s)));
    });
    this.flowers.forEach((f) => {
      const bob = this.reduced ? 0 : Math.sin(t * 0.7 + f.ph) * 0.08;
      this.drawEl(L, this.m.flowers[f.k], mul(translate(f.p[0], f.p[1] + bob, f.p[2]), rotX(1.15), rotY(this.reduced ? f.ph : t * 0.3 + f.ph), scale(f.s)));
    });
    this.sparkles.forEach((s) => {
      const tw = this.reduced ? 1 : 0.75 + 0.35 * Math.sin(t * 2.2 + s.ph);
      this.drawEl(L, this.m.sparkle, mul(translate(...s.p), scale(s.s * tw)));
    });

    /* items: split into behind / in front of her */
    const positions = this.items.map((it) => {
      if (since < 0) return null;
      const { p, k: fk } = this.itemPos(it, t, since);
      return { it, p: [p[0], p[1] + floatY, p[2]], fk };
    });
    const behind = positions.filter((x) => x && x.p[2] < 0);
    const front = positions.filter((x) => x && x.p[2] >= 0);
    behind.sort((a, b) => a.p[2] - b.p[2]);
    front.sort((a, b) => a.p[2] - b.p[2]);
    this.drawItems(behind, t, since);

    /* soft contact shadow */
    this.drawShadow(world);

    /* the character */
    this.drawCharacter(world);

    /* glow from the laptop + rays + burst */
    this.drawLaptopLight(t, since, floatY);

    this.drawItems(front, t, since);

    gl.depthMask(true);
    gl.bindVertexArray(null);
  }

  hasVideoChanged() {
    const v = this.video;
    if (!v) return false;
    const changed = v.currentTime !== this.lastVT || !this.hasFrame;
    this.lastVT = v.currentTime;
    return changed;
  }

  drawEl(prog, mesh, model) {
    const gl = this.gl;
    gl.uniformMatrix4fv(prog.u.uModel, false, model);
    gl.bindVertexArray(mesh.vao);
    if (mesh.indexed) gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_INT, 0);
    else gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
  }

  billboard(pos, sx, sy, roll = 0) {
    // a quad facing the camera
    const f = normalize([this.eye[0] - pos[0], this.eye[1] - pos[1], this.eye[2] - pos[2]]);
    const yaw = Math.atan2(f[0], f[2]);
    const pitch = -Math.asin(f[1]);
    return mul(translate(...pos), rotY(yaw), rotX(pitch), rotZ(roll), scale(sx, sy, 1));
  }

  drawCharacter(world) {
    if (!this.hasFrame) return;
    const gl = this.gl;
    const V = this.vid;
    gl.useProgram(V.p);
    gl.uniformMatrix4fv(V.u.uProj, false, this.proj);
    gl.uniformMatrix4fv(V.u.uView, false, this.view);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.vidTex);
    gl.uniform1i(V.u.uVid, 0);
    gl.uniform1f(V.u.uSplit, VIDEO.colorHeight / VIDEO.totalHeight);
    gl.uniform1f(V.u.uAlphaOff, VIDEO.alphaOffset / VIDEO.totalHeight);
    gl.uniform1f(V.u.uOpacity, 1);
    // she always faces the camera (a cut-out standing on the island)
    const pos = [0, this.charH / 2 - this.feetPad, 0];
    const f = normalize([this.eye[0] - pos[0], 0, this.eye[2] - pos[2]]);
    const model = mul(world, translate(...pos), rotY(Math.atan2(f[0], f[2])), scale(this.charW, this.charH, 1));
    // depth pass (opaque core) then colour pass
    gl.colorMask(false, false, false, false);
    gl.depthMask(true);
    gl.uniform1f(V.u.uDepthPass, 1);
    this.drawEl(V, this.m.quad, model);
    gl.colorMask(true, true, true, true);
    gl.depthMask(false);
    gl.uniform1f(V.u.uDepthPass, 0);
    this.drawEl(V, this.m.quad, model);
    gl.depthMask(true);
  }

  drawShadow(world) {
    const gl = this.gl;
    const F = this.fx;
    gl.useProgram(F.p);
    gl.uniformMatrix4fv(F.u.uProj, false, this.proj);
    gl.uniformMatrix4fv(F.u.uView, false, this.view);
    gl.uniform1i(F.u.uMode, 0);
    gl.uniform3fv(F.u.uColor, [0.22, 0.35, 0.41]);
    gl.uniform1f(F.u.uAlpha, 0.35);
    gl.depthMask(false);
    this.drawEl(F, this.m.quad, mul(world, translate(0, 0.012, 0.05), rotX(-Math.PI / 2), scale(1.5, 0.8, 1)));
    gl.depthMask(true);
  }

  drawLaptopLight(t, since, floatY) {
    if (since < 0 && this.closing == null) return;
    const gl = this.gl;
    const Lp = this.laptopPoint();
    const origin = [Lp[0], Lp[1] + floatY, Lp[2] + 0.05];
    const F = this.fx;
    gl.useProgram(F.p);
    gl.uniformMatrix4fv(F.u.uProj, false, this.proj);
    gl.uniformMatrix4fv(F.u.uView, false, this.view);
    gl.depthMask(false);
    gl.blendFunc(gl.ONE, gl.ONE); // additive light
    if (since >= 0) {
      // burst flash
      const flash = clamp01(since / 0.35) * (1 - clamp01((since - 0.35) / 1.2));
      if (flash > 0.01) {
        gl.uniform1i(F.u.uMode, 0);
        gl.uniform3fv(F.u.uColor, [0.93, 0.89, 1.0]);
        gl.uniform1f(F.u.uAlpha, flash * 0.7);
        this.drawEl(F, this.m.quad, this.billboard(origin, 1.9 * easeOutBack(clamp01(since / 0.6)), 1.9 * easeOutBack(clamp01(since / 0.6))));
        // light rays
        gl.uniform1i(F.u.uMode, 1);
        for (let i = 0; i < 9; i++) {
          const ang = (i / 9) * Math.PI * 2 + t * 0.4;
          const len = 1.6 + (i % 3) * 0.5;
          gl.uniform3fv(F.u.uColor, i % 2 ? [0.72, 0.66, 0.9] : [0.7, 0.88, 0.9]);
          gl.uniform1f(F.u.uAlpha, flash * 0.55);
          const bb = this.billboard(origin, 1, 1, 0);
          this.drawEl(F, this.m.quad, mul(bb, rotZ(ang), translate(len * 0.5 * easeOutCubic(clamp01(since / 0.5)), 0, 0), scale(len, 0.06, 1)));
        }
      }
      // a soft shock ring that expands from the screen
      if (since < 1.4) {
        const k = easeOutCubic(clamp01(since / 1.4));
        gl.uniform1i(F.u.uMode, 2);
        gl.uniform3fv(F.u.uColor, [0.82, 0.76, 1.0]);
        gl.uniform1f(F.u.uAlpha, (1 - k) * 0.9);
        this.drawEl(F, this.m.quad, this.billboard(origin, 0.4 + k * 4.2, 0.4 + k * 4.2));
      }
      // the screen keeps glowing softly while she types
      const pulse = 0.28 + Math.sin(t * 3.1) * 0.06;
      gl.uniform1i(F.u.uMode, 0);
      gl.uniform3fv(F.u.uColor, [0.8, 0.76, 1.0]);
      gl.uniform1f(F.u.uAlpha, clamp01(since / 0.8) * pulse);
      this.drawEl(F, this.m.quad, this.billboard(origin, 1.1, 0.8));

      // particle burst, then a gentle stream of motes while she types
      const P = this.pt;
      gl.useProgram(P.p);
      gl.uniformMatrix4fv(P.u.uProj, false, this.proj);
      gl.uniformMatrix4fv(P.u.uView, false, this.view);
      gl.uniform1f(P.u.uPR, this.dpr);
      gl.uniform3fv(P.u.uOrigin, origin);
      gl.bindVertexArray(this.m.burst.vao);
      if (since < 2.4) {
        gl.uniform1f(P.u.uStream, 0);
        gl.uniform1f(P.u.uT, since);
        gl.drawArrays(gl.POINTS, 0, this.m.burst.count);
      }
      if (since > 1.0) {
        gl.uniform1f(P.u.uStream, 1);
        gl.uniform1f(P.u.uT, t);
        gl.drawArrays(gl.POINTS, 0, Math.min(this.lite ? 18 : 34, this.m.burst.count));
      }
    }
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(true);
  }

  /** screen-space distance (in NDC) between an item and the cursor */
  hoverAmount(p) {
    if (!this.ndc) return 0;
    const m = mul(this.proj, this.view);
    const x = m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12];
    const y = m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13];
    const w = m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15];
    const dx = (x / w - this.ndc[0]) * this.aspect;
    const dy = y / w - this.ndc[1];
    return Math.max(0, 1 - Math.hypot(dx, dy) / 0.22);
  }

  drawItems(list, t, since) {
    if (!list.length) return;
    const gl = this.gl;
    const T = this.tile;
    const F = this.fx;
    list.forEach(({ it, p, fk }) => {
      // ease a per-item hover value so tiles respond to the cursor
      const target = this.reduced || fk < 1 ? 0 : this.hoverAmount(p);
      it.h = lerp(it.h || 0, target, 0.15);
      const pop = this.reduced ? 1 : easeOutBack(clamp01(fk * 1.3));
      const sc = Math.max(0.001, it.s * (0.25 + 0.75 * pop) * (1 + it.h * 0.22));

      // soft halo behind React, Claude and whatever the cursor is near
      const halo = (it.featured ? 0.35 + Math.sin(t * 2 + it.bob) * 0.08 : 0) + it.h * 0.5;
      if (halo > 0.02 && fk > 0.3) {
        gl.useProgram(F.p);
        gl.uniformMatrix4fv(F.u.uProj, false, this.proj);
        gl.uniformMatrix4fv(F.u.uView, false, this.view);
        gl.uniform1i(F.u.uMode, 0);
        gl.uniform3fv(F.u.uColor, it.edge.map((c) => Math.min(1, c * 0.7 + 0.35)));
        gl.uniform1f(F.u.uAlpha, halo * clamp01(fk));
        gl.depthMask(false);
        gl.blendFunc(gl.ONE, gl.ONE);
        this.drawEl(F, this.m.quad, this.billboard([p[0], p[1], p[2] - 0.05], sc * 1.5, sc * 1.5));
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthMask(true);
      }

      gl.useProgram(T.p);
      gl.uniformMatrix4fv(T.u.uProj, false, this.proj);
      gl.uniformMatrix4fv(T.u.uView, false, this.view);
      gl.uniform3fv(T.u.uCam, this.eye);
      gl.uniform1f(T.u.uTime, t);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.atlasTex);
      gl.uniform1i(T.u.uAtlas, 1);
      // mostly face the camera, with a gentle personal wobble so the thickness shows
      const f = normalize([this.eye[0] - p[0], 0, this.eye[2] - p[2]]);
      const wob = (this.reduced ? it.tilt : Math.sin(t * 0.8 + it.bob) * 0.35 + it.spin * (1 - fk) * 6) * (1 - it.h);
      const yaw = Math.atan2(f[0], f[2]) + wob + it.h * Math.sin(t * 6) * 0.08;
      const model = mul(translate(...p), rotY(yaw), rotX(Math.sin(t * 0.6 + it.bob) * 0.15 * (1 - it.h)), rotZ(it.tilt * 0.4 * (1 - it.h)), scale(sc));
      gl.uniform4f(T.u.uCell, it.cell.u0, it.cell.v0, it.cell.u1, it.cell.v1);
      gl.uniform3fv(T.u.uEdge, it.edge);
      gl.uniform1f(T.u.uShine, it.bob);
      gl.uniform1f(T.u.uAlpha, this.reduced ? 1 : clamp01(fk * 4));
      this.drawEl(T, it.kind === 'card' ? this.m.card : this.m.tile, model);
    });
  }

  setPointerNDC(x, y) {
    this.ndc = [x, y];
  }

  dispose() {
    const gl = this.gl;
    Object.values(this.m).flat().forEach((m) => {
      gl.deleteVertexArray(m.vao);
      m.bufs.forEach((b) => gl.deleteBuffer(b));
    });
    gl.deleteTexture(this.vidTex);
    gl.deleteTexture(this.atlasTex);
    [this.lit, this.tile, this.vid, this.fx, this.pt].forEach((p) => gl.deleteProgram(p.p));
  }
}
