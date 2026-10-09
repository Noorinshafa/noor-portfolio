// Little-world props: floating island, lavender sprigs, flowers, sparkles, bubbles,
// a mini laptop, butterfly wings and soft blobs. All vertex-coloured.

import { lathe, ellipsoid, tube, torus, box, finalize, hex, rotX, rotY, rotZ, chain } from './geometry';

const C = {
  grass: hex('#B4D8DC'),
  grassDeep: hex('#8FB9C0'),
  earth: hex('#648F9B'),
  earthDeep: hex('#385A69'),
  stem: hex('#648F9B'),
  lav: hex('#B9AADB'),
  lavDeep: hex('#8F7FC2'),
  plum: hex('#776991'),
  peach: hex('#F6D3C2'),
  cream: hex('#FFF6EA'),
  butter: hex('#FFE9B8'),
  aqua: hex('#B4D8DC'),
  teal: hex('#648F9B'),
  screen: hex('#E6DDFA'),
};

const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.min(1, Math.max(0, t)));

export function island({ detail = 1 } = {}) {
  const seg = Math.round(64 * detail);
  const top = lathe(
    [[0, 0], [0.6, 0.005], [0.98, 0], [1.04, -0.05], [1.02, -0.13]],
    { seg, sz: 0.92, color: (x, y) => (y > -0.02 ? C.grass : C.grassDeep) }
  );
  const rock = lathe(
    [[1.02, -0.13], [0.96, -0.2], [0.82, -0.3], [0.6, -0.5], [0.36, -0.72], [0.14, -0.9], [0, -0.96]],
    {
      seg,
      sz: 0.92,
      color: (x, y) => lerp3(C.earth, C.earthDeep, (-0.15 - y) / 0.7),
      warp: (p, t, j) => {
        const wob = 1 + 0.06 * Math.sin(t * 5 + j) * (j / 6);
        return [p[0] * wob, p[1], p[2] * wob];
      },
    }
  );
  // a few soft rounded bushes
  const bushes = [
    [-0.7, 0.06, -0.25, 0.14], [-0.55, 0.05, -0.45, 0.1], [0.72, 0.05, -0.3, 0.12], [0.5, 0.04, 0.55, 0.08],
  ].map(([x, y, z, r]) => ellipsoid([x, y, z], [r, r * 0.8, r], { color: C.grassDeep, w: 14, h: 10 }));
  return finalize([top, rock, ...bushes]);
}

export function lavenderSprig({ height = 0.42, buds = 9 } = {}) {
  const stem = tube([[0, 0, 0], [0.01, height * 0.5, 0.0], [0.025, height, 0.01]], () => 0.008, { steps: 10, radial: 5, color: C.stem });
  const parts = [stem];
  for (let i = 0; i < buds; i++) {
    const t = 0.45 + (i / buds) * 0.58;
    const a = i * 2.3;
    const y = height * t;
    const r = 0.022 * (1.1 - (i / buds) * 0.5);
    parts.push(
      ellipsoid([0.02 + Math.cos(a) * r * 0.8, y, Math.sin(a) * r * 0.8], [r, r * 1.4, r], {
        color: i % 3 === 0 ? C.lavDeep : C.lav,
        w: 8,
        h: 6,
      })
    );
  }
  return finalize(parts);
}

export function flower(petal = C.lav, center = C.butter, { petals = 5, size = 1 } = {}) {
  const parts = [ellipsoid([0, 0.012 * size, 0], [0.04 * size, 0.03 * size, 0.04 * size], { color: center, w: 12, h: 8 })];
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2;
    parts.push(
      ellipsoid([Math.cos(a) * 0.085 * size, 0, Math.sin(a) * 0.085 * size], [0.075 * size, 0.022 * size, 0.05 * size], {
        color: petal,
        w: 14,
        h: 8,
        rotate: rotY(-a),
      })
    );
  }
  return finalize(parts);
}

export const flowerColors = [
  [C.lav, C.butter],
  [C.peach, C.cream],
  [C.aqua, C.peach],
  [C.cream, C.lav],
];

export function sparkle() {
  const k = [0.024, 0.14, 0.024];
  return finalize([
    ellipsoid([0, 0, 0], k, { color: C.butter, mat: 3, w: 10, h: 10 }),
    ellipsoid([0, 0, 0], [k[1], k[0], k[2]], { color: C.butter, mat: 3, w: 10, h: 10 }),
    ellipsoid([0, 0, 0], [0.045, 0.045, 0.03], { color: C.cream, mat: 3, w: 10, h: 8 }),
  ]);
}

export function bubble() {
  return finalize([ellipsoid([0, 0, 0], [1, 1, 1], { color: [1, 1, 1], w: 24, h: 16 })]);
}

export function miniLaptop() {
  const base = box([0, 0, 0], [0.42, 0.025, 0.29], { color: C.teal });
  const keys = box([0, 0.014, 0.03], [0.34, 0.006, 0.14], { color: C.aqua });
  const lid = box([0, 0.15, -0.16], [0.42, 0.29, 0.02], { color: C.teal, rotate: rotX(-0.18) });
  const screen = box([0, 0.152, -0.145], [0.37, 0.24, 0.006], { color: C.screen, mat: 3, rotate: rotX(-0.18) });
  // tiny code lines on the screen
  const lines = [0.22, 0.18, 0.14, 0.1].map((y, i) =>
    box([-0.06 + (i % 2) * 0.03, y, -0.135 + (0.2 - y) * 0.18], [0.16 - i * 0.025, 0.012, 0.004], { color: i % 2 ? C.peach : C.lavDeep, mat: 3, rotate: rotX(-0.18) })
  );
  return finalize([base, keys, lid, screen, ...lines]);
}

export function wing(side = 1) {
  return finalize([
    ellipsoid([side * 0.07, 0.03, 0], [0.075, 0.006, 0.06], { color: C.lav, w: 14, h: 6, rotate: rotY(side * 0.3) }),
    ellipsoid([side * 0.055, -0.03, 0.02], [0.05, 0.005, 0.04], { color: C.peach, w: 12, h: 6, rotate: rotY(-side * 0.4) }),
  ]);
}

export function butterflyBody() {
  return finalize([
    ellipsoid([0, 0, 0], [0.012, 0.012, 0.055], { color: C.plum, w: 8, h: 6 }),
    tube([[0, 0.005, 0.05], [-0.025, 0.03, 0.08]], () => 0.003, { steps: 4, radial: 4, color: C.plum }),
    tube([[0, 0.005, 0.05], [0.025, 0.03, 0.08]], () => 0.003, { steps: 4, radial: 4, color: C.plum }),
  ]);
}

export function blobRing(color = C.peach) {
  return finalize([torus([0, 0, 0], 0.11, 0.045, { color, seg: 28, tube: 12 })]);
}

export function pebble(color = C.lav) {
  return finalize([ellipsoid([0, 0, 0], [0.11, 0.08, 0.1], { color, w: 18, h: 12 })]);
}

/** flat disc used for the soft contact shadow */
export function disc() {
  const positions = [0, 0, 0];
  const indices = [];
  const n = 32;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    positions.push(Math.cos(a), 0, Math.sin(a));
    if (i > 0) indices.push(0, i, i + 1 > n ? 1 : i + 1);
  }
  return { positions: new Float32Array(positions), indices: new Uint32Array(indices) };
}

export { rotX, rotY, rotZ, chain };
