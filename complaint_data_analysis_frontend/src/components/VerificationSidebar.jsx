import React, { useMemo, useState } from 'react';

// PUBLIC_INTERFACE
export default function VerificationSidebar({ selected, onMark, summary = {}, hsSummary = {}, derivedHazards = [] }) {
  /**
   * VerificationSidebar displays analysis summaries and details of a selected row, with guidance.
   * Props:
   *  - selected: object representing the currently selected record
   *  - summary: AnalyzeResponse.summary { total_violations, rows_with_violations, rows_without_violations }
   *  - hsSummary: AnalyzeResponse.hs_summary map of rule code => count
   *  - derivedHazards: AnalyzeResponse.derived_hazards array of strings
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

  const ruleGuidance = {
    HS_NO_HS_WHEN_HAZARDS: 'Narrative implies hazards but Hazardous Situation is empty. Review HS text.',
    HS_DEVICE_USE_MISMATCH: 'Device Use vs Hazardous Situation text conflict. Align classification.',
    HS_UNKNOWN_DEVICE_USE_REVIEW: 'Device Use value is unknown/unsupported. Review and normalize.',
    HS_HAZARD_GRID_MISSING: 'Hazard Grid missing entries where hazards are present. Update grid.',
    HS_HAZARD_GRID_MISMATCH: 'Derived hazards do not match Hazard Grid selections.',
  };

  const selectedHazardGrid = Array.isArray(selected?.hazard_grid) ? selected.hazard_grid : (typeof selected?.hazard_grid === 'string' ? selected.hazard_grid.split(',').map(s=>s.trim()).filter(Boolean) : []);
  const hazardMismatches = Array.isArray(derivedHazards)
    ? derivedHazards.filter((h) => !selectedHazardGrid.includes(h))
    : [];

  return (
    <aside className="card" aria-label="Verification panel">
      <div className="card-header">
        <h3 className="card-title">Verification</h3>
      </div>
      <div className="card-body" style={{ display: 'grid', gap: 12 }}>
        {/* Summary counters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ padding: '6px 10px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Total violations</span>
            <div style={{ fontWeight: 900, color: 'var(--error-500)' }}>{summary?.total_violations ?? 0}</div>
          </div>
          <div style={{ padding: '6px 10px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Rows with violations</span>
            <div style={{ fontWeight: 900 }}>{summary?.rows_with_violations ?? 0}</div>
          </div>
          <div style={{ padding: '6px 10px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Rows without violations</span>
            <div style={{ fontWeight: 900, color: 'var(--success-500)' }}>{summary?.rows_without_violations ?? 0}</div>
          </div>
        </div>

        {/* Rule categories with guidance */}
        <div>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Rule guidance</div>
          <div style={{ display: 'grid', gap: 6 }}>
            {Object.keys(ruleGuidance).map((code) => (
              <div key={code} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 8, background: 'var(--surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                  <div style={{ fontWeight: 800 }}>
                    {code}{' '}
                    <span style={{ marginLeft: 6, fontSize: 12, color: 'var(--muted)' }}>
                      {hsSummary?.[code] ? `(${hsSummary[code]})` : ''}
                    </span>
                  </div>
                  <span
                    className="badge-violation"
                    style={{
                      display: 'inline-block',
                      padding: '2px 6px',
                      borderRadius: 999,
                      background: 'linear-gradient(135deg, var(--primary-500), var(--secondary-500))',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {hsSummary?.[code] ?? 0}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{ruleGuidance[code]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Derived vs Grid mismatches */}
        <div>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Derived vs Grid</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            Derived hazards (from narrative):{' '}
            <span style={{ color: 'var(--text)' }}>{Array.isArray(derivedHazards) ? derivedHazards.join(', ') : '—'}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            Hazard Grid (row):{' '}
            <span style={{ color: 'var(--text)' }}>{selectedHazardGrid.length ? selectedHazardGrid.join(', ') : '—'}</span>
          </div>
          {selected ? (
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Mismatches (derived not in grid):</div>
              {hazardMismatches.length ? (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {hazardMismatches.map((h) => (
                    <span key={h} style={{ padding: '2px 6px', borderRadius: 999, background: 'rgba(236,72,153,0.12)', border: '1px solid var(--border)', fontSize: 12 }}>
                      {h}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--success-500)', fontWeight: 800, marginTop: 4 }}>No mismatches</div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Select a row to compare.</div>
          )}
        </div>

        {/* Selected row details and actions */}
        {!selected ? (
          <div style={{ color: 'var(--muted)' }}>Select a row to view details.</div>
        ) : (
          <>
            <div style={{ marginTop: 4, marginBottom: 10 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>
                Item: {selected.id ?? '(no id)'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                Status: <span style={{ color: statusColor, fontWeight: 800 }}>{String(selected.status ?? 'unknown')}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                Completeness: {completeness.score}/{completeness.total}
              </div>
              <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>Violation code:</span>
                <span style={{ padding: '2px 6px', borderRadius: 999, background: 'rgba(139,92,246,0.12)', border: '1px solid var(--border)', fontSize: 12, fontWeight: 800 }}>
                  {selected.code || '—'}
                </span>
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

        {/* Compact legend */}
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
          Legend: Rule badges show counts; HS_* codes indicate Hazardous Situation checks. Pink chips indicate hazards present in narrative but not selected in grid.
        </div>
      </div>
    </aside>
  );
}
