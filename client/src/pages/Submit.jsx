import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useSite } from '../SiteContext.jsx';
import { IMG } from '../components/Layout.jsx';

export default function Submit() {
  const site = useSite();
  const [form, setForm] = useState({
    author: '',
    email: '',
    institution: '',
    title: '',
    message: '',
    certify: false,
    consent: false,
  });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] || null;
    if (selected && selected.size > 10 * 1024 * 1024) {
      setError('The file is too large. Maximum size is 10 MB.');
      setFile(null);
      return;
    }
    setError('');
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.author.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!form.title.trim()) {
      setError('Please enter the paper title.');
      return;
    }
    if (!file) {
      setError('Please attach a PDF, DOC, or DOCX file (max 10 MB).');
      return;
    }
    if (!form.certify || !form.consent) {
      setError('Please accept both declarations to continue.');
      return;
    }

    const fd = new FormData();
    fd.append('author', form.author.trim());
    fd.append('email', form.email.trim());
    fd.append('institution', form.institution.trim());
    fd.append('title', form.title.trim());
    fd.append('message', form.message.trim());
    fd.append('paper', file);

    setBusy(true);
    try {
      const res = await api('/submissions', { method: 'POST', form: fd });
      setSuccess(res.paperId || 'Received');
    } catch (err) {
      setError(err.message || 'Something went wrong while submitting. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const resetForm = () => {
    setForm({
      author: '',
      email: '',
      institution: '',
      title: '',
      message: '',
      certify: false,
      consent: false,
    });
    setFile(null);
    setSuccess(null);
    setError('');
  };

  return (
    <div className="submission-page">
      {/* Breadcrumb banner */}
      <section
        className="cm-banner"
        style={{
          backgroundImage: `linear-gradient(100deg, rgba(15, 39, 102, 0.95) 25%, rgba(27, 63, 149, 0.78) 65%, rgba(217, 38, 47, 0.55)), url('${IMG.committeeBanner || IMG.banner}')`,
        }}
      >
        <span className="cm-banner-bg" aria-hidden="true" />
        <span className="cm-banner-shape cm-s1" aria-hidden="true" />
        <span className="cm-banner-shape cm-s2" aria-hidden="true" />
        <div className="cm-banner-inner">
          <h2>Paper Submission</h2>
          <span className="cm-bar" aria-hidden="true" />
          <nav aria-label="Breadcrumb">
            <ol className="cm-crumbs">
              <li>
                <Link to="/">
                  <svg className="crumb-home-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                  </svg>
                  Home
                </Link>
              </li>
              <li aria-current="page">Paper Submission</li>
            </ol>
          </nav>
        </div>
        <div className="cm-banner-wave" aria-hidden="true" />
      </section>

      {/* Section 1: Paper Submission Guidelines */}
      <section className="submission-guidelines-section">
        <div className="submission-guidelines-container">
          <div className="submission-guidelines-header">
            <span className="submission-eyebrow">FOR AUTHORS</span>
            <h2>Paper Submission Guidelines</h2>
            <p>
              Please ensure that your research paper meets the following requirements before submission.
            </p>
          </div>

          <div className="submission-guidelines-grid">
            {/* Guideline 1 */}
            <article className="submission-guideline-card">
              <div className="submission-card-top">
                <span className="submission-number">01</span>
                <div className="submission-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m16 16 4 4" />
                    <path d="M8.5 11h5M11 8.5v5" />
                  </svg>
                </div>
              </div>
              <h3>Research Problem &amp; Objectives</h3>
              <p>
                Clearly identify the research problem, objectives and contributions of your work.
              </p>
            </article>

            {/* Guideline 2 */}
            <article className="submission-guideline-card">
              <div className="submission-card-top">
                <span className="submission-number">02</span>
                <div className="submission-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 3h6" />
                    <path d="M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" />
                    <path d="M8 15h8" />
                  </svg>
                </div>
              </div>
              <h3>Methodology &amp; Validation</h3>
              <p>
                Present a sound methodology supported by appropriate experiments, analysis or validation.
              </p>
            </article>

            {/* Guideline 3 */}
            <article className="submission-guideline-card">
              <div className="submission-card-top">
                <span className="submission-number">03</span>
                <div className="submission-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 19V5" />
                    <path d="M4 19h16" />
                    <path d="M8 15V9" />
                    <path d="M12 15V5" />
                    <path d="M16 15v-4" />
                  </svg>
                </div>
              </div>
              <h3>Comparison with Existing Methods</h3>
              <p>
                Compare proposed approaches with relevant existing methods wherever applicable.
              </p>
            </article>

            {/* Guideline 4 */}
            <article className="submission-guideline-card">
              <div className="submission-card-top">
                <span className="submission-number">04</span>
                <div className="submission-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 19h16" />
                    <path d="M6 16V9" />
                    <path d="M10 16V5" />
                    <path d="M14 16v-4" />
                    <path d="M18 16V7" />
                  </svg>
                </div>
              </div>
              <h3>Results &amp; Practical Implications</h3>
              <p>
                Discuss the results, limitations and practical implications of your research.
              </p>
            </article>

            {/* Guideline 5 */}
            <article className="submission-guideline-card">
              <div className="submission-card-top">
                <span className="submission-number">05</span>
                <div className="submission-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                    <path d="M14 3v5h5" />
                    <path d="M9 13h6M9 17h6" />
                  </svg>
                </div>
              </div>
              <h3>Paper Template &amp; Instructions</h3>
              <p>
                Follow the official conference paper template and submission instructions.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Section 2: Important Notice & Policy */}
      <section className="submission-notice-section">
        <div className="submission-notice-container">
          {/* Important Notice */}
          <div className="submission-notice-content">
            <div className="submission-notice-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5" />
                <path d="M12 8h.01" />
              </svg>
            </div>
            <div className="submission-notice-text">
              <span className="submission-notice-label">IMPORTANT INFORMATION</span>
              <h2>Important Notice for Authors</h2>
              <p>
                The final submission format, page limits, submission portal, review dates and publication arrangements will be announced through the official conference website.
              </p>
            </div>
          </div>

          {/* Originality & Peer Review */}
          <div className="submission-review-content">
            <div className="submission-review-heading">
              <div className="submission-review-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 3h8l4 4v14H4V3h4" />
                  <path d="M8 12l2.5 2.5L16 9" />
                  <path d="M8 7h4" />
                </svg>
              </div>
              <div>
                <span>CONFERENCE POLICY</span>
                <h3>Originality &amp; Peer Review</h3>
              </div>
            </div>

            <p>
              Papers must be original and must not be simultaneously submitted to another publication venue. All submissions will undergo peer review according to the conference&apos;s review policy.
            </p>

            <div className="submission-review-points">
              <div className="submission-review-point">
                <span className="submission-check">✓</span>
                <span>Original and unpublished research</span>
              </div>
              <div className="submission-review-point">
                <span className="submission-check">✓</span>
                <span>No simultaneous submission elsewhere</span>
              </div>
              <div className="submission-review-point">
                <span className="submission-check">✓</span>
                <span>Peer review as per conference policy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Preparing Your Research Paper */}
      <section className="submission-process-section">
        <div className="submission-process-container">
          <div className="submission-process-heading">
            <span className="submission-process-label">FOR RESEARCHERS</span>
            <h2>Preparing Your Research Paper</h2>
            <p>
              Prepare your manuscript carefully and follow the official conference instructions before submitting your research.
            </p>
          </div>

          <div className="submission-process-grid">
            <div className="submission-process-card">
              <span className="submission-process-number">01</span>
              <div className="submission-process-marker">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" />
                  <path d="M4 5.5V21" />
                  <path d="M8 7h8M8 11h8" />
                </svg>
              </div>
              <h3>Prepare Your Manuscript</h3>
              <p>
                Clearly present your research problem, objectives, methodology, findings and contributions.
              </p>
            </div>

            <div className="submission-process-card">
              <span className="submission-process-number">02</span>
              <div className="submission-process-marker">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="m8 14 2 2 5-5" />
                </svg>
              </div>
              <h3>Review the Guidelines</h3>
              <p>
                Check the official paper template and submission instructions once they are announced.
              </p>
            </div>

            <div className="submission-process-card">
              <span className="submission-process-number">03</span>
              <div className="submission-process-marker">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v12" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M5 17v4h14v-4" />
                </svg>
              </div>
              <h3>Follow Official Instructions</h3>
              <p>
                Use the official submission portal and follow the announced deadlines when available.
              </p>
            </div>
          </div>

          <div className="submission-process-note">
            <span className="submission-process-note-icon">i</span>
            <p>
              <strong>Please Note:</strong> The official submission portal, paper format, page limits and important dates will be announced through the conference website.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Registration Fee Structure */}
      <section className="reg-fee-section" id="registration-fee">
        <div className="reg-fee-container">
          <div className="reg-fee-header">
            <span className="reg-fee-eyebrow">REGISTRATION DETAILS</span>
            <h2>Registration Fee Structure</h2>
            <div className="reg-fee-bar" aria-hidden="true" />
            <p>
              Please review the registration fees for in-person and online presentations. Fees apply to authors from institutions outside India.
            </p>
          </div>

          <div className="reg-fee-grid">
            {/* Mode 1: In Person */}
            <div className="reg-fee-card in-person">
              <div className="reg-fee-card-header">
                <div className="reg-fee-badge in-person-badge">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>In Person</span>
                </div>
                <h3>In-Person Presentation</h3>
                <p>For authors attending and presenting physically at Centro Escolar University, Manila</p>
              </div>

              <div className="reg-fee-table-wrap">
                <table className="reg-fee-table">
                  <thead>
                    <tr>
                      <th>Author Category</th>
                      <th className="fee-amount-th">Authors from Institution Outside India (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="cat-cell">
                        <strong>Regular Author</strong>
                        <span>Full conference presentation &amp; proceedings consideration</span>
                      </td>
                      <td className="fee-cell">
                        <span className="fee-badge">${site.feeInPersonRegular || 500}</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="cat-cell">
                        <strong>Short Paper / Poster Presentation</strong>
                        <span className="fee-subtext">(No Publication)</span>
                      </td>
                      <td className="fee-cell">
                        <span className="fee-badge">${site.feeInPersonShort || 200}</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="cat-cell">
                        <strong>Participant / Co-Author Registration</strong>
                        <span>Attending delegate without primary manuscript presentation</span>
                      </td>
                      <td className="fee-cell">
                        <span className="fee-badge">${site.feeInPersonParticipant || 400}</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="cat-cell">
                        <strong>Students</strong>
                        <span className="fee-subtext">(UG, PG, PhD)</span>
                      </td>
                      <td className="fee-cell">
                        <span className="fee-badge">${site.feeInPersonStudent || 300}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mode 2: Online */}
            <div className="reg-fee-card online">
              <div className="reg-fee-card-header">
                <div className="reg-fee-badge online-badge">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <span>Online</span>
                </div>
                <h3>Online Presentation</h3>
                <p>For international authors presenting remotely through official conference virtual sessions</p>
              </div>

              <div className="reg-fee-table-wrap">
                <table className="reg-fee-table">
                  <thead>
                    <tr>
                      <th>Author Category</th>
                      <th className="fee-amount-th">Authors from Institution Outside India (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="cat-cell">
                        <strong>Regular Author</strong>
                        <span>Virtual presentation slot &amp; proceedings consideration</span>
                      </td>
                      <td className="fee-cell">
                        <span className="fee-badge fee-badge-gold">${site.feeOnlineRegular || 250}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="reg-fee-note">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p>
              <strong>Important Notes:</strong> All registration fees are listed in <strong>US Dollars (USD)</strong>. Registration fee includes presentation certificate, attendance to all sessions, conference kit, and proceedings access as per conference guidelines.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Paper Submission Form */}
      <section className="psf-section" id="submit-paper">
        <div className="psf-container">
          <div className="psf-header">
            <span className="psf-eyebrow">SUBMIT YOUR PAPER</span>
            <h2>Paper Submission Form</h2>
            <p>
              Fill in the details below and attach your manuscript. Our team will receive it directly by email.
            </p>
          </div>

          <div className={`psf-card ${success ? 'sent' : ''}`} id="psfCard">
            {!success ? (
              <form id="paperForm" onSubmit={handleSubmit} noValidate>
                <div className="psf-field psf-half">
                  <label htmlFor="psfAuthor">
                    Name of corresponding author <b>*</b>
                  </label>
                  <input
                    type="text"
                    id="psfAuthor"
                    name="author"
                    placeholder="FULL NAME"
                    value={form.author}
                    onChange={handleChange}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="psf-field psf-half">
                  <label htmlFor="psfEmail">
                    Email <b>*</b>
                  </label>
                  <input
                    type="email"
                    id="psfEmail"
                    name="email"
                    placeholder="e.g. swapnil@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="psf-field psf-half">
                  <label htmlFor="psfInst">Name of institution and country</label>
                  <input
                    type="text"
                    id="psfInst"
                    name="institution"
                    value={form.institution}
                    onChange={handleChange}
                    maxLength={200}
                  />
                </div>

                <div className="psf-field psf-half">
                  <label htmlFor="psfTitle">
                    Paper Title <small>(only first and last two words separated by a dash)</small> <b>*</b>
                  </label>
                  <input
                    type="text"
                    id="psfTitle"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    maxLength={200}
                    required
                  />
                </div>

                <div className="psf-field">
                  <label htmlFor="psfMsg">Message</label>
                  <textarea
                    id="psfMsg"
                    name="message"
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    maxLength={5000}
                  />
                </div>

                <div className="psf-field">
                  <label htmlFor="psfFile">
                    File <b>*</b> <small>(PDF, DOC or DOCX, max 10 MB)</small>
                  </label>
                  <div className={`psf-file ${file ? 'has-file' : ''}`}>
                    <input
                      type="file"
                      id="psfFile"
                      name="paper"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      required
                    />
                    <span className="psf-file-btn">Choose File</span>
                    <span className="psf-file-name" id="psfFileName">
                      {file ? file.name : 'No file chosen'}
                    </span>
                  </div>
                </div>

                <div className="psf-check psf-field">
                  <label>
                    <input
                      type="checkbox"
                      name="certify"
                      checked={form.certify}
                      onChange={handleChange}
                      required
                    />
                    <span className="psf-box" aria-hidden="true" />
                    <span>
                      &ldquo;I certify that the paper is my original research contribution with the references properly cited in the manuscript.&rdquo;
                    </span>
                  </label>
                </div>

                <div className="psf-check psf-field">
                  <label>
                    <input
                      type="checkbox"
                      name="consent"
                      checked={form.consent}
                      onChange={handleChange}
                      required
                    />
                    <span className="psf-box" aria-hidden="true" />
                    <span>
                      &ldquo;I give my consent to transfer the copyright of my paper to the publisher of the conference proceedings and the journal in which my paper is published.&rdquo;
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="psf-status error" role="alert">
                    {error}
                  </div>
                )}

                <button type="submit" className={`psf-send ${busy ? 'loading' : ''}`} disabled={busy}>
                  <span className="psf-spin" aria-hidden="true" />
                  <span className="psf-send-text">{busy ? 'SENDING...' : 'SEND'}</span>
                </button>
              </form>
            ) : (
              <div className="psf-success" role="status">
                <div className="psf-tick">
                  <svg viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M10 25 L20 35 L38 13" />
                  </svg>
                </div>
                <h3>Paper Submitted</h3>
                <p>
                  Thank you. We have received your paper (ID: <strong>{success}</strong>) and will contact you on your email address.
                </p>
                <button type="button" className="psf-again" onClick={resetForm}>
                  Submit another paper
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
