import Icon from './Icon';

/** <a> when href is given, otherwise <button>. Variants: primary · soft · ghost */
export default function Button({ variant = 'primary', href, icon, children, className = '', ...rest }) {
  const cls = `btn btn--${variant} ${className}`;
  const inner = (
    <>
      <span className="btn__label">{children}</span>
      {icon ? <Icon name={icon} size={18} className="btn__icon" /> : null}
    </>
  );
  if (href) {
    const external = /^https?:/.test(href);
    return (
      <a className={cls} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
        {inner}
        {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
      </a>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {inner}
    </button>
  );
}
