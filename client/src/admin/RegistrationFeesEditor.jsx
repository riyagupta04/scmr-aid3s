import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useSite } from '../SiteContext.jsx';

export default function RegistrationFeesEditor() {
  const site = useSite();
  const [data, setData] = useState({
    feeInPersonRegular: 500,
    feeInPersonShort: 200,
    feeInPersonParticipant: 400,
    feeInPersonStudent: 300,
    feeOnlineRegular: 250,
  });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/settings')
      .then((settings) => {
        setData({
          feeInPersonRegular: settings.feeInPersonRegular ?? 500,
          feeInPersonShort: settings.feeInPersonShort ?? 200,
          feeInPersonParticipant: settings.feeInPersonParticipant ?? 400,
          feeInPersonStudent: settings.feeInPersonStudent ?? 300,
          feeOnlineRegular: settings.feeOnlineRegular ?? 250,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      const current = await api('/settings');
      const updated = {
        ...current,
        ...data,
      };
      await api('/settings', { method: 'PUT', body: updated });
      await site.reload();
      setMsg('Registration fees updated successfully!');
    } catch (err) {
      setMsg(err.message || 'Failed to update fees');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="muted">Loading fee settings…</p>;

  return (
    <div className="admin-editor-wrap">
      <div className="admin-bar">
        <div>
          <h2>Registration Fee Structure</h2>
          <p className="muted" style={{ margin: '0.2rem 0 0' }}>
            Update the registration fees shown on the Paper Submission page.
          </p>
        </div>
      </div>

      <form className="card form" onSubmit={handleSave} style={{ maxWidth: 680 }}>
        <h3 style={{ margin: '0 0 1rem', color: '#102a6b', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🏢</span> In-Person Presentation Fees (USD)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label>
            Regular Author ($)
            <input
              type="number"
              name="feeInPersonRegular"
              value={data.feeInPersonRegular}
              onChange={handleChange}
              min="0"
              required
            />
          </label>

          <label>
            Short Paper / Poster ($)
            <input
              type="number"
              name="feeInPersonShort"
              value={data.feeInPersonShort}
              onChange={handleChange}
              min="0"
              required
            />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label>
            Participant / Co-Author ($)
            <input
              type="number"
              name="feeInPersonParticipant"
              value={data.feeInPersonParticipant}
              onChange={handleChange}
              min="0"
              required
            />
          </label>

          <label>
            Students (UG, PG, PhD) ($)
            <input
              type="number"
              name="feeInPersonStudent"
              value={data.feeInPersonStudent}
              onChange={handleChange}
              min="0"
              required
            />
          </label>
        </div>

        <div className="sep" style={{ margin: '1.5rem 0' }} />

        <h3 style={{ margin: '0 0 1rem', color: '#0284c7', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🌐</span> Online Presentation Fees (USD)
        </h3>

        <label style={{ maxWidth: 320 }}>
          Regular Author ($)
          <input
            type="number"
            name="feeOnlineRegular"
            value={data.feeOnlineRegular}
            onChange={handleChange}
            min="0"
            required
          />
        </label>

        {msg && (
          <p
            className={msg.includes('successfully') ? 'muted' : 'error'}
            style={{ fontWeight: 600, marginTop: '1rem', color: msg.includes('successfully') ? '#16a34a' : '#dc2626' }}
          >
            {msg}
          </p>
        )}

        <div style={{ marginTop: '1.5rem' }}>
          <button className="btn" disabled={busy}>
            {busy ? 'Saving…' : 'Save Registration Fees'}
          </button>
        </div>
      </form>
    </div>
  );
}

