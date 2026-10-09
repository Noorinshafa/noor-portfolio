import { useEffect, useRef } from 'react';

/**
 * A soft trail of tiny pastel sparkles that follows the mouse.
 * Desktop (fine pointer) only, never under reduced motion, never blocks clicks.
 */
const COLORS = ['#B9AADB', '#B4D8DC', '#F6D3C2', '#8FB9C0'];

export default function CursorSparkles() {
  const ref = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = ref.current;
    if (!fine || reduced || !canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let dpr = 1;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    size();
    window.addEventListener('resize', size);

    const parts = [];
    let last = null;
    let raf = 0;
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      const p = { x: e.clientX, y: e.clientY };
      if (last) {
        const d = Math.hypot(p.x - last.x, p.y - last.y);
        const n = Math.min(3, Math.floor(d / 14));
        for (let i = 0; i < n; i++) {
          parts.push({
            x: p.x + (Math.random() - 0.5) * 10,
            y: p.y + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 0.6,
            vy: 0.3 + Math.random() * 0.6,
            life: 1,
            r: 2.5 + Math.random() * 3.5,
            c: COLORS[(Math.random() * COLORS.length) | 0],
            rot: Math.random() * Math.PI,
          });
        }
        if (parts.length > 90) parts.splice(0, parts.length - 90);
      }
      last = p;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const star = (r) => {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const rr = i % 2 ? r * 0.35 : r;
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath();
      ctx.fill();
    };
    const tick = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.022;
        p.rot += 0.05;
        if (p.life <= 0) {
          parts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = p.life * 0.85;
        ctx.fillStyle = p.c;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        star(p.r * (0.5 + p.life * 0.5));
        ctx.restore();
      }
      raf = parts.length ? requestAnimationFrame(tick) : 0;
      if (!raf) ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', size);
    };
  }, []);

  return <canvas ref={ref} className="cursor-sparkles" aria-hidden="true" />;
}
