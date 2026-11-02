import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, clearToken, getToken } from '../api.js';
import CrudManager from './CrudManager.jsx';
import Inbox from './Inbox.jsx';
import SettingsEditor from './SettingsEditor.jsx';
import RegistrationFeesEditor from './RegistrationFeesEditor.jsx';

const content = [
  {
    id: 'dates',
    label: 'Important dates',
    icon: '📅',
    desc: 'Edit paper submission deadlines, acceptance notices, and conference dates',
    endpoint: '/dates',
    fields: [
      { name: 'label', label: 'Event', required: true },
      { name: 'date', label: 'Date (leave empty to show "To be announced")', type: 'date' },
      { name: 'note', label: 'Note' },
      { name: 'order', label: 'Order', type: 'number' },
    ],
    columns: ['label', 'date', 'order'],
  },
  {
    id: 'tracks',
    label: 'Tracks and topics',
    icon: '📚',
    desc: 'Manage the 7 conference tracks, topics of interest, and call for papers',
    endpoint: '/tracks',
    fields: [
      { name: 'title', label: 'Track title', required: true },
      { name: 'shortTitle', label: 'Short title for track tab' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'topics', label: 'Topics', type: 'tags' },
      { name: 'order', label: 'Order', type: 'number' },
    ],
    columns: ['title', 'topics', 'order'],
  },
  {
    id: 'members',
    label: 'Conference committee',
    icon: '👥',
    desc: 'Add, update or remove chairs, secretaries, advisory board and committee members',
    endpoint: '/members',
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'role', label: 'Role' },
      { name: 'affiliation', label: 'Affiliation' },
      { name: 'email', label: 'Email' },
      {
        name: 'group',
        label: 'Group',
        type: 'select',
        options: [
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
        ],
      },
      { name: 'order', label: 'Order', type: 'number' },
    ],
    columns: ['name', 'role', 'group', 'order'],
  },
];

