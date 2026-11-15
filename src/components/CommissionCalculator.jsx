'use client';

import React, { useState } from 'react';

const TIERS = [
  { level: 1, name: 'Level 1', desc: 'Direct members you invite', rate: 10, max: 20 },
  { level: 2, name: 'Level 2', desc: 'Members invited by Level 1', rate: 8, max: 50 },
  { level: 3, name: 'Level 3', desc: 'Members invited by Level 2', rate: 6, max: 150 },
  { level: 4, name: 'Level 4', desc: 'Members invited by Level 3', rate: 6, max: 300 },
];

const PRESETS = [
  { label: '2 × 2 Team', values: [2, 4, 8, 16] },
  { label: '3 × 3 Team', values: [3, 9, 27, 81] },
  { label: '5 × 5 Team', values: [5, 25, 125, 250] },
];

export default function CommissionCalculator() {
  const [counts, setCounts] = useState([3, 9, 27, 81]);
  const [activePreset, setActivePreset] = useState(1);

  const updateCount = (idx, value) => {
    setActivePreset(null);
    const val = Math.max(0, parseInt(value, 10) || 0);
    const next = [...counts];
    next[idx] = val;
    setCounts(next);
  };

  const applyPreset = (pIdx) => {
    setActivePreset(pIdx);
    setCounts([...PRESETS[pIdx].values]);
  };

  const monthlyTotal = counts.reduce((sum, count, i) => sum + count * TIERS[i].rate, 0);
  const annualTotal = monthlyTotal * 12;
  const totalSubscribers = counts.reduce((sum, count) => sum + count, 0);

  return (
    <div
      style={{
        background: '#140e0a',
        border: '1px solid var(--mocha-border)',
        borderRadius: '20px',
        padding: ' clamp(20px, 4vw, 36px)',
      }}
    >
      <style>{`
        .calc-header-row {
          display: grid;
          grid-template-columns: 180px 1fr 110px;
          gap: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--mocha-border);
          font-size: 0.78rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .calc-row {
          display: grid;
          grid-template-columns: 180px 1fr 110px;
          gap: 20px;
          align-items: center;
          padding: 18px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .calc-row:last-child {
          border-bottom: none;
        }
        .calc-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          outline: none;
          cursor: pointer;
        }
        .calc-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--amber-primary);
          cursor: pointer;
          border: 2px solid #140e0a;
        }
        .calc-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--amber-primary);
          cursor: pointer;
          border: 2px solid #140e0a;
        }
        .calc-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          padding-top: 24px;
          margin-top: 12px;
          border-top: 1px solid var(--mocha-border);
        }
        @media (max-width: 680px) {
          .calc-header-row {
            display: none;
          }
          .calc-row {
            grid-template-columns: 1fr auto;
            gap: 12px;
          }
          .calc-slider-cell {
            grid-column: 1 / -1;
            order: 3;
          }
          .calc-footer {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>

      {/* Preset Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Select an example scenario or move sliders:
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(i)}
              style={{
                background: activePreset === i ? 'var(--amber-primary)' : 'rgba(255, 255, 255, 0.05)',
                color: activePreset === i ? '#0d0907' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: activePreset === i ? 'var(--amber-primary)' : 'var(--mocha-border)',
                borderRadius: '999px',
                padding: '6px 14px',
                fontSize: '0.82rem',
                fontWeight: activePreset === i ? '700' : '500',
                cursor: 'pointer',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Header */}
      <div className="calc-header-row">
        <div>Tier & Commission</div>
        <div>Active Subscribers</div>
        <div style={{ textAlign: 'right' }}>Monthly Income</div>
      </div>

      {/* Rows */}
      {TIERS.map((tier, idx) => {
        const count = counts[idx];
        const subtotal = count * tier.rate;

        return (
          <div key={tier.level} className="calc-row">
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                {tier.name}{' '}
                <span style={{ color: 'var(--amber-light)', fontWeight: '700', marginLeft: '4px' }}>
                  ${tier.rate}
                </span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>/box</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {tier.desc}
              </div>
            </div>

            <div className="calc-slider-cell" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <input
                type="range"
                min="0"
                max={tier.max}
                value={count}
                onChange={(e) => updateCount(idx, e.target.value)}
                className="calc-slider"
              />
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  minWidth: '70px',
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {count} {count === 1 ? 'member' : 'members'}
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: subtotal > 0 ? 'var(--amber-light)' : 'var(--text-muted)',
                }}
              >
                ${subtotal}
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>/mo</span>
            </div>
          </div>
        );
      })}

      {/* Footer Total */}
      <div className="calc-footer">
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Monthly Recurring Commission
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 3.5vw, 2.5rem)',
              fontWeight: '700',
              color: 'var(--amber-light)',
              lineHeight: '1.15',
              marginTop: '2px',
            }}
          >
            ${monthlyTotal.toLocaleString()}{' '}
            <span style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--text-secondary)' }}>
              / month
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <strong>{totalSubscribers}</strong> active subscribers across 4 tiers
          </div>
          <div style={{ fontSize: '0.96rem', color: 'var(--text-primary)', fontWeight: '600', marginTop: '3px' }}>
            ${annualTotal.toLocaleString()}{' '}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '400' }}>
              annual projected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
