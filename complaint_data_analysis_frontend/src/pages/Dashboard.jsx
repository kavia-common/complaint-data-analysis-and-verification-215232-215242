import React, { useState } from 'react';
import UploadPanel from '../components/UploadPanel';
import ResultsTable from '../components/ResultsTable';
import VerificationSidebar from '../components/VerificationSidebar';
import Legend from '../components/Legend';
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
  const [lastAnalysisId, setLastAnalysisId] = useState(null);
  const [summary, setSummary] = useState({});
  const [hsSummary, setHsSummary] = useState({});
  const [derivedHazards, setDerivedHazards] = useState([]);

  const normalizeToRows = (payload) => {
    // Convert normalized payload into flat rows of issues with badges and codes
    if (!payload) return [];
    const analyze = payload?.results ?? payload;
    const issues = Array.isArray(analyze?.issues) ? analyze.issues : [];

    // Map issues to table rows
    const issueRows = issues.map((it, idx) => ({
      id: `issue-${idx}`,
      type: 'issue',
      row_index: it.row_index,
      code: it.code || '',
      status: 'error',
      message: it.message,
      // Add a default violation count of 1 per issue; backend may later aggregate per row if needed
      violations: 1,
      fields: Array.isArray(it.fields) ? it.fields : [],
      // include some common HS-related fields if present in details
      hazard_grid: Array.isArray(it?.details?.hazard_grid) ? it.details.hazard_grid : (typeof it?.details?.hazard_grid === 'string' ? it.details.hazard_grid.split(',').map(s=>s.trim()).filter(Boolean) : []),
      device_use: it?.details?.device_use || it?.details?.DeviceUse || '',
      hazardous_situation: it?.details?.hazardous_situation || it?.details?.HazardousSituation || '',
      derived_hazards: Array.isArray(it?.details?.derived_hazards) ? it.details.derived_hazards : [],
    }));

    return issueRows;
  };

  const handleAnalyzed = async (analyzeResp, uploadId) => {
    // analyzeResp is normalized by api client if from analyze();
    setLastUploadId(uploadId);
    setErr(null);
    setLoading(true);
    try {
      let analysisId = analyzeResp?.analysis_id || analyzeResp?.results?.analysis_id;
      let normalized = analyzeResp;

      if (analysisId) {
        setLastAnalysisId(analysisId);
        // fetch full report by analysis_id; api normalizes shape
        normalized = await getResults(analysisId);
      }

      const issueRows = normalizeToRows(normalized);
      const res = normalized?.results ?? {};
      setSummary(res?.summary || {});
      setHsSummary(res?.hs_summary || {});
      setDerivedHazards(Array.isArray(res?.derived_hazards) ? res.derived_hazards : []);

      // Fallback with minimal example data if still empty
      const outRows = issueRows && issueRows.length > 0
        ? issueRows
        : [
            { id: 1, row_index: 0, code: '', status: 'ok', message: '', violations: 0, fields: [] },
            { id: 2, row_index: 1, code: 'HS_HAZARD_GRID_MISSING', status: 'error', message: 'Missing grid selection', violations: 1, fields: ['hazard_grid'] }
          ];

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
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              {lastAnalysisId ? `Analysis ID: ${lastAnalysisId}` : null}
            </div>
          </div>
          <div className="card-body">
            {loading ? <div>Loading results…</div> : null}
            {err ? <div style={{ color: 'var(--error-500)', fontWeight: 700 }}>{err}</div> : null}
          </div>
        </div>
        <ResultsTable rows={rows} onRowSelect={onRowSelect} />
        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-body">
            <Legend />
          </div>
        </div>
      </div>
      <VerificationSidebar
        selected={selected}
        onMark={onMark}
        summary={summary}
        hsSummary={hsSummary}
        derivedHazards={derivedHazards}
      />
    </section>
  );
}
