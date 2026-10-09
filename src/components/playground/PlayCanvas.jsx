import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

/**
 * A tiny 2D playground: floating pastel flowers, pebbles and stars.
 * Drag (mouse or touch) to move and fling them, tap empty space to plant a flower,
 * or use the arrow keys to nudge the highlighted one. Canvas 2D — no libraries.
 */
const COLORS = ['#B9AADB', '#B4D8DC', '#F6D3C2', '#8FB9C0', '#E9E2F6', '#776991'];
const KINDS = ['flower', 'flower', 'pebble', 'star'];

function makeShape(w, h, x, y, kind) {
  const k = kind || KINDS[Math.floor(Math.random() * KINDS.length)];
  return {
    kind: k,
    x: x ?? 40 + Math.random() * (w - 80),
    y: y ?? 40 + Math.random() * (h - 80),
    vx: (Math.random() - 0.5) * 30,
    vy: (Math.random() - 0.5) * 30,
    r: k === 'star' ? 14 + Math.random() * 6 : 18 + Math.random() * 16,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    born: performance.now(),
  };
}

function drawShape(ctx, s, selected) {
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(s.rot);
  const age = Math.min(1, (performance.now() - s.born) / 350);
  const sc = age < 1 ? 0.4 + 0.6 * (1 - Math.pow(1 - age, 3)) : 1;
  ctx.scale(sc, sc);
  ctx.shadowColor = 'rgba(56, 90, 105, 0.18)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = s.color;
  if (s.kind === 'flower') {
    for (let i = 0; i < 5; i++) {
      ctx.rotate((Math.PI * 2) / 5);
      ctx.beginPath();
      ctx.ellipse(0, -s.r * 0.55, s.r * 0.36, s.r * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#FFF4D6';
    ctx.beginPath();
    ctx.arc(0, 0, s.r * 0.28, 0, Math.PI * 2);
    ctx.fill();
  } else if (s.kind === 'pebble') {
    ctx.beginPath();
    ctx.ellipse(0, 0, s.r, s.r * 0.78, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.ellipse(-s.r * 0.35, -s.r * 0.3, s.r * 0.25, s.r * 0.14, -0.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#FFE9B8';
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const rr = i % 2 ? s.r * 0.32 : s.r;
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
  }
  if (selected) {
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#385A69';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, s.r * 1.25, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

const PlayCanvas = forwardRef(function PlayCanvas({ paused, reducedMotion, onCount }, ref) {
  const canvasRef = useRef(null);
  const state = useRef({ shapes: [], sparks: [], drag: null, sel: 0, w: 600, h: 400 });

  const addShape = (x, y, kind) => {
    const st = state.current;
    if (st.shapes.length >= 40) st.shapes.shift();
    st.shapes.push(makeShape(st.w, st.h, x, y, kind));
    st.sel = st.shapes.length - 1;
    onCount?.(st.shapes.length);
  };
  const burst = (x, y) => {
    const st = state.current;
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 60 + Math.random() * 140;
      st.sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, c: COLORS[i % COLORS.length] });
    }
  };

  useImperativeHandle(ref, () => ({
    add: () => addShape(undefined, undefined, 'flower'),
    sparkle: () => {
      const st = state.current;
      const s = st.shapes[st.sel];
      burst(s ? s.x : st.w / 2, s ? s.y : st.h / 2);
    },
    shake: () => state.current.shapes.forEach((s) => {
      s.vx += (Math.random() - 0.5) * 420;
      s.vy += (Math.random() - 0.5) * 420;
    }),
    clear: () => {
      state.current.shapes = [];
      onCount?.(0);
    },
    nudge: (dx, dy) => {
      const st = state.current;
      const s = st.shapes[st.sel];
      if (s) {
        s.x = Math.min(st.w - s.r, Math.max(s.r, s.x + dx));
        s.y = Math.min(st.h - s.r, Math.max(s.r, s.y + dy));
      }
    },
    next: () => {
      const st = state.current;
      if (st.shapes.length) st.sel = (st.sel + 1) % st.shapes.length;
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const st = state.current;
    let dpr = 1;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      st.w = canvas.clientWidth;
      st.h = canvas.clientHeight;
      canvas.width = st.w * dpr;
      canvas.height = st.h * dpr;
    };
    size();
    if (!st.shapes.length) {
      for (let i = 0; i < 12; i++) st.shapes.push(makeShape(st.w, st.h));
      onCount?.(st.shapes.length);
    }
    const ro = new ResizeObserver(size);
    ro.observe(canvas);

    let raf = 0;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      if (!paused) {
        st.shapes.forEach((s, i) => {
          if (st.drag && st.drag.s === s) return;
          if (!reducedMotion) {
            s.vx += Math.sin(t * 0.7 + i) * 4 * dt;
            s.vy += Math.cos(t * 0.6 + i * 1.3) * 4 * dt;
            s.rot += s.vr * dt;
          }
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          s.vx *= 0.985;
          s.vy *= 0.985;
          if (s.x < s.r) { s.x = s.r; s.vx = Math.abs(s.vx) * 0.7; }
          if (s.x > st.w - s.r) { s.x = st.w - s.r; s.vx = -Math.abs(s.vx) * 0.7; }
          if (s.y < s.r) { s.y = s.r; s.vy = Math.abs(s.vy) * 0.7; }
          if (s.y > st.h - s.r) { s.y = st.h - s.r; s.vy = -Math.abs(s.vy) * 0.7; }
        });
        st.sparks.forEach((p) => {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.94;
          p.vy *= 0.94;
          p.life -= dt * 1.3;
        });
        st.sparks = st.sparks.filter((p) => p.life > 0);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, st.w, st.h);
      st.shapes.forEach((s, i) => drawShape(ctx, s, i === st.sel && st.showSel));
      st.sparks.forEach((p) => {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 + p.life * 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const pt = (e) => {
      const r = canvas.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    const hit = (x, y) => {
      for (let i = st.shapes.length - 1; i >= 0; i--) {
        const s = st.shapes[i];
        if (Math.hypot(s.x - x, s.y - y) < s.r * 1.1) return i;
      }
      return -1;
    };
    const down = (e) => {
      const [x, y] = pt(e);
      const i = hit(x, y);
      if (i >= 0) {
        st.sel = i;
        st.drag = { s: st.shapes[i], ox: x - st.shapes[i].x, oy: y - st.shapes[i].y, px: x, py: y, t: performance.now(), moved: false };
        canvas.setPointerCapture(e.pointerId);
      } else {
        addShape(x, y, 'flower');
        burst(x, y);
      }
    };
    const move = (e) => {
      if (!st.drag) return;
      const [x, y] = pt(e);
      const d = st.drag;
      const now = performance.now();
      const dtm = Math.max(1, now - d.t) / 1000;
      d.s.vx = (x - d.px) / dtm;
      d.s.vy = (y - d.py) / dtm;
      d.s.x = x - d.ox;
      d.s.y = y - d.oy;
      d.px = x;
      d.py = y;
      d.t = now;
      d.moved = true;
    };
    const up = () => {
      if (st.drag && !st.drag.moved) burst(st.drag.s.x, st.drag.s.y);
      st.drag = null;
    };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    const onFocus = () => (st.showSel = true);
    const onBlur = () => (st.showSel = false);
    canvas.addEventListener('focus', onFocus);
    canvas.addEventListener('blur', onBlur);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      canvas.removeEventListener('focus', onFocus);
      canvas.removeEventListener('blur', onBlur);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="play__canvas"
      tabIndex={0}
      aria-label="Playground canvas. Arrow keys move the highlighted shape, N selects the next one, Space adds sparkles, F adds a flower."
      onKeyDown={(e) => {
        const api = ref.current;
        const step = e.shiftKey ? 30 : 12;
        const map = {
          ArrowLeft: () => api.nudge(-step, 0),
          ArrowRight: () => api.nudge(step, 0),
          ArrowUp: () => api.nudge(0, -step),
          ArrowDown: () => api.nudge(0, step),
          ' ': () => api.sparkle(),
          n: () => api.next(),
          f: () => api.add(),
        };
        const fn = map[e.key];
        if (fn) {
          e.preventDefault();
          fn();
        }
      }}
    />
  );
});

export default PlayCanvas;
