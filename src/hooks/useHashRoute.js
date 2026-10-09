import { useCallback, useEffect, useState } from 'react';

/**
 * Minimal hash router for case-study pages: #/work/<slug>.
 * Hash routing works on any static host (Vercel, Netlify, GitHub Pages) with no rewrites.
 */
function parse() {
  const m = window.location.hash.match(/^#\/work\/([\w-]+)/);
  return m ? m[1] : null;
}

export default function useHashRoute() {
  const [slug, setSlug] = useState(parse);
  useEffect(() => {
    const onHash = () => setSlug(parse());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const open = useCallback((s) => {
    window.location.hash = `/work/${s}`;
  }, []);
  const close = useCallback(() => {
    if (parse()) {
      // remove hash without jumping the page
      history.pushState('', document.title, window.location.pathname + window.location.search);
      setSlug(null);
    }
  }, []);
  return { slug, open, close };
}
