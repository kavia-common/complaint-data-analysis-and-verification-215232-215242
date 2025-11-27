import React, { useMemo, useState } from 'react';

// PUBLIC_INTERFACE
export default function ResultsTable({ rows = [], onRowSelect }) {
  /**
   * ResultsTable renders analysis rows with simple sorting and filtering.
   * Props:
   *  - rows: array of objects { id, field, status, message, ... }
   *  - onRowSelect(row): callback when a row is clicked
   */
  const [q, setQ] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState('asc');

  const cols = useMemo(() => {
    // Derive columns from first row
    const base = rows?.[0] ? Object.keys(rows[0]) : ['id', 'field', 'status', 'message'];
    return base.slice(0, 6); // limit to avoid overflow
  }, [rows]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let out = Array.isArray(rows) ? rows : [];
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
  }, [rows, q, sortKey, sortDir]);

  const onSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Analysis Results</h3>
        <input
          className="input"
          placeholder="Filter results…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: 260 }}
        />
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
                    <td key={c + (r.id ?? idx)}>{String(r?.[c] ?? '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
