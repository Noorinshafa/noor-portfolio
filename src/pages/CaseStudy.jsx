import { useEffect, useRef } from 'react';
import Icon from '../components/ui/Icon';
import ProjectPreview from '../components/ui/ProjectPreview';
import { projects } from '../data/projects';

/**
 * Case study as an accessible full-screen dialog at #/work/<slug>.
 * Only sections with real content are shown.
 */
export default function CaseStudy({ slug, onClose, onNavigate }) {
  const project = projects.find((p) => p.slug === slug);
  const ref = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!project) return undefined;
    const prevFocus = document.activeElement;
    const prevTitle = document.title;
    document.title = `${project.name} — Case Study · A Little World of Noor`;
    document.body.classList.add('no-scroll');
    closeRef.current?.focus();
    ref.current?.scrollTo(0, 0);
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const f = ref.current.querySelectorAll('a[href], button:not([disabled])');
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
      document.title = prevTitle;
      prevFocus?.focus?.({ preventScroll: true });
    };
  }, [project, onClose]);

  if (!project) return null;
  const i = projects.indexOf(project);
  const next = projects[(i + 1) % projects.length];
  const blocks = [
    ['Overview', project.summary],
    ['Objective', project.objective],
    ['My contribution', project.contribution],
    ['Design approach', project.approach],
    ['Challenges & solutions', project.challenges],
  ].filter(([, v]) => v);

  return (
    <div className="case" role="dialog" aria-modal="true" aria-labelledby="case-title" ref={ref}>
      <div className="case__backdrop" onClick={onClose} aria-hidden="true" />
      <article className="case__sheet">
        <header className="case__top">
          <p className="eyebrow">Case study · {String(i + 1).padStart(2, '0')}</p>
          <button ref={closeRef} type="button" className="icon-btn" onClick={onClose}>
            <Icon name="close" size={20} />
            <span className="sr-only">Close case study</span>
          </button>
        </header>

        <p className="exhibit__cat">{project.category}{project.year ? ` · ${project.year}` : ''}</p>
        <h2 id="case-title" className="case__title">{project.name}</h2>
        {project.relationship ? <p className="scribble case__rel">{project.relationship}</p> : null}

        <div className="case__hero">
          <ProjectPreview project={project} eager withPhone={project.type === 'shop'} />
        </div>

        <div className="case__grid">
          <div className="case__blocks">
            {blocks.map(([t, v]) => (
              <section key={t} className="case__block">
                <h3>{t}</h3>
                <p>{v}</p>
              </section>
            ))}
          </div>
          <aside className="case__aside">
            {project.stack?.length ? (
              <section className="case__block">
                <h3>Tools & technologies</h3>
                <ul className="chips">
                  {project.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            {project.integrations?.length ? (
              <section className="case__block">
                <h3>Integrations</h3>
                <ul className="chips">
                  {project.integrations.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            <div className="case__links">
              {project.url ? (
                <a className="btn btn--primary" href={project.url} target="_blank" rel="noopener noreferrer">
                  <span className="btn__label">{project.linkLabel || 'Visit Website'}</span>
                  <Icon name="arrowUpRight" size={18} className="btn__icon" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : null}
              {project.repo ? (
                <a className="btn btn--soft" href={project.repo} target="_blank" rel="noopener noreferrer">
                  <span className="btn__label">Repository</span>
                  <Icon name="github" size={18} className="btn__icon" />
                </a>
              ) : null}
            </div>
          </aside>
        </div>

        {project.gallery?.length ? (
          <div className="case__gallery">
            {project.gallery.map((g, gi) => (
              <figure key={gi}>
                <img src={g.src} alt={g.alt} loading="lazy" />
                {g.caption ? <figcaption>{g.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        ) : null}

        {next && next.slug !== project.slug ? (
          <footer className="case__next">
            <span className="scribble">next little project</span>
            <button type="button" onClick={() => onNavigate(next.slug)}>
              {next.name} <Icon name="arrowRight" size={26} />
            </button>
          </footer>
        ) : null}
      </article>
    </div>
  );
}
