'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Sliders,
  ShoppingBag,
  LogOut,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  X,
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authChecking, setAuthChecking] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);


  const checkAdminAuth = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('caffeloja_token') : null;
    if (!token) {
      router.replace('/login?redirect=/admin/dashboard');
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        if (data.user.role !== 'admin') {
          router.replace('/user/dashboard');
          return;
        }
        localStorage.setItem('caffeloja_user', JSON.stringify(data.user));
        setAdminUser(data.user);
        setAuthChecking(false);
      } else {
        localStorage.removeItem('caffeloja_token');
        localStorage.removeItem('caffeloja_user');
        router.replace('/login?redirect=/admin/dashboard');
      }
    } catch {
      try {
        const cached = JSON.parse(localStorage.getItem('caffeloja_user') || '{}');
        if (cached?.role === 'admin') {
          setAdminUser(cached);
          setAuthChecking(false);
          return;
        }
      } catch {}
      router.replace('/login?redirect=/admin/dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('caffeloja_token');
    localStorage.removeItem('caffeloja_user');
    window.dispatchEvent(new Event('caffeloja_auth_change'));
    router.replace('/login');
  };

  if (authChecking) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
        }}
      >
        <RefreshCw size={32} className="spin-icon" style={{ color: 'var(--amber-primary)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Verifying administrative credentials...</p>
      </div>
    );
  }

  const isDashboard = pathname === '/admin/dashboard' || pathname === '/admin';
  const isUsers = pathname?.startsWith('/admin/users');
  const isCommissions = pathname?.startsWith('/admin/commissions') || pathname?.startsWith('/admin/commission');
  const isOrders = pathname?.startsWith('/admin/orders');
  const isSettings = pathname?.startsWith('/admin/settings');

  const currentTab = isUsers
    ? { name: 'Registered Users', icon: Users }
    : isCommissions
    ? { name: 'Commission Rates', icon: Sliders }
    : isOrders
    ? { name: 'Orders & Logs', icon: ShoppingBag }
    : isSettings
    ? { name: 'Settings & Security', icon: ShieldCheck }
    : { name: 'Overview', icon: LayoutDashboard };
  const CurrentTabIcon = currentTab.icon;

  const getPageHeader = () => {
    if (isUsers) {
      return {
        title: 'Registered Users Directory',
        subtitle: 'Inspect and manage all platform accounts and verified subscriptions',
      };
    }
    if (isCommissions) {
      return {
        title: '4-Level Fixed Commission Rates ($/Box)',
        subtitle: 'Configure exact cash rewards distributed to upstream sponsors on coffee box sales',
      };
    }
    if (isOrders) {
      return {
        title: 'Dropship Orders & API Logs',
        subtitle: 'Inspect raw Stripe payment events and WooCommerce fulfillment responses',
      };
    }
    if (isSettings) {
      return {
        title: 'Settings & Security',
        subtitle: 'Configure contact form email routing, change admin password, and set up Google Authenticator (2FA)',
      };
    }
    return {
      title: 'Executive Control Center',
      subtitle: 'Live overview of sales, subscriptions, revenue, and store operations',
    };
  };

  const pageHeader = getPageHeader();

  return (
    <div
      className="affiliate-dashboard-wrap"
      style={{
        paddingTop: '28px',
        minHeight: '100vh',
        paddingBottom: '80px',
        position: 'relative',
      }}
    >
      {/* Background with low opacity matching User Portal */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage:
            'url("https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1920&q=85")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.07,
          filter: 'blur(1px) saturate(0.85)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div className="container portal-container" style={{ position: 'relative', zIndex: 1 }}>
        {/* TOP DASHBOARD HEADER & NAVIGATION CARD */}
        <header className="portal-top-header">
          {/* Upper Tier: Logo / Brand, Admin Profile, Quick Actions */}
          <div className="portal-header-upper">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Link href="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                <img src="/logo.png" alt="Caffeloja" style={{ height: '34px', width: 'auto', display: 'block' }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="portal-brand-text">
                      Caffeloja
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.5)',
                        color: '#fbbf24',
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                      }}
                    >
                      <ShieldCheck size={12} />
                      ADMIN
                    </span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#8e7c72' }}>
                    Executive Control Center
                  </span>
                </div>
              </Link>
            </div>

            {/* Right: Admin Profile, Visit Store, Log Out */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '5px 12px 5px 8px',
                  borderRadius: '8px',
                }}
              >
                <div
                  className="affiliate-avatar"
                  style={{
                    width: '30px',
                    height: '30px',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #f59e0b, #b45309)',
                    color: '#0d0907',
                    borderRadius: '6px',
                  }}
                >
                  {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.25 }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {adminUser?.name || 'Admin'}
                  </div>
                  <div style={{ fontSize: '0.70rem', color: 'var(--amber-light)' }}>
                    Executive Access
                  </div>
                </div>
              </div>

              <Link
                href="/"
                className="btn-secondary btn-sm"
                style={{
                  padding: '6px 13px',
                  fontSize: '0.82rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '6px',
                  height: '34px',
                }}
              >
                <ExternalLink size={14} />
                <span>Visit Store</span>
              </Link>

              <button
                onClick={handleLogout}
                className="btn-outline btn-sm"
                style={{
                  padding: '6px 13px',
                  fontSize: '0.82rem',
                  borderColor: 'rgba(239, 68, 68, 0.35)',
                  color: '#f87171',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  height: '34px',
                }}
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Lower Tier: Navigation Menu Tabs on Top with Mobile Non-Scrolling Menu Bar */}
          <div className="portal-nav-section">
            {/* Mobile Active Header & Toggle Button (Shown on mobile screens) */}
            <div
              className="portal-mobile-menu-bar"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className="portal-mobile-active-info">
                <span className="portal-mobile-active-label">SECTION</span>
                <div className="portal-mobile-active-title">
                  <CurrentTabIcon size={16} />
                  <span>{currentTab.name}</span>
                </div>
              </div>
              <button
                type="button"
                className="portal-mobile-menu-toggle-btn"
                aria-label="Toggle Navigation Menu"
              >
                <span>{mobileMenuOpen ? 'Close Menu' : 'Menu Options'}</span>
                {mobileMenuOpen ? <X size={15} /> : <ChevronDown size={15} />}
              </button>
            </div>

            {/* Navigation Tabs (Horizontal on desktop, Non-scrolling 2-col grid on mobile when open) */}
            <nav className={`portal-top-nav-tabs ${mobileMenuOpen ? 'mobile-open' : ''}`}>
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`portal-nav-tab ${isDashboard ? 'active' : ''}`}
              >
                <LayoutDashboard size={16} />
                <span>Overview</span>
              </Link>

              <Link
                href="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className={`portal-nav-tab ${isUsers ? 'active' : ''}`}
              >
                <Users size={16} />
                <span>Registered Users</span>
              </Link>

              <Link
                href="/admin/commissions"
                onClick={() => setMobileMenuOpen(false)}
                className={`portal-nav-tab ${isCommissions ? 'active' : ''}`}
              >
                <Sliders size={16} />
                <span>Commission Rates</span>
              </Link>

              <Link
                href="/admin/orders"
                onClick={() => setMobileMenuOpen(false)}
                className={`portal-nav-tab ${isOrders ? 'active' : ''}`}
              >
                <ShoppingBag size={16} />
                <span>Orders & Logs</span>
              </Link>

              <Link
                href="/admin/settings"
                onClick={() => setMobileMenuOpen(false)}
                className={`portal-nav-tab ${isSettings ? 'active' : ''}`}
              >
                <ShieldCheck size={16} />
                <span>Settings & Security</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* FULL-WIDTH MAIN CONTENT AREA */}
        <main className="portal-main-card">
          {/* Header Title inside Content Area */}
          <div className="portal-content-header">
            <div>
              <h1 className="portal-content-title">
                {pageHeader.title}
              </h1>
              <p className="portal-content-subtitle">
                {pageHeader.subtitle}
              </p>
            </div>
          </div>

          {/* Injected Page Content */}
          <div style={{ marginTop: '24px' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

