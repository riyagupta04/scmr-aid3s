import { useEffect, useState } from 'react';
import { api } from '../api.js';

const toInput = (f, v) => {
  if (f.type === 'date') return v ? String(v).slice(0, 10) : '';
  if (f.type === 'tags') return Array.isArray(v) ? v.join(', ') : '';
  if (f.type === 'checkbox') return !!v;
  if (f.type === 'select') return v || f.options[0];
  return v ?? '';
};

const fromInput = (f, v) => {
  if (f.type === 'tags') return String(v).split(',').map((x) => x.trim()).filter(Boolean);
  if (f.type === 'number') return Number(v || 0);
  return v;
};

const show = (v) => {
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return v.slice(0, 10);
  return String(v ?? '').slice(0, 80);
};

export default function CrudManager({ endpoint, title, fields, columns }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState('');

  const load = () => api(endpoint).then(setItems).catch((e) => setMsg(e.message));

  useEffect(() => {
    setEditing(null);
    setMsg('');
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const open = (item) => {
    const f = {};
    fields.forEach((fd) => {
      f[fd.name] = toInput(fd, item ? item[fd.name] : fd.default);
    });
    setForm(f);
    setEditing(item || {});
    setMsg('');
  };

  const save = async (e) => {
    e.preventDefault();
    const body = {};
    fields.forEach((fd) => {
      body[fd.name] = fromInput(fd, form[fd.name]);
    });
    try {
      if (editing._id) await api(`${endpoint}/${editing._id}`, { method: 'PUT', body });
      else await api(endpoint, { method: 'POST', body });
      setEditing(null);
      load();
    } catch (err) {
      setMsg(err.message);
    }
  };

  const del = async (it) => {
    if (!confirm('Delete this item?')) return;
    try {
      await api(`${endpoint}/${it._id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setMsg(err.message);
    }
  };

  const field = (f) => {
    const v = form[f.name];
    const on = (e) =>
      setForm({ ...form, [f.name]: f.type === 'checkbox' ? e.target.checked : e.target.value });
    if (f.type === 'textarea') return <textarea rows={4} value={v} onChange={on} />;
    if (f.type === 'select')
      return (
        <select value={v} onChange={on}>
          {f.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    if (f.type === 'checkbox') return <input type="checkbox" checked={v} onChange={on} />;
    return (
      <input
        type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
        required={f.required}
        value={v}
        onChange={on}
        placeholder={f.type === 'tags' ? 'comma, separated, values' : undefined}
      />
    );
  };

  if (editing)
    return (
      <div>
        <h2>
          {editing._id ? 'Edit' : 'Add'} · {title}
        </h2>
        <form className="card form" onSubmit={save}>
          {fields.map((f) => (
            <label key={f.name} className={f.type === 'checkbox' ? 'checkline' : ''}>
              {f.label}
              {field(f)}
            </label>
          ))}
          {msg && <p className="error">{msg}</p>}
          <div className="actions">
            <button className="btn">Save</button>
            <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );

  return (
    <div>
      <div className="admin-bar">
        <h2>{title}</h2>
        <button className="btn btn-sm" onClick={() => open(null)}>
          + Add new
        </button>
      </div>
      {msg && <p className="error">{msg}</p>}
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{fields.find((f) => f.name === c)?.label || c}</th>
            ))}
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it._id}>
              {columns.map((c) => (
                <td key={c}>{show(it[c])}</td>
              ))}
              <td>
                <div className="actions">
                  <button className="btn btn-sm btn-outline" onClick={() => open(it)}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => del(it)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1} className="muted">
                Nothing added yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
