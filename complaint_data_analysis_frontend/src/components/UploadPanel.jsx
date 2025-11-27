import React, { useRef, useState } from 'react';
import { uploadCSV, analyze } from '../api/client';

// PUBLIC_INTERFACE
export default function UploadPanel({ onAnalyzed }) {
  /**
   * UploadPanel allows CSV selection, upload, and analysis trigger.
   * Props:
   *  - onAnalyzed(analyzeResponse, uploadId): callback when analysis response is available.
   */
  const fileRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [uploadId, setUploadId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const onSelect = (e) => {
    setFileName(e?.target?.files?.[0]?.name || '');
    setErr(null);
  };

  const onUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setErr('Please choose a CSV file first.');
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const resp = await uploadCSV(file);
      const id = resp?.upload_id || resp?.uploadId || resp?.id || 'latest';
      setUploadId(id);
    } catch (e) {
      setErr(e.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const onAnalyze = async () => {
    if (!uploadId) {
      setErr('Upload a file before running analysis.');
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const analyzeResponse = await analyze(uploadId);
      onAnalyzed?.(analyzeResponse, uploadId);
    } catch (e) {
      setErr(e.message || 'Analyze failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Upload CSV</h3>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{fileName || 'No file chosen'}</div>
      </div>
      <div className="card-body">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            onChange={onSelect}
            aria-label="Choose CSV file"
          />
          <button className="btn" onClick={onUpload} disabled={loading}>
            {loading ? 'Uploading…' : 'Upload'}
          </button>
          <button className="btn btn-secondary" onClick={onAnalyze} disabled={loading || !uploadId}>
            {loading ? 'Analyzing…' : 'Analyze'}
          </button>
        </div>
        {uploadId ? (
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>Upload ID: {uploadId}</div>
        ) : null}
        {err ? (
          <div style={{ marginTop: 10, color: 'var(--error-500)', fontWeight: 700 }}>{err}</div>
        ) : null}
      </div>
    </div>
  );
}
