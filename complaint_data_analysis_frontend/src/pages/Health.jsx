import React, { useEffect, useState } from 'react';
import { apiHealth } from '../api/client';

 // PUBLIC_INTERFACE
export default function Health() {
  /**
   * Health page that pings backend to show availability and response payload.
   * It targets `${REACT_APP_API_BASE}/` and falls back to `${REACT_APP_API_BASE}/health`.
   */
  const [status, setStatus] = useState('checking');
  const [payload, setPayload] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setStatus('checking');
      setErr(null);
      try {
        const data = await apiHealth();
        if (!mounted) return;
        setPayload(data);
        setStatus('ok');
      } catch (e) {
        if (!mounted) return;
        setErr(e.message || 'Unavailable');
        setStatus('down');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Backend Health</h3>
        <span
          aria-label={`status-${status}`}
          style={{
            color: status === 'ok' ? 'var(--success-500)' : 'var(--error-500)',
            fontWeight: 800
          }}
        >
          {status === 'checking' ? 'Checking…' : status === 'ok' ? 'Healthy' : 'Down'}
        </span>
      </div>
      <div className="card-body">
        {err ? (
          <div style={{ color: 'var(--error-500)', fontWeight: 700 }}>{err}</div>
        ) : (
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: 'var(--bg)',
              padding: 12,
              borderRadius: 12,
              border: '1px solid var(--border)',
            }}
          >
            {payload ? JSON.stringify(payload, null, 2) : 'No payload'}
          </pre>
        )}
      </div>
    </div>
  );
}
