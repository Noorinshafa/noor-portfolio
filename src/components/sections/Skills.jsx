import { useState } from 'react';
import Reveal from '../animations/Reveal';
import SectionHeading from '../ui/SectionHeading';
import { skillGroups } from '../../data/skills';
import { projects } from '../../data/projects';

const projectName = (slug) => projects.find((p) => p.slug === slug)?.name || slug;

function Skill({ s, kind, i }) {
  const [open, setOpen] = useState(false);
  const id = `skill-${s.name.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <li className={`tool tool--${kind}`} style={{ '--r': `${((i * 37) % 7) - 3}deg` }}>
      <button
        type="button"
        className="tool__btn"
        aria-expanded={open}
        aria-describedby={id}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
      >
        {s.name}
        {s.learned ? <><span className="tool__dot" aria-hidden="true" /><span className="sr-only"> (covered in my NUML training)</span></> : null}
      </button>
      <span role="tooltip" id={id} className={`tool__note ${open ? 'is-open' : ''}`}>
        {s.note}
        {s.usedIn?.length ? <em> Used in {s.usedIn.map(projectName).join(', ')}.</em> : null}
      </span>
    </li>
  );
}

export default function Skills() {
  const code = skillGroups.filter((g) => g.kind === 'code');
  const art = skillGroups.filter((g) => g.kind === 'art');
  return (
    <section id="skills" className="section skills" aria-labelledby="skills-title">
      <div className="wrap">
        <SectionHeading
          eyebrow="My skills · my creative toolbox"
          lead="Things I Use to Make"
          accent="Ideas Real."
          id="skills-title"
          intro="Half developer’s workspace, half artist’s desk. Hover or tap a tool to see what I use it for."
        />

        <Reveal className="desk">
          <div className="desk__side desk__side--code">
            <p className="desk__label scribble">the code side</p>
            {code.map((g, gi) => (
              <article key={g.id} className="window" style={{ '--gi': gi }} aria-labelledby={`sg-${g.id}`}>
                <div className="window__bar" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <span>{g.id}.jsx</span>
                </div>
                <div className="window__body">
                  <h3 id={`sg-${g.id}`}>{g.title}</h3>
                  <p className="desk__blurb">{g.blurb}</p>
                  <ul className="tools">
                    {g.skills.map((s, i) => (
                      <Skill key={s.name} s={s} kind="code" i={i + gi} />
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          <div className="desk__side desk__side--art">
            <p className="desk__label scribble">the art side</p>
            {art.map((g, gi) => (
              <article key={g.id} className={`sheet sheet--${gi}`} aria-labelledby={`sg-${g.id}`}>
                <span className="tape" aria-hidden="true" />
                <h3 id={`sg-${g.id}`}>{g.title}</h3>
                <p className="desk__blurb">{g.blurb}</p>
                <ul className="tools">
                  {g.skills.map((s, i) => (
                    <Skill key={s.name} s={s} kind="art" i={i + gi * 3} />
                  ))}
                </ul>
              </article>
            ))}
            <div className="desk__props" aria-hidden="true">
              <span className="pencil" />
              <span className="swatch swatch--a" />
              <span className="swatch swatch--b" />
              <span className="swatch swatch--c" />
            </div>
          </div>
        </Reveal>

        <p className="skills__legend">
          <span className="tool__dot" aria-hidden="true" /> Covered in my NUML Web Development training (HTML, CSS,
          JavaScript, React, Vite, Git, GitHub, Vercel). No ratings, no percentages — just the tools and what they’re for.
        </p>
      </div>
    </section>
  );
}
