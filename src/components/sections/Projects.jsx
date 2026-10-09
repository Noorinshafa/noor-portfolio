import Reveal from '../animations/Reveal';
import Icon from '../ui/Icon';
import TiltCard from '../ui/TiltCard';
import SectionHeading, { Flower } from '../ui/SectionHeading';
import ProjectPreview from '../ui/ProjectPreview';
import { projects, totalCompletedProjects } from '../../data/projects';
import { goTo } from '../../utils/scroll';

function Exhibit({ project, index, onOpen }) {
  const flipped = index % 2 === 1;
  return (
    <article className={`exhibit ${flipped ? 'is-flipped' : ''}`} aria-labelledby={`p-${project.slug}`}>
      <Reveal className="exhibit__media" variant="mask">
        <TiltCard max={5}>
          <button type="button" className="exhibit__open" onClick={() => onOpen(project.slug)} aria-label={`Open the ${project.name} case study`}>
            <ProjectPreview project={project} withPhone={project.type === 'shop'} />
          </button>
        </TiltCard>
        <Flower size={26} className="exhibit__flower exhibit__flower--a" />
        <Flower size={16} className="exhibit__flower exhibit__flower--b" />
      </Reveal>

      <Reveal className="exhibit__info" delay={140}>
        <p className="exhibit__num" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </p>
        <p className="exhibit__cat">{project.category}</p>
        <h3 id={`p-${project.slug}`} className="exhibit__title">
          {project.name}
        </h3>
        {project.relationship ? <p className="scribble exhibit__rel">{project.relationship}</p> : null}
        <p className="exhibit__summary">{project.summary}</p>
        {project.stack?.length ? (
          <ul className="chips" aria-label="Technologies">
            {project.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        ) : null}
        <div className="exhibit__actions">
          <button type="button" className="btn btn--primary" onClick={() => onOpen(project.slug)}>
            <span className="btn__label">Read the case study</span>
            <Icon name="arrowRight" size={18} className="btn__icon" />
          </button>
          {project.url ? (
            <a className="link" href={project.url} target="_blank" rel="noopener noreferrer">
              {project.linkLabel || 'Visit Website'} <Icon name="arrowUpRight" size={16} />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : null}
        </div>
      </Reveal>
    </article>
  );
}

export default function Projects({ onOpen }) {
  const extra = Math.max(0, 5 - projects.length);
  return (
    <section id="projects" className="section projects" aria-labelledby="projects-title">
      <div className="wrap">
        <SectionHeading
          eyebrow="My projects · things I’ve built"
          lead="A Few Things I’ve"
          accent="Brought to Life."
          id="projects-title"
          intro={`I’ve completed ${totalCompletedProjects} web development projects. Here are two of them — open a case study for the details, or visit the live site.`}
        />

        <div className="exhibits">
          {projects.map((p, i) => (
            <Exhibit key={p.slug} project={p} index={i} onOpen={onOpen} />
          ))}
        </div>

        {extra > 0 ? (
          <Reveal className="more">
            <div className="more__text">
              <h3>More little projects</h3>
              <p>
                The rest of my completed projects are being written up as case studies. Want to hear about them now?{' '}
                <a className="link" href="#contact" onClick={goTo('contact')}>
                  Just ask ✿
                </a>
              </p>
            </div>
            <ul className="more__slots" aria-hidden="true">
              {Array.from({ length: extra }).map((_, i) => (
                <li key={i} style={{ '--i': i }}>
                  <span className="scribble">coming soon</span>
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