function Overview({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api('/stats').then(setStats).catch(() => {});
  }, []);

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await api('/auth/change-password', { method: 'POST', body: pw });
      setPw({ currentPassword: '', newPassword: '' });
      setMsg('Password changed.');
    } catch (err) {
      setMsg(err.message);
    }
  };

  const kpis = stats && [
    ['Papers submitted', stats.submissions],
    ['Papers accepted', stats.accepted],
    ['Messages', stats.messages],
    ['Unread messages', stats.unread],
  ];

  return (
    <div>
      <div className="admin-bar">
        <div>
          <h2>Dashboard Overview</h2>
          <p className="muted" style={{ margin: '0.2rem 0 0' }}>
            Welcome to the AID3S 2027 Admin Control Panel. Select any section below to edit website content.
          </p>
        </div>
      </div>

      {kpis ? (
        <div className="kpis" style={{ marginBottom: '2.5rem' }}>
          {kpis.map(([label, value]) => (
            <div key={label} className="kpi">
              <strong>{value}</strong>
              <span className="muted">{label}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">Loading statistics…</p>
      )}

      {/* Direct Content Management Cards */}
      <h2 style={{ fontSize: '1.4rem', margin: '0 0 1rem', color: '#102a6b' }}>
        Website Content Management
      </h2>
      <p className="muted" style={{ margin: '0 0 1.5rem' }}>
        Click any of the cards below to modify titles, dates, committee members, or registration fees:
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '3rem',
        }}
      >
        {/* Card 1: Site Settings */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>⚙️</div>
          <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.15rem', color: '#0f172a' }}>Site Settings</h3>
          <p className="muted" style={{ fontSize: '0.9rem', flex: 1, marginBottom: '1.2rem', lineHeight: 1.5 }}>
            Change conference name, dates, venue, contact email, about description, and guidelines.
          </p>
          <button className="btn btn-sm" onClick={() => onNavigate('settings')}>
            Edit Site Settings →
          </button>
        </div>

        {/* Card 2: Registration Fees */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>💳</div>
          <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.15rem', color: '#0f172a' }}>Registration Fees</h3>
          <p className="muted" style={{ fontSize: '0.9rem', flex: 1, marginBottom: '1.2rem', lineHeight: 1.5 }}>
            Update In-Person ($500, $200, $400, $300) and Online ($250) pricing for international authors.
          </p>
          <button className="btn btn-sm" onClick={() => onNavigate('fees')}>
            Edit Registration Fees →
          </button>
        </div>

        {/* Card 3: Committee */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>👥</div>
          <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.15rem', color: '#0f172a' }}>Conference Committee</h3>
          <p className="muted" style={{ fontSize: '0.9rem', flex: 1, marginBottom: '1.2rem', lineHeight: 1.5 }}>
            Add, update, or remove General Chairs, Honorary Chairs, Secretaries, and Advisory members.
          </p>
          <button className="btn btn-sm" onClick={() => onNavigate('members')}>
            Manage Committee Members →
          </button>
        </div>

        {/* Card 4: Tracks */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>📚</div>
          <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.15rem', color: '#0f172a' }}>Tracks &amp; Topics</h3>
          <p className="muted" style={{ fontSize: '0.9rem', flex: 1, marginBottom: '1.2rem', lineHeight: 1.5 }}>
            Add or edit research tracks, track titles, and specialized topics of interest.
          </p>
          <button className="btn btn-sm" onClick={() => onNavigate('tracks')}>
            Manage Tracks &amp; Topics →
          </button>
        </div>

        {/* Card 5: Dates */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>📅</div>
          <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.15rem', color: '#0f172a' }}>Important Dates</h3>
          <p className="muted" style={{ fontSize: '0.9rem', flex: 1, marginBottom: '1.2rem', lineHeight: 1.5 }}>
            Update submission deadlines, review notifications, camera-ready and conference dates.
          </p>
          <button className="btn btn-sm" onClick={() => onNavigate('dates')}>
            Manage Important Dates →
          </button>
        </div>

        {/* Card 6: Submissions */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>📄</div>
          <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.15rem', color: '#0f172a' }}>Paper Submissions</h3>
          <p className="muted" style={{ fontSize: '0.9rem', flex: 1, marginBottom: '1.2rem', lineHeight: 1.5 }}>
            View submitted manuscripts, download attached files, and update paper review statuses.
          </p>
          <button className="btn btn-sm" onClick={() => onNavigate('submissions')}>
            View Submissions →
          </button>
        </div>

        {/* Card 7: Messages */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>✉️</div>
          <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.15rem', color: '#0f172a' }}>Contact Messages</h3>
          <p className="muted" style={{ fontSize: '0.9rem', flex: 1, marginBottom: '1.2rem', lineHeight: 1.5 }}>
            Read attendee inquiries sent through the Contact Us form and mark as read/replied.
          </p>
          <button className="btn btn-sm" onClick={() => onNavigate('messages')}>
            View Messages →
          </button>
        </div>
      </div>

      <h2>Account Security</h2>
      <form className="card form" onSubmit={changePassword} style={{ maxWidth: 460 }}>
        <h3 style={{ margin: '0 0 0.8rem', fontSize: '1.1rem' }}>Change Admin Password</h3>
        <label>
          Current password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={pw.currentPassword}
            onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
          />
        </label>
        <label>
          New password (min 8 characters)
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={pw.newPassword}
            onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
          />
        </label>
        {msg && <p className={msg === 'Password changed.' ? 'muted' : 'error'}>{msg}</p>}
        <div>
          <button className="btn btn-sm">Update password</button>
        </div>
      </form>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (!getToken()) return navigate('/admin/login', { replace: true });
    api('/auth/me')
      .then(() => setReady(true))
      .catch(() => {
        clearToken();
        navigate('/admin/login', { replace: true });
      });
  }, [navigate]);

  if (!ready) return <p className="muted center" style={{ padding: '3rem' }}>Checking login credentials…</p>;

  const logout = () => {
    clearToken();
    navigate('/admin/login');
  };

  const current = content.find((c) => c.id === tab);

  return (
    <div className="admin">
      <aside className="admin-side">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', padding: '0.4rem 0.6rem 0.8rem' }}>
          <span>🛡️</span> AID3S Admin
        </h3>

        <button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>
          <span>📊</span> Overview
        </button>

        <div className="sep" />
        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8', padding: '0.3rem 0.6rem', display: 'block' }}>
          Content &amp; Settings
        </span>

        <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>
          <span>⚙️</span> Site settings
        </button>

        <button className={tab === 'fees' ? 'active' : ''} onClick={() => setTab('fees')}>
          <span>💳</span> Registration fees
        </button>

        {content.map((c) => (
          <button key={c.id} className={tab === c.id ? 'active' : ''} onClick={() => setTab(c.id)}>
            <span>{c.icon}</span> {c.label}
          </button>
        ))}

        <div className="sep" />
        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8', padding: '0.3rem 0.6rem', display: 'block' }}>
          Incoming Activity
        </span>

        <button className={tab === 'submissions' ? 'active' : ''} onClick={() => setTab('submissions')}>
          <span>📄</span> Paper submissions
        </button>

        <button className={tab === 'messages' ? 'active' : ''} onClick={() => setTab('messages')}>
          <span>✉️</span> Messages
        </button>

        <div className="sep" style={{ marginTop: 'auto' }} />
        <Link to="/" style={{ color: '#93c5fd', padding: '0.6rem 0.7rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
          <span>↗</span> View website
        </Link>
        <button onClick={logout} style={{ color: '#fca5a5' }}>
          <span>🚪</span> Log out
        </button>
      </aside>

      <main className="admin-main" style={{ padding: '2.5rem' }}>
        {tab === 'overview' && <Overview onNavigate={setTab} />}
        {tab === 'settings' && <SettingsEditor />}
        {tab === 'fees' && <RegistrationFeesEditor />}
        {current && (
          <CrudManager
            key={current.id}
            endpoint={current.endpoint}
            title={current.label}
            fields={current.fields}
            columns={current.columns}
          />
        )}
        {tab === 'submissions' && <Inbox kind="submissions" title="Paper submissions" />}
        {tab === 'messages' && <Inbox kind="messages" title="Messages" />}
      </main>
    </div>
  );
}
