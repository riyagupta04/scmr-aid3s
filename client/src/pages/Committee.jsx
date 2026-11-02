import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../api.js';
import { Empty, Loading } from '../components/Bits.jsx';
import { IMG } from '../components/Layout.jsx';

const preferred = [
  'General Chairs',
  'Honorary Chairs',
  'Program Chairs',
  'Industrial Chairs',
  'General Co-Chairs',
  'Organizing Secretaries',
  'Publication Chairs',
  'Publicity Chairs',
  'Track Chairs',
  'International Advisory Board',
  'National Advisory Board',
  'Technical Program Committee',
];

const slug = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const stripPrefix = (name) =>
  String(name || '').replace(/^(Prof\.|Dr\.|Er\.)\s*/i, '');

const initials = (name) =>
  stripPrefix(name)
    .trim()
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase();

export default function Committee() {
  const members = useApi('/members');
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const tabbarRef = useRef(null);

  // Group members by group and sort according to preferred order and internal member order
  const groups = useMemo(() => {
    const grouped = new Map();
    (members.data || []).forEach((member) => {
      const group = member.group || 'Committee';
      if (!grouped.has(group)) grouped.set(group, []);
      grouped.get(group).push(member);
    });

    return [...grouped.entries()]
      .sort(([a], [b]) => {
        const ia = preferred.indexOf(a);
        const ib = preferred.indexOf(b);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
      })
      .map(([name, people]) => {
        const sortedPeople = [...people].sort((x, y) => (x.order || 0) - (y.order || 0));
        const filteredPeople = query.trim()
          ? sortedPeople.filter((person) =>
              `${person.name} ${person.affiliation || ''} ${person.email || ''} ${name}`
                .toLowerCase()
                .includes(query.trim().toLowerCase())
            )
          : sortedPeople;
        return [name, filteredPeople, sortedPeople.length];
      })
      .filter(([, filteredPeople]) => !query.trim() || filteredPeople.length > 0);
  }, [members.data, query]);

  // Set initial active tab to first group
  useEffect(() => {
    if (groups.length > 0 && !activeTab) {
      setActiveTab(groups[0][0]);
    }
  }, [groups, activeTab]);

  // Scrollspy to automatically update active tab when user scrolls
  useEffect(() => {
    if (query.trim()) return;

    const handleScroll = () => {
      const scrollPos = window.scrollY + 220;
      for (let i = groups.length - 1; i >= 0; i--) {
        const [groupName] = groups[i];
        const el = document.getElementById(`committee-${slug(groupName)}`);
        if (el && el.offsetTop <= scrollPos) {
          setActiveTab(groupName);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [groups, query]);

  const scrollToGroup = (groupName) => {
    setActiveTab(groupName);
    const el = document.getElementById(`committee-${slug(groupName)}`);
    if (el) {
      const yOffset = -150;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="cm-page">
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
          <h2>Conference Committee</h2>
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
              <li aria-current="page">Conference Committee</li>
            </ol>
          </nav>
        </div>
        <div className="cm-banner-wave" aria-hidden="true" />
      </section>

      {/* Main Committee Section */}
      <main className="cm-wrap">
        <div className="cm-container">
          {members.loading && <Loading state={members} />}
          {!members.loading && members.error && (
            <p className="error">Could not load committee members: {members.error}</p>
          )}

          {!members.loading && !members.error && (
            <>
              {/* Search Bar */}
              <div className="cm-intro">
                <label className="cm-search">
                  <svg
                    className="cm-search-icon"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    id="cmSearch"
                    type="search"
                    placeholder="Search a member in all committees"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search members"
                  />
                </label>
              </div>

              {/* Horizontal Filter Tabs with member count badges */}
              <div className="cm-tabbar" ref={tabbarRef}>
                <div className="cm-tabs" role="tablist" aria-label="Committees">
                  {groups.map(([group, people, totalCount]) => {
                    const isSelected = activeTab === group;
                    return (
                      <button
                        key={group}
                        type="button"
                        className={`cm-tab ${isSelected ? 'active' : ''}`}
                        role="tab"
                        aria-selected={isSelected}
                        onClick={() => scrollToGroup(group)}
                      >
                        {group}
                        <b>{query.trim() ? people.length : totalCount}</b>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Committee Member Panels */}
              <div className="cm-panels">
                {groups.length === 0 ? (
                  <p className="cm-empty">No member found. Try another name or institute.</p>
                ) : (
                  groups.map(([group, people]) => (
                    <section
                      className="cm-panel"
                      id={`committee-${slug(group)}`}
                      key={group}
                    >
                      <h3 className="cm-panel-title">{group}</h3>
                      <div className="cm-grid">
                        {people.map((member, index) => {
                          const isThird = (index + 1) % 3 === 0;
                          return (
                            <article
                              className={`cm-card ${isThird ? 'card-alt' : ''}`}
                              key={member._id || `${group}-${member.name}-${index}`}
                            >
                              <div className={`cm-av ${isThird ? 'av-red' : 'av-blue'}`}>
                                {initials(member.name)}
                              </div>
                              <div className="cm-info">
                                <h4 className="cm-name">{member.name}</h4>
                                {member.affiliation && (
                                  <p className="cm-inst">{member.affiliation}</p>
                                )}
                              </div>
                              {member.email && (
                                <a
                                  className="cm-mail"
                                  href={`mailto:${member.email}`}
                                  title={`Send email to ${member.name}`}
                                >
                                  <span className="cm-mail-ico">
                                    <svg
                                      viewBox="0 0 24 24"
                                      width="14"
                                      height="14"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <rect x="2" y="4" width="20" height="16" rx="2" />
                                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                  </span>
                                  <span className="cm-mail-txt">{member.email}</span>
                                </a>
                              )}
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
