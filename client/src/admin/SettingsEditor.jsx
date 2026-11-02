import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useSite } from '../SiteContext.jsx';

const fields = [
  ['name', 'Conference name', 'text'],
  ['shortName', 'Short name / acronym', 'text'],
  ['tagline', 'Line under the title (e.g. AID3S - 2027)', 'text'],
  ['startDate', 'Start date', 'date'],
  ['endDate', 'End date', 'date'],
  ['venue', 'Venue', 'text'],
  ['city', 'City / country', 'text'],
  ['organizer', 'Organizer', 'text'],
  ['email', 'Contact email', 'text'],
  ['highlights', 'Scrolling topic strip (one per line)', 'textarea'],
  ['about', 'About the conference (one paragraph per line)', 'textarea'],
  ['objectives', 'Conference objectives (one per line)', 'textarea'],
  ['publication', 'Publication opportunities (one paragraph per line)', 'textarea'],
  ['participate', 'Who should participate (one paragraph per line)', 'textarea'],
  ['guidelines', 'Submission guidelines (one point per line)', 'textarea'],
  ['footerAbout', 'Footer description', 'textarea'],
];

export default function SettingsEditor() {
  const site = useSite();
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api('/settings').then((d) => {
      setData(d);
    });
  }, []);

  if (!data) return <p className="muted">Loading…</p>;

  const set = (k, v) => setData({ ...data, [k]: v });

  const save = async (e) => {
    e.preventDefault();
    try {
      await api('/settings', { method: 'PUT', body: data });
      await site.reload();
      setMsg('Saved.');
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div>
      <h2>Site settings</h2>
      <form className="card form" onSubmit={save}>
        {fields.map(([key, label, type]) => (
          <label key={key}>
            {label}
            {type === 'textarea' ? (
              <textarea rows={4} value={data[key] || ''} onChange={(e) => set(key, e.target.value)} />
            ) : (
              <input
                type={type}
                value={type === 'date' ? String(data[key] || '').slice(0, 10) : data[key] || ''}
                onChange={(e) => set(key, e.target.value)}
              />
            )}
          </label>
        ))}
        <label className="checkline">
          <input
            type="checkbox"
            checked={data.submissionOpen !== false}
            onChange={(e) => set('submissionOpen', e.target.checked)}
          />
          Paper submission is open
        </label>
        {msg && <p className={msg === 'Saved.' ? 'muted' : 'error'}>{msg}</p>}
        <div>
          <button className="btn">Save settings</button>
        </div>
      </form>
    </div>
  );
}
