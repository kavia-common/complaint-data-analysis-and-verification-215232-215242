import React, { useMemo, useState } from 'react';

// PUBLIC_INTERFACE
export default function VerificationSidebar({ selected, onMark }) {
  /**
   * VerificationSidebar displays details of a selected row and allows marking as complete/correct.
   * Props:
   *  - selected: object representing the currently selected record
   *  - onMark(action, payload): callback when user marks status
   */
  const [note, setNote] = useState('');

  const completeness = useMemo(() => {
    // naive completeness: count non-empty fields
    if (!selected) return { score: 0, total: 0 };
    const vals = Object.values(selected);
    const total = vals.length;
    const filled = vals.filter((v) => v !== null && v !== undefined && String(v).trim() !== '').length;
    return { score: filled, total };
  }, [selected]);

  const statusColor = (selected?.status || '').toLowerCase().includes('error')
    ? 'var(--error-500)'
    : 'var(--success-500)';

  return (
    <aside className="card" aria-label="Verification panel">
      <div className="card-header">
        <h3 className="card-title">Verification</h3>
      </div>
      <div className="card-body">
        {!selected ? (
          <div style={{ color: 'var(--muted)' }}>Select a row to view details.</div>
        ) : (
          <>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>
                Item: {selected.id ?? '(no id)'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                Status: <span style={{ color: statusColor, fontWeight: 800 }}>{String(selected.status ?? 'unknown')}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                Completeness: {completeness.score}/{completeness.total}
              </div>
            </div>

            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
              {selected.message ? `Message: ${selected.message}` : 'No message available.'}
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              <textarea
                className="input"
                rows={3}
                placeholder="Add a verification note…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn"
                  onClick={() => onMark?.('complete', { id: selected.id, note })}
                >
                  Mark Complete
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => onMark?.('correct', { id: selected.id, note })}
                >
                  Mark Correct
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
