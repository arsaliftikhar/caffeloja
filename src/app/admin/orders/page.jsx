'use client';

import { useState, useEffect } from 'react';
import {
  ShoppingBag,
  RefreshCw,
  Search,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrderLog, setSelectedOrderLog] = useState(null);
  const [retryingOrderId, setRetryingOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

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

  const handleRetryDropship = async (orderId) => {
    setRetryingOrderId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry_dropship', orderId }),
      });
      const data = await res.json();
      alert(data.message || 'Dropship dispatched to WordPress');
      fetchOrders();
    } catch (e) {
      alert('Failed to retry dropship');
    } finally {
      setRetryingOrderId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = orderSearch
      ? (o.orderNumber || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.customer?.name || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.customer?.email || '').toLowerCase().includes(orderSearch.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter === 'paid'
        ? o.paymentStatus === 'paid'
        : statusFilter === 'unpaid'
        ? o.paymentStatus !== 'paid'
        : statusFilter === 'synced'
        ? o.dropshipping?.status === 'success' || o.dropshipping?.status === 'forwarded'
        : true;

    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  const paidOrdersCount = orders.filter((o) => o.paymentStatus === 'paid').length;

  return (
    <div
      className="animate-fadeIn"
      style={{
        background: '#1a120d',
        border: '1px solid var(--mocha-border)',
        borderRadius: '20px',
        padding: 'clamp(20px, 4vw, 32px)',
      }}
    >
      {/* Header with Title and Refresh */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', margin: '0 0 4px' }}>
            Order Fulfillment & Dropship Tracking Log
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
            Inspect raw Stripe payment events, customer details, and WooCommerce fulfillment responses.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="btn-outline btn-sm"
          disabled={isLoadingOrders}
          style={{ fontSize: '0.82rem' }}
        >
          <RefreshCw size={14} className={isLoadingOrders ? 'spin-icon' : ''} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '22px',
        }}
      >
        <div style={{ background: '#120d09', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '12px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
            Total Orders Logged
          </span>
          <strong style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--amber-light)' }}>
            {orders.length}
          </strong>
        </div>

        <div style={{ background: '#120d09', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '12px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
            Paid Orders
          </span>
          <strong style={{ fontSize: '1.35rem', fontWeight: '800', color: '#34d399' }}>
            {paidOrdersCount}
          </strong>
        </div>

        <div style={{ background: '#120d09', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '12px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
            Gross Store Sales
          </span>
          <strong style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            ${totalRevenue.toFixed(2)}
          </strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#120d09',
            border: '1px solid var(--mocha-border)',
            borderRadius: '10px',
            padding: '8px 14px',
            gap: '10px',
            flex: '1 1 280px',
            maxWidth: '420px',
          }}
        >
          <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by order #, customer, or email..."
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '0.86rem',
              outline: 'none',
              width: '100%',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              background: '#120d09',
              border: '1px solid var(--mocha-border)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              padding: '9px 14px',
              fontSize: '0.84rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Orders ({orders.length})</option>
            <option value="paid">Paid Orders ({paidOrdersCount})</option>
            <option value="unpaid">Unpaid / Failed ({orders.length - paidOrdersCount})</option>
            <option value="synced">WooCommerce Synced</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--mocha-border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>Order #</th>
                <th style={{ padding: '10px 12px' }}>Customer</th>
                <th style={{ padding: '10px 12px' }}>Total</th>
                <th style={{ padding: '10px 12px' }}>Payment</th>
                <th style={{ padding: '10px 12px' }}>WC Order ID</th>
                <th style={{ padding: '10px 12px' }}>Dropship Sync</th>
                <th style={{ padding: '10px 12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((ord) => (
                <tr key={ord._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 12px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{ord.orderNumber}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {new Date(ord.createdAt).toLocaleDateString()} {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <div style={{ fontWeight: '600' }}>{ord.customer?.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{ord.customer?.email}</div>
                  </td>
                  <td style={{ padding: '12px 12px', fontWeight: '700', color: 'var(--amber-light)' }}>
                    ${(ord.total || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        background: ord.paymentStatus === 'paid' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        border: ord.paymentStatus === 'paid' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                        color: ord.paymentStatus === 'paid' ? '#34d399' : '#fbbf24',
                      }}
                    >
                      {ord.paymentStatus || 'unpaid'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 12px', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                    {ord.dropshipping?.dropshipOrderId ? `#${ord.dropshipping.dropshipOrderId}` : '—'}
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        background:
                          ord.dropshipping?.status === 'success' || ord.dropshipping?.status === 'forwarded'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : ord.dropshipping?.status === 'failed'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : 'rgba(245, 158, 11, 0.15)',
                        border:
                          ord.dropshipping?.status === 'success' || ord.dropshipping?.status === 'forwarded'
                            ? '1px solid rgba(16, 185, 129, 0.4)'
                            : ord.dropshipping?.status === 'failed'
                            ? '1px solid rgba(239, 68, 68, 0.4)'
                            : '1px solid rgba(245, 158, 11, 0.4)',
                        color:
                          ord.dropshipping?.status === 'success' || ord.dropshipping?.status === 'forwarded'
                            ? '#34d399'
                            : ord.dropshipping?.status === 'failed'
                            ? '#f87171'
                            : '#fbbf24',
                      }}
                    >
                      {ord.dropshipping?.status || 'pending'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedOrderLog(ord)}
                        className="btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                      >
                        Logs
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRetryDropship(ord._id)}
                        disabled={retryingOrderId === ord._id}
                        className="btn-outline btn-sm"
                        style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                      >
                        {retryingOrderId === ord._id ? 'Sending...' : 'Retry WP'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
          {isLoadingOrders ? 'Loading orders...' : orderSearch ? 'No orders match your search query.' : 'No orders in database yet.'}
        </div>
      )}

      {/* Selected Order Audit Logs Modal */}
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
              {/* Customer & Shipping Summary */}
              <div>
                <h4 style={{ fontSize: '0.92rem', color: 'var(--amber-light)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  1. Shipping & Customer Details
                </h4>
                <div style={{ background: '#0d0907', border: '1px solid var(--mocha-border)', borderRadius: '12px', padding: '14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <div><strong>Name:</strong> {selectedOrderLog.customer?.name}</div>
                  <div><strong>Email:</strong> {selectedOrderLog.customer?.email}</div>
                  <div><strong>Phone:</strong> {selectedOrderLog.customer?.phone || 'N/A'}</div>
                  <div>
                    <strong>Shipping Address:</strong> {selectedOrderLog.customer?.address?.street}, {selectedOrderLog.customer?.address?.city}, {selectedOrderLog.customer?.address?.state} {selectedOrderLog.customer?.address?.postalCode}, {selectedOrderLog.customer?.address?.country}
                  </div>
                  <div><strong>Stripe Payment Intent:</strong> {selectedOrderLog.stripePaymentIntentId || 'N/A'}</div>
                  <div><strong>Subscription ID:</strong> {selectedOrderLog.stripeSubscriptionId || 'N/A'}</div>
                </div>
              </div>

              {/* WooCommerce Order API Log */}
              <div>
                <h4 style={{ fontSize: '0.92rem', color: 'var(--amber-light)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  2. WooCommerce Order API Log
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

