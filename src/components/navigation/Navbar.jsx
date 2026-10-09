import { useEffect, useRef, useState } from 'react';
import useScrolled from '../../hooks/useScrolled';
import useActiveSection from '../../hooks/useActiveSection';
import { navLinks, site } from '../../data/site';
import { scrollToId } from '../../utils/scroll';
import { Flower } from '../ui/SectionHeading';

const ids = navLinks.map((l) => l.id);

export function Wordmark({ className = '' }) {
  return (
    <span className={`wordmark ${className}`}>
      noor<span className="wordmark__dot">.</span>
      <Flower size={11} className="wordmark__flower" />
    </span>
  );
}

export default function Navbar() {
  const scrolled = useScrolled(30);
  const active = useActiveSection(ids);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const menuRef = useRef(null);

  const go = (id) => (e) => {
    e.preventDefault();
    setOpen(false);
    requestAnimationFrame(() => scrollToId(id));
  };

  useEffect(() => {
    if (!open) return undefined;
    document.body.classList.add('no-scroll');
    menuRef.current?.querySelector('a')?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (e.key === 'Tab') {
        const items = [toggleRef.current, ...menuRef.current.querySelectorAll('a')];
        const i = items.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          items[items.length - 1].focus();
        } else if (!e.shiftKey && i === items.length - 1) {
          e.preventDefault();
          items[0].focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <a className="skip-link" href="#main">Skip to content</a>
      <nav className="nav__bar" aria-label="Primary">
        <a href="#home" className="nav__brand" onClick={go('home')} aria-label={`${site.name} — back to the top`}>
          <Wordmark />
        </a>

        <ul className="nav__links">
          {navLinks.slice(1, -1).map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} onClick={go(l.id)} className={active === l.id ? 'is-active' : ''} aria-current={active === l.id ? 'true' : undefined}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a href="#contact" onClick={go('contact')} className="btn btn--primary btn--sm nav__cta">
          <span className="btn__label">Let’s Talk ✿</span>
        </a>

        <button ref={toggleRef} type="button" className="nav__toggle" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((v) => !v)}>
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span className="nav__toggle-lines" aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      </nav>

      <div id="mobile-menu" className="menu" ref={menuRef} hidden={!open}>
        <p className="scribble menu__hello" aria-hidden="true">where to next? ✿</p>
        <ul className="menu__list">
          {navLinks.map((l, i) => (
            <li key={l.id} style={{ '--i': i }}>
              <a href={`#${l.id}`} onClick={go(l.id)} className={active === l.id ? 'is-active' : ''}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a href="#contact" onClick={go('contact')} className="btn btn--primary menu__cta">
          <span className="btn__label">Let’s Talk ✿</span>
        </a>
      </div>
    </header>
  );
}
