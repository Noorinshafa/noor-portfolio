import { useRef, useState } from 'react';
import SectionHeading from '../ui/SectionHeading';
import Icon from '../ui/Icon';
import Reveal from '../animations/Reveal';
import { chapters } from '../../data/journey';

/* Illustrations for each chapter — soft, flat-dimensional SVG scenes */
const Art = {
  science: (
    <svg viewBox="0 0 360 260" aria-hidden="true">
      <ellipse cx="180" cy="232" rx="150" ry="14" fill="#385A69" opacity=".08" />
      <g className="float-a">
        <path d="M120 60h36M126 60v52l-38 72a10 10 0 0 0 9 15h82a10 10 0 0 0 9-15l-38-72V60" fill="#FFFDF9" stroke="#776991" strokeWidth="3" strokeLinejoin="round" />
        <path d="M100 166c20-8 40 8 60 0s30-6 47 2l11 18a10 10 0 0 1-9 13h-82a10 10 0 0 1-9-15z" fill="#B9AADB" opacity=".85" />
        <circle cx="132" cy="182" r="5" fill="#FFFDF9" opacity=".8" />
        <circle cx="150" cy="172" r="3" fill="#FFFDF9" opacity=".8" />
      </g>
      <g className="float-b">
        <rect x="222" y="110" width="56" height="92" rx="10" fill="#FFFDF9" stroke="#648F9B" strokeWidth="3" />
        <rect x="225" y="150" width="50" height="49" rx="8" fill="#B4D8DC" />
        <path d="M222 128h56" stroke="#648F9B" strokeWidth="2" />
      </g>
      <g className="float-c" stroke="#8FB9C0" strokeWidth="3">
        <line x1="250" y1="58" x2="286" y2="40" />
        <line x1="250" y1="58" x2="290" y2="78" />
        <line x1="250" y1="58" x2="226" y2="30" />
        <circle cx="250" cy="58" r="12" fill="#F6D3C2" />
        <circle cx="290" cy="38" r="8" fill="#B9AADB" />
        <circle cx="294" cy="80" r="8" fill="#B4D8DC" />
        <circle cx="222" cy="26" r="7" fill="#E9E2F6" />
      </g>
    </svg>
  ),
  developer: (
    <svg viewBox="0 0 360 260" aria-hidden="true">
      <ellipse cx="180" cy="236" rx="150" ry="12" fill="#385A69" opacity=".08" />
      <g className="float-a">
        <rect x="70" y="70" width="220" height="136" rx="14" fill="#FFFDF9" stroke="#648F9B" strokeWidth="3" />
        <path d="M70 96h220" stroke="#648F9B" strokeWidth="2" />
        <circle cx="88" cy="83" r="4" fill="#F6D3C2" />
        <circle cx="101" cy="83" r="4" fill="#B9AADB" />
        <circle cx="114" cy="83" r="4" fill="#B4D8DC" />
        <rect x="90" y="114" width="70" height="8" rx="4" fill="#B9AADB" />
        <rect x="104" y="132" width="120" height="8" rx="4" fill="#8FB9C0" />
        <rect x="104" y="150" width="90" height="8" rx="4" fill="#F6D3C2" />
        <rect x="90" y="168" width="40" height="8" rx="4" fill="#B9AADB" />
      </g>
      <g className="float-b">
        <rect x="236" y="30" width="96" height="58" rx="12" fill="#E9E2F6" stroke="#776991" strokeWidth="3" />
        <text x="284" y="66" textAnchor="middle" fontFamily="Cormorant Garamond, Georgia, serif" fontStyle="italic" fontSize="26" fill="#776991">85%</text>
      </g>
      <g className="float-c">
        <text x="40" y="58" fontFamily="DM Sans, sans-serif" fontSize="28" fontWeight="600" fill="#648F9B">&lt;/&gt;</text>
      </g>
    </svg>
  ),
  building: (
    <svg viewBox="0 0 360 260" aria-hidden="true">
      <ellipse cx="180" cy="238" rx="150" ry="12" fill="#385A69" opacity=".08" />
      <g className="float-a">
        <rect x="40" y="58" width="180" height="128" rx="12" fill="#FFFDF9" stroke="#648F9B" strokeWidth="3" />
        <path d="M40 80h180" stroke="#648F9B" strokeWidth="2" />
        <rect x="56" y="96" width="90" height="12" rx="6" fill="#385A69" opacity=".75" />
        <rect x="56" y="116" width="120" height="6" rx="3" fill="#8FB9C0" />
        <rect x="56" y="132" width="60" height="16" rx="8" fill="#B4D8DC" />
        <rect x="150" y="96" width="54" height="72" rx="8" fill="#E3F0F1" />
      </g>
      <g className="float-b">
        <rect x="170" y="96" width="160" height="116" rx="12" fill="#FFFDF9" stroke="#776991" strokeWidth="3" />
        <path d="M170 116h160" stroke="#776991" strokeWidth="2" />
        <rect x="186" y="130" width="38" height="46" rx="6" fill="#E9E2F6" />
        <rect x="232" y="130" width="38" height="46" rx="6" fill="#FBEAE1" />
        <rect x="278" y="130" width="38" height="46" rx="6" fill="#E3F0F1" />
        <rect x="186" y="186" width="60" height="10" rx="5" fill="#B9AADB" />
      </g>
    </svg>
  ),
  creative: (
    <svg viewBox="0 0 360 260" aria-hidden="true">
      <ellipse cx="180" cy="238" rx="150" ry="12" fill="#385A69" opacity=".08" />
      <g className="float-a">
        <rect x="58" y="50" width="130" height="160" rx="6" fill="#FFFDF9" stroke="#776991" strokeWidth="3" transform="rotate(-6 123 130)" />
        <circle cx="116" cy="112" r="34" fill="#B9AADB" opacity=".8" transform="rotate(-6 123 130)" />
        <path d="M70 180 C 100 150, 130 190, 176 160" stroke="#8FB9C0" strokeWidth="10" fill="none" strokeLinecap="round" transform="rotate(-6 123 130)" />
      </g>
      <g className="float-b">
        <rect x="190" y="70" width="120" height="84" rx="10" fill="#385A69" />
        <rect x="200" y="80" width="100" height="64" rx="6" fill="#E3F0F1" />
        <path d="M240 98v28l22-14z" fill="#776991" />
        <g fill="#FFFDF9">
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={198 + i * 22} y="160" width="16" height="10" rx="2" />
          ))}
        </g>
      </g>
      <g className="float-c">
        <path d="M268 210 l40 -60" stroke="#648F9B" strokeWidth="8" strokeLinecap="round" />
        <path d="M308 150 l6 -10 c4 -6 12 -2 8 4 l-6 10z" fill="#F6D3C2" />
      </g>
    </svg>
  ),
};

