'use client';

import React, { useState } from 'react';

const TIERS = [
  { level: 1, name: 'Level 1', desc: 'Direct members you invite', rate: 10, max: 50 },
  { level: 2, name: 'Level 2', desc: 'Members invited by Level 1', rate: 8, max: 500 },
  { level: 3, name: 'Level 3', desc: 'Members invited by Level 2', rate: 6, max: 2500 },
  { level: 4, name: 'Level 4', desc: 'Members invited by Level 3', rate: 6, max: 12000 },
];

const PRESETS = [
  { label: '2 × 2 Team', mult: 2, values: [2, 4, 8, 16] },
  { label: '3 × 3 Team', mult: 3, values: [3, 9, 27, 81] },
  { label: '5 × 5 Team', mult: 5, values: [5, 25, 125, 625] },
  { label: '10 × 10 Team', mult: 10, values: [10, 100, 1000, 10000] },
];

export default function CommissionCalculator() {
  const [counts, setCounts] = useState([3, 9, 27, 81]);
  const [activePreset, setActivePreset] = useState(1);
  const [duplicationFactor, setDuplicationFactor] = useState(3);

  const updateCount = (idx, value) => {
    setActivePreset(null);
    const val = Math.max(0, parseInt(value, 10) || 0);
    const next = [...counts];
    next[idx] = val;
    setCounts(next);
  };

  const applyPreset = (pIdx) => {
    setActivePreset(pIdx);
    setDuplicationFactor(PRESETS[pIdx].mult);
    setCounts([...PRESETS[pIdx].values]);
  };

  const handleDuplicationSlider = (multVal) => {
    const n = parseInt(multVal, 10) || 2;
    setDuplicationFactor(n);
    const presetIndex = PRESETS.findIndex((p) => p.mult === n);
    setActivePreset(presetIndex !== -1 ? presetIndex : null);
    setCounts([n, n * n, n * n * n, n * n * n * n]);
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
        padding: 'clamp(20px, 4vw, 36px)',
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

      {/* Preset Buttons & Duplication Controls */}
      <div style={{ marginBottom: '28px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '18px',
          }}
        >
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Choose a team duplication model or customize:
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
                  transition: 'all 0.15s ease',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Master 2x2 to 10x10 Team Duplication Slider */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--mocha-border)',
            borderRadius: '14px',
            padding: '14px 18px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
              fontSize: '0.86rem',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>
              Team Duplication Slider (Each member invites <strong>{duplicationFactor}</strong>):
            </span>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--amber-light)',
                fontWeight: '700',
                fontSize: '1rem',
              }}
            >
              {duplicationFactor} &times; {duplicationFactor} Model
            </span>
          </div>
          <input
            type="range"
            min="2"
            max="10"
            step="1"
            value={duplicationFactor}
            onChange={(e) => handleDuplicationSlider(e.target.value)}
            className="calc-slider"
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              marginTop: '6px',
            }}
          >
            <span>2 &times; 2</span>
            <span>3 &times; 3</span>
            <span>4 &times; 4</span>
            <span>5 &times; 5</span>
            <span>6 &times; 6</span>
            <span>7 &times; 7</span>
            <span>8 &times; 8</span>
            <span>9 &times; 9</span>
            <strong style={{ color: 'var(--amber-light)' }}>10 &times; 10</strong>
          </div>
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
                max={Math.max(tier.max, count)}
                value={count}
                onChange={(e) => updateCount(idx, e.target.value)}
                className="calc-slider"
              />
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  minWidth: '95px',
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {count.toLocaleString()} {count === 1 ? 'member' : 'members'}
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  color: subtotal > 0 ? 'var(--amber-light)' : 'var(--text-muted)',
                }}
              >
                ${subtotal.toLocaleString()}
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
            <strong>{totalSubscribers.toLocaleString()}</strong> active subscribers across 4 tiers
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
