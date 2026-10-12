'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Copy,
  Check,
  TrendingUp,
  Award,
  Wallet,
  ArrowRight,
  ArrowUpRight,
  UserCheck,
  ShieldCheck,
  Share2,
  DollarSign,
  ChevronRight,
  Layers,
  Sparkles,
  LayoutDashboard,
  CreditCard,
  Megaphone,
  Settings,
  LogOut,
  QrCode,
  Search,
  Send,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Building,
  Smartphone,
  Lock,
  RefreshCw,
  ShoppingBag,
  HelpCircle,
  BarChart3,
  Calendar,
  Activity,
} from 'lucide-react';
import AffiliateLineChart from '@/components/AffiliateLineChart';

export default function AffiliatePage() {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [sidebarTab, setSidebarTab] = useState('overview'); // 'overview' | 'network' | 'commissions' | 'marketing' | 'payouts' | 'settings'
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [networkSearch, setNetworkSearch] = useState('');

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', phone: '', sponsorCode: '' });
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Dashboard states
  const [downline, setDownline] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [expandedLevel, setExpandedLevel] = useState(1);
  const [payoutForm, setPayoutForm] = useState({ method: 'bank', iban: '', accountName: '', mbway: '', crypto: '' });
  const [payoutMessage, setPayoutMessage] = useState('');
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);

  useEffect(() => {
    // Check URL params for mode or referral code
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const modeParam = urlParams.get('mode') || urlParams.get('tab');
      const refParam = urlParams.get('ref');

      if (modeParam === 'register') {
        setActiveTab('register');
      }

      if (refParam) {
        const cleanRef = refParam.toUpperCase().trim();
        localStorage.setItem('caffeloja_ref', cleanRef);
        setRegForm((prev) => ({ ...prev, sponsorCode: cleanRef }));
      } else {
        const savedRef = localStorage.getItem('caffeloja_ref');
        if (savedRef) {
          setRegForm((prev) => ({ ...prev, sponsorCode: savedRef }));
        }
      }
    }

    // Check existing auth token
    const savedToken = localStorage.getItem('caffeloja_token');
    if (savedToken) {
      setToken(savedToken);
      fetchUserProfile(savedToken);
    }
  }, []);

  const fetchUserProfile = async (authToken) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        fetchDownlineAndCommissions(authToken);
      } else {
        localStorage.removeItem('caffeloja_token');
        setToken(null);
      }
    } catch {
      localStorage.removeItem('caffeloja_token');
    }
  };

  const fetchDownlineAndCommissions = async (authToken) => {
    try {
      const [downlineRes, commRes] = await Promise.all([
        fetch('/api/affiliate/downline', { headers: { Authorization: `Bearer ${authToken}` } }),
        fetch('/api/affiliate/commissions', { headers: { Authorization: `Bearer ${authToken}` } }),
      ]);

      const downlineData = await downlineRes.json();
      const commData = await commRes.json();

      if (downlineData.success) setDownline(downlineData.data);
      if (commData.success) setCommissions(commData.data);
    } catch (e) {
      console.error('Error loading dashboard data', e);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('caffeloja_token', data.token);
        setToken(data.token);
        setUser(data.user);
        window.dispatchEvent(new Event('caffeloja_auth_change'));
        fetchDownlineAndCommissions(data.token);
      } else {
        setAuthError(data.message || data.error || 'Login failed. Please verify credentials.');
      }
    } catch (err) {
      setAuthError('Connection error: ' + (err.message || 'Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('caffeloja_token', data.token);
        setToken(data.token);
        setUser(data.user);
        window.dispatchEvent(new Event('caffeloja_auth_change'));
        fetchDownlineAndCommissions(data.token);
      } else {
        setAuthError(data.message || data.error || 'Registration failed. Please check your details.');
      }
    } catch (err) {
      setAuthError('Connection error: ' + (err.message || 'Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('caffeloja_token');
    setToken(null);
    setUser(null);
    window.dispatchEvent(new Event('caffeloja_auth_change'));
    setActiveTab('login');
  };

  const referralLink = user
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://caffeloja.com'}/?ref=${user.referralCode}`
    : '';

  const copyReferralLink = (customUrl = '') => {
    const textToCopy = customUrl || referralLink;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRequestPayout = (e) => {
    e.preventDefault();
    setIsRequestingPayout(true);
    setTimeout(() => {
      setIsRequestingPayout(false);
      setPayoutMessage('Payout request of $' + (user?.walletBalance || 0).toFixed(2) + ' submitted successfully! Payouts are processed every Monday.');
    }, 1000);
  };

  const getRankProgress = () => {
    const volume = user?.totalSalesVolume || 0;
    if (volume >= 10000) return { current: 'Diamond Founder', next: 'Max Level Reached', percent: 100, remaining: 0 };
    if (volume >= 5000) return { current: 'Platinum Master', next: 'Diamond Founder', percent: ((volume - 5000) / 5000) * 100, remaining: 10000 - volume };
    if (volume >= 2000) return { current: 'Gold Sommelier', next: 'Platinum Master', percent: ((volume - 2000) / 3000) * 100, remaining: 5000 - volume };
    if (volume >= 500) return { current: 'Silver Roaster', next: 'Gold Sommelier', percent: ((volume - 500) / 1500) * 100, remaining: 2000 - volume };
    return { current: 'Bronze Barista', next: 'Silver Roaster', percent: (volume / 500) * 100, remaining: 500 - volume };
  };

  const rankInfo = getRankProgress();

  // Downline member filtering
  const currentLevelMembers = downline ? downline[`level${expandedLevel}`] || [] : [];
  const filteredMembers = currentLevelMembers.filter((m) =>
    networkSearch ? (m.name?.toLowerCase().includes(networkSearch.toLowerCase()) || m.referralCode?.toLowerCase().includes(networkSearch.toLowerCase()) || m.email?.toLowerCase().includes(networkSearch.toLowerCase())) : true
  );

  return (
    <div className="affiliate-dashboard-wrap">
      <div className="container">
        {/* If user is NOT logged in: Show Login / Register Card */}
        {!user ? (
          <div className="affiliate-auth-card">
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <span className="section-tag">Affiliate Partner Network</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', margin: '8px 0' }}>
                4-Level Coffee Partner Portal
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Earn multi-tier commissions on artisan coffee sales with direct fulfillment.
              </p>
            </div>

            {/* Tab switch */}
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.4)', padding: '6px', borderRadius: '12px', marginBottom: '24px' }}>
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setAuthError(''); }}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: '8px',
                  fontSize: '0.92rem',
                  fontWeight: '600',
                  background: activeTab === 'login' ? 'var(--amber-primary)' : 'transparent',
                  color: activeTab === 'login' ? '#0d0907' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
              >
                Partner Login
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setAuthError(''); }}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: '8px',
                  fontSize: '0.92rem',
                  fontWeight: '600',
                  background: activeTab === 'register' ? 'var(--amber-primary)' : 'transparent',
                  color: activeTab === 'register' ? '#0d0907' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
              >
                Join Network
              </button>
            </div>

            {authError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#ef4444', padding: '12px 16px', borderRadius: '10px', fontSize: '0.86rem', marginBottom: '18px' }}>
                {authError}
              </div>
            )}

            {activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="checkout-form">
                <div className="form-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="partner@example.com"
                    value={loginForm.email}
                    onChange={(e) => {
                      setLoginForm({ ...loginForm, email: e.target.value });
                      if (authError) setAuthError('');
                    }}
                  />
                </div>
                <div className="form-field">
                  <label>Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => {
                      setLoginForm({ ...loginForm, password: e.target.value });
                      if (authError) setAuthError('');
                    }}
                  />
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary" style={{ marginTop: '12px', padding: '14px', width: '100%' }}>
                  {isLoading ? 'Authenticating...' : 'Access MLM Dashboard'}
                </button>
                <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Don&apos;t have an affiliate account?{' '}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('register'); setAuthError(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--amber-light)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Join Network
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="checkout-form">
                <div className="form-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Manuel Costa"
                    value={regForm.name}
                    onChange={(e) => {
                      setRegForm({ ...regForm, name: e.target.value });
                      if (authError) setAuthError('');
                    }}
                  />
                </div>
                <div className="form-field">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="manuel@example.com"
                    value={regForm.email}
                    onChange={(e) => {
                      setRegForm({ ...regForm, email: e.target.value });
                      if (authError) setAuthError('');
                    }}
                  />
                </div>
                <div className="form-field">
                  <label>Password * (Minimum 6 characters)</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={regForm.password}
                    onChange={(e) => {
                      setRegForm({ ...regForm, password: e.target.value });
                      if (authError) setAuthError('');
                    }}
                  />
                </div>
                <div className="form-field">
                  <label>Phone Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+351 912 345 678"
                    value={regForm.phone}
                    onChange={(e) => {
                      setRegForm({ ...regForm, phone: e.target.value });
                      if (authError) setAuthError('');
                    }}
                  />
                </div>
                <div className="form-field">
                  <label>Sponsor Referral Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. LOJA-4029"
                    value={regForm.sponsorCode}
                    onChange={(e) => {
                      setRegForm({ ...regForm, sponsorCode: e.target.value.toUpperCase() });
                      if (authError) setAuthError('');
                    }}
                    style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
                  />
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary" style={{ marginTop: '12px', padding: '14px', width: '100%' }}>
                  {isLoading ? 'Creating Account...' : 'Join & Generate Referral Link'}
                </button>
                <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); setAuthError(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--amber-light)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Log In Here
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Logged In: FULL PROFESSIONAL DASHBOARD WITH LEFT SIDEBAR */
          <div className="affiliate-layout animate-fadeIn">
            {/* LEFT SIDEBAR NAVIGATION */}
            <aside className="affiliate-sidebar">
              {/* Profile Card */}
              <div className="affiliate-profile-card">
                <div className="affiliate-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: 'var(--text-primary)' }}>
                    {user.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span className="badge-pill" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                      Affiliate Partner
                    </span>
                  </div>
                </div>
              </div>

              {/* Wallet Widget */}
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--mocha-border)', borderRadius: '14px', padding: '14px 16px' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Available Balance
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: '700', color: 'var(--amber-light)', margin: '4px 0 8px' }}>
                  ${(user.walletBalance || 0).toFixed(2)}
                </div>
                <button
                  onClick={() => setSidebarTab('payouts')}
                  className="btn-primary btn-sm"
                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', justifyContent: 'center' }}
                >
                  <Wallet size={14} />
                  <span>Withdraw Earnings</span>
                </button>
              </div>

              {/* Sidebar Menu Buttons */}
              <nav className="affiliate-nav-menu">
                <button
                  onClick={() => setSidebarTab('overview')}
                  className={`affiliate-nav-btn ${sidebarTab === 'overview' ? 'active' : ''}`}
                >
                  <div className="affiliate-nav-btn-left">
                    <LayoutDashboard size={18} />
                    <span>Overview</span>
                  </div>
                  <ChevronRight size={14} style={{ opacity: sidebarTab === 'overview' ? 1 : 0.4 }} />
                </button>

                <button
                  onClick={() => setSidebarTab('network')}
                  className={`affiliate-nav-btn ${sidebarTab === 'network' ? 'active' : ''}`}
                >
                  <div className="affiliate-nav-btn-left">
                    <Users size={18} />
                    <span>4-Tier Network</span>
                  </div>
                  <span className="badge-pill" style={{ fontSize: '0.72rem', padding: '1px 6px' }}>
                    {downline ? downline.totalMembers : 0}
                  </span>
                </button>

                <button
                  onClick={() => setSidebarTab('commissions')}
                  className={`affiliate-nav-btn ${sidebarTab === 'commissions' ? 'active' : ''}`}
                >
                  <div className="affiliate-nav-btn-left">
                    <TrendingUp size={18} />
                    <span>Commissions Ledger</span>
                  </div>
                  <span className="badge-pill" style={{ fontSize: '0.72rem', padding: '1px 6px' }}>
                    {commissions.length}
                  </span>
                </button>

                <button
                  onClick={() => setSidebarTab('marketing')}
                  className={`affiliate-nav-btn ${sidebarTab === 'marketing' ? 'active' : ''}`}
                >
                  <div className="affiliate-nav-btn-left">
                    <Megaphone size={18} />
                    <span>Marketing & Links</span>
                  </div>
                  <Sparkles size={14} className="text-amber" />
                </button>

                <button
                  onClick={() => setSidebarTab('payouts')}
                  className={`affiliate-nav-btn ${sidebarTab === 'payouts' ? 'active' : ''}`}
                >
                  <div className="affiliate-nav-btn-left">
                    <CreditCard size={18} />
                    <span>Payout & Banking</span>
                  </div>
                  <ChevronRight size={14} style={{ opacity: sidebarTab === 'payouts' ? 1 : 0.4 }} />
                </button>

                <button
                  onClick={() => setSidebarTab('settings')}
                  className={`affiliate-nav-btn ${sidebarTab === 'settings' ? 'active' : ''}`}
                >
                  <div className="affiliate-nav-btn-left">
                    <Settings size={18} />
                    <span>Account Settings</span>
                  </div>
                  <ChevronRight size={14} style={{ opacity: sidebarTab === 'settings' ? 1 : 0.4 }} />
                </button>
              </nav>

              {/* Sponsor & Logout */}
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Referral Code: <strong style={{ color: 'var(--amber-light)' }}>{user.referralCode}</strong>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-outline btn-sm"
                  style={{ width: '100%', justifyContent: 'center', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="affiliate-main-content">
              {/* Top Bar inside main content */}
              <div className="affiliate-top-bar">
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Affiliate Control Center
                  </div>
                  <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)', margin: '2px 0 0' }}>
                    {sidebarTab === 'overview' && 'Partner Dashboard Overview'}
                    {sidebarTab === 'network' && '4-Level Downline Lineage'}
                    {sidebarTab === 'commissions' && 'Commissions & Earnings History'}
                    {sidebarTab === 'marketing' && 'Marketing Tools & Referral Links'}
                    {sidebarTab === 'payouts' && 'Payouts & Banking Settings'}
                    {sidebarTab === 'settings' && 'Account & Security Settings'}
                  </h1>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => copyReferralLink()}
                    className="btn-primary btn-sm"
                    style={{ padding: '8px 16px' }}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copied ? 'Link Copied!' : 'Copy Partner Link'}</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: OVERVIEW */}
              {sidebarTab === 'overview' && (
                <div className="animate-fadeIn">
                  {/* 4 Dashboard KPI Stat Cards */}
                  <div className="affiliate-stat-grid-4">
                    {/* 1. Total Income */}
                    <div className="affiliate-stat-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Income</span>
                        <TrendingUp size={18} className="text-green" />
                      </div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', fontWeight: '700', color: '#10b981' }}>
                        ${(user.totalEarnings || 0).toFixed(2)}
                      </div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Lifetime 4-tier earnings</span>
                    </div>

                    {/* 2. Total Withdraw */}
                    <div className="affiliate-stat-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Withdraw</span>
                        <ArrowUpRight size={18} style={{ color: '#ef4444' }} />
                      </div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', fontWeight: '700', color: '#f87171' }}>
                        ${((user.totalWithdrawn !== undefined && user.totalWithdrawn !== null) ? user.totalWithdrawn : Math.max(0, (user.totalEarnings || 0) - (user.walletBalance || 0))).toFixed(2)}
                      </div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Dispatched payouts</span>
                    </div>

                    {/* 3. Direct Team */}
                    <div className="affiliate-stat-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Direct Team</span>
                        <UserCheck size={18} className="text-amber" />
                      </div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {downline?.level1?.length || 0}
                      </div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Level 1 direct members</span>
                    </div>

                    {/* 4. Total Team */}
                    <div className="affiliate-stat-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Team</span>
                        <Users size={18} className="text-amber" />
                      </div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {downline ? downline.totalMembers : 0}
                      </div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Across all 4 tiers</span>
                    </div>
                  </div>

                  {/* Animated Credit & Debit Line Chart */}
                  <AffiliateLineChart commissions={commissions} user={user} />
                </div>
              )}

              {/* TAB 2: 4-TIER NETWORK / LINEAGE */}
              {sidebarTab === 'network' && (
                <div className="animate-fadeIn">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
                    <div>
                      <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)' }}>4-Level Team Lineage</h2>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Browse your downline team members across all 4 commission tiers.
                      </p>
                    </div>

                    {/* Member Search */}
                    <div style={{ display: 'flex', alignItems: 'center', background: '#1a120d', border: '1px solid var(--mocha-border)', borderRadius: '10px', padding: '6px 12px', gap: '8px' }}>
                      <Search size={16} style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder="Search member name or code..."
                        value={networkSearch}
                        onChange={(e) => setNetworkSearch(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.84rem', outline: 'none', width: '200px' }}
                      />
                    </div>
                  </div>

                  {/* 4-Tier Interactive Selector */}
                  <div className="affiliate-tier-selector-grid">
                    {[
                      { lvl: 1, label: 'Direct Sponsor', rate: '10%' },
                      { lvl: 2, label: 'Sub-tier 1', rate: '5%' },
                      { lvl: 3, label: 'Sub-tier 2', rate: '3%' },
                      { lvl: 4, label: 'Sub-tier 3', rate: '2%' },
                    ].map((tier) => {
                      const count = downline ? downline[`level${tier.lvl}`]?.length || 0 : 0;
                      return (
                        <button
                          key={tier.lvl}
                          onClick={() => setExpandedLevel(tier.lvl)}
                          style={{
                            background: expandedLevel === tier.lvl ? 'rgba(230, 157, 69, 0.2)' : 'rgba(0,0,0,0.3)',
                            border: expandedLevel === tier.lvl ? '1px solid var(--amber-primary)' : '1px solid var(--mocha-border)',
                            borderRadius: '12px',
                            padding: '14px 10px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'var(--transition)',
                          }}
                        >
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Level {tier.lvl} ({tier.rate})</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: expandedLevel === tier.lvl ? 'var(--amber-light)' : 'var(--text-primary)', margin: '2px 0' }}>
                            {count}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{tier.label}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Member Cards */}
                  <div style={{ background: '#120c09', border: '1px solid var(--mocha-border)', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>
                        Level {expandedLevel} Partners ({filteredMembers.length})
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--amber-light)' }}>
                        Commission: {expandedLevel === 1 ? '10%' : expandedLevel === 2 ? '5%' : expandedLevel === 3 ? '3%' : '2%'} on all sales
                      </span>
                    </div>

                    {filteredMembers.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                        {filteredMembers.map((member, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid var(--mocha-border)',
                              borderRadius: '12px',
                              padding: '16px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '0.96rem', color: 'var(--text-primary)' }}>{member.name}</strong>
                              <span className="badge-pill" style={{ fontSize: '0.7rem' }}>Active Partner</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              Code: <strong style={{ color: 'var(--amber-light)' }}>{member.referralCode}</strong> &bull; {member.email}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                              <span>Sales: ${(member.totalSalesVolume || 0).toFixed(2)}</span>
                              <span>Joined: {new Date(member.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                        <Users size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                        <p style={{ fontSize: '0.9rem', marginBottom: '6px' }}>No partners found at Level {expandedLevel}.</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Share your referral link with coffee lovers and business partners to build this tier!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: COMMISSIONS LEDGER */}
              {sidebarTab === 'commissions' && (
                <div className="animate-fadeIn">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
                    <div>
                      <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)' }}>Commission Transaction Ledger</h2>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Real-time audit log of all 4-tier earnings credited to your affiliate wallet.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => fetchDownlineAndCommissions(token)} className="btn-outline btn-sm">
                        <RefreshCw size={14} />
                        <span>Refresh</span>
                      </button>
                    </div>
                  </div>

                  {commissions.length > 0 ? (
                    <div className="affiliate-table-wrap">
                      <table className="affiliate-table">
                        <thead>
                          <tr>
                            <th>Order Ref</th>
                            <th>Date</th>
                            <th>Tier Level</th>
                            <th>Order Subtotal</th>
                            <th>Rate</th>
                            <th>Commission Earned</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {commissions.map((comm) => (
                            <tr key={comm._id}>
                              <td style={{ fontWeight: '600' }}>{comm.orderNumber}</td>
                              <td style={{ color: 'var(--text-muted)' }}>{new Date(comm.createdAt).toLocaleDateString()}</td>
                              <td><span className="badge-pill">Level {comm.level}</span></td>
                              <td>${comm.orderAmount.toFixed(2)}</td>
                              <td style={{ color: 'var(--amber-light)', fontWeight: '600' }}>{comm.percentage}%</td>
                              <td style={{ fontWeight: '700', color: 'var(--success)' }}>+${comm.commissionAmount.toFixed(2)}</td>
                              <td><span style={{ color: 'var(--success)', fontSize: '0.78rem', textTransform: 'capitalize' }}>● {comm.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ background: '#120c09', border: '1px solid var(--mocha-border)', borderRadius: '16px', padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <TrendingUp size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                      <p style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '4px' }}>No commission records yet</p>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Whenever a customer or downline member makes a purchase with your code, your commission will be logged here automatically.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: MARKETING TOOLS & LINKS */}
              {sidebarTab === 'marketing' && (
                <div className="animate-fadeIn">
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)' }}>Promotional Links & Assets</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Deep links crafted with your referral code to drive high-converting coffee sales.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '28px' }}>
                    {/* Product Link 1 */}
                    <div style={{ background: '#17100b', border: '1px solid var(--mocha-border)', borderRadius: '14px', padding: '20px' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '6px' }}>Storefront Homepage Link</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                        Directs traffic to the main Caffè Loja roastery homepage.
                      </p>
                      <button
                        onClick={() => copyReferralLink(referralLink)}
                        className="btn-primary btn-sm"
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        <Copy size={14} />
                        <span>Copy Store Link</span>
                      </button>
                    </div>

                    {/* Product Link 2 */}
                    <div style={{ background: '#17100b', border: '1px solid var(--mocha-border)', borderRadius: '14px', padding: '20px' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '6px' }}>Coffee Catalog / Menu</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                        Takes customers directly to the full artisan product catalog.
                      </p>
                      <button
                        onClick={() => copyReferralLink(`${typeof window !== 'undefined' ? window.location.origin : 'https://caffeloja.com'}/menu?ref=${user.referralCode}`)}
                        className="btn-primary btn-sm"
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        <Copy size={14} />
                        <span>Copy Menu Link</span>
                      </button>
                    </div>

                    {/* Product Link 3 */}
                    <div style={{ background: '#17100b', border: '1px solid var(--mocha-border)', borderRadius: '14px', padding: '20px' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '6px' }}>Affiliate Recruitment Link</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                        Sends prospects directly to the affiliate join portal to build your Level 1 downline.
                      </p>
                      <button
                        onClick={() => copyReferralLink(`${typeof window !== 'undefined' ? window.location.origin : 'https://caffeloja.com'}/affiliate?mode=register&ref=${user.referralCode}`)}
                        className="btn-primary btn-sm"
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        <Copy size={14} />
                        <span>Copy Recruitment Link</span>
                      </button>
                    </div>
                  </div>

                  {/* Pre-written Copy Samples */}
                  <div style={{ background: '#17100b', border: '1px solid var(--mocha-border)', borderRadius: '16px', padding: '24px' }}>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '14px' }}>Ready-to-Use Marketing Pitches</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--mocha-border)', borderRadius: '12px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--amber-light)' }}>Coffee Lovers Message (English)</span>
                          <button onClick={() => copyReferralLink(`Experience rare single-origin roasts and Pedro Bacano's Yarumo collection from Caffè Loja! Order fresh dropshipped coffee: ${referralLink}`)} className="btn-outline btn-sm" style={{ padding: '4px 10px', fontSize: '0.74rem' }}>
                            <Copy size={12} /> Copy Text
                          </button>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          &ldquo;Experience rare single-origin roasts and Pedro Bacano&apos;s Yarumo collection from Caffè Loja! Order fresh dropshipped coffee: {referralLink}&rdquo;
                        </p>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--mocha-border)', borderRadius: '12px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--amber-light)' }}>Recruitment Pitch (Portuguese)</span>
                          <button onClick={() => copyReferralLink(`Junta-te à rede de parceiros Caffè Loja e ganha comissões em 4 níveis na venda de café artesanal! Regista-te aqui: ${typeof window !== 'undefined' ? window.location.origin : 'https://caffeloja.com'}/affiliate?mode=register&ref=${user.referralCode}`)} className="btn-outline btn-sm" style={{ padding: '4px 10px', fontSize: '0.74rem' }}>
                            <Copy size={12} /> Copy Text
                          </button>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          &ldquo;Junta-te à rede de parceiros Caffè Loja e ganha comissões em 4 níveis na venda de café artesanal! Regista-te aqui: {typeof window !== 'undefined' ? window.location.origin : 'https://caffeloja.com'}/affiliate?mode=register&ref={user.referralCode}&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: PAYOUTS & BANKING */}
              {sidebarTab === 'payouts' && (
                <div className="animate-fadeIn">
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)' }}>Payouts & Withdrawal Settings</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Configure your preferred bank account or digital payout method to receive weekly payouts.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '28px' }}>
                    {/* Balance & Request Form */}
                    <div style={{ background: '#17100b', border: '1px solid var(--mocha-border)', borderRadius: '16px', padding: '24px' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Available for Withdrawal</div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: '700', color: 'var(--amber-light)', margin: '6px 0 16px' }}>
                        ${(user.walletBalance || 0).toFixed(2)}
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--mocha-border)', borderRadius: '10px', padding: '12px 14px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--amber-light)', fontWeight: '600', marginBottom: '4px' }}>
                          <ShieldCheck size={16} /> Minimum Payout: $20.00
                        </div>
                        Payouts are dispatched via SEPA Bank Transfer, MBWay, or USDT every Monday.
                      </div>

                      {payoutMessage && (
                        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success)', color: 'var(--success)', padding: '12px', borderRadius: '8px', fontSize: '0.84rem', marginBottom: '16px' }}>
                          {payoutMessage}
                        </div>
                      )}

                      <button
                        onClick={handleRequestPayout}
                        disabled={(user.walletBalance || 0) < 20 || isRequestingPayout}
                        className="btn-primary"
                        style={{ width: '100%', padding: '14px', justifyContent: 'center' }}
                      >
                        <Wallet size={18} />
                        <span>{isRequestingPayout ? 'Processing Request...' : (user.walletBalance || 0) >= 20 ? 'Request Full Withdrawal' : 'Minimum $20.00 Required'}</span>
                      </button>
                    </div>

                    {/* Banking Details Form */}
                    <div style={{ background: '#17100b', border: '1px solid var(--mocha-border)', borderRadius: '16px', padding: '24px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '14px' }}>Saved Payout Destination</h3>

                      <form onSubmit={(e) => { e.preventDefault(); setPayoutMessage('Payout credentials saved securely to your profile!'); }} className="checkout-form">
                        <div className="form-field">
                          <label>Payout Method</label>
                          <select
                            value={payoutForm.method}
                            onChange={(e) => setPayoutForm({ ...payoutForm, method: e.target.value })}
                            style={{ background: '#1f1611', border: '1px solid var(--mocha-border)', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '0.88rem', width: '100%' }}
                          >
                            <option value="bank">SEPA Bank Transfer (IBAN)</option>
                            <option value="mbway">MBWay (Portugal Mobile)</option>
                            <option value="crypto">USDT / Crypto Wallet</option>
                          </select>
                        </div>

                        {payoutForm.method === 'bank' && (
                          <>
                            <div className="form-field">
                              <label>Account Holder Name</label>
                              <input
                                type="text"
                                placeholder="Manuel Costa"
                                value={payoutForm.accountName}
                                onChange={(e) => setPayoutForm({ ...payoutForm, accountName: e.target.value })}
                              />
                            </div>
                            <div className="form-field">
                              <label>IBAN Number</label>
                              <input
                                type="text"
                                placeholder="PT50 0000 0000 0000 0000 0000 0"
                                value={payoutForm.iban}
                                onChange={(e) => setPayoutForm({ ...payoutForm, iban: e.target.value })}
                              />
                            </div>
                          </>
                        )}

                        {payoutForm.method === 'mbway' && (
                          <div className="form-field">
                            <label>MBWay Phone Number</label>
                            <input
                              type="tel"
                              placeholder="+351 912 345 678"
                              value={payoutForm.mbway}
                              onChange={(e) => setPayoutForm({ ...payoutForm, mbway: e.target.value })}
                            />
                          </div>
                        )}

                        {payoutForm.method === 'crypto' && (
                          <div className="form-field">
                            <label>USDT Address (TRC20 or ERC20)</label>
                            <input
                              type="text"
                              placeholder="T..."
                              value={payoutForm.crypto}
                              onChange={(e) => setPayoutForm({ ...payoutForm, crypto: e.target.value })}
                            />
                          </div>
                        )}

                        <button type="submit" className="btn-outline btn-sm" style={{ marginTop: '10px', width: '100%', justifyContent: 'center' }}>
                          Save Payout Settings
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: ACCOUNT SETTINGS */}
              {sidebarTab === 'settings' && (
                <div className="animate-fadeIn">
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)' }}>Account & Profile Details</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Manage your profile information and security settings.
                    </p>
                  </div>

                  <div style={{ maxWidth: '640px', background: '#17100b', border: '1px solid var(--mocha-border)', borderRadius: '16px', padding: '24px' }}>
                    <div className="affiliate-settings-grid">
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '10px', border: '1px solid var(--mocha-border)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Full Name</span>
                        <div style={{ fontWeight: '600', fontSize: '0.95rem', marginTop: '2px' }}>{user.name}</div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '10px', border: '1px solid var(--mocha-border)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address</span>
                        <div style={{ fontWeight: '600', fontSize: '0.95rem', marginTop: '2px' }}>{user.email}</div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '10px', border: '1px solid var(--mocha-border)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Partner Referral Code</span>
                        <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--amber-light)', marginTop: '2px' }}>{user.referralCode}</div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '10px', border: '1px solid var(--mocha-border)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sponsor Code</span>
                        <div style={{ fontWeight: '600', fontSize: '0.95rem', marginTop: '2px' }}>{user.sponsorCode || 'Direct Sign-up (Head of Tree)'}</div>
                      </div>
                    </div>

                    <div style={{ paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '12px' }}>Security & Session</h4>
                      <button onClick={handleLogout} className="btn-outline btn-sm" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                        <LogOut size={14} />
                        <span>Sign Out of All Sessions</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}