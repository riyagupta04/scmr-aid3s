import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useSite } from '../SiteContext.jsx';
import { Icon } from './Bits.jsx';

// Images are loaded from the reference site. Download them into client/public/images
// and change these paths if you want to host them yourself.
export const IMG = {
  logo: '/images/scmr-logo.png',
  partner: '/images/centro-escolar-university-logo.png',
  banner: '/images/banner.webp',
  committeeBanner: '/images/conferece-banner.webp',
  contact: '/images/contact-img.webp',
  who: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAOoZdx4ecW5WpetodbvSSZjxLwRNtKLrW-9csJyG_aKOG3CkX',
};

export const links = [
  ['/', 'Home'],
  ['/conference-committee', 'Conference Committee'],
  ['/paper-submission', 'Paper Submission'],
  ['/contact', 'Contact Us'],
];

export default function Layout() {
  const site = useSite();
  const [open, setOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const { pathname, hash } = useLocation();

  useEffect(() => {
    setOpen(false);
    if (!hash) window.scrollTo(0, 0);
    else setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 80);
  }, [pathname, hash]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const year = site.startDate ? new Date(site.startDate).getUTCFullYear() : '';
  const titleTag = site.tagline || (site.shortName ? `${site.shortName}${year ? ` - ${year}` : ''}` : site.name);

  return (
    <>
      <header className="top">
        <div className="container top-inner">
          <Link to="/" className="logo-left">
            <img src={IMG.logo} alt="SCMR logo" />
          </Link>
          <div className="top-title">
            <h1>{site.name || 'International Conference on Artificial Intelligence in Design, Diagnostics and Decision Systems'}</h1>
            <span className="year-pill">{titleTag || 'AID3S - 2027'}</span>
          </div>
          <Link to="/" className="logo-right">
            <img src={IMG.partner} alt="Centro Escolar University logo" />
          </Link>
        </div>
        <div className="rainbow" />
      </header>

      <nav className="navbar">
        <div className="container nav-inner">
          <button className="menu-btn" aria-label="Toggle menu" onClick={() => setOpen((o) => !o)}>
            {open ? '✕' : '☰'} <span>Menu</span>
          </button>
          <ul className={open ? 'open' : ''}>
            {links.map(([to, label]) => (
              <li key={to}>
                <NavLink to={to} end={to === '/'}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="rainbow" />
        <div className="container footer-grid">
          <div>
            <h4>About SCMR {site.shortName}</h4>
            <span className="underline" />
            <p>{site.footerAbout}</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <span className="underline" />
            <ul>
              {links.map(([to, label]) => (
                <li key={to}>
                  <Link to={to}>
                    <Icon name="chevron" size={16} /> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Get in Touch</h4>
            <span className="underline" />
            {site.email && (
              <a className="mail" href={`mailto:${site.email}`}>
                <Icon name="mail" size={18} /> {site.email}
              </a>
            )}
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            <span>
              Copyright © {new Date().getFullYear()}, SPJ Centre for Multi-disciplinary Research. All rights reserved
            </span>
            <Link to="/admin">Admin</Link>
          </div>
        </div>
      </footer>

      <button
        className={`to-top ${showTop ? 'show' : ''}`}
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <Icon name="up" size={24} />
      </button>
    </>
  );
}
