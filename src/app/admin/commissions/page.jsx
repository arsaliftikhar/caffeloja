'use client';

import { useState, useEffect } from 'react';
import { Sliders, Save, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminCommissionsPage() {
  const [settings, setSettings] = useState({
    levels: [
      { level: 1, amount: 10, label: 'Direct Sponsor (Level 1)' },
      { level: 2, amount: 8, label: 'Level 2 Sponsor' },
      { level: 3, amount: 6, label: 'Level 3 Sponsor' },
      { level: 4, amount: 6, label: 'Level 4 Sponsor' },
    ],
    isMLMActive: true,
    minimumPayout: 20,
  });
  const [saveStatus, setSaveStatus] = useState({ loading: false, success: false, message: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (e) {
      console.error('Error fetching admin settings', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLevelAmountChange = (levelNumber, val) => {
    const num = Math.max(0, Math.min(69, parseFloat(val) || 0));
    const newLevels = (settings.levels || []).map((lvl) => {
      if (lvl.level === levelNumber) {
        return { ...lvl, amount: num, percentage: num };
      }
      return lvl;
    });
    setSettings({ ...settings, levels: newLevels });
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSaveStatus({ loading: true, success: false, message: '' });
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('caffeloja_token') : null;
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus({ loading: false, success: true, message: 'Fixed commission rates saved to database!' });
        setTimeout(() => setSaveStatus({ loading: false, success: false, message: '' }), 4000);
      } else {
        setSaveStatus({ loading: false, success: false, message: data.message || data.error || 'Failed to update commission rates' });
      }
    } catch (err) {
      setSaveStatus({ loading: false, success: false, message: 'Server communication error' });
    }
  };

  const totalCommissionPool = (settings.levels || []).reduce(
    (sum, l) => sum + (Number(l.amount ?? l.percentage) || 0),
    0
  );

  return (
    <form
      onSubmit={handleSaveSettings}
      className="animate-fadeIn"
      style={{
        background: '#1a120d',
        border: '1px solid var(--mocha-border)',
        borderRadius: '20px',
        padding: 'clamp(20px, 4vw, 32px)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', margin: '0 0 4px' }}>
            4-Level Fixed Commission Rates ($/Box)
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
            Configure exact dollar amounts earned per recurring coffee box purchase across 4 sponsor levels.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSettings}
          className="btn-outline btn-sm"
          disabled={isLoading}
          style={{ fontSize: '0.82rem' }}
        >
          <RefreshCw size={14} className={isLoading ? 'spin-icon' : ''} />
          <span>Reload</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', marginBottom: '28px' }}>
        {/* Toggle & Min Payout */}
        <div className="form-grid-2">
          <div className="form-field">
            <label>Affiliate Engine Status</label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#130d09',
                border: '1px solid var(--mocha-border)',
                padding: '12px 16px',
                borderRadius: '12px',
              }}
            >
              <input
                type="checkbox"
                id="isMLMActive"
                checked={settings.isMLMActive ?? true}
                onChange={(e) => setSettings({ ...settings, isMLMActive: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--amber-primary)', cursor: 'pointer' }}
              />
              <label htmlFor="isMLMActive" style={{ margin: 0, cursor: 'pointer', fontSize: '0.92rem', color: settings.isMLMActive ? '#34d399' : '#f87171', fontWeight: '600' }}>
                {settings.isMLMActive ? 'Active (Commissions Distributed)' : 'Paused (No Payouts Distributed)'}
              </label>
            </div>
          </div>

          <div className="form-field">
            <label>Minimum Withdrawal Threshold ($)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: '700' }}>$</span>
              <input
                type="number"
                min="0"
                value={settings.minimumPayout ?? 20}
                onChange={(e) => setSettings({ ...settings, minimumPayout: parseFloat(e.target.value) || 0 })}
                style={{ paddingLeft: '28px' }}
              />
            </div>
          </div>
        </div>

        {/* 4 Levels Inputs */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: 'var(--amber-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Fixed Cash Per Coffee Box ($69.00 / Box)
            </label>
            <span style={{ fontSize: '0.84rem', color: '#fbbf24', fontWeight: '700' }}>
              Total Fixed Pool: ${totalCommissionPool.toFixed(2)} / Box
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(settings.levels || []).map((lvl) => (
              <div
                key={lvl.level}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#130d09',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: '1px solid var(--mocha-border)',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                    Level {lvl.level} ({lvl.label})
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {lvl.level === 1 ? 'Direct sponsor who referred the customer' : `Upstream sponsor level ${lvl.level}`}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--amber-light)' }}>$</span>
                  <input
                    type="number"
                    min="0"
                    max="69"
                    step="0.5"
                    value={lvl.amount ?? lvl.percentage}
                    onChange={(e) => handleLevelAmountChange(lvl.level, e.target.value)}
                    style={{
                      width: '84px',
                      background: '#1f1611',
                      border: '1px solid var(--amber-primary)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      textAlign: 'center',
                      fontSize: '1.05rem',
                      fontWeight: '700',
                      color: 'var(--amber-light)',
                    }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>/ box</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Explain Box */}
        <div style={{ background: 'rgba(230, 157, 69, 0.08)', border: '1px solid var(--amber-glow)', borderRadius: '12px', padding: '16px' }}>
          <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--amber-light)', marginBottom: '4px' }}>
            💡 Fixed Price Model:
          </strong>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
            Every time a customer or member orders a monthly coffee box ($69), our system calculates direct and upstream referral trees, crediting each eligible sponsor’s wallet with their designated fixed dollar amount ($10, $8, $6, $6).
          </p>
        </div>
      </div>

      {saveStatus.message && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.88rem',
            marginBottom: '16px',
            background: saveStatus.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: saveStatus.success ? '#34d399' : '#ef4444',
            border: `1px solid ${saveStatus.success ? '#34d399' : '#ef4444'}`,
          }}
        >
          {saveStatus.message}
        </div>
      )}

      <button type="submit" disabled={saveStatus.loading} className="btn-primary" style={{ width: '100%', padding: '14px', justifyContent: 'center' }}>
        <Save size={18} />
        <span>{saveStatus.loading ? 'Saving to MongoDB...' : 'Save Fixed Commission Rates'}</span>
      </button>
    </form>
  );
}

