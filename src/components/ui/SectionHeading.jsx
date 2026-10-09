import Reveal from '../animations/Reveal';

/**
 * Eyebrow + editorial serif heading. `lead` is set upright, `accent` in italic lavender.
 * `scribble` adds a small handwritten aside.
 */
export default function SectionHeading({ eyebrow, lead, accent, after = '', id, intro, scribble, align = 'left' }) {
  return (
    <header className={`heading heading--${align}`}>
      <Reveal as="p" className="eyebrow">
        <Flower /> {eyebrow}
      </Reveal>
      <Reveal as="h2" id={id} className="heading__title" delay={80}>
        {lead} {accent ? <em>{accent}</em> : null}
        {after}
      </Reveal>
      {scribble ? (
        <Reveal as="p" className="scribble heading__scribble" delay={260} aria-hidden="true">
          {scribble}
        </Reveal>
      ) : null}
      {intro ? (
        <Reveal as="p" className="heading__intro" delay={160}>
          {intro}
        </Reveal>
      ) : null}
    </header>
  );
}

export function Flower({ size = 12, className = '' }) {
  return (
    <svg className={`tiny-flower ${className}`} width={size} height={size} viewBox="-12 -12 24 24" aria-hidden="true">
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} rx="4.2" ry="7" cy="-5.5" transform={`rotate(${r})`} fill="currentColor" />
      ))}
      <circle r="3.4" fill="#F6D3C2" />
    </svg>
  );
}
