import React from 'react';

// PUBLIC_INTERFACE
export default function Legend() {
  /** Compact legend explaining violation codes and badges. */
  const codes = [
    { code: 'HS_NO_HS_WHEN_HAZARDS', text: 'Hazards inferred from narrative but HS empty' },
    { code: 'HS_DEVICE_USE_MISMATCH', text: 'Device Use conflicts with HS text' },
    { code: 'HS_UNKNOWN_DEVICE_USE_REVIEW', text: 'Unsupported/unknown Device Use value' },
    { code: 'HS_HAZARD_GRID_MISSING', text: 'Hazard Grid missing entries' },
    { code: 'HS_HAZARD_GRID_MISMATCH', text: 'Derived hazards vs grid mismatch' },
  ];

  return (
    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
      <div style={{ fontWeight: 800, marginBottom: 6 }}>Legend</div>
      <div style={{ display: 'grid', gap: 4 }}>
        <div>
          <span className="badge-violation" style={{
            display: 'inline-block',
            padding: '2px 6px',
            borderRadius: 999,
            background: 'linear-gradient(135deg, var(--error-500), var(--secondary-500))',
            color: '#fff',
            fontSize: 11,
            fontWeight: 800,
            marginRight: 6
          }}>n</span>
          Violation count per row
        </div>
        {codes.map((c) => (
          <div key={c.code}>
            <span style={{ fontWeight: 800 }}>{c.code}</span>: {c.text}
          </div>
        ))}
      </div>
    </div>
  );
}
