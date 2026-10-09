import Icon from '../ui/Icon';
import { Wordmark } from '../navigation/Navbar';
import { navLinks, site } from '../../data/site';
import { goTo, scrollToId } from '../../utils/scroll';

function Bloom() {
  return (
    <svg className="bloom" viewBox="-30 -30 60 60" aria-hidden="true">
      <path className="bloom__stem" d="M0 30 C 0 18, -4 10, 0 2" />
      <g className="bloom__head">
        {[0, 72, 144, 216, 288].map((r, i) => (
          <ellipse key={r} rx="5.5" ry="9" cy="-9" transform={`rotate(${r})`} style={{ '--i': i }} />
        ))}
        <circle r="5" className="bloom__eye" />
      </g>
    </svg>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  const socials = site.socials.filter((s) => s.href);
  return (
    <footer className="footer">
      <div className="wrap footer__grid">
        <div className="footer__brand">
          <a href="#home" onClick={goTo('home')} aria-label="Back to the top">
            <Wordmark className="wordmark--big" />
          </a>
          <p className="scribble footer__tag">
            See you in my little world <Bloom />
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="footer__links">
            {navLinks.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} onClick={goTo(l.id)}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {socials.length || site.email ? (
          <ul className="footer__social" aria-label="Social profiles">
            {site.email ? (
              <li>
                <a className="icon-btn" href={`mailto:${site.email}`}>
                  <Icon name="mail" size={18} />
                  <span className="sr-only">Email</span>
                </a>
              </li>
            ) : null}
            {socials.map((s) => (
              <li key={s.label}>
                <a className="icon-btn" href={s.href} target="_blank" rel="noopener noreferrer">
                  <Icon name={s.icon} size={18} />
                  <span className="sr-only">{s.label} (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="wrap footer__bottom">
        <p>
          © {year} Noor · {site.tagline}
        </p>
        <button type="button" className="to-top" onClick={() => scrollToId('home')}>
          Back to top <Icon name="arrowUp" size={15} />
        </button>
      </div>
    </footer>
  );
}
