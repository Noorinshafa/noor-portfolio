import Reveal from '../animations/Reveal';
import SectionHeading from '../ui/SectionHeading';
import { notes, traits } from '../../data/site';

export default function Mind() {
  return (
    <section id="mind" className="section mind" aria-labelledby="mind-title">
      <div className="wrap mind__grid">
        <SectionHeading eyebrow="My creative mind" lead="A Little Bit of Everything That Makes Me," accent="Me." id="mind-title" />

        <ul className="bubbles" aria-label="Things that describe me">
          {traits.map((t, i) => (
            <Reveal as="li" key={t.label} className={`bubble bubble--${t.color}`} delay={i * 70} style={{ '--i': i }}>
              <span className="bubble__label">{t.label}</span>
              <span className="bubble__note">{t.note}</span>
            </Reveal>
          ))}
        </ul>

        <ul className="notes" aria-label="A few notes about me">
          {notes.map((n, i) => (
            <Reveal as="li" key={n} className="note" delay={200 + i * 90} style={{ '--i': i }}>
              {n}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
