import { useRef, useState } from 'react';
import Reveal from '../animations/Reveal';
import SectionHeading from '../ui/SectionHeading';
import { approach } from '../../data/site';

/* a small interface preview per step */
const Art = {
  understand: (
    <svg viewBox="0 0 320 200" aria-hidden="true">
      <rect x="20" y="22" width="180" height="150" rx="14" fill="#FFFDF9" stroke="#B9AADB" strokeWidth="2" />
      <text x="40" y="56" fontFamily="Caveat, cursive" fontSize="22" fill="#776991">who is it for?</text>
      {[80, 104, 128].map((y, i) => (
        <g key={y}>
          <circle cx="44" cy={y} r="6" fill={['#B4D8DC', '#F6D3C2', '#B9AADB'][i]} />
          <rect x="58" y={y - 4} width={[110, 90, 120][i]} height="8" rx="4" fill="#E3F0F1" />
        </g>
      ))}
      <circle cx="238" cy="96" r="42" fill="none" stroke="#648F9B" strokeWidth="6" />
      <path d="M268 126l26 26" stroke="#648F9B" strokeWidth="8" strokeLinecap="round" />
    </svg>
  ),
  design: (
    <svg viewBox="0 0 320 200" aria-hidden="true">
      <rect x="20" y="20" width="280" height="160" rx="14" fill="#FFFDF9" stroke="#B9AADB" strokeWidth="2" />
      <rect x="40" y="40" width="110" height="70" rx="10" fill="#E9E2F6" />
      <rect x="40" y="122" width="70" height="10" rx="5" fill="#B9AADB" />
      <rect x="40" y="140" width="100" height="8" rx="4" fill="#E3F0F1" />
      <rect x="170" y="40" width="110" height="34" rx="8" fill="#E3F0F1" />
      <rect x="170" y="84" width="110" height="34" rx="8" fill="#FBEAE1" />
      {['#B4D8DC', '#8FB9C0', '#648F9B', '#776991', '#B9AADB'].map((c, i) => (
        <circle key={c} cx={182 + i * 22} cy="150" r="9" fill={c} />
      ))}
    </svg>
  ),
  develop: (
    <svg viewBox="0 0 320 200" aria-hidden="true">
      <rect x="20" y="20" width="280" height="160" rx="14" fill="#385A69" />
      <circle cx="40" cy="38" r="4" fill="#F6D3C2" />
      <circle cx="54" cy="38" r="4" fill="#B9AADB" />
      <circle cx="68" cy="38" r="4" fill="#B4D8DC" />
      {[
        [40, 66, 60, '#B9AADB'], [60, 86, 120, '#B4D8DC'], [60, 106, 90, '#F6D3C2'], [80, 126, 110, '#B4D8DC'], [60, 146, 70, '#B9AADB'],
      ].map(([x, y, w, c], i) => (
        <rect key={i} x={x} y={y} width={w} height="8" rx="4" fill={c} />
      ))}
      <rect x="222" y="62" width="58" height="96" rx="10" fill="#FFFDF9" />
      <rect x="230" y="74" width="42" height="26" rx="5" fill="#E9E2F6" />
      <rect x="230" y="106" width="30" height="6" rx="3" fill="#8FB9C0" />
    </svg>
  ),
  refine: (
    <svg viewBox="0 0 320 200" aria-hidden="true">
      <rect x="22" y="40" width="150" height="120" rx="12" fill="#FFFDF9" stroke="#B9AADB" strokeWidth="2" />
      <rect x="186" y="56" width="58" height="104" rx="12" fill="#FFFDF9" stroke="#8FB9C0" strokeWidth="2" />
      <rect x="256" y="76" width="42" height="84" rx="10" fill="#FFFDF9" stroke="#F6D3C2" strokeWidth="2" />
      {[[60, 100], [214, 104], [277, 118]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="14" fill={['#E9E2F6', '#E3F0F1', '#FBEAE1'][i]} />
          <path d={`M${x - 6} ${y} l4 5 l9 -10`} stroke="#385A69" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      <text x="92" y="30" fontFamily="Caveat, cursive" fontSize="22" fill="#776991">tested on every size ✿</text>
    </svg>
  ),
};

export default function Approach() {
  const [active, setActive] = useState(0);
  const tabs = useRef([]);
  const onKey = (e) => {
    const n = e.key === 'ArrowRight' ? (active + 1) % 4 : e.key === 'ArrowLeft' ? (active + 3) % 4 : null;
    if (n === null) return;
    e.preventDefault();
    setActive(n);
    tabs.current[n]?.focus();
  };
  const s = approach[active];
  return (
    <section id="approach" className="section approach" aria-labelledby="approach-title">
      <div className="wrap">
        <SectionHeading eyebrow="My approach · how I create" lead="Thoughtfully Designed." accent="Carefully Built." id="approach-title" />

        <Reveal className="process">
          <div className="process__steps" role="tablist" aria-label="Four stages of how I work" onKeyDown={onKey}>
            {approach.map((a, i) => (
              <button
                key={a.step}
                ref={(el) => (tabs.current[i] = el)}
                type="button"
                role="tab"
                id={`ap-tab-${i}`}
                aria-selected={active === i}
                aria-controls="ap-panel"
                tabIndex={active === i ? 0 : -1}
                className={`process__step ${active === i ? 'is-active' : ''}`}
                onClick={() => setActive(i)}
              >
                <span className="process__num">0{i + 1}</span>
                <span className="process__name">{a.step}</span>
              </button>
            ))}
            <span className="process__thread" style={{ '--p': active / 3 }} aria-hidden="true" />
          </div>
          <div className="process__panel" role="tabpanel" id="ap-panel" aria-labelledby={`ap-tab-${active}`} key={active}>
            <p className="process__text">
              <span className="process__big">0{active + 1}</span>
              {s.text}
            </p>
            <div className="process__art">{Art[s.art]}</div>
          </div>
        </Reveal>
        <p className="approach__note">This is how I like to work in general — each project shapes its own path.</p>
      </div>
    </section>
  );
}
