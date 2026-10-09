import { useCallback, useEffect, useRef, useState } from 'react';
import Reveal from '../animations/Reveal';
import Icon from '../ui/Icon';
import SectionHeading from '../ui/SectionHeading';
import { creative, creativeAreas } from '../../data/creative';

function Lightbox({ items, index, onClose, onStep }) {
  const ref = useRef(null);
  const item = items[index];
  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.querySelector('button')?.focus();
    document.body.classList.add('no-scroll');
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onStep(1);
      if (e.key === 'ArrowLeft') onStep(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
      prev?.focus?.();
    };
  }, [onClose, onStep]);
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={item.title} ref={ref}>
      <button type="button" className="icon-btn lightbox__close" onClick={onClose}>
        <Icon name="close" />
        <span className="sr-only">Close</span>
      </button>
      {items.length > 1 ? (
        <>
          <button type="button" className="icon-btn lightbox__prev" onClick={() => onStep(-1)}>
            <Icon name="chevronLeft" />
            <span className="sr-only">Previous</span>
          </button>
          <button type="button" className="icon-btn lightbox__next" onClick={() => onStep(1)}>
            <Icon name="chevronRight" />
            <span className="sr-only">Next</span>
          </button>
        </>
      ) : null}
      <figure className="lightbox__figure">
        {item.src && /\.(mp4|webm)(\?|$)/.test(item.src) ? (
          <video src={item.src} poster={item.poster} controls playsInline />
        ) : item.src ? (
          <img src={item.src} alt={item.alt || item.title} />
        ) : null}
        <figcaption>
          <strong>{item.title}</strong>
          {item.tool ? <span> · {item.tool}</span> : null}
          {item.link ? (
            <a className="link" href={item.link} target="_blank" rel="noopener noreferrer">
              View original <Icon name="arrowUpRight" size={14} />
            </a>
          ) : null}
        </figcaption>
      </figure>
    </div>
  );
}

const masks = ['arch', 'blob', 'circle'];

function DesignArea({ open }) {
  const items = creative.design;
  if (!items.length) {
    return (
      <div className="frames" aria-label="Graphic design pieces coming soon">
        {masks.map((m, i) => (
          <div key={m} className={`frame frame--${m} frame--empty`} style={{ '--i': i }}>
            <span className="scribble">a new piece is on its way</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="frames">
      {items.map((it, i) => (
        <button key={i} type="button" className={`frame frame--${masks[i % 3]}`} onClick={() => open('design', i)}>
          <img src={it.src} alt={it.alt || it.title} loading="lazy" />
          <span className="frame__label">{it.title}</span>
        </button>
      ))}
    </div>
  );
}

function WritingArea() {
  const items = creative.writing;
  if (!items.length) {
    return (
      <div className="pages">
        <div className="page page--empty">
          <span className="page__quote" aria-hidden="true">“</span>
          <p className="scribble">words are being polished — my writing samples will live here.</p>
          <span className="page__lines" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="pages">
      {items.map((it, i) => (
        <article key={i} className="page">
          <p className="page__kind">{it.kind}</p>
          <h4>{it.title}</h4>
          <p>{it.excerpt}</p>
          {it.link ? (
            <a className="link" href={it.link} target="_blank" rel="noopener noreferrer">
              Read more <Icon name="arrowUpRight" size={14} />
            </a>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function AnimationArea({ open }) {
  const items = creative.animation;
  const slots = items.length ? items : [null, null, null];
  return (
    <div className="filmstrip">
      {slots.map((it, i) =>
        it ? (
          <button key={i} type="button" className="film" onClick={() => open('animation', i)}>
            {it.poster ? <img src={it.poster} alt="" loading="lazy" /> : null}
            <span className="film__play">
              <Icon name="play" size={18} />
            </span>
            <span className="film__label">{it.title}</span>
          </button>
        ) : (
          <div key={i} className="film film--empty" aria-hidden="true">
            <span className="film__play">
              <Icon name="play" size={16} />
            </span>
          </div>
        )
      )}
      {!items.length ? <p className="scribble filmstrip__note">frames are still being drawn ✿</p> : null}
    </div>
  );
}

export default function Creative() {
  const [box, setBox] = useState(null); // { area, index }
  const open = useCallback((area, index) => setBox({ area, index }), []);
  const close = useCallback(() => setBox(null), []);
  const step = useCallback(
    (d) => setBox((b) => {
      const n = creative[b.area].length;
      return { ...b, index: (b.index + d + n) % n };
    }),
    []
  );

  const render = { design: <DesignArea open={open} />, writing: <WritingArea />, animation: <AnimationArea open={open} /> };

  return (
    <section id="creative" className="section creative" aria-labelledby="creative-title">
      <div className="wrap">
        <SectionHeading
          eyebrow="Creative corner · the artist in me"
          lead="Where My Imagination Gets a"
          accent="Little Wild."
          id="creative-title"
          scribble="my little studio ✿"
        />

        <div className="studio">
          {creativeAreas.map((a, i) => (
            <Reveal as="article" key={a.id} className={`studio__area studio__area--${a.id}`} delay={i * 100} aria-labelledby={`ca-${a.id}`}>
              <header className="studio__head">
                <span className="studio__letter" aria-hidden="true">
                  {a.letter}
                </span>
                <div>
                  <h3 id={`ca-${a.id}`}>{a.title}</h3>
                  <p>{a.intro}</p>
                  <ul className="chips chips--small">
                    {a.tools.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </header>
              {render[a.id]}
            </Reveal>
          ))}
        </div>
      </div>
      {box ? <Lightbox items={creative[box.area]} index={box.index} onClose={close} onStep={step} /> : null}
    </section>
  );
}
