import { useEffect, useState } from 'react';

const BASE = import.meta.env.VITE_API_URL || '/api';

export const getToken = () => localStorage.getItem('token');
export const setToken = (t) => localStorage.setItem('token', t);
export const clearToken = () => localStorage.removeItem('token');

async function request(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(BASE + path, { method, headers, body: payload });
  return res;
}

export async function api(path, opts) {
  const res = await request(path, opts);
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// Download a protected file (admin only) and open it in a new tab
export async function openFile(path) {
  const res = await request(path);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Could not download file');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export function useApi(path) {
  const [state, setState] = useState({ data: [], loading: true, error: null });
  useEffect(() => {
    let on = true;
    setState((s) => ({ ...s, loading: true }));
    api(path)
      .then((data) => on && setState({ data, loading: false, error: null }))
      .catch((e) => on && setState({ data: [], loading: false, error: e.message }));
    return () => {
      on = false;
    };
  }, [path]);
  return state;
}

export const fmtDate = (d, opts = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  d ? new Date(d).toLocaleDateString('en-IN', { ...opts, timeZone: 'UTC' }) : '';

// "26 – 28 February, 2027"
export const dateRange = (start, end) => {
  if (!start) return '';
  const s = new Date(start);
  const month = (d) => d.toLocaleDateString('en-GB', { month: 'long', timeZone: 'UTC' });
  if (!end || start === end) return `${s.getUTCDate()} ${month(s)}, ${s.getUTCFullYear()}`;
  const e = new Date(end);
  if (s.getUTCMonth() === e.getUTCMonth() && s.getUTCFullYear() === e.getUTCFullYear()) {
    return `${s.getUTCDate()} – ${e.getUTCDate()} ${month(e)}, ${e.getUTCFullYear()}`;
  }
  return `${s.getUTCDate()} ${month(s)} – ${e.getUTCDate()} ${month(e)}, ${e.getUTCFullYear()}`;
};
