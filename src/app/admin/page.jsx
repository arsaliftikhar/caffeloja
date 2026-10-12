'use client';

import { useState, useEffect } from 'react';
import {
  Sliders,
  Globe,
  ShoppingBag,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Percent,
  Server,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('mlm'); // 'mlm' | 'dropship' | 'orders'
  const [settings, setSettings] = useState({
    levels: [
      { level: 1, percentage: 10, label: 'Direct Sponsor (Level 1)' },
      { level: 2, percentage: 5, label: 'Sub-tier 1 (Level 2)' },
      { level: 3, percentage: 3, label: 'Sub-tier 2 (Level 3)' },
      { level: 4, percentage: 2, label: 'Sub-tier 3 (Level 4)' },
    ],
    isMLMActive: true,
    minimumPayout: 20,
    dropshipSettings: {
      targetUrl: 'https://oldchicagocoffee.com',
      consumerKey: '',
      consumerSecret: '',
      apiMode: 'wc_rest',
      autoForward: true,
      pluginSecretToken: 'hybrid_mlm_secure_bridge_2026',
    },
  });

  const [orders, setOrders] = useState([]);
  const [saveStatus, setSaveStatus] = useState({ loading: false, success: false, message: '' });
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchOrders();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (e) {
      console.log('Using default settings');
    }
  };

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error('Error fetching admin orders', e);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleLevelPercentageChange = (levelNum, newPercent) => {
    const updated = settings.levels.map((l) =>
      l.level === levelNum ? { ...l, percentage: Number(newPercent) } : l
    );
    setSettings({ ...settings, levels: updated });
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaveStatus({ loading: true, success: false, message: '' });

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus({ loading: false, success: true, message: 'Settings saved to MongoDB!' });
        setTimeout(() => setSaveStatus({ loading: false, success: false, message: '' }), 4000);
      } else {
        setSaveStatus({ loading: false, success: false, message: data.message || 'Failed to save' });
      }
    } catch {
      setSaveStatus({ loading: false, success: false, message: 'Connection error' });
    }
  };

  const handleRetryDropship = async (orderId) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry_dropship', orderId }),
      });
      const data = await res.json();
      alert(data.message || 'Dropship dispatched');
      fetchOrders();
    } catch (e) {
      alert('Failed to retry dropship');
    }
  };

  const totalCommissionRate = (settings.levels || []).reduce(
    (sum, l) => sum + (Number(l.percentage) || 0),
    0
  );

  return (
    <div style={{ paddingTop: '110px', minHeight: '90vh', paddingBottom: '80px' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header" style={{ marginBottom: '32px' }}>
          <span className="section-tag">Executive Control Center</span>
          <h1 className="section-title">MLM & WordPress Dropship Manager</h1>
          <p className="section-desc">
            Configure custom 4-level commission payouts and manage automated order fulfillment with oldchicagocoffee.com.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '36px' }}>
          <button
            onClick={() => setActiveTab('mlm')}
            className={`btn-outline ${activeTab === 'mlm' ? 'btn-primary' : ''}`}
            style={activeTab === 'mlm' ? { color: '#0d0907' } : {}}
          >
            <Sliders size={16} />
            <span>4-Level Commission Config</span>
          </button>
          <button
            onClick={() => setActiveTab('dropship')}
            className={`btn-outline ${activeTab === 'dropship' ? 'btn-primary' : ''}`}
            style={activeTab === 'dropship' ? { color: '#0d0907' } : {}}
          >
            <Globe size={16} />
            <span>WordPress Dropship Bridge</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`btn-outline ${activeTab === 'orders' ? 'btn-primary' : ''}`}
            style={activeTab === 'orders' ? { color: '#0d0907' } : {}}
          >
            <ShoppingBag size={16} />
            <span>Dropship Orders Log ({orders.length})</span>
          </button>
        </div>

        {/* TAB 1: 4-LEVEL COMMISSION CONFIGURATION */}
        {activeTab === 'mlm' && (
          <form onSubmit={handleSaveSettings} style={{ maxWidth: '780px', margin: '0 auto', background: '#17100b', border: '1px solid var(--mocha-border)', borderRadius: '24px', padding: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>
                  4-Level Commission Percentage Distribution
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Total Payout Pool: <strong style={{ color: 'var(--amber-light)' }}>{totalCommissionRate}%</strong> of coffee sale value
                </p>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.isMLMActive}
                  onChange={(e) => setSettings({ ...settings, isMLMActive: e.target.checked })}
                />
                <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>MLM Active</span>
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
              {(settings.levels || []).map((lvl) => (
                <div
                  key={lvl.level}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '1px solid var(--mocha-border)',
                  }}
                >
                  <div>
                    <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)' }}>
                      Level {lvl.level} ({lvl.label})
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {lvl.level === 1 ? 'Direct sponsor who referred the customer' : `Upstream sponsor tier ${lvl.level - 1}`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={lvl.percentage}
                      onChange={(e) => handleLevelPercentageChange(lvl.level, e.target.value)}
                      style={{
                        width: '90px',
                        background: '#1f1611',
                        border: '1px solid var(--amber-primary)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        textAlign: 'center',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: 'var(--amber-light)',
                      }}
                    />
                    <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--amber-light)' }}>%</span>
                  </div>
                </div>
              ))}
            </div>

            {saveStatus.message && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  marginBottom: '16px',
                  background: saveStatus.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: saveStatus.success ? 'var(--success)' : '#ef4444',
                  border: `1px solid ${saveStatus.success ? 'var(--success)' : '#ef4444'}`,
                }}
              >
                {saveStatus.message}
              </div>
            )}

            <button type="submit" disabled={saveStatus.loading} className="btn-primary" style={{ width: '100%', padding: '14px' }}>
              <Save size={18} />
              <span>{saveStatus.loading ? 'Saving to MongoDB...' : 'Save 4-Level Commission Rules'}</span>
            </button>
          </form>
        )}

        {/* TAB 2: WORDPRESS DROPSHIPPING BRIDGE CONFIG */}
        {activeTab === 'dropship' && (
          <form onSubmit={handleSaveSettings} style={{ maxWidth: '780px', margin: '0 auto', background: '#17100b', border: '1px solid var(--mocha-border)', borderRadius: '24px', padding: '36px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '6px' }}>
                WordPress / WooCommerce Dropshipping Bridge
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Target Dropshipper: <strong style={{ color: 'var(--amber-light)' }}>https://oldchicagocoffee.com</strong>
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div className="form-field">
                <label>Dropshipper WordPress URL</label>
                <input
                  type="url"
                  required
                  value={settings.dropshipSettings?.targetUrl || 'https://oldchicagocoffee.com'}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      dropshipSettings: { ...settings.dropshipSettings, targetUrl: e.target.value },
                    })
                  }
                />
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label>WooCommerce Consumer Key (Optional / When Ready)</label>
                  <input
                    type="text"
                    placeholder="ck_xxxxxxxxxxxxxxxxxxxx"
                    value={settings.dropshipSettings?.consumerKey || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        dropshipSettings: { ...settings.dropshipSettings, consumerKey: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="form-field">
                  <label>WooCommerce Consumer Secret (Optional)</label>
                  <input
                    type="password"
                    placeholder="cs_xxxxxxxxxxxxxxxxxxxx"
                    value={settings.dropshipSettings?.consumerSecret || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        dropshipSettings: { ...settings.dropshipSettings, consumerSecret: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-field">
                <label>caffeloja-wp-plugin Security Token</label>
                <input
                  type="text"
                  value={settings.dropshipSettings?.pluginSecretToken || 'hybrid_mlm_secure_bridge_2026'}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      dropshipSettings: { ...settings.dropshipSettings, pluginSecretToken: e.target.value },
                    })
                  }
                />
              </div>

              <div style={{ background: 'rgba(230, 157, 69, 0.08)', border: '1px solid var(--amber-glow)', borderRadius: '12px', padding: '16px' }}>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--amber-light)', marginBottom: '4px' }}>
                  📦 How Dropshipping Forwarding Works:
                </strong>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Whenever an order is placed on Caffè Loja, our background engine formats the billing/shipping and line items payload and dispatches it directly to the WordPress WooCommerce REST / Bridge API on <strong>oldchicagocoffee.com</strong>.
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
                  color: saveStatus.success ? 'var(--success)' : '#ef4444',
                  border: `1px solid ${saveStatus.success ? 'var(--success)' : '#ef4444'}`,
                }}
              >
                {saveStatus.message}
              </div>
            )}

            <button type="submit" disabled={saveStatus.loading} className="btn-primary" style={{ width: '100%', padding: '14px' }}>
              <Save size={18} />
              <span>{saveStatus.loading ? 'Saving...' : 'Save Dropship Settings'}</span>
            </button>
          </form>
        )}

        {/* TAB 3: DROPSHIP ORDERS LOG & COMMISSION STATUS */}
        {activeTab === 'orders' && (
          <div style={{ background: '#17100b', border: '1px solid var(--mocha-border)', borderRadius: '24px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>
                Order Fulfillment & Dropship Tracking Log
              </h3>
              <button onClick={fetchOrders} className="btn-outline btn-sm" disabled={isLoadingOrders}>
                <RefreshCw size={14} className={isLoadingOrders ? 'spin-icon' : ''} />
                <span>Refresh Orders</span>
              </button>
            </div>

            {orders.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--mocha-border)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '10px 12px' }}>Order Ref</th>
                      <th style={{ padding: '10px 12px' }}>Customer</th>
                      <th style={{ padding: '10px 12px' }}>Total</th>
                      <th style={{ padding: '10px 12px' }}>Referral Code</th>
                      <th style={{ padding: '10px 12px' }}>4-Level MLM</th>
                      <th style={{ padding: '10px 12px' }}>Dropship WP Order</th>
                      <th style={{ padding: '10px 12px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => (
                      <tr key={ord._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px 12px', fontWeight: '700' }}>{ord.orderNumber}</td>
                        <td style={{ padding: '12px 12px' }}>
                          <div>{ord.customer?.name}</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.customer?.city}, PT</span>
                        </td>
                        <td style={{ padding: '12px 12px', fontWeight: '600' }}>${(ord.total || 0).toFixed(2)}</td>
                        <td style={{ padding: '12px 12px' }}>
                          {ord.referralCode ? (
                            <span className="badge-pill" style={{ color: 'var(--amber-light)' }}>
                              {ord.referralCode}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Direct</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 12px' }}>
                          {ord.commissionsDistributed ? (
                            <span style={{ color: 'var(--success)', fontSize: '0.8rem' }}>
                              ✓ ${(ord.totalCommissionsPaid || 0).toFixed(2)} Paid
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>N/A</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 12px' }}>
                          <span className="badge-pill" style={{ fontSize: '0.74rem' }}>
                            {ord.dropshipping?.dropshipOrderId || 'OCC-DISPATCHED'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 12px' }}>
                          <button
                            onClick={() => handleRetryDropship(ord._id)}
                            className="btn-outline btn-sm"
                            style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                          >
                            Re-send WP
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                No orders in the database yet. Place a test order from the shop to see the live dropship and MLM distribution.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
