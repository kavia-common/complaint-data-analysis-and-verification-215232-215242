/**
 * Lightweight API client for the frontend that reads REACT_APP_API_BASE or falls back to REACT_APP_BACKEND_URL.
 * Exposes helpers for health, upload, analyze, and results retrieval.
 *
 * Backend interface (from OpenAPI):
 * - GET  /                            (health)
 * - POST /api/complaints/upload       multipart/form-data: { file }
 * - POST /api/complaints/analyze      form or multipart body: { upload_id | file }
 * - GET  /api/complaints/report/{analysis_id}
 */

const base =
  process.env.REACT_APP_API_BASE?.replace(/\/*$/, '') ||
  process.env.REACT_APP_BACKEND_URL?.replace(/\/*$/, '') ||
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
  /** Upload a CSV file for processing. Returns upload_id and summary. */
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(buildUrl('/api/complaints/upload'), {
    method: 'POST',
    body: form,
    // Let browser set Content-Type boundary; CORS preflight handled by backend
    // credentials can be omitted if backend does not use cookies/auth
  });
  return handleResponse(res);
}

/**
 * Normalize AnalyzeResponse or ReportResponse payload into a stable shape
 * so the UI can rely on derived_hazards and summary presence when available.
 */
function normalizeAnalysisPayload(payload) {
  const results = payload?.results || payload || {};
  return {
    analysis_id: payload?.analysis_id || results?.analysis_id,
    results: {
      analysis_id: results?.analysis_id,
      columns: results?.columns || [],
      completeness: results?.completeness || {},
      issues: Array.isArray(results?.issues) ? results.issues : [],
      row_count: typeof results?.row_count === 'number' ? results.row_count : 0,
      hs_summary: results?.hs_summary || {},
      derived_hazards: Array.isArray(results?.derived_hazards) ? results.derived_hazards : [],
      summary: results?.summary || {},
    },
  };
}

// PUBLIC_INTERFACE
export async function analyze(uploadId) {
  /** Triggers analysis for a given upload_id. Returns analysis results incl. analysis_id. */
  const body = new URLSearchParams();
  body.set('upload_id', String(uploadId));

  const res = await fetch(buildUrl('/api/complaints/analyze'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body,
  });
  const data = await handleResponse(res);
  return normalizeAnalysisPayload(data);
}

/** Keep normalizeAnalysisPayload in scope from previous block */

// PUBLIC_INTERFACE
export async function getResults(analysisId) {
  /** Fetches analysis report for a given analysis_id. */
  const res = await fetch(buildUrl(`/api/complaints/report/${encodeURIComponent(analysisId)}`), {
    method: 'GET',
  });
  const data = await handleResponse(res);
  return normalizeAnalysisPayload(data);
}
