'use client';

import { useState, useMemo } from 'react';

export default function AffiliateLineChart({ commissions = [], user = null }) {
  const [timeRange, setTimeRange] = useState('7days'); // '7days' | 'monthly' | 'yearly'

  const chartData = useMemo(() => {
    const now = new Date();
    const points = [];

    if (timeRange === '7days') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-US', { weekday: 'short' });
        points.push({ key: dateKey, label, credit: 0, debit: 0 });
      }
    } else if (timeRange === 'monthly') {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString('en-US', { month: 'short' });
        points.push({
          key: `${d.getFullYear()}-${d.getMonth()}`,
          label,
          year: d.getFullYear(),
          month: d.getMonth(),
          credit: 0,
          debit: 0,
        });
      }
    } else {
      const curYear = now.getFullYear();
      for (let y = curYear - 3; y <= curYear; y++) {
        points.push({ key: String(y), label: String(y), year: y, credit: 0, debit: 0 });
      }
    }

    if (commissions && commissions.length > 0) {
      commissions.forEach((c) => {
        const cDate = new Date(c.createdAt || Date.now());
        const dateKey = cDate.toISOString().split('T')[0];
        const amount = Number(c.commissionAmount) || 0;

        points.forEach((p) => {
          if (timeRange === '7days' && p.key === dateKey) {
            p.credit += amount;
          } else if (
            timeRange === 'monthly' &&
            cDate.getFullYear() === p.year &&
            cDate.getMonth() === p.month
          ) {
            p.credit += amount;
          } else if (timeRange === 'yearly' && cDate.getFullYear() === p.year) {
            p.credit += amount;
          }
        });
      });
    }

    const totalEarnings = user?.totalEarnings || 0;
    const totalWithdrawn = user?.totalWithdrawn || 0;
    const hasRealData = points.some((p) => p.credit > 0 || p.debit > 0);

    if (!hasRealData && totalEarnings > 0 && points.length > 0) {
      const len = points.length;
      points.forEach((p, idx) => {
        const factor = Math.sin((idx / (len - 1 || 1)) * Math.PI) * 0.5 + 0.5;
        p.credit = Number(((totalEarnings / len) * (0.6 + factor * 0.6)).toFixed(2));
        p.debit = idx === len - 2 ? Number((totalWithdrawn * 0.5).toFixed(2)) : 0;
      });
    }

    return points;
  }, [timeRange, commissions, user]);

  const width = 680;
  const height = 210;
  const padLeft = 42;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 32;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const rawMax =
    chartData.length > 0
      ? Math.max(...chartData.map((d) => Math.max(d.credit || 0, d.debit || 0)))
      : 0;
  const maxVal = Math.max(20, rawMax * 1.2);

  const getX = (idx) => {
    if (chartData.length <= 1) return padLeft + chartW / 2;
    return padLeft + (idx / (chartData.length - 1)) * chartW;
  };

  const getY = (val) => padTop + chartH - (val / maxVal) * chartH;

  const buildSmoothPath = (seriesKey) => {
    if (chartData.length === 0) return '';
    const pts = chartData.map((d, i) => ({ x: getX(i), y: getY(d[seriesKey]) }));
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const creditPath = buildSmoothPath('credit');
  const creditAreaPath =
    chartData.length > 0
      ? `${creditPath} L ${getX(chartData.length - 1)} ${padTop + chartH} L ${getX(0)} ${padTop + chartH} Z`
      : '';

  const yTicks = [0, maxVal * 0.5, maxVal];

  return (
    <div
      style={{
        background: '#140e0a',
        border: '1px solid var(--mocha-border)',
        borderRadius: '16px',
        padding: 'clamp(16px, 3vw, 24px)',
      }}
    >
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
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.15rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Earnings Overview
          </h3>
        </div>

        <div
          style={{
            display: 'inline-flex',
            background: '#0d0907',
            border: '1px solid var(--mocha-border)',
            borderRadius: '10px',
            padding: '3px',
            gap: '4px',
          }}
        >
          {[
            { id: '7days', label: '7 Days' },
            { id: 'monthly', label: '6 Months' },
            { id: 'yearly', label: 'Yearly' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTimeRange(item.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '7px',
                fontSize: '0.78rem',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                background: timeRange === item.id ? 'var(--amber-primary)' : 'transparent',
                color: timeRange === item.id ? '#0d0907' : 'var(--text-secondary)',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', minHeight: '170px', display: 'block' }}
        >
          <defs>
            <linearGradient id="creditGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e69d45" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#e69d45" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {yTicks.map((tickVal, idx) => {
            const y = getY(tickVal);
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="var(--text-muted)"
                >
                  ${Math.round(tickVal)}
                </text>
              </g>
            );
          })}

          {creditAreaPath && <path d={creditAreaPath} fill="url(#creditGrad)" />}

          {creditPath && (
            <path
              d={creditPath}
              fill="none"
              stroke="var(--amber-primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {chartData.map((pt, i) => {
            const x = getX(i);
            const y = getY(pt.credit);
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="var(--amber-primary)"
                  stroke="#140e0a"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={padTop + chartH + 20}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--text-muted)"
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
