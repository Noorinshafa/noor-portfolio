import { useState } from 'react';
import Reveal from '../animations/Reveal';
import Icon from '../ui/Icon';
import SectionHeading from '../ui/SectionHeading';
import CharacterImage from '../world/CharacterImage';
import { site } from '../../data/site';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const empty = { name: '', email: '', subject: '', message: '', company: '' };

function validate(v) {
  const e = {};
  if (!v.name.trim()) e.name = 'Please add your name.';
  if (!v.email.trim()) e.email = 'Please add your email so I can reply.';
  else if (!EMAIL_RE.test(v.email.trim())) e.email = 'This email address looks incomplete — please check it.';
  if (!v.subject.trim()) e.subject = 'A short subject helps me reply faster.';
  if (v.message.trim().length < 10) e.message = 'Please write at least 10 characters.';
  return e;
}

export default function Contact() {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error | mailto

  const configured = Boolean(site.formEndpoint || site.email);
  const socials = site.socials.filter((s) => s.href);

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`f-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    if (values.company) return; // honeypot
    if (site.formEndpoint) {
      setStatus('sending');
      try {
        const res = await fetch(site.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ name: values.name, email: values.email, subject: values.subject, message: values.message }),
        });
        if (!res.ok) throw new Error(String(res.status));
        setStatus('sent');
        setValues(empty);
      } catch {
        setStatus('error');
      }
    } else if (site.email) {
      const body = `${values.message}\n\n— ${values.name} (${values.email})`;
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(body)}`;
      setStatus('mailto');
    }
  };

  const field = (name, label, opts = {}) => (
    <div className={`field ${errors[name] ? 'has-error' : ''} ${opts.wide ? 'field--wide' : ''}`}>
      <label htmlFor={`f-${name}`}>{label}</label>
      {opts.textarea ? (
        <textarea id={`f-${name}`} name={name} rows={5} value={values[name]} onChange={onChange} placeholder={opts.placeholder}
          aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `e-${name}` : undefined} />
      ) : (
        <input id={`f-${name}`} name={name} type={opts.type || 'text'} autoComplete={opts.auto} value={values[name]} onChange={onChange}
          placeholder={opts.placeholder} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `e-${name}` : undefined} />
      )}
      {errors[name] ? (
        <p className="field__error" id={`e-${name}`}>
          <Icon name="alert" size={14} /> {errors[name]}
        </p>
      ) : null}
    </div>
  );

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="wrap contact__grid">
        <div className="contact__intro">
          <SectionHeading
            eyebrow="Contact · let’s make something beautiful"
            lead="Have Something in Mind?"
            accent="Let’s Create It."
            id="contact-title"
            intro="Whether it’s a creative project, a frontend opportunity, a collaboration or simply a hello, I’d love to hear from you."
          />

          <div className="contact__art">
            <CharacterImage className="contact__character" chips={5} />
          </div>

          <ul className="contact__details">
            {site.email ? (
              <li>
                <Icon name="mail" size={18} /> <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
            ) : null}
            {socials.map((s) => (
              <li key={s.label}>
                <Icon name={s.icon} size={18} />
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
            {site.resumeUrl ? (
              <li>
                <a className="btn btn--soft btn--sm" href={site.resumeUrl} download>
                  <span className="btn__label">Download Resume</span>
                  <Icon name="download" size={16} className="btn__icon" />
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        <Reveal className="letter" delay={120}>
          <span className="letter__stamp" aria-hidden="true">✿</span>
          {status === 'sent' ? (
            <div className="letter__done" role="status">
              <h3>Message sent — thank you!</h3>
              <p>It landed safely in my inbox. I’ll get back to you soon.</p>
              <button type="button" className="btn btn--soft" onClick={() => setStatus('idle')}>
                <span className="btn__label">Write another</span>
              </button>
            </div>
          ) : (
            <form className="form" noValidate onSubmit={onSubmit}>
              <p className="scribble letter__hello" aria-hidden="true">Dear Noor,</p>
              <div className="form__row">
                {field('name', 'Name', { auto: 'name', placeholder: 'Your name' })}
                {field('email', 'Email', { type: 'email', auto: 'email', placeholder: 'you@example.com' })}
              </div>
              {field('subject', 'Subject', { placeholder: 'What’s it about?' })}
              {field('message', 'Message', { textarea: true, placeholder: 'Tell me about your idea…' })}
              <div className="hp" aria-hidden="true">
                <label htmlFor="f-company">Company</label>
                <input id="f-company" name="company" tabIndex={-1} autoComplete="off" value={values.company} onChange={onChange} />
              </div>
              <div className="form__foot">
                <button type="submit" className="btn btn--primary" disabled={!configured || status === 'sending'}>
                  <span className="btn__label">{status === 'sending' ? 'Sending…' : 'Send Message'}</span>
                  <Icon name="send" size={17} className="btn__icon" />
                </button>
                <p className="form__status" role="status" aria-live="polite">
                  {!configured
                    ? 'My contact form is being connected — it will be ready very soon.'
                    : status === 'error'
                    ? 'Your message didn’t send. Please check your connection and try again.'
                    : status === 'mailto'
                    ? 'Your email app should open with the message ready to send.'
                    : ''}
                </p>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
