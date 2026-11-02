import { useState } from 'react';
import { Link } from 'react-router-dom';
import { defaults, useSite } from '../SiteContext.jsx';
import { dateRange, fmtDate, useApi } from '../api.js';
import { Empty, Icon, Paragraphs, Reveal, Rich, SectionHead, lines } from '../components/Bits.jsx';
import { IMG } from '../components/Layout.jsx';
import defaultTracks from '../../../shared/tracks.json';

const objectiveIcons = ['atom', 'steth', 'network', 'scale', 'users'];

const highlightTopics = [
  { label: 'Generative AI', color: 'red' },
  { label: 'Intelligent Optimization', color: 'yellow' },
  { label: 'Computer Vision', color: 'blue' },
  { label: 'Natural Language Processing', color: 'red' },
  { label: 'Autonomous Systems', color: 'yellow' },
  { label: 'Deep Learning', color: 'blue' },
];

export default function Home() {
  const site = useSite();
  const tracks = useApi('/tracks');
  const dates = useApi('/dates');
  // Default to Track 1 (index 0)
  const [active, setActive] = useState(0);

  const rawTopics = lines(site.highlights);
  const objectives = lines(site.objectives || defaults.objectives);
  const pubs = lines(site.publication);
  const part = lines(site.participate);
  const displayedTracks = tracks.data.length ? tracks.data : defaultTracks;
  const start = site.startDate ? new Date(site.startDate) : null;
  const end = site.endDate ? new Date(site.endDate) : null;
  const sameMonth = start && end && start.getUTCMonth() === end.getUTCMonth();
  const month = start ? start.toLocaleDateString('en-GB', { month: 'long', timeZone: 'UTC' }) : '';

  const track = displayedTracks[Math.min(active, Math.max(displayedTracks.length - 1, 0))];

  return (
    <>
      {/* ================= HERO BANNER ================= */}
      <section
        className="banner"
        style={{ backgroundImage: `url('${IMG.banner || '/images/banner.webp'}')` }}
      >
        <div className="container banner-wrap">
          <div className="banner-card">
            <h2>{site.city || 'Manila, Philippines'}</h2>
            <div className="banner-date">
              <span className="banner-icon" aria-hidden="true">
                <Icon name="calendar" size={28} />
              </span>
              <span>{dateRange(site.startDate, site.endDate) || '26 – 28 February, 2027'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT THE CONFERENCE ================= */}
      <section className="section about-sec" id="about">
        <div className="container about-grid">
          <Reveal from="left">
            <div className="about-card">
              <h2>
                About the
                <br />
                Conference
              </h2>
              <span className="about-red-bar" aria-hidden="true" />

              {/* Movable / Infinite scrolling topic pills */}
              <div className="chip-scroll">
                <div className="chip-track">
                  {[0, 1].map((copy) => (
                    <div className="chip-group" key={copy} aria-hidden={copy === 1}>
                      {highlightTopics.map((h, i) => (
                        <div key={`${copy}-${i}`} className={`about-pill pill-${h.color}`}>
                          {h.label}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="date-chip">
                <b>
                  {start ? start.getUTCDate() : 26}
                  {sameMonth && end ? `–${end.getUTCDate()}` : '–28'}
                </b>
                <span>
                  {month || 'February'}
                  <br />
                  {start ? start.getUTCFullYear() : 2027}
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal from="right" delay={120}>
            <div className="about-text">
              <Paragraphs text={site.about} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= STRATEGIC MISSION / OBJECTIVES ================= */}
      {objectives.length > 0 && (
        <section className="section alt objectives-sec">
          <div className="container">
            <Reveal>
              <SectionHead center eyebrow="STRATEGIC MISSION" title="Conference Objectives" />
            </Reveal>
            <div className="obj-grid">
              {objectives.map((o, i) => (
                <Reveal key={i} delay={i * 90} className="obj-wrap">
                  <div className="obj">
                    <span className="obj-icon">
                      <Icon name={objectiveIcons[i % objectiveIcons.length]} size={26} />
                    </span>
                    <p>{o}</p>
                    <span className="obj-num">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= CONFERENCE TRACKS ================= */}
      <section className="section tracks-sec">
        <div className="container">
          <Reveal>
            <SectionHead center eyebrow="CALL FOR PAPERS" title="Conference Tracks and Topics of Interest">
              <p className="sub">
                Original research papers are invited in, but are not limited to, the following areas.
              </p>
            </SectionHead>
          </Reveal>

          {tracks.error && (
            <p className="notice">
              Showing the built-in conference tracks: {tracks.error}
            </p>
          )}

          {displayedTracks.length === 0 ? (
            <Empty />
          ) : (
            <Reveal>
              <div className="tabs-bar" role="tablist">
                {displayedTracks.map((t, i) => {
                  const isActive = i === active;
                  return (
                    <button
                      key={t._id || `track-tab-${i}`}
                      role="tab"
                      aria-selected={isActive}
                      className={`tab tab-style-${(i % 3) + 1} ${isActive ? 'active' : ''}`}
                      onClick={() => setActive(i)}
                    >
                      <span className="tab-num">{i + 1}</span>
                      <span className="tab-label">{t.shortTitle || t.title}</span>
                      {isActive && <span className="tab-active-indicator" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>

              {track && (
                <div className="track-panel" key={track._id || `track-panel-${active}`}>
                  <div className="track-head">
                    <span className="track-big">{String(active + 1).padStart(2, '0')}</span>
                    <div>
                      <small>TRACK {active + 1}</small>
                      <h3>{track.title}</h3>
                    </div>
                    {track.topics?.length > 0 && (
                      <span className="topic-count">{track.topics.length} topics</span>
                    )}
                  </div>
                  <div className="topic-grid">
                    {(track.topics || []).map((x, i) => {
                      const accentColorClass = `accent-${['amber', 'pink', 'purple', 'blue'][i % 4]}`;
                      return (
                        <div
                          key={x}
                          className={`topic ${accentColorClass}`}
                          style={{ animationDelay: `${i * 40}ms` }}
                        >
                          <span className="topic-n">{i + 1}</span>
                          <span className="topic-title">{x}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Reveal>
          )}
        </div>
      </section>

      {/* ================= PUBLICATION + DATES ================= */}
      <section className="section pub-sec">
        <div className="container pub-grid">
          <Reveal from="left">
            <div className="pub-card">
              <span className="pill">Publication</span>
              <h2>
                <span className="title-icon navy">
                  <Icon name="doc" size={26} />
                </span>
                Publication Opportunities
              </h2>
              <span className="underline" />
              {pubs[0] && <p className="pub-lead">{pubs[0]}</p>}
              {pubs[1] && (
                <div className="callout">
                  <span className="callout-icon">
                    <Icon name="info" size={22} />
                  </span>
                  <p>
                    <Rich text={pubs[1]} />
                  </p>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal from="right" delay={120}>
            <div className="dates-card">
              <h2>
                <span className="title-icon amber">
                  <Icon name="calendar" size={26} />
                </span>
                Important Dates
              </h2>
              <span className="underline" />
              {dates.data.length === 0 ? (
                <Empty />
              ) : (
                <ol className="timeline">
                  {dates.data.map((d) => (
                    <li key={d._id}>
                      <div className="tl-row">
                        <span className="tl-label">{d.label}</span>
                        <span className="tl-badge">{d.date ? fmtDate(d.date) : 'To be announced'}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= WHO SHOULD PARTICIPATE ================= */}
      <section className="section who-sec">
        <div className="container who-grid">
          <Reveal from="left">
            <div className="who-visual">
              <div className="who-ring" />
              <div className="who-blob">
                <img src={IMG.who} alt="Participants" />
              </div>
              <span className="float f1">AI &amp; ML</span>
              <span className="float f2">Design</span>
              <span className="float f3">Diagnostics</span>
              <span className="float f4">Decisions</span>
              <span className="dot-pulse" />
            </div>
          </Reveal>
          <Reveal from="right" delay={120}>
            <div className="who-text">
              <SectionHead eyebrow="Join Us" title="Who Should Participate?" />
              {part[0] && <p className="who-lead">{part[0]}</p>}
              {part[1] && <p>{part[1]}</p>}
              <div className="cta-box">
                <span className="cta-star">
                  <Icon name="star" size={24} />
                </span>
                <p>{part[2]}</p>
                {site.submissionOpen && (
                  <Link className="cta-btn" to="/paper-submission#submit-paper">
                    Submit Your Paper <Icon name="arrow" size={18} />
                  </Link>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
