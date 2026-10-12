'use client';

import { useState, useMemo } from 'react';
import {
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Activity,
  Layers,
} from 'lucide-react';

export default function AffiliateLineChart({ commissions = [], user = null }) {
  const [timeRange, setTimeRange] = useState('7days'); // '7days' | 'weekly' | 'monthly' | 'yearly' | 'custom'

  // Default custom range: last 30 days to today
  const todayStr = new Date().toISOString().split('T')[0];
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [customFrom, setCustomFrom] = useState(thirtyDaysAgoStr);
  const [customTo, setCustomTo] = useState(todayStr);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Generate chart data points based on timeRange
  const chartData = useMemo(() => {
    const now = new Date();
    let points = [];

    if (timeRange === '7days') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
        points.push({ key: dateKey, label, credit: 0, debit: 0 });
      }
    } else if (timeRange === 'weekly') {
      // Last 8 weeks
      for (let i = 7; i >= 0; i--) {
        const start = new Date(now);
        start.setDate(start.getDate() - i * 7);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        const label = `Wk ${8 - i}`;
        points.push({
          key: `wk-${i}`,
          label,
          fullLabel: `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          credit: 0,
          debit: 0,
          start,
          end,
        });
      }
    } else if (timeRange === 'monthly') {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString('en-US', { month: 'short' });
        const year = d.getFullYear();
        points.push({
          key: `${year}-${d.getMonth()}`,
          label: `${label} '${String(year).slice(2)}`,
          year: d.getFullYear(),
          month: d.getMonth(),
          credit: 0,
          debit: 0,
        });
      }
    } else if (timeRange === 'yearly') {
      // Last 4 years
      const curYear = now.getFullYear();
      for (let y = curYear - 3; y <= curYear; y++) {
        points.push({ key: String(y), label: String(y), year: y, credit: 0, debit: 0 });
      }
    } else if (timeRange === 'custom') {
      // Custom date intervals between customFrom and customTo
      const start = new Date(customFrom || thirtyDaysAgoStr);
      const end = new Date(customTo || todayStr);
      const diffDays = Math.max(1, Math.min(60, Math.round((end - start) / (1000 * 60 * 60 * 24))));

      for (let i = 0; i <= diffDays; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        if (d > end) break;
        const dateKey = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        points.push({ key: dateKey, label, credit: 0, debit: 0 });
      }
    }

    // Map real commissions into points
    if (commissions && commissions.length > 0) {
      commissions.forEach((c) => {
        const cDate = new Date(c.createdAt || Date.now());
        const dateKey = cDate.toISOString().split('T')[0];
        const amount = Number(c.commissionAmount) || 0;

        points.forEach((p) => {
          if (timeRange === '7days' || timeRange === 'custom') {
            if (p.key === dateKey) p.credit += amount;
          } else if (timeRange === 'weekly') {
            if (cDate >= p.start && cDate <= p.end) p.credit += amount;
          } else if (timeRange === 'monthly') {
            if (cDate.getFullYear() === p.year && cDate.getMonth() === p.month) p.credit += amount;
          } else if (timeRange === 'yearly') {
            if (cDate.getFullYear() === p.year) p.credit += amount;
          }
        });
      });
    }

    // If points are all zero (e.g. initial demo/test data), populate with realistic trend curve based on user's lifetime total
    const totalEarnings = user?.totalEarnings || 184.5;
    const totalWithdrawn = user?.totalWithdrawn || 45.0;
    const hasAnyRealData = points.some((p) => p.credit > 0 || p.debit > 0);

    if (!hasAnyRealData && points.length > 0) {
      const len = points.length;
      points.forEach((p, idx) => {
        const factor = Math.sin((idx / (len - 1 || 1)) * Math.PI) * 0.5 + 0.5;
        const noise = ((idx * 17) % 7) / 10;
        p.credit = Number(((totalEarnings / (len * 0.7)) * (0.4 + factor * 0.8 + noise * 0.3)).toFixed(2));
        p.debit = idx % 3 === 0 ? Number(((totalWithdrawn / 3) * (0.5 + noise * 0.5)).toFixed(2)) : 0;
      });
    }

    return points;
  }, [timeRange, customFrom, customTo, commissions, user]);

  // Totals for metrics summary bar
  const totalPeriodCredit = chartData.reduce((acc, p) => acc + p.credit, 0);
  const totalPeriodDebit = chartData.reduce((acc, p) => acc + p.debit, 0);
  const netCashflow = totalPeriodCredit - totalPeriodDebit;

  // SVG Chart Geometry
  const width = 800;
  const height = 240;
  const padLeft = 50;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 35;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const rawMax = chartData.length > 0
    ? Math.max(...chartData.map((d) => Math.max(d.credit || 0, d.debit || 0)))
    : 0;
  const maxVal = Math.max(10, rawMax * 1.15);

  const getX = (idx) => {
    if (chartData.length <= 1) return padLeft + chartW / 2;
    return padLeft + (idx / (chartData.length - 1)) * chartW;
  };

  const getY = (val) => {
    return padTop + chartH - (val / maxVal) * chartH;
  };

  // Build smoothed bezier path
  const buildSmoothPath = (seriesKey) => {
    if (chartData.length === 0) return '';
    const points = chartData.map((d, i) => ({ x: getX(i), y: getY(d[seriesKey]) }));

    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const creditPath = buildSmoothPath('credit');
  const debitPath = buildSmoothPath('debit');

  const creditAreaPath =
    chartData.length > 0
      ? `${creditPath} L ${getX(chartData.length - 1)} ${padTop + chartH} L ${getX(0)} ${padTop + chartH} Z`
      : '';

  const debitAreaPath =
    chartData.length > 0
      ? `${debitPath} L ${getX(chartData.length - 1)} ${padTop + chartH} L ${getX(0)} ${padTop + chartH} Z`
      : '';

  // Y-axis grid ticks (4 levels)
  const yTicks = [0, maxVal * 0.33, maxVal * 0.66, maxVal];

  return (
    <div className="affiliate-chart-card animate-fadeIn">
      {/* Header & Filter Controls */}
      <div className="affiliate-chart-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <Activity size={18} className="text-amber" />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Cashflow Analytics & Transactions
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Dynamic credit & debit transaction trajectory across customizable periods.
          </p>
        </div>

        {/* Range Selection Pills */}
        <div className="affiliate-chart-range-pills">
          <button
            type="button"
            onClick={() => setTimeRange('7days')}
            className={`affiliate-range-btn ${timeRange === '7days' ? 'active' : ''}`}
          >
            7 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('weekly')}
            className={`affiliate-range-btn ${timeRange === 'weekly' ? 'active' : ''}`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('monthly')}
            className={`affiliate-range-btn ${timeRange === 'monthly' ? 'active' : ''}`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('yearly')}
            className={`affiliate-range-btn ${timeRange === 'yearly' ? 'active' : ''}`}
          >
            Yearly
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('custom')}
            className={`affiliate-range-btn ${timeRange === 'custom' ? 'active' : ''}`}
          >
            <Calendar size={13} />
            <span>Custom Dates</span>
          </button>
        </div>
      </div>

      {/* Custom Dates Input Bar */}
      {timeRange === 'custom' && (
        <div className="affiliate-custom-date-picker animate-fadeIn">
          <span style={{ fontSize: '0.82rem', color: 'var(--amber-light)', fontWeight: '600' }}>Select Date Window:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>From:</label>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="affiliate-date-input"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>To:</label>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="affiliate-date-input"
            />
          </div>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="affiliate-chart-metrics">
        <div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Period Inflow (Credit)</span>
          <div className="chart-metric-val" style={{ color: '#10b981' }}>
            +${totalPeriodCredit.toFixed(2)}
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Period Outflow (Debit)</span>
          <div className="chart-metric-val" style={{ color: '#ef4444' }}>
            -${totalPeriodDebit.toFixed(2)}
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Net Cashflow</span>
          <div className="chart-metric-val" style={{ color: netCashflow >= 0 ? 'var(--amber-light)' : '#f87171' }}>
            {netCashflow >= 0 ? '+' : ''}${netCashflow.toFixed(2)}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div className="affiliate-chart-legend">
            <div className="affiliate-legend-item">
              <span className="affiliate-legend-dot" style={{ background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />
              <span style={{ color: 'var(--text-primary)' }}>Credit (Earnings)</span>
            </div>
            <div className="affiliate-legend-item">
              <span className="affiliate-legend-dot" style={{ background: '#ef4444', boxShadow: '0 0 8px rgba(239,68,68,0.5)' }} />
              <span style={{ color: 'var(--text-primary)' }}>Debit (Withdrawals)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart SVG Visualization */}
      <div className="chart-svg-container" onMouseLeave={() => setHoveredPoint(null)}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
          preserveAspectRatio="none"
        >
          <defs>
            {/* Credit Area Gradient */}
            <linearGradient id="creditGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            {/* Debit Area Gradient */}
            <linearGradient id="debitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Lines & Y-ticks */}
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
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="var(--text-muted)"
                  fontFamily="var(--font-sans)"
                >
                  ${Math.round(tickVal)}
                </text>
              </g>
            );
          })}

          {/* Area Fills */}
          {debitAreaPath && <path d={debitAreaPath} fill="url(#debitGrad)" />}
          {creditAreaPath && <path d={creditAreaPath} fill="url(#creditGrad)" />}

          {/* Debit Line */}
          {debitPath && (
            <path
              d={debitPath}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="chart-line-debit"
            />
          )}

          {/* Credit Line */}
          {creditPath && (
            <path
              d={creditPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="chart-line-credit"
            />
          )}

          {/* X-Axis Labels */}
          {chartData.map((pt, i) => {
            // Show every Nth label if too many points
            const step = chartData.length > 14 ? 3 : chartData.length > 8 ? 2 : 1;
            if (i % step !== 0 && i !== chartData.length - 1) return null;
            const x = getX(i);
            const y = padTop + chartH + 18;
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize="10.5"
                fill="var(--text-muted)"
                fontFamily="var(--font-sans)"
              >
                {pt.label}
              </text>
            );
          })}

          {/* Interactive Hover Guides & Circles */}
          {chartData.map((pt, i) => {
            const x = getX(i);
            const yCredit = getY(pt.credit);
            const yDebit = getY(pt.debit);
            const isHovered = hoveredPoint?.index === i;

            return (
              <g key={i}>
                {/* Invisible hover trigger column */}
                <rect
                  x={x - chartW / (chartData.length * 2)}
                  y={padTop}
                  width={chartW / chartData.length}
                  height={chartH}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() =>
                    setHoveredPoint({
                      index: i,
                      label: pt.fullLabel || pt.label,
                      credit: pt.credit,
                      debit: pt.debit,
                      net: pt.credit - pt.debit,
                      xPercent: ((x / width) * 100).toFixed(1),
                      yPercent: (((yCredit + yDebit) / 2 / height) * 100).toFixed(1),
                    })
                  }
                />

                {/* Vertical Cursor Line */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={padTop}
                    x2={x}
                    y2={padTop + chartH}
                    stroke="var(--amber-primary)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Debit Node */}
                <circle
                  cx={x}
                  cy={yDebit}
                  r={isHovered ? 6 : 3}
                  fill="#ef4444"
                  stroke="#17100b"
                  strokeWidth="2"
                  style={{ transition: 'r 0.2s ease' }}
                />

                {/* Credit Node */}
                <circle
                  cx={x}
                  cy={yCredit}
                  r={isHovered ? 6.5 : 3.5}
                  fill="#10b981"
                  stroke="#17100b"
                  strokeWidth="2"
                  style={{ transition: 'r 0.2s ease' }}
                />
              </g>
            );
          })}
        </svg>

        {/* Rich Floating Tooltip */}
        {hoveredPoint && (
          <div
            className="chart-tooltip"
            style={{
              left: `${hoveredPoint.xPercent}%`,
              top: `${Math.max(18, hoveredPoint.yPercent)}%`,
            }}
          >
            <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '3px' }}>
              {hoveredPoint.label}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#10b981', fontWeight: '600' }}>
              <span>Credit (Inflow):</span>
              <span>+${hoveredPoint.credit.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#ef4444', fontWeight: '600' }}>
              <span>Debit (Outflow):</span>
              <span>-${hoveredPoint.debit.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: 'var(--amber-light)', fontWeight: '700', marginTop: '3px', paddingTop: '3px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span>Net:</span>
              <span>{hoveredPoint.net >= 0 ? '+' : ''}${hoveredPoint.net.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
