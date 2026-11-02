import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/* ---------- Scroll reveal: wrap anything to make it fade/slide in when scrolled into view ---------- */
export function Reveal({ children, delay = 0, className = '', from = 'up' }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) return setOn(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal from-${from} ${on ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ---------- Small inline icons ---------- */
const paths = {
  atom: (
    <>
      <circle cx="12" cy="12" r="1.6" />
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
    </>
  ),
  steth: (
    <>
      <path d="M6 3v6a4 4 0 0 0 8 0V3M10 13v2a5 5 0 0 0 10 0v-2" />
      <circle cx="20" cy="11" r="2" />
    </>
  ),
  network: (
    <>
      <circle cx="5" cy="12" r="2.5" />
      <circle cx="19" cy="5" r="2.5" />
      <circle cx="19" cy="19" r="2.5" />
      <path d="M7.2 11l9.6-4.6M7.2 13l9.6 4.6" />
    </>
  ),
  scale: <path d="M12 3v18M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0zM8 21h8" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 21v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1M17 4a3.5 3.5 0 0 1 0 7M22 21v-1a5 5 0 0 0-3-4.6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2.5" />
      <path d="M8 2v4M16 2v4M3 10h18" />
    </>
  ),
  doc: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8" />,
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </>
  ),
  star: <path fill="currentColor" d="M12 2l3 6.9 7.5.7-5.7 5 1.7 7.4L12 18l-6.5 4 1.7-7.4-5.7-5 7.5-.7z" />,
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2.5" />
      <path d="M2 7l10 7 10-7" />
    </>
  ),
  arrow: <path d="M5 12h14M12 5l7 7-7 7" />,
  chevron: <path d="M9 6l6 6-6 6" />,
  up: <path d="M12 19V5M5 12l7-7 7 7" />,
};

export function Icon({ name, size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

/* Turns **bold** into <strong> */
export function Rich({ text }) {
  return String(text || '')
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) =>
      part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>
    );
}

/* ---------- Sub-page title bar ---------- */
export function PageHeader({ title }) {
  return (
    <section className="page-title">
      <div className="container">
        <h2>{title}</h2>
        <ol className="crumbs">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>{title}</li>
        </ol>
      </div>
    </section>
  );
}

/* ---------- Section heading: red pill + title + gradient underline ---------- */
export function SectionHead({ eyebrow, title, center = false, children }) {
  return (
    <div className={`sec-head ${center ? 'center' : ''}`}>
      {eyebrow && <span className="pill">{eyebrow}</span>}
      <h2>{title}</h2>
      <span className="underline" />
      {children}
    </div>
  );
}

export function Loading({ state }) {
  if (state.loading) return <p className="muted">Loading…</p>;
  if (state.error) return <p className="error">Could not load data: {state.error}</p>;
  return null;
}

export function Empty({ children = 'Nothing here yet. Please check back soon.' }) {
  return <p className="muted">{children}</p>;
}

export const lines = (text) =>
  String(text || '')
    .split('\n')
    .filter((l) => l.trim());

export function Paragraphs({ text }) {
  return lines(text).map((l, i) => (
    <p key={i}>
      <Rich text={l} />
    </p>
  ));
}

export function BulletLines({ text }) {
  const items = lines(text);
  if (!items.length) return null;
  return (
    <ul className="bullets">
      {items.map((l, i) => (
        <li key={i}>{l}</li>
      ))}
    </ul>
  );
}
