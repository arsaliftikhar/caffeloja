'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RefreshCw, ExternalLink, ArrowRight, X } from 'lucide-react';
import SubscriptionRevenueChart from '@/components/SubscriptionRevenueChart';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({
    levels: [
      { level: 1, amount: 10, label: 'Direct Sponsor (Level 1)' },
      { level: 2, amount: 8, label: 'Level 2 Sponsor' },
      { level: 3, amount: 6, label: 'Level 3 Sponsor' },
      { level: 4, amount: 6, label: 'Level 4 Sponsor' },
    ],
    isMLMActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [selectedOrderLog, setSelectedOrderLog] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('caffeloja_token') : null;
    try {
      const [ordersRes, usersRes, settingsRes] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/settings'),
      ]);

      const [ordersData, usersData, settingsData] = await Promise.all([
        ordersRes.json(),
        usersRes.json(),
        settingsRes.json(),
      ]);

      if (ordersData.success) setOrders(ordersData.orders || []);
      if (usersData.success && usersData.users) {
        setUsers(usersData.users.filter((u) => u.role !== 'admin'));
      }
      if (settingsData.success && settingsData.data) {
        setSettings(settingsData.data);
      }
    } catch (e) {
      console.error('Failed to load admin dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  const totalVolume = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const activeSubsCount = users.filter((u) => u.hasActiveSubscription || u.subscriptionStatus === 'active').length;
  const totalCommissionPool = (settings.levels || []).reduce(
    (sum, l) => sum + (Number(l.amount ?? l.percentage) || 0),
    0
  );

  return (
    <div className="animate-fadeIn">
      {/* 4 Executive KPI Cards */}
      <div className="user-kpi-grid">
        <Link
          href="/admin/users"
          className="user-kpi-card"
          style={{ textDecoration: 'none', display: 'block', transition: 'transform 0.15s ease' }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
            Registered Users
          </span>
          <strong style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--amber-light)' }}>
            {users.length}
          </strong>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {activeSubsCount} active subscribers →
          </div>
        </Link>

        <Link
          href="/admin/orders"
          className="user-kpi-card"
          style={{ textDecoration: 'none', display: 'block', transition: 'transform 0.15s ease' }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
            Total Store Orders
          </span>
          <strong style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            {orders.length}
          </strong>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            ${totalVolume.toFixed(2)} total volume →
          </div>
        </Link>

        <Link
          href="/admin/users?filter=active"
          className="user-kpi-card"
          style={{ textDecoration: 'none', display: 'block', transition: 'transform 0.15s ease' }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
            Active Subscriptions
          </span>
          <strong style={{ fontSize: '1.65rem', fontWeight: '800', color: '#34d399' }}>
            {activeSubsCount}
          </strong>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            ${(activeSubsCount * 69).toFixed(2)}/mo recurring MRR →
          </div>
        </Link>

        <Link
          href="/admin/commissions"
          className="user-kpi-card"
          style={{ textDecoration: 'none', display: 'block', transition: 'transform 0.15s ease' }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
            Fixed Commission Pool
          </span>
          <strong style={{ fontSize: '1.65rem', fontWeight: '800', color: '#fbbf24' }}>
            ${totalCommissionPool.toFixed(2)} / box
          </strong>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            $10, $8, $6, $6 across 4 levels ({settings.isMLMActive ? 'Active' : 'Paused'}) →
          </div>
        </Link>
      </div>

      {/* Subscriptions Revenue History Line Graph Chart */}
      <SubscriptionRevenueChart orders={orders} users={users} />

      {/* Recent Orders Preview */}
      <div
        style={{
          background: '#1a120d',
          border: '1px solid var(--mocha-border)',
          borderRadius: '16px',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', margin: '0 0 2px' }}>
              Recent Store Orders
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Recent coffee purchases and subscription box renewals.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="btn-outline btn-sm"
            style={{ fontSize: '0.78rem', textDecoration: 'none' }}
          >
            <span>View All Orders ({orders.length})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {orders.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--mocha-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px 10px' }}>Order #</th>
                  <th style={{ padding: '8px 10px' }}>Customer</th>
                  <th style={{ padding: '8px 10px' }}>Total</th>
                  <th style={{ padding: '8px 10px' }}>Payment</th>
                  <th style={{ padding: '8px 10px' }}>Dropship Status</th>
                  <th style={{ padding: '8px 10px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((ord) => (
                  <tr key={ord._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 10px', fontWeight: '700' }}>{ord.orderNumber}</td>
                    <td style={{ padding: '10px 10px' }}>{ord.customer?.name}</td>
                    <td style={{ padding: '10px 10px', fontWeight: '600' }}>${(ord.total || 0).toFixed(2)}</td>
                    <td style={{ padding: '10px 10px' }}>
                      <span style={{ color: ord.paymentStatus === 'paid' ? '#34d399' : 'var(--amber-light)', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                        {ord.paymentStatus || 'unpaid'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 10px' }}>
                      <span className="badge-pill" style={{ fontSize: '0.72rem' }}>
                        {ord.dropshipping?.status || 'pending'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 10px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedOrderLog(ord)}
                        className="btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                      >
                        Logs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
            {loading ? 'Loading orders...' : 'No orders recorded in database yet.'}
          </div>
        )}
      </div>

      {/* Selected Order Raw Logs Drawer / Modal */}
      {selectedOrderLog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedOrderLog(null)}
        >
          <div
            style={{
              background: '#1a120d',
              border: '1px solid var(--mocha-border)',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '740px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', margin: 0 }}>
                  Order Audit Log: {selectedOrderLog.orderNumber}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Customer: {selectedOrderLog.customer?.name} ({selectedOrderLog.customer?.email})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderLog(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '0.92rem', color: 'var(--amber-light)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  WooCommerce Order API Log
                </h4>
                <div style={{ background: '#0d0907', border: '1px solid var(--mocha-border)', borderRadius: '12px', padding: '14px', fontSize: '0.8rem' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                      gap: '8px',
                      marginBottom: '10px',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <div><strong>Sync Status:</strong> {selectedOrderLog.dropshipping?.status || 'pending'}</div>
                    <div><strong>HTTP Status:</strong> {selectedOrderLog.dropshipping?.httpStatus ?? 'N/A'}</div>
                    <div><strong>WC Order ID:</strong> {selectedOrderLog.dropshipping?.dropshipOrderId || 'N/A'}</div>
                    <div><strong>Endpoint:</strong> {selectedOrderLog.dropshipping?.targetUrl || 'N/A'}</div>
                  </div>
                  {selectedOrderLog.dropshipping?.requestPayload && (
                    <div style={{ marginBottom: '12px' }}>
                      <strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '4px' }}>Request JSON Sent:</strong>
                      <pre
                        style={{
                          margin: 0,
                          overflowX: 'auto',
                          color: '#cbd5e1',
                          fontSize: '0.74rem',
                          lineHeight: 1.45,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {selectedOrderLog.dropshipping.requestPayload}
                      </pre>
                    </div>
                  )}
                  <strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '4px' }}>WooCommerce API Response:</strong>
                  <pre
                    style={{
                      margin: 0,
                      overflowX: 'auto',
                      color: '#e7ddd4',
                      fontSize: '0.74rem',
                      lineHeight: 1.45,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {selectedOrderLog.dropshipping?.responseLog || 'No WooCommerce API response logged yet.'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
