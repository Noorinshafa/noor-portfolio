/**
 * Device mockups. Show the real screenshot when `project.image` is set; otherwise
 * a soft, clearly illustrative composition in the project's tint (never a fake screenshot).
 */
export function Browser({ domain, children, className = '' }) {
  return (
    <div className={`browser ${className}`}>
      <div className="browser__bar" aria-hidden="true">
        <span className="browser__dots">
          <i />
          <i />
          <i />
        </span>
        <span className="browser__url">{domain}</span>
      </div>
      <div className="browser__view">{children}</div>
    </div>
  );
}

function Sketch({ project }) {
  const [a, b] = project.tint;
  const shop = project.type === 'shop';
  return (
    <div className={`sketch sketch--${project.type}`} style={{ '--a': a, '--b': b }} aria-hidden="true">
      <div className="sketch__nav">
        <span className="sketch__logo" />
        <span className="sketch__links">
          <i />
          <i />
          <i />
        </span>
        <span className="sketch__pill" />
      </div>
      <div className="sketch__hero">
        <div className="sketch__copy">
          <span className="sketch__kicker" />
          <strong>{project.name}</strong>
          <span className="sketch__line" />
          <span className="sketch__line sketch__line--short" />
          <span className="sketch__cta" />
        </div>
        {shop ? (
          <div className="sketch__products">
            <i />
            <i />
            <i />
          </div>
        ) : (
          <div className="sketch__panel">
            <i />
            <i />
            <i />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectPreview({ project, eager = false, withPhone = false }) {
  return (
    <div className={`preview ${withPhone ? 'preview--duo' : ''}`}>
      <Browser domain={project.domain}>
        {project.image ? (
          <img src={project.image} alt={`Homepage of ${project.name}`} loading={eager ? 'eager' : 'lazy'} decoding="async" />
        ) : (
          <Sketch project={project} />
        )}
      </Browser>
      {withPhone ? (
        <div className="phone" aria-hidden={!project.mobileImage}>
          <div className="phone__screen">
            {project.mobileImage ? (
              <img src={project.mobileImage} alt={`${project.name} on mobile`} loading="lazy" />
            ) : (
              <div className="sketch sketch--phone" style={{ '--a': project.tint[0], '--b': project.tint[1] }}>
                <span className="sketch__logo" />
                <strong>{project.name}</strong>
                <div className="sketch__products sketch__products--stack">
                  <i />
                  <i />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
