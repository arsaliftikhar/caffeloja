'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  UserCheck,
  UserX,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

function AdminUsersContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';

  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [userSubFilter, setUserSubFilter] = useState(initialFilter);
  const [actionStatus, setActionStatus] = useState({ userId: null, loading: false });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const f = searchParams.get('filter');
    if (f) setUserSubFilter(f);
  }, [searchParams]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('caffeloja_token') : null;
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.users) {
        // Strictly exclude admin accounts from user table
        setUsers(data.users.filter((u) => u.role !== 'admin'));
      }
    } catch (e) {
      console.error('Failed to load registered users', e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleToggleEmailVerification = async (user) => {
    if (!user?._id) return;
    setActionStatus({ userId: user._id, loading: true });
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('caffeloja_token') : null;
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'toggle_email_verification',
          userId: user._id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, isEmailVerified: !u.isEmailVerified } : u))
        );
      } else {
        alert(data.message || 'Failed to update email verification status');
      }
    } catch (e) {
      alert('Error communicating with server');
    } finally {
      setActionStatus({ userId: null, loading: false });
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = userSearch
      ? (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.phone || '').toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.referralCode || '').toLowerCase().includes(userSearch.toLowerCase())
      : true;

    const matchesSub =
      userSubFilter === 'active'
        ? u.hasActiveSubscription || u.subscriptionStatus === 'active'
        : userSubFilter === 'inactive'
        ? !u.hasActiveSubscription && u.subscriptionStatus !== 'active'
        : true;

    return matchesSearch && matchesSub;
  });

  const activeSubCount = users.filter((u) => u.hasActiveSubscription || u.subscriptionStatus === 'active').length;

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
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', margin: '0 0 4px' }}>
            Registered Users Directory
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
            Inspect all platform accounts, track subscription activity, and verify emails.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="btn-outline btn-sm"
          disabled={isLoadingUsers}
          style={{ fontSize: '0.82rem' }}
        >
          <RefreshCw size={14} className={isLoadingUsers ? 'spin-icon' : ''} />
          <span>Refresh Directory</span>
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
            Total Registered Members
          </span>
          <strong style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--amber-light)' }}>
            {users.length}
          </strong>
        </div>

        <div style={{ background: '#120d09', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '12px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
            Active Subscribers
          </span>
          <strong style={{ fontSize: '1.35rem', fontWeight: '800', color: '#34d399' }}>
            {activeSubCount}
          </strong>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
            ({users.length > 0 ? Math.round((activeSubCount / users.length) * 100) : 0}%)
          </span>
        </div>

        <div style={{ background: '#120d09', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '12px 16px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
            Verified Emails
          </span>
          <strong style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            {users.filter((u) => u.isEmailVerified).length}
          </strong>
        </div>
      </div>

      {/* Search & Subscription Filter Controls */}
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
            placeholder="Search by name, email, phone, code..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
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
            value={userSubFilter}
            onChange={(e) => setUserSubFilter(e.target.value)}
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
            <option value="all">All Members ({users.length})</option>
            <option value="active">Active Subscribers ({activeSubCount})</option>
            <option value="inactive">Inactive Subscribers ({users.length - activeSubCount})</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--mocha-border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>Member Details</th>
                <th style={{ padding: '10px 12px' }}>Referral Codes</th>
                <th style={{ padding: '10px 12px' }}>Subscription</th>
                <th style={{ padding: '10px 12px' }}>Email Status</th>
                <th style={{ padding: '10px 12px' }}>Wallet & Earnings</th>
                <th style={{ padding: '10px 12px' }}>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 12px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{u.name}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    {u.phone && <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{u.phone}</div>}
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--amber-light)', fontWeight: '600' }}>
                      {u.referralCode || 'N/A'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Sponsor: {u.sponsorCode ? u.sponsorCode : 'Direct'}
                    </div>
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        background: u.hasActiveSubscription ? 'rgba(16, 185, 129, 0.14)' : 'rgba(239, 68, 68, 0.14)',
                        border: u.hasActiveSubscription ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)',
                        color: u.hasActiveSubscription ? '#34d399' : '#fca5a5',
                        textTransform: 'uppercase',
                      }}
                    >
                      {u.hasActiveSubscription ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          color: u.isEmailVerified ? '#34d399' : '#f87171',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        {u.isEmailVerified ? (
                          <>
                            <UserCheck size={13} />
                            Verified
                          </>
                        ) : (
                          <>
                            <UserX size={13} />
                            Pending
                          </>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleEmailVerification(u)}
                        disabled={actionStatus.loading && actionStatus.userId === u._id}
                        className="btn-secondary btn-sm"
                        style={{ fontSize: '0.68rem', padding: '2px 6px' }}
                      >
                        {u.isEmailVerified ? 'Unmark' : 'Verify'}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      ${(u.walletBalance || 0).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Earned: ${(u.totalEarnings || 0).toFixed(2)}
                    </div>
                  </td>
                  <td style={{ padding: '12px 12px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
          {isLoadingUsers ? 'Loading members...' : userSearch ? 'No registered users match your search query.' : 'No users found in database.'}
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="spin-icon" style={{ color: 'var(--amber-primary)', margin: '0 auto 8px' }} />
          <div>Loading members directory...</div>
        </div>
      }
    >
      <AdminUsersContent />
    </Suspense>
  );
}