export default function Journey() {
  const [active, setActive] = useState(0);
  const tabsRef = useRef([]);
  const ch = chapters[active];

  const onKey = (e) => {
    let n = active;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (active + 1) % chapters.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (active - 1 + chapters.length) % chapters.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = chapters.length - 1;
    else return;
    e.preventDefault();
    setActive(n);
    tabsRef.current[n]?.focus();
  };

  return (
    <section id="journey" className="section journey" aria-labelledby="journey-title">
      <div className="wrap">
        <SectionHeading
          eyebrow="My journey · from chemistry to code"
          lead="Different Chapters,"
          accent="One Curious Mind."
          id="journey-title"
          scribble="turn the pages →"
        />

        <Reveal className="book">
          <div className="book__tabs" role="tablist" aria-label="Chapters of my journey" onKeyDown={onKey}>
            {chapters.map((c, i) => (
              <button
                key={c.id}
                ref={(el) => (tabsRef.current[i] = el)}
                role="tab"
                id={`ch-tab-${c.id}`}
                aria-selected={active === i}
                aria-controls={`ch-panel-${c.id}`}
                tabIndex={active === i ? 0 : -1}
                className={`bookmark ${active === i ? 'is-active' : ''}`}
                style={{ '--i': i }}
                onClick={() => setActive(i)}
              >
                <span className="bookmark__num">{c.number}</span>
                <span className="bookmark__title">{c.title.replace('The ', '')}</span>
              </button>
            ))}
          </div>

          <div className="book__page" role="tabpanel" id={`ch-panel-${ch.id}`} aria-labelledby={`ch-tab-${ch.id}`} key={ch.id}>
            <div className="book__art">{Art[ch.art]}</div>
            <div className="book__text">
              <p className="book__num">
                {ch.number}
                {ch.date ? <time> · {ch.date}</time> : null}
              </p>
              <h3>{ch.title}</h3>
              <p className="book__subtitle">{ch.subtitle}</p>
              <p className="book__body">“{ch.text}”</p>
              {ch.tags ? (
                <ul className="chips" aria-label="Technologies learned">
                  {ch.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              ) : null}
              {ch.links ? (
                <ul className="book__links">
                  {ch.links.map((l) => (
                    <li key={l.href}>
                      <a className="link" href={l.href} target="_blank" rel="noopener noreferrer">
                        {l.label} <Icon name="arrowUpRight" size={15} />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="scribble book__note" aria-hidden="true">{ch.note}</p>
              <div className="book__nav">
                <button type="button" className="icon-btn" onClick={() => setActive((active - 1 + chapters.length) % chapters.length)}>
                  <Icon name="chevronLeft" size={18} />
                  <span className="sr-only">Previous chapter</span>
                </button>
                <span className="book__count" aria-hidden="true">
                  {active + 1} / {chapters.length}
                </span>
                <button type="button" className="icon-btn" onClick={() => setActive((active + 1) % chapters.length)}>
                  <Icon name="chevronRight" size={18} />
                  <span className="sr-only">Next chapter</span>
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
