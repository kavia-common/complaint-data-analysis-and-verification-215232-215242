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
  const [lastAnalysisId, setLastAnalysisId] = useState(null);

  const normalizeToRows = (payload) => {
    // Convert API AnalyzeResponse or ReportResponse into a flat row list for the table
    if (!payload) return [];
    // ReportResponse: { analysis_id, results: AnalyzeResponse }
    const analyze = payload?.results ?? payload;
    const issues = Array.isArray(analyze?.issues) ? analyze.issues : [];
    const columns = Array.isArray(analyze?.columns) ? analyze.columns : [];
    const rowCount = typeof analyze?.row_count === 'number' ? analyze.row_count : null;
    const completeness = analyze?.completeness || {};

    // Create table rows: include issues and overall summary
    const issueRows = issues.map((it, idx) => ({
      id: `issue-${idx}`,
      type: 'issue',
      row_index: it.row_index,
      status: 'error',
      message: it.message,
    }));

    const summaryRow = {
      id: 'summary',
      type: 'summary',
      status: 'ok',
      message: 'Analysis summary',
      columns: columns.join(', '),
      row_count: rowCount,
      completeness: JSON.stringify(completeness),
    };

    return [...issueRows, summaryRow];
  };

  const handleAnalyzed = async (analyzeResp, uploadId) => {
    // analyzeResp expected to be AnalyzeResponse { analysis_id, ... }
    setLastUploadId(uploadId);
    setErr(null);
    setLoading(true);
    try {
      let outRows = [];
      let analysisId = analyzeResp?.analysis_id;

      if (analysisId) {
        setLastAnalysisId(analysisId);
        // fetch full report by analysis_id
        const report = await getResults(analysisId);
        outRows = normalizeToRows(report);
      } else {
        // fallback if backend returned inline results
        outRows = normalizeToRows(analyzeResp);
      }

      // Fallback with minimal example data if still empty
      if (!outRows || outRows.length === 0) {
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
      </div>
      <VerificationSidebar selected={selected} onMark={onMark} />
    </section>
  );
}
