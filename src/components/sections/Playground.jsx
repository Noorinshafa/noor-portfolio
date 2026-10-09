import { lazy, Suspense, useRef, useState } from 'react';
import SectionHeading from '../ui/SectionHeading';
import Icon from '../ui/Icon';
import useInView from '../../hooks/useInView';
import useReducedMotion from '../../hooks/useReducedMotion';
import { goTo } from '../../utils/scroll';

// Loaded only when the visitor scrolls near it.
const PlayCanvas = lazy(() => import('../playground/PlayCanvas'));

export default function Playground() {
  const [wrapRef, near] = useInView({ rootMargin: '300px 0px', once: true });
  const reduced = useReducedMotion();
  const [on, setOn] = useState(true);
  const [paused, setPaused] = useState(false);
  const [count, setCount] = useState(0);
  const api = useRef(null);

  return (
    <section id="playground" className="section playground" aria-labelledby="play-title">
      <div className="wrap">
        <div className="playground__head">
          <SectionHeading
            eyebrow="A little interactive playground"
            lead="Play With My Little"
            accent="Creative World."
            id="play-title"
            intro="Drag the shapes around, fling them, or tap an empty spot to plant a flower. Totally optional."
          />
          <a className="link playground__skip" href="#contact" onClick={goTo('contact')}>
            Skip the playground <Icon name="arrowDown" size={15} />
          </a>
        </div>

        <div className="play" ref={wrapRef}>
          <div className="play__tools" role="toolbar" aria-label="Playground controls">
            <button type="button" className="chip-btn" onClick={() => api.current?.add()} disabled={!on}>
              <Icon name="plus" size={16} /> Add a flower
            </button>
            <button type="button" className="chip-btn" onClick={() => api.current?.sparkle()} disabled={!on}>
              <Icon name="sparkles" size={16} /> Sparkle
            </button>
            <button type="button" className="chip-btn" onClick={() => api.current?.shake()} disabled={!on || paused}>
              <Icon name="shuffle" size={16} /> Shake things up
            </button>
            <button type="button" className="chip-btn" onClick={() => api.current?.clear()} disabled={!on}>
              <Icon name="trash" size={16} /> Tidy up
            </button>
            <button type="button" className="chip-btn" aria-pressed={paused} onClick={() => setPaused((p) => !p)} disabled={!on}>
              <Icon name={paused ? 'play' : 'pause'} size={16} /> {paused ? 'Resume' : 'Pause'}
            </button>
            <button type="button" className="chip-btn chip-btn--quiet" aria-pressed={!on} onClick={() => setOn((v) => !v)}>
              {on ? 'Turn off' : 'Turn on'}
            </button>
          </div>

          <div className="play__stage">
            {on && near ? (
              <Suspense fallback={<p className="play__loading scribble">getting the flowers ready…</p>}>
                <PlayCanvas ref={api} paused={paused} reducedMotion={reduced} onCount={setCount} />
              </Suspense>
            ) : (
              <p className="play__off scribble">{on ? 'getting the flowers ready…' : 'the playground is resting ✿'}</p>
            )}
          </div>
          <p className="play__status" aria-live="polite">
            {on ? `${count} little thing${count === 1 ? '' : 's'} in the playground.` : 'Playground turned off.'}
            <span className="play__keys"> Keyboard: focus the canvas, then use the arrow keys, N, F and Space.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
