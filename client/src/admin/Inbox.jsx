import { useEffect, useState } from 'react';
import { api, fmtDate, openFile } from '../api.js';

const statuses = {
  submissions: ['submitted', 'under review', 'accepted', 'rejected', 'camera-ready'],
};

const csvCols = {
  submissions: ['paperId', 'title', 'track', 'authors', 'correspondingEmail', 'keywords', 'status', 'createdAt'],
  messages: ['name', 'email', 'subject', 'message', 'read', 'createdAt'],
};

const cell = (v) => {
  let s = Array.isArray(v) ? v.map((a) => a.name || a).join('; ') : String(v ?? '');
  // Stop spreadsheet apps from running user-entered text as a formula
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

function exportCsv(kind, rows) {
  const cols = csvCols[kind];
  const text = [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${kind}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Inbox({ kind, title }) {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState('');

  const load = () => api(`/${kind}`).then(setRows).catch((e) => setMsg(e.message));

  useEffect(() => {
    setRows([]);
    setMsg('');
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  const patch = async (row, body) => {
    try {
      const updated = await api(`/${kind}/${row._id}`, { method: 'PATCH', body });
      setRows(rows.map((r) => (r._id === row._id ? updated : r)));
    } catch (e) {
      setMsg(e.message);
    }
  };

  const del = async (row) => {
    if (!confirm('Delete permanently?')) return;
    try {
      await api(`/${kind}/${row._id}`, { method: 'DELETE' });
      setRows(rows.filter((r) => r._id !== row._id));
    } catch (e) {
      setMsg(e.message);
    }
  };

  const statusSelect = (row) =>
    statuses[kind] && (
      <select value={row.status} onChange={(e) => patch(row, { status: e.target.value })}>
        {statuses[kind].map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
    );

  return (
    <div>
      <div className="admin-bar">
        <h2>
          {title} ({rows.length})
        </h2>
        <button className="btn btn-sm btn-outline" onClick={() => exportCsv(kind, rows)} disabled={!rows.length}>
          Export CSV
        </button>
      </div>
      {msg && <p className="error">{msg}</p>}

      {kind === 'submissions' && (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Paper</th>
              <th>Authors</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id}>
                <td>
                  <strong>{r.paperId}</strong>
                  <br />
                  <small className="muted">{fmtDate(r.createdAt)}</small>
                </td>
                <td>
                  <strong>{r.title}</strong>
                  <br />
                  <small className="muted">{r.track}</small>
                  <details>
                    <summary>Abstract</summary>
                    <p className="msg-body">{r.abstract}</p>
                  </details>
                </td>
                <td>
                  {(r.authors || []).map((a, i) => (
                    <div key={i}>
                      <strong>{a.name}</strong>
                      {(a.affiliation || r.institution) && (
                        <small className="muted"> ({a.affiliation || r.institution})</small>
                      )}
                    </div>
                  ))}
                  <div>
                    <small>{r.correspondingEmail}</small>
                  </div>
                </td>
                <td>{statusSelect(r)}</td>
                <td>
                  <div className="actions">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => openFile(`/submissions/${r._id}/file`).catch((e) => setMsg(e.message))}
                    >
                      {r.originalName ? r.originalName.split('.').pop().toUpperCase() : 'File'}
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => del(r)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {kind === 'messages' &&
        rows.map((r) => (
          <div key={r._id} className="card" style={{ opacity: r.read ? 0.7 : 1 }}>
            <div className="admin-bar">
              <div>
                <strong>{r.subject || '(no subject)'}</strong>
                <br />
                <small className="muted">
                  {r.name} · {r.email} · {fmtDate(r.createdAt)}
                </small>
              </div>
              <div className="actions">
                <button className="btn btn-sm btn-outline" onClick={() => patch(r, { read: !r.read })}>
                  Mark {r.read ? 'unread' : 'read'}
                </button>
                <a className="btn btn-sm btn-outline" href={`mailto:${r.email}`}>
                  Reply
                </a>
                <button className="btn btn-sm btn-danger" onClick={() => del(r)}>
                  Delete
                </button>
              </div>
            </div>
            <p className="msg-body">{r.message}</p>
          </div>
        ))}

      {rows.length === 0 && !msg && <p className="muted">Nothing here yet.</p>}
    </div>
  );
}
