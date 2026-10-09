import { useRef } from 'react';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Subtle 3D tilt + cursor-following light on fine pointers only.
 * Touch devices get a static card (no hover dependency).
 */
export default function TiltCard({ as: Tag = 'div', max = 6, className = '', children, ...rest }) {
  const ref = useRef(null);
  const frame = useRef(0);

  const onMove = (e) => {
    if (e.pointerType !== 'mouse' || prefersReducedMotion()) return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty('--rx', `${(0.5 - py) * max}deg`);
      el.style.setProperty('--ry', `${(px - 0.5) * max}deg`);
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
    });
  };
  const onLeave = () => {
    const el = ref.current;
    cancelAnimationFrame(frame.current);
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <Tag ref={ref} className={`tilt ${className}`} onPointerMove={onMove} onPointerLeave={onLeave} {...rest}>
      {children}
    </Tag>
  );
}
