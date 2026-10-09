// Procedural, vertex-coloured geometry for the little world.
// Every builder returns a "part": { positions:[], indices:[], colors:[] } where each
// vertex colour is [r, g, b, material]. `finalize` merges parts and welds normals.
//
// material ids:  0 = matte fabric/clay   1 = skin   2 = glossy (eyes, screens)   3 = glow (emissive)

import { normalize } from './math';

export const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

function paint(positions, color, mat) {
  const colors = [];
  for (let i = 0; i < positions.length; i += 3) {
    const c = typeof color === 'function' ? color(positions[i], positions[i + 1], positions[i + 2]) : color;
    colors.push(c[0], c[1], c[2], mat);
  }
  return colors;
}

/** Surface of revolution. profile = [[r, y], ...]; front is +Z. `warp(p, t, j)` may move vertices. */
export function lathe(profile, { seg = 48, t0 = 0, t1 = Math.PI * 2, sx = 1, sz = 1, at = [0, 0, 0], warp, color = [1, 1, 1], mat = 0 } = {}) {
  const positions = [];
  const indices = [];
  const n = profile.length;
  for (let i = 0; i <= seg; i++) {
    const t = t0 + ((t1 - t0) * i) / seg;
    for (let j = 0; j < n; j++) {
      const [r, y] = profile[j];
      let p = [r * Math.sin(t) * sx, y, r * Math.cos(t) * sz];
      if (warp) p = warp(p, t, j);
      positions.push(p[0] + at[0], p[1] + at[1], p[2] + at[2]);
    }
  }
  for (let i = 0; i < seg; i++) {
    for (let j = 0; j < n - 1; j++) {
      const a = i * n + j, b = (i + 1) * n + j;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  return { positions, indices, colors: paint(positions, color, mat) };
}

/** Ellipsoid; `keep(x,y,z)` (local, unit-free) can cut away triangles (e.g. a face opening). */
export function ellipsoid(c, r, { w = 28, h = 20, color = [1, 1, 1], mat = 0, keep, rotate } = {}) {
  const positions = [];
  const indices = [];
  for (let y = 0; y <= h; y++) {
    const phi = (y / h) * Math.PI;
    for (let x = 0; x <= w; x++) {
      const th = (x / w) * Math.PI * 2;
      let p = [r[0] * Math.sin(phi) * Math.sin(th), r[1] * Math.cos(phi), r[2] * Math.sin(phi) * Math.cos(th)];
      if (rotate) p = rotate(p);
      positions.push(c[0] + p[0], c[1] + p[1], c[2] + p[2]);
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = y * (w + 1) + x, b = a + w + 1;
      const tris = [[a, b, a + 1], [b, b + 1, a + 1]];
      for (const t of tris) {
        if (keep) {
          const cx = (positions[t[0] * 3] + positions[t[1] * 3] + positions[t[2] * 3]) / 3;
          const cy = (positions[t[0] * 3 + 1] + positions[t[1] * 3 + 1] + positions[t[2] * 3 + 1]) / 3;
          const cz = (positions[t[0] * 3 + 2] + positions[t[1] * 3 + 2] + positions[t[2] * 3 + 2]) / 3;
          if (!keep(cx, cy, cz)) continue;
        }
        indices.push(...t);
      }
    }
  }
  return { positions, indices, colors: paint(positions, color, mat) };
}

export function torus(c, R, r, { seg = 40, tube = 12, rotate = (p) => p, color = [1, 1, 1], mat = 0 } = {}) {
  const positions = [];
  const indices = [];
  for (let i = 0; i <= seg; i++) {
    const u = (i / seg) * Math.PI * 2;
    for (let j = 0; j <= tube; j++) {
      const v = (j / tube) * Math.PI * 2;
      const p = rotate([(R + r * Math.cos(v)) * Math.cos(u), r * Math.sin(v), (R + r * Math.cos(v)) * Math.sin(u)]);
      positions.push(p[0] + c[0], p[1] + c[1], p[2] + c[2]);
    }
  }
  for (let i = 0; i < seg; i++) {
    for (let j = 0; j < tube; j++) {
      const a = i * (tube + 1) + j, b = (i + 1) * (tube + 1) + j;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  return { positions, indices, colors: paint(positions, color, mat) };
}

function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return [0, 1, 2].map(
    (k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)
  );
}

/** Smooth tube along control points with rounded (capped) ends. */
export function tube(points, radius, { steps = 40, radial = 12, closed = false, color = [1, 1, 1], mat = 0 } = {}) {
  const pts = closed ? [points[points.length - 1], ...points, points[0], points[1]] : [points[0], ...points, points[points.length - 1]];
  const segs = pts.length - 3;
  const path = [];
  for (let i = 0; i <= steps; i++) {
    const g = (i / steps) * segs;
    const k = Math.min(Math.floor(g), segs - 1);
    path.push(catmull(pts[k], pts[k + 1], pts[k + 2], pts[k + 3], g - k));
  }
  const positions = [];
  const indices = [];
  let prevN = null;
  for (let i = 0; i <= steps; i++) {
    const a = path[Math.max(0, i - 1)], b = path[Math.min(steps, i + 1)];
    const T = normalize([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
    const ref = prevN || (Math.abs(T[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0]);
    const B = normalize([T[1] * ref[2] - T[2] * ref[1], T[2] * ref[0] - T[0] * ref[2], T[0] * ref[1] - T[1] * ref[0]]);
    const N = normalize([B[1] * T[2] - B[2] * T[1], B[2] * T[0] - B[0] * T[2], B[0] * T[1] - B[1] * T[0]]);
    prevN = N;
    const r = radius(i / steps);
    for (let j = 0; j <= radial; j++) {
      const v = (j / radial) * Math.PI * 2;
      const cs = Math.cos(v), sn = Math.sin(v);
      positions.push(path[i][0] + r * (cs * N[0] + sn * B[0]), path[i][1] + r * (cs * N[1] + sn * B[1]), path[i][2] + r * (cs * N[2] + sn * B[2]));
    }
  }
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j, b = (i + 1) * (radial + 1) + j;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const part = { positions, indices, colors: paint(positions, color, mat) };
  if (closed) return part;
  // round caps
  const caps = [path[0], path[steps]].map((p, k) => ellipsoid(p, [radius(k), radius(k), radius(k)].map((x) => x * 0.98), { w: radial, h: 8, color, mat }));
  return merge([part, ...caps]);
}

/** Axis-aligned box with optional rounded look via slight bevel-free normals (welded per face). */
export function box(c, s, { color = [1, 1, 1], mat = 0, rotate } = {}) {
  const [hx, hy, hz] = [s[0] / 2, s[1] / 2, s[2] / 2];
  const faces = [
    [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    [[-1, 0, 0], [0, 1, 0], [0, 0, -1]],
    [[0, 1, 0], [0, 0, 1], [1, 0, 0]],
    [[0, -1, 0], [0, 0, -1], [1, 0, 0]],
    [[0, 0, 1], [1, 0, 0], [0, 1, 0]],
    [[0, 0, -1], [-1, 0, 0], [0, 1, 0]],
  ];
  const positions = [];
  const indices = [];
  faces.forEach(([n, u, v]) => {
    const base = positions.length / 3;
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      let p = [0, 1, 2].map((k) => (n[k] + u[k] * a + v[k] * b) * [hx, hy, hz][k]);
      if (rotate) p = rotate(p);
      positions.push(p[0] + c[0], p[1] + c[1], p[2] + c[2]);
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  });
  return { positions, indices, colors: paint(positions, color, mat), flat: true };
}

/** Concatenate parts without computing normals. */
export function merge(parts) {
  const out = { positions: [], indices: [], colors: [], flatMask: [] };
  for (const p of parts) {
    const base = out.positions.length / 3;
    out.positions.push(...p.positions);
    out.colors.push(...p.colors);
    for (const i of p.indices) out.indices.push(i + base);
    const n = p.positions.length / 3;
    for (let i = 0; i < n; i++) out.flatMask.push(p.flat || (p.flatMask && p.flatMask[i]) ? 1 : 0);
  }
  return out;
}

/** Merge parts, compute smooth normals (welded by position within each part), pack typed arrays. */
export function finalize(parts) {
  const positions = [];
  const colors = [];
  const indices = [];
  const partOf = [];
  const flat = [];
  parts.forEach((p, pi) => {
    const base = positions.length / 3;
    positions.push(...p.positions);
    colors.push(...p.colors);
    for (const i of p.indices) indices.push(i + base);
    const n = p.positions.length / 3;
    for (let i = 0; i < n; i++) {
      partOf.push(pi);
      flat.push(p.flat || (p.flatMask && p.flatMask[i]) ? 1 : 0);
    }
  });
  const count = positions.length / 3;
  const acc = new Float32Array(count * 3);
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i], b = indices[i + 1], c = indices[i + 2];
    const e1 = [positions[b * 3] - positions[a * 3], positions[b * 3 + 1] - positions[a * 3 + 1], positions[b * 3 + 2] - positions[a * 3 + 2]];
    const e2 = [positions[c * 3] - positions[a * 3], positions[c * 3 + 1] - positions[a * 3 + 1], positions[c * 3 + 2] - positions[a * 3 + 2]];
    const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    for (const v of [a, b, c]) {
      acc[v * 3] += n[0];
      acc[v * 3 + 1] += n[1];
      acc[v * 3 + 2] += n[2];
    }
  }
  const groups = new Map();
  for (let i = 0; i < count; i++) {
    const k = flat[i]
      ? `f${i}`
      : `${partOf[i]}|${positions[i * 3].toFixed(4)},${positions[i * 3 + 1].toFixed(4)},${positions[i * 3 + 2].toFixed(4)}`;
    const g = groups.get(k);
    if (g) {
      g.list.push(i);
      g.n[0] += acc[i * 3]; g.n[1] += acc[i * 3 + 1]; g.n[2] += acc[i * 3 + 2];
    } else groups.set(k, { list: [i], n: [acc[i * 3], acc[i * 3 + 1], acc[i * 3 + 2]] });
  }
  const normals = new Float32Array(count * 3);
  for (const g of groups.values()) {
    const n = normalize(g.n);
    for (const i of g.list) normals.set(n, i * 3);
  }
  // make normals point outward from the part's centroid where winding is inconsistent
  return {
    positions: new Float32Array(positions),
    normals,
    colors: new Float32Array(colors),
    indices: new Uint32Array(indices),
  };
}

export const rotY = (a) => (p) => [p[0] * Math.cos(a) + p[2] * Math.sin(a), p[1], -p[0] * Math.sin(a) + p[2] * Math.cos(a)];
export const rotX = (a) => (p) => [p[0], p[1] * Math.cos(a) - p[2] * Math.sin(a), p[1] * Math.sin(a) + p[2] * Math.cos(a)];
export const rotZ = (a) => (p) => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];
export const chain = (...fns) => (p) => fns.reduce((acc, f) => f(acc), p);
