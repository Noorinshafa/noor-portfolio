import { prefersReducedMotion } from '../hooks/useReducedMotion';

/** Smoothly scrolls to a section and moves focus to its heading for keyboard & screen-reader users. */
export function scrollToId(id, { focus = true } = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - (id === 'home' ? 0 : 80);
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  if (focus) {
    const target = el.querySelector('h1, h2') || el;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
}

/** onClick helper for in-page links */
export const goTo = (id) => (e) => {
  e.preventDefault();
  scrollToId(id);
};
