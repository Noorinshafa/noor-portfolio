import cutout from '../../assets/images/noor-cutout.webp';
import { TECH } from './techItems';

/**
 * Still version of Noor (background removed) with a few CSS-floating tech tiles.
 * Used when WebGL isn't available, while the 3D scene loads, and in the contact section.
 */
export default function CharacterImage({ className = '', chips = 6, alt = '' }) {
  return (
    <div className={`character-image ${className}`}>
      <img src={cutout} alt={alt} width="336" height="682" decoding="async" />
      {chips ? (
        <ul className="orbit-chips" aria-hidden="true">
          {TECH.slice(0, chips).map((t, i) => (
            <li key={t.label} style={{ '--i': i, '--n': chips, '--from': t.from, '--to': t.to, '--ink': t.ink }}>
              {t.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
