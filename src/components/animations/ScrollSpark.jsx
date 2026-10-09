import { useEffect, useRef, useState } from 'react';
import { trail } from '../../data/site';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';
import { scrollToId } from '../../utils/scroll';

/**
 * "Follow the little spark": a lavender flower travels down a delicate trail
 * as you scroll, shedding the odd petal and blooming at each section.
 * Native scrolling is untouched — this only listens.
 */
export default function ScrollSpark() {
  const [marks, setMarks] = useState([]);
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const flowerRef = useRef(null);
  const petalsRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    let raf = 0;
    let lastY = window.scrollY;
    let acc = 0;
    let lastActive = -1;
    const reduced = prefersReducedMotion();

    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setMarks(
        trail
          .map((t) => {
            const el = document.getElementById(t.id);
            if (!el) return null;
            const top = el.getBoundingClientRect().top + window.scrollY - 80;
            return { ...t, p: Math.min(1, Math.max(0, top / Math.max(1, max))) };
          })
          .filter(Boolean)
      );
    };

    const petal = (p) => {
      if (reduced || !petalsRef.current || petalsRef.current.childElementCount > 6) return;
      const el = document.createElement('i');
      el.className = 'spark__petal';
      el.style.top = `${p * 100}%`;
      el.style.setProperty('--dx', `${(Math.random() * 2 - 1) * 26}px`);
      el.style.setProperty('--rot', `${Math.random() * 360}deg`);
      petalsRef.current.appendChild(el);
      setTimeout(() => el.remove(), 1600);
    };

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, window.scrollY / Math.max(1, max)));
      root.style.setProperty('--p', p.toFixed(4));
      const dy = Math.abs(window.scrollY - lastY);
      lastY = window.scrollY;
      acc += dy;
      if (acc > 260) {
        acc = 0;
        petal(p);
      }
      // which milestone are we at?
      let idx = 0;
      const els = trail.map((t) => document.getElementById(t.id));
      els.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45) idx = i;
      });
      if (idx !== lastActive) {
        lastActive = idx;
        setActive(idx);
        const f = flowerRef.current;
        if (f && !reduced) {
          f.classList.remove('is-blooming');
          void f.offsetWidth;
          f.classList.add('is-blooming');
        }
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    measure();
    update();
    const ro = new ResizeObserver(() => {
      measure();
      update();
    });
    ro.observe(document.body);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className="spark" ref={rootRef}>
      <nav className="spark__trail" aria-label="Page progress">
        <span className="spark__line" aria-hidden="true">
          <span className="spark__fill" />
        </span>
        <ol className="spark__marks">
          {marks.map((m, i) => (
            <li key={m.id} style={{ top: `${m.p * 100}%` }} className={i <= active ? 'is-passed' : ''}>
              <button type="button" onClick={() => scrollToId(m.id)} aria-current={i === active ? 'step' : undefined}>
                <span className="spark__label">{m.label}</span>
              </button>
            </li>
          ))}
        </ol>
        <span className="spark__petals" ref={petalsRef} aria-hidden="true" />
        <span className="spark__flower" ref={flowerRef} aria-hidden="true">
          <svg viewBox="-12 -12 24 24">
            {[0, 72, 144, 216, 288].map((r) => (
              <ellipse key={r} rx="4.4" ry="7.2" cy="-5.6" transform={`rotate(${r})`} />
            ))}
            <circle r="3.6" />
          </svg>
        </span>
      </nav>
      <span className="spark__bar" aria-hidden="true">
        <span className="spark__bar-fill" />
      </span>
    </div>
  );
}
