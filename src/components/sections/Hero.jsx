import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Button from '../ui/Button';
import useReducedMotion from '../../hooks/useReducedMotion';
import { site } from '../../data/site';
import { goTo } from '../../utils/scroll';
import CharacterImage from '../world/CharacterImage';

// The 3D world is code-split so the words paint first.
const HeroWorld = lazy(() => import('../world/HeroWorld'));

export function supportsWebGL2() {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}

const words = ['Creating', 'little', 'pieces', 'of', 'the'];

export default function Hero() {
  const reduced = useReducedMotion();
  const [use3D, setUse3D] = useState(false);
  const [ready, setReady] = useState(false);
  const worldRef = useRef(null);

  useEffect(() => setUse3D(supportsWebGL2()), []);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setUse3D(false), []);

  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      <div className="hero__sky" aria-hidden="true">
        <span className="blob blob--lav" />
        <span className="blob blob--aqua" />
        <span className="blob blob--peach" />
      </div>

      <div className={`hero__stage ${ready ? 'is-ready' : ''}`}>
        {use3D ? (
          <Suspense fallback={<CharacterImage className="hero__fallback" />}>
            <HeroWorld
              ref={worldRef}
              reducedMotion={reduced}
              onReady={onReady}
              onError={onError}
              label="Noor’s 3D character, a girl in a lavender hijab and knit sweater, stands on a floating island of lavender. She opens her laptop and glowing tiles for HTML, CSS, JavaScript, React, Vite, Git, GitHub, Vercel and WordPress, plus little code snippets, fly out and float around her."
            />
          </Suspense>
        ) : (
          <CharacterImage className="hero__fallback" />
        )}
      </div>

      <div className="hero__copy">
        <p className="hero__hello intro" style={{ '--d': '100ms' }}>
          ✿ Hello, I’m {site.name}
        </p>
        <h1 id="hero-title" className="hero__title">
          <span className="sr-only">Creating little pieces of the digital world.</span>
          <span aria-hidden="true">
            {words.map((w, i) => (
              <span key={w}>
                <span className="hero__word" style={{ '--d': `${200 + i * 80}ms` }}>
                  {w}
                </span>{' '}
              </span>
            ))}
            <span className="hero__accent">
              <span className="hero__word" style={{ '--d': '640ms' }}>
                digital
              </span>{' '}
              <span className="hero__word" style={{ '--d': '720ms' }}>
                world.
              </span>
              <svg className="hero__squiggle" viewBox="0 0 300 24" preserveAspectRatio="none">
                <path d="M3 15 C 40 4, 70 22, 110 12 S 180 4, 220 13 S 280 18, 297 8" />
              </svg>
            </span>
          </span>
        </h1>
        <p className="hero__lede intro" style={{ '--d': '900ms' }}>
          I’m a frontend developer who loves blending code, design and imagination to create meaningful digital experiences.
        </p>
        <div className="hero__ctas intro" style={{ '--d': '1050ms' }}>
          <Button href="#about" onClick={goTo('about')}>
            Explore My World
          </Button>
          <Button variant="soft" href="#projects" onClick={goTo('projects')}>
            View My Projects
          </Button>
        </div>
        <div className="hero__meta intro" style={{ '--d': '1200ms' }}>
          <p className="hero__roles">{site.roles.join(' · ')}</p>
          {use3D && !reduced ? (
            <button type="button" className="hero__hi" onClick={() => worldRef.current?.replay()}>
              Watch my laptop again ↺<span className="sr-only"> — replays Noor opening her laptop</span>
            </button>
          ) : null}
        </div>
      </div>

      <a className="hero__scroll intro" style={{ '--d': '1500ms' }} href="#about" onClick={goTo('about')}>
        <span className="scribble">There’s more to my little world</span>
        <span className="hero__scroll-arrow" aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
