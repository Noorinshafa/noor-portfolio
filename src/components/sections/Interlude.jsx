import { useCallback, useEffect, useState } from 'react';
import Reveal from '../animations/Reveal';
import AlphaVideo from '../world/AlphaVideo';
import { INTERLUDE } from '../world/videoMeta';
import { supportsWebGL2 } from './Hero';
import useReducedMotion from '../../hooks/useReducedMotion';
import presentingWebm from '../../assets/video/noor-presenting.webm';
import presentingMp4 from '../../assets/video/noor-presenting.mp4';
import presentingStill from '../../assets/images/noor-presenting.webp';

/**
 * A quiet interlude between Creative Corner and "A Little Bit of Everything…":
 * Noor uncrosses her arms and taps a floating "run" tile, which turns into a Git tile.
 */
export default function Interlude() {
  const reduced = useReducedMotion();
  const [use3D, setUse3D] = useState(false);
  useEffect(() => setUse3D(supportsWebGL2()), []);
  const onFail = useCallback(() => setUse3D(false), []);
  const label = 'Noor’s character uncrosses her arms and taps a floating “run” tile, which turns into a Git tile.';

  return (
    <section id="interlude" className="interlude" aria-labelledby="interlude-title">
      <div className="wrap interlude__grid">
        <Reveal className="interlude__copy">
          <p className="eyebrow">✿ One small step at a time</p>
          <h2 id="interlude-title" className="interlude__title">
            Every idea starts with <em>a little click.</em>
          </h2>
          <p className="interlude__text">Run it, check it, commit it — then on to the next little idea.</p>
        </Reveal>

        <Reveal className="interlude__stage" variant="rise" delay={120}>
          <span className="interlude__arch" aria-hidden="true" />
          <span className="interlude__floor" aria-hidden="true" />
          {use3D ? (
            <AlphaVideo
              className="interlude__noor"
              webm={presentingWebm}
              mp4={presentingMp4}
              meta={INTERLUDE}
              reducedMotion={reduced}
              onFail={onFail}
              label={label}
            />
          ) : (
            <img className="interlude__noor" src={presentingStill} alt={label} loading="lazy" width="546" height="1060" />
          )}
        </Reveal>
      </div>
    </section>
  );
}
