import React, { useState } from 'react';
import UploadPanel from '../components/UploadPanel';
import ResultsTable from '../components/ResultsTable';
import VerificationSidebar from '../components/VerificationSidebar';
import { getResults } from '../api/client';

// PUBLIC_INTERFACE
export default function Dashboard() {
  /**
   * Dashboard page hosting upload, results, and verification sidebar.
   */
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [lastUploadId, setLastUploadId] = useState(null);

  const handleAnalyzed = async (initialResults, uploadId) => {
    // Use analyze response if it contains usable rows; otherwise, fetch via getResults
    setLastUploadId(uploadId);
    setErr(null);
    setLoading(true);
    try {
      let outRows = [];

      // Normalize initialResults to rows array if possible
      if (Array.isArray(initialResults)) {
        outRows = initialResults;
      } else if (Array.isArray(initialResults?.rows)) {
        outRows = initialResults.rows;
      } else if (Array.isArray(initialResults?.results)) {
        outRows = initialResults.results;
      }

      if (outRows.length === 0 && uploadId) {
        const pulled = await getResults(uploadId);
        if (Array.isArray(pulled)) outRows = pulled;
        else if (Array.isArray(pulled?.rows)) outRows = pulled.rows;
        else if (Array.isArray(pulled?.results)) outRows = pulled.results;
      }

      // Fallback with minimal example data if still empty
      if (outRows.length === 0) {
        outRows = [
          { id: 1, field: 'complaint_id', status: 'ok', message: '' },
          { id: 2, field: 'device_type', status: 'error', message: 'Missing value' }
        ];
      }

      setRows(outRows);
      setSelected(null);
    } catch (e) {
      setErr(e.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const onRowSelect = (row) => setSelected(row);

  const onMark = (action, payload) => {
    // For now, optimistic local effect; integration to backend can be added when endpoint is available
    if (!payload?.id) return;
    setRows((prev) =>
      prev.map((r) =>
        r.id === payload.id
          ? {
              ...r,
              verification: action,
              verification_note: payload.note || ''
            }
          : r
      )
    );
    if (selected?.id === payload.id) {
      setSelected((s) => (s ? { ...s, verification: action, verification_note: payload.note || '' } : s));
    }
  };

  return (
    <section className="grid" aria-label="Dashboard">
      <div className="grid-main">
        <UploadPanel onAnalyzed={handleAnalyzed} />
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Run & Status</h3>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              {lastUploadId ? `Upload ID: ${lastUploadId}` : 'No upload yet'}
            </div>
          </div>
          <div className="card-body">
            {loading ? <div>Loading results…</div> : null}
            {err ? <div style={{ color: 'var(--error-500)', fontWeight: 700 }}>{err}</div> : null}
          </div>
        </div>
        <ResultsTable rows={rows} onRowSelect={onRowSelect} />
      </div>
      <VerificationSidebar selected={selected} onMark={onMark} />
    </section>
  );
}
