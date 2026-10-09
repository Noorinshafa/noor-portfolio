import { useCallback, useEffect, useRef, useState } from 'react';
import Reveal from '../animations/Reveal';
import Icon from '../ui/Icon';
import AlphaVideo from '../world/AlphaVideo';
import { SITTING } from '../world/videoMeta';
import { supportsWebGL2 } from './Hero';
import useReducedMotion from '../../hooks/useReducedMotion';
import { scrollToId } from '../../utils/scroll';
import { tour } from '../../data/site';
import sittingWebm from '../../assets/video/noor-sitting.webm';
import sittingMp4 from '../../assets/video/noor-sitting.mp4';
import sittingStill from '../../assets/images/noor-sitting.webp';

/** Types a line out letter by letter (instantly under reduced motion). */
function useTypewriter(text, reduced) {
  const [out, setOut] = useState(reduced ? text : '');
  useEffect(() => {
    if (reduced) {
      setOut(text);
      return undefined;
    }
    let i = 0;
    setOut('');
    const id = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 24);
    return () => clearInterval(id);
  }, [text, reduced]);
  return out;
}

export default function Tour() {
  const reduced = useReducedMotion();
  const [use3D, setUse3D] = useState(false);
  const [active, setActive] = useState(null); // id of the stop being pointed at
  const [auto, setAuto] = useState(0); // rotating hint while idle
  const pausedRef = useRef(false);
  useEffect(() => setUse3D(supportsWebGL2()), []);
  const onFail = useCallback(() => setUse3D(false), []);

  // gently cycle through the stops while nobody is interacting
  useEffect(() => {
    if (reduced) return undefined;
    const id = setInterval(() => {
      if (!pausedRef.current) setAuto((a) => (a + 1) % (tour.stops.length + 1));
    }, 5200);
    return () => clearInterval(id);
  }, [reduced]);

  const stop = active ? tour.stops.find((s) => s.id === active) : auto === 0 ? null : tour.stops[auto - 1];
  const line = stop ? stop.say : tour.hello;
  const typed = useTypewriter(line, reduced);

  const focusStop = (id) => {
    pausedRef.current = true;
    setActive(id);
  };
  const leave = () => {
    pausedRef.current = false;
    setActive(null);
  };

  return (
    <section id="tour" className="section tour" aria-labelledby="tour-title">
      <div className="wrap tour__grid">
        <Reveal className="tour__stage" variant="scale">
          <span className="tour__rug" aria-hidden="true" />
          <span className="tour__glow" aria-hidden="true" />
          {use3D ? (
            <AlphaVideo
              className="tour__noor"
              webm={sittingWebm}
              mp4={sittingMp4}
              meta={SITTING}
              reducedMotion={reduced}
              onFail={onFail}
              label="Noor’s character sitting cross-legged beside her laptop and tote bag, smiling at you."
            />
          ) : (
            <img className="tour__noor tour__still" src={sittingStill} alt="Noor’s character sitting cross-legged beside her laptop and tote bag" loading="lazy" />
          )}
          <span className="tour__floaties" aria-hidden="true">
            {['✿', '♡', '</>', '✦', '{ }', '✿'].map((c, i) => (
              <i key={i} style={{ '--i': i }}>
                {c}
              </i>
            ))}
          </span>
        </Reveal>

        <div className="tour__talk">
          <Reveal as="p" className="eyebrow">
            ✿ A little tour
          </Reveal>
          <Reveal as="h2" id="tour-title" className="heading__title tour__title" delay={80}>
            Let me show you <em>around.</em>
          </Reveal>

          <Reveal className="bubble-say" delay={160}>
            <p aria-hidden="true">
              {typed}
              <span className="bubble-say__caret" />
            </p>
            <p className="sr-only" aria-live="polite">
              {line}
            </p>
          </Reveal>

          <ul className="stops" aria-label="Sections of my portfolio">
            {tour.stops.map((s, i) => (
              <Reveal as="li" key={s.id} delay={200 + i * 60}>
                <a
                  href={`#${s.id}`}
                  className={`stop ${stop?.id === s.id ? 'is-active' : ''}`}
                  style={{ '--c': s.color }}
                  onMouseEnter={() => focusStop(s.id)}
                  onMouseLeave={leave}
                  onFocus={() => focusStop(s.id)}
                  onBlur={leave}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToId(s.id);
                  }}
                >
                  <span className="stop__emoji" aria-hidden="true">
                    {s.mark}
                  </span>
                  <span className="stop__label">{s.label}</span>
                  <Icon name="arrowRight" size={15} className="stop__arrow" />
                </a>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
