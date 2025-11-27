import React, { useMemo, useState } from 'react';

// PUBLIC_INTERFACE
export default function ResultsTable({ rows = [], onRowSelect }) {
  /**
   * ResultsTable renders analysis rows with simple sorting and filtering.
   * Props:
   *  - rows: array of issue-like objects { id, row_index, code, message, fields, violations, ... }
   *  - onRowSelect(row): callback when a row is clicked
   */
  const [q, setQ] = useState('');
  const [sortKey, setSortKey] = useState('row_index');
  const [sortDir, setSortDir] = useState('asc');
  const [onlyViolations, setOnlyViolations] = useState(true);

  // Auto derive columns with a curated order
  const cols = useMemo(() => {
    const keys = new Set(['row_index', 'code', 'message', 'fields', 'violations']);
    (rows?.[0] ? Object.keys(rows[0]) : []).forEach((k) => keys.add(k));
    return Array.from(keys).slice(0, 8);
  }, [rows]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let out = Array.isArray(rows) ? rows : [];
    if (onlyViolations) {
      out = out.filter((r) => {
        const count = typeof r?.violations === 'number' ? r.violations : (r?.code ? 1 : 0);
        return count > 0;
      });
    }
    if (term) {
      out = out.filter((r) =>
        Object.values(r || {}).some((v) => String(v ?? '').toLowerCase().includes(term))
      );
    }
    if (sortKey) {
      out = out.slice().sort((a, b) => {
        const va = a?.[sortKey];
        const vb = b?.[sortKey];
        if (va == null && vb == null) return 0;
        if (va == null) return sortDir === 'asc' ? -1 : 1;
        if (vb == null) return sortDir === 'asc' ? 1 : -1;
        if (String(va) < String(vb)) return sortDir === 'asc' ? -1 : 1;
        if (String(va) > String(vb)) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return out;
  }, [rows, q, sortKey, sortDir, onlyViolations]);

  const onSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const renderCell = (r, c, key) => {
    const isFieldInvolved =
      Array.isArray(r?.fields) && r.fields.map(String).includes(String(c));
    const highlightStyle = isFieldInvolved
      ? { background: 'rgba(236,72,153,0.08)', borderRadius: 8, padding: '4px 6px' }
      : null;

    if (c === 'violations') {
      const count = typeof r?.violations === 'number' ? r.violations : (r?.code ? 1 : 0);
      return (
        <span
          key={key}
          className="badge-violation"
          aria-label={`violations-${count}`}
          style={{
            display: 'inline-block',
            padding: '4px 8px',
            borderRadius: 999,
            background: 'linear-gradient(135deg, var(--error-500), var(--secondary-500))',
            color: '#fff',
            fontWeight: 800,
            fontSize: 12,
          }}
        >
          {count}
        </span>
      );
    }

    if (c === 'fields') {
      return (
        <span key={key} style={{ fontSize: 12, color: 'var(--muted)' }}>
          {Array.isArray(r?.fields) ? r.fields.join(', ') : ''}
        </span>
      );
    }

    return <span key={key} style={highlightStyle}>{String(r?.[c] ?? '')}</span>;
  };

  return (
    <div className="card">
      <div className="card-header" style={{ gap: 8 }}>
        <h3 className="card-title">Analysis Results</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)' }}>
            <input
              type="checkbox"
              checked={onlyViolations}
              onChange={(e) => setOnlyViolations(e.target.checked)}
            />
            Only violations
          </label>
          <input
            className="input"
            placeholder="Filter results…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ maxWidth: 260 }}
          />
        </div>
      </div>
      <div className="card-body" style={{ overflowX: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ color: 'var(--muted)' }}>No results to show.</div>
        ) : (
          <table className="table" aria-label="Analysis results table">
            <thead>
              <tr>
                {cols.map((c) => (
                  <th key={c} onClick={() => onSort(c)} aria-sort={sortKey === c ? sortDir : 'none'}>
                    {c} {sortKey === c ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr key={r.id ?? idx} onClick={() => onRowSelect?.(r)} style={{ cursor: 'pointer' }}>
                  {cols.map((c) => (
                    <td key={c + (r.id ?? idx)}>{renderCell(r, c, c + (r.id ?? idx))}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>
          Legend: <span style={{ fontWeight: 800 }}>Violation count badge</span> shows number of rule violations for that row. Fields highlighted with a soft pink background are involved in the violation.
        </div>
      </div>
    </div>
  );
}
