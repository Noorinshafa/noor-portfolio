import useInView from '../../hooks/useInView';

/**
 * Scroll-triggered entrance. Content is always in the DOM and readable;
 * only opacity/transform animate. Disabled under prefers-reduced-motion via CSS.
 */
export default function Reveal({ as: Tag = 'div', delay = 0, variant = 'up', className = '', children, ...rest }) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      className={`reveal reveal--${variant} ${inView ? 'is-in' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms`, ...(rest.style || {}) }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
