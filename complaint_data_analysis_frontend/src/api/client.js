/**
 * Lightweight API client for the frontend that reads REACT_APP_API_BASE or falls back to REACT_APP_BACKEND_URL.
 * Exposes helpers for health, upload, analyze, and results retrieval.
 */

const base =
  process.env.REACT_APP_API_BASE?.replace(/\/+$/, '') ||
  process.env.REACT_APP_BACKEND_URL?.replace(/\/+$/, '') ||
  '';

function buildUrl(path) {
  if (!base) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

async function handleResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  let data = null;
  try {
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }
  } catch (_e) {
    data = null;
  }
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || res.statusText || 'Request failed';
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// PUBLIC_INTERFACE
export async function apiHealth() {
  /** Calls backend root or /health to verify availability. */
  // try root first, then /health
  try {
    const res = await fetch(buildUrl('/'), { method: 'GET' });
    return await handleResponse(res);
  } catch (_e) {
    const res = await fetch(buildUrl('/health'), { method: 'GET' });
    return await handleResponse(res);
  }
}

// PUBLIC_INTERFACE
export async function uploadCSV(file) {
  /** Upload a CSV file for processing. Returns upload ID or metadata. */
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(buildUrl('/upload'), {
    method: 'POST',
    body: form
  });
  return handleResponse(res);
}

// PUBLIC_INTERFACE
export async function analyze(uploadId) {
  /** Triggers analysis for a given upload ID. Returns analysis results. */
  const res = await fetch(buildUrl(`/analyze?uploadId=${encodeURIComponent(uploadId)}`), {
    method: 'POST'
  });
  return handleResponse(res);
}

// PUBLIC_INTERFACE
export async function getResults(uploadId) {
  /** Fetches analysis results for a given upload ID. */
  const res = await fetch(buildUrl(`/results?uploadId=${encodeURIComponent(uploadId)}`), {
    method: 'GET'
  });
  return handleResponse(res);
}
