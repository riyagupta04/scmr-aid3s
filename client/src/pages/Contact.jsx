import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../SiteContext.jsx';
import { api } from '../api.js';
import { IMG } from '../components/Layout.jsx';

const TOPICS = [
  { id: 'Paper submission', label: 'Paper submission', icon: 'doc' },
  { id: 'Registration', label: 'Registration', icon: 'card' },
  { id: 'Sponsorship', label: 'Sponsorship', icon: 'handshake' },
  { id: 'General enquiry', label: 'General enquiry', icon: 'question' },
];

export default function Contact() {
  const site = useSite();
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: 'General enquiry',
    message: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [touched, setTouched] = useState({});

  const emailValue = site.email || 'secretary@scmrglobal.org';
  const venueValue = site.venue
    ? `${site.venue}${site.city ? `, ${site.city}` : ''}`
    : 'Centro Escolar University, Manila, Philippines';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const selectTopic = (topic) => {
    setForm((prev) => ({ ...prev, subject: topic }));
    const formCard = document.getElementById('formCard');
    if (formCard) {
      formCard.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.message.trim().length < 10) {
      setError('Please write at least 10 characters.');
      return;
    }

    setBusy(true);
    try {
      await api('/messages', {
        method: 'POST',
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject || 'General enquiry',
          message: form.message.trim(),
        },
      });
      setSent(true);
      setError('');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      subject: 'General enquiry',
      message: '',
    });
    setTouched({});
    setSent(false);
    setError('');
  };

  return (
    <div className="ct-page">
      {/* ===== HERO ===== */}
      <section className="ct-hero">
        <span className="ct-orb o1" aria-hidden="true" />
        <span className="ct-orb o2" aria-hidden="true" />
        <div className="ct-wrap ct-hero-grid">
          <div className="ct-hero-text">
            <div className="ct-crumb">
              <Link to="/">
                <svg className="crumb-home-icon" viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
                Home
              </Link>
              <span className="ct-sep">›</span>
              <span>Contact Us</span>
            </div>
            <h1>
              Let&rsquo;s talk about <em>AID3S</em>
            </h1>
            <p>
              Questions about paper submission, registration, sponsorship or the conference in Manila? Write to us and the organising team will reply to you by email.
            </p>
            <div className="ct-hero-cta">
              <a className="ct-btn gold" href="#formCard">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
                Send a message
              </a>
              <a className="ct-btn ghost" href={`mailto:${emailValue}`}>
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                Email us directly
              </a>
            </div>
          </div>
          <div className="ct-hero-art">
            <img
              className="ct-photo"
              src={IMG.contact || '/images/contact-img.webp'}
              alt="Laptop showing incoming email messages"
              width="480"
              height="400"
            />
          </div>
        </div>
      </section>

      {/* ===== INFO + FORM ===== */}
      <section className="ct-main">
        <div className="ct-wrap ct-grid">
          <aside className="ct-info">
            <a className="ct-card ct-info-card" href={`mailto:${emailValue}`}>
              <span className="ct-ico ico-navy">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <span>
                <small>Email</small>
                <span className="v">{emailValue}</span>
              </span>
            </a>

            <div className="ct-card ct-info-card">
              <span className="ct-ico ico-red">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <span>
                <small>Venue</small>
                <span className="v">{venueValue}</span>
              </span>
            </div>

            <div className="ct-card ct-topics">
              <h3>What can we help you with?</h3>
              <p>Pick a topic and we will fill it in for you.</p>
              <div className="ct-chips" id="chips">
                {TOPICS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`ct-chip ${form.subject === t.id ? 'on' : ''}`}
                    onClick={() => selectTopic(t.id)}
                  >
                    {t.icon === 'doc' && (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                        <path d="M16 13H8M16 17H8" />
                      </svg>
                    )}
                    {t.icon === 'card' && (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M2 10h20M7 15h2" />
                      </svg>
                    )}
                    {t.icon === 'handshake' && (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.3-4.3a1 1 0 0 0 0-1.4l-3-3" />
                        <path d="m20.5 7.5-3-3a1 1 0 0 0-1.4 0L13.8 6.8" />
                        <path d="m3.5 16.5 3 3a1 1 0 0 0 1.4 0l5.9-5.9" />
                        <path d="m7 7 3-3a1 1 0 0 1 1.4 0l1.4 1.4" />
                      </svg>
                    )}
                    {t.icon === 'question' && (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
                      </svg>
                    )}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="ct-reply">
              <span className="ct-live" aria-hidden="true" />
              <span>We read every message and reply by email.</span>
            </div>
          </aside>

          <div className={`ct-card ct-form-card ${sent ? 'sent' : ''}`} id="formCard">
            <div className="ct-head">
              <h2>Send us a message</h2>
              <p className="sub">Fill in the form and we will reply to your email address.</p>
            </div>

            {!sent ? (
              <form id="contactForm" onSubmit={handleSubmit} noValidate>
                <div className="ct-row">
                  <div className={`ct-field ${touched.name && !form.name.trim() ? 'has-error' : ''}`}>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Full name"
                      value={form.name}
                      onChange={handleChange}
                      onBlur={() => handleBlur('name')}
                      autoComplete="name"
                      maxLength={100}
                      required
                    />
                    <span className="ct-err">Please enter your name.</span>
                  </div>

                  <div className={`ct-field ${touched.email && (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) ? 'has-error' : ''}`}>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Email address"
                      value={form.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur('email')}
                      autoComplete="email"
                      required
                    />
                    <span className="ct-err">Please enter a valid email address.</span>
                  </div>
                </div>

                <div className="ct-field">
                  <label htmlFor="subject" className="ct-field-label">What is this about?</label>
                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="Paper submission">Paper submission</option>
                    <option value="Registration">Registration</option>
                    <option value="Sponsorship">Sponsorship</option>
                    <option value="General enquiry">General enquiry</option>
                  </select>
                </div>

                <div className={`ct-field ${touched.message && form.message.trim().length < 10 ? 'has-error' : ''}`}>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Your message"
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    onBlur={() => handleBlur('message')}
                    minLength={10}
                    maxLength={5000}
                    required
                  />
                  <div className="ct-field-meta">
                    <span className="ct-err">
                      {touched.message && form.message.trim().length < 10
                        ? 'Please write at least 10 characters.'
                        : ''}
                    </span>
                    <span className="ct-count" id="msgCount">
                      {form.message.length} / 5000
                    </span>
                  </div>
                </div>

                {error && <div className="ct-status error" role="alert">{error}</div>}

                <button type="submit" className={`ct-send ${busy ? 'loading' : ''}`} id="sendBtn" disabled={busy}>
                  <span className="ct-spin" aria-hidden="true" />
                  <svg className="fa-paper-plane" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                  <span className="ct-send-text">{busy ? 'Sending...' : 'Send message'}</span>
                </button>
              </form>
            ) : (
              <div className="ct-success" role="status">
                <div className="ct-check">
                  <svg viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M10 25 L20 35 L38 13" />
                  </svg>
                </div>
                <h3>Message sent</h3>
                <p>Thank you. We have received your message and will reply to your email soon.</p>
                <button type="button" className="ct-again" id="againBtn" onClick={resetForm}>
                  Send another message
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== VENUE MAP ===== */}
      <section className="ct-venue">
        <div className="ct-wrap">
          <div className="ct-venue-box">
            <iframe
              title="Map of Centro Escolar University, Manila"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://maps.google.com/maps?q=Centro%20Escolar%20University%20Manila&t=&z=15&ie=UTF8&iwloc=&output=embed"
            />
            <div className="ct-venue-tag">
              <small>CONFERENCE VENUE</small>
              <strong>Centro Escolar University</strong>
              <span>Manila, Philippines</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
